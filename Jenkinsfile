// ─────────────────────────────────────────────────────────────────────────────
// Pipeline de pruebas de OpenCart 4.1.0.3        (job en Jenkins: opencart-pruebas)
//
//   Entorno → Tienda de prueba → PHPUnit y cobertura → Pruebas contra la tienda
//          → SonarQube (análisis + Quality Gate) → Dependencias (composer audit)
//
// - Corre dentro del agente de Dockerfile.jenkins: la máquina de Jenkins solo
//   necesita Docker (mismo patrón que el pipeline de CelularPro).
// - OpenCart no se corrige: las pruebas que documentan defectos reales fallan a
//   propósito. Por eso las etapas de pruebas marcan el build como INESTABLE
//   (amarillo) y no como FALLIDO (rojo); el Quality Gate sí corta el pipeline.
//
// Plugins: Pipeline, Git, Docker Pipeline, SonarQube Scanner, JUnit, Timestamper
// ─────────────────────────────────────────────────────────────────────────────

pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile.jenkins'
            // Socket de Docker del host para levantar la tienda con docker compose.
            args '-v /var/run/docker.sock:/var/run/docker.sock -u root'
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 40, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        CI           = 'true'
        OPENCART_URL = 'http://opencart'
        COMPOSE      = 'docker compose -p opencart-pruebas -f docker-compose.ci.yml'
    }

    stages {

        stage('Entorno') {
            steps {
                sh '''
                    node --version
                    php --version
                    composer --version
                    docker --version
                '''
            }
        }

        stage('Tienda de prueba') {
            steps {
                // Levanta OpenCart + MySQL (docker-compose.ci.yml, con el código dentro de la
                // imagen), conecta este agente a su red y espera a que la tienda responda.
                sh '''
                    $COMPOSE up -d --build
                    docker network connect opencart-pruebas_default "$(hostname)" || true
                    for i in $(seq 1 72); do
                        code=$(curl -s -o /dev/null -w '%{http_code}' "$OPENCART_URL/index.php?route=common/home" || true)
                        [ "$code" = "200" ] && exit 0
                        sleep 5
                    done
                    echo "La tienda no respondió a tiempo. Estado y registro del contenedor:"
                    $COMPOSE ps -a
                    $COMPOSE logs --tail=60 opencart
                    exit 1
                '''
            }
        }

        stage('PHPUnit y cobertura') {
            steps {
                // Pruebas unitarias de Santiago y de Andrés; la cobertura (clover) la lee SonarQube.
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        (cd tests/unit && composer install -q --no-interaction \
                            && php -d pcov.enabled=1 -d pcov.directory=../../upload vendor/bin/phpunit \
                                --coverage-clover evidencia/cobertura/clover.xml --log-junit ../../reports/phpunit-santiago.xml)
                        (cd tests/andres && composer install -q --no-interaction \
                            && php -d pcov.enabled=1 -d pcov.directory=../../upload vendor/bin/phpunit \
                                --coverage-clover evidencia/cobertura/clover.xml --log-junit ../../reports/phpunit-andres.xml)
                    '''
                }
            }
            post {
                always { junit testResults: 'reports/phpunit-*.xml', allowEmptyResults: true }
            }
        }

        stage('Pruebas contra la tienda') {
            steps {
                // Regresión, API, rendimiento y seguridad (Vitest + supertest) sobre la tienda encendida.
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        cd tests/regresion/santiago
                        npm ci --no-audit --no-fund
                        npx vitest run --reporter=default --reporter=junit --outputFile.junit=../../../reports/vitest-santiago.xml
                    '''
                }
            }
            post {
                always { junit testResults: 'reports/vitest-*.xml', allowEmptyResults: true }
            }
        }

        stage('SonarQube') {
            steps {
                // 'SonarQube' es el servidor configurado en Manage Jenkins → System.
                // Lee sonar-project.properties; qualitygate.wait corta el pipeline si no pasa.
                withSonarQubeEnv('SonarQube') {
                    sh 'npx --yes sonarqube-scanner@5 -Dsonar.qualitygate.wait=true'
                }
            }
        }

        stage('Dependencias') {
            steps {
                // Revisa composer.lock contra avisos de seguridad conocidos.
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh 'composer audit --locked --format=json > reports/composer-audit.json'
                }
            }
        }
    }

    post {
        always {
            sh '$COMPOSE down -v || true'
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
        success  { echo 'OpenCart OK: pruebas, SonarQube y dependencias revisadas.' }
        unstable { echo 'OpenCart INESTABLE: hay pruebas que documentan defectos reales (esperado).' }
        failure  { echo 'OpenCart FALLÓ: revisa la etapa en rojo (tienda, SonarQube o Quality Gate).' }
    }
}
