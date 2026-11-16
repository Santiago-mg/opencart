#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pruebas de seguridad que corren en el Mac (necesitan Docker y SonarQube):
#
#   1. Análisis estático con SonarQube (archivos de RF-06 a RF-11)
#   2. Revisión de dependencias PHP de OpenCart con `composer audit`
#   3. Análisis dinámico pasivo con OWASP ZAP contra la tienda encendida
#
# Uso, desde la carpeta del proyecto:
#   SONAR_TOKEN=<tu token> bash tests/seguridad/analizar.sh
#
# El token se crea en SonarQube → My Account → Security → Generate Tokens,
# tipo "User Token" (sirve para analizar y para leer los resultados).
# Todo lo que sale queda en tests/seguridad/evidencia/.
# ─────────────────────────────────────────────────────────────────────────────
set -u
cd "$(dirname "$0")/../.." || exit 1

SONAR_URL=${SONAR_URL:-http://localhost:9000}
PROYECTO=OpenCart-Santiago
TIENDA=${OPENCART_URL:-http://localhost}
EVIDENCIA=tests/seguridad/evidencia

paso() { printf '\n══ %s ══\n' "$1"; }
sonar_arriba() { curl -s "$SONAR_URL/api/system/status" | grep -q '"status":"UP"'; }

# ── 1. SonarQube ────────────────────────────────────────────────────────────
paso "1/3 SonarQube"
if ! sonar_arriba; then
  echo "SonarQube no responde en $SONAR_URL; intento encender el contenedor 'sonarqube'..."
  docker start sonarqube >/dev/null 2>&1 || docker run -d --name sonarqube -p 9000:9000 sonarqube:community >/dev/null
  for _ in $(seq 1 60); do sonar_arriba && break; sleep 5; done
fi
if ! sonar_arriba; then
  echo "SonarQube sigue sin responder. Abre Docker Desktop y vuelve a correr el script."
  exit 1
fi
if [ -z "${SONAR_TOKEN:-}" ]; then
  echo "Falta SONAR_TOKEN. Créalo en $SONAR_URL → My Account → Security (tipo User Token) y corre:"
  echo "  SONAR_TOKEN=<tu token> bash tests/seguridad/analizar.sh"
  exit 1
fi

# Lee sonar-project.properties (en la raíz). Con qualitygate.wait espera a que
# SonarQube termine de procesar antes de bajar los resultados.
npx --yes sonarqube-scanner@5 \
  -Dsonar.host.url="$SONAR_URL" \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.qualitygate.wait=true \
  || echo "(El Quality Gate no pasó o hubo avisos: igual se guardan los resultados.)"

api() { curl -s -u "$SONAR_TOKEN:" "$SONAR_URL/api/$1"; }
api "issues/search?componentKeys=$PROYECTO&ps=500&additionalFields=rules" > "$EVIDENCIA/sonarqube/issues.json"
api "hotspots/search?project=$PROYECTO&ps=500" > "$EVIDENCIA/sonarqube/hotspots.json"
api "measures/component?component=$PROYECTO&metricKeys=ncloc,bugs,vulnerabilities,security_hotspots,security_rating,security_review_rating,reliability_rating,sqale_rating,code_smells,duplicated_lines_density" > "$EVIDENCIA/sonarqube/medidas.json"
api "qualitygates/project_status?projectKey=$PROYECTO" > "$EVIDENCIA/sonarqube/quality-gate.json"
echo "Resultados de SonarQube en $EVIDENCIA/sonarqube/ (y en $SONAR_URL/dashboard?id=$PROYECTO)"

# ── 2. Dependencias PHP ─────────────────────────────────────────────────────
paso "2/3 composer audit (dependencias PHP de OpenCart)"
# --locked revisa las versiones exactas de composer.lock, que son las que trae upload/system/storage/vendor.
docker run --rm -v "$PWD":/app -w /app composer:2 audit --locked --format=json \
  > "$EVIDENCIA/dependencias/composer-audit.json"
echo "Resultado en $EVIDENCIA/dependencias/composer-audit.json"

# ── 3. OWASP ZAP ────────────────────────────────────────────────────────────
paso "3/3 OWASP ZAP (análisis dinámico pasivo)"
if [ "$(curl -s -o /dev/null -w '%{http_code}' "$TIENDA/index.php?route=common/home")" != "200" ]; then
  echo "La tienda no responde en $TIENDA. Enciéndela con: docker compose up -d opencart"
  exit 1
fi
# Dentro del contenedor de ZAP, el Mac se llama host.docker.internal.
docker run --rm -v "$PWD/tests/seguridad":/zap/wrk:rw zaproxy/zap-stable \
  zap.sh -cmd -autorun /zap/wrk/zap/plan.yaml
echo "Reporte en $EVIDENCIA/dinamico/zap-reporte.html"

paso "Listo"
