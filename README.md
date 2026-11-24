# 🛒 OpenCart 4.1.0.3 · QA, seguridad y CI/CD

> *Quality assurance of a real PHP e-commerce platform: 534 automated unit, regression, API, performance and security tests plus Cypress and Serenity/JS E2E suites, 37 real defects found and fixed, SonarQube Quality Gate passed and a Jenkins pipeline.*

Proyecto de aseguramiento de calidad sobre **OpenCart 4.1.0.3**, una tienda en línea de código abierto en PHP. El objetivo fue probar a fondo once funcionalidades de la tienda y del panel de administración, **encontrar defectos reales, corregirlos** en el código de OpenCart y dejar todo automatizado en un pipeline.

Proyecto en equipo: **Santiago González** (RF-06 a RF-11, funciones de la tienda) y **Andrés Mendoza** (RF-01 a RF-05, panel de administración).

![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![PHPUnit](https://img.shields.io/badge/PHPUnit-3C9CD7?style=flat-square)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-69D3A7?style=flat-square&logo=cypress&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square)
![Serenity/JS](https://img.shields.io/badge/Serenity%2FJS-1F6FEB?style=flat-square)
![Cucumber](https://img.shields.io/badge/Gherkin-23D96C?style=flat-square&logo=cucumber&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=flat-square&logo=sonarqube&logoColor=white)
![OWASP](https://img.shields.io/badge/OWASP_ZAP-000000?style=flat-square&logo=owasp&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

## 📊 Resultados

| | |
|---|---|
| ✅ **Pruebas automatizadas** | **Vitest 347/347** (regresión, API, rendimiento y seguridad) · **PHPUnit 110/110** (Santiago) y **77/77** (Andrés) |
| 🐞 **Defectos** | **37 defectos reales** de OpenCart documentados primero como pruebas rojas (TDD) y luego corregidos en el código → [`tests/DEFECTOS_CORREGIDOS.md`](tests/DEFECTOS_CORREGIDOS.md) |
| 🔐 **Seguridad** | **SonarQube: Quality Gate Passed**, Semgrep, OWASP ZAP, 104 pruebas dinámicas de seguridad contra la tienda (inyección SQL, XSS, sesión, cabeceras, abuso de lógica), `composer audit` y `npm audit`, organizado con el **OWASP Top 10** |
| ⚙️ **CI/CD** | Pipeline de **Jenkins** que levanta la tienda en Docker, corre PHPUnit con cobertura, las pruebas contra la tienda, SonarQube y la auditoría de dependencias |

## 🧪 Qué se probó

| RF | Funcionalidad | Responsable |
|---|---|---|
| RF-01 a RF-05 | Funciones del panel de administración | Andrés Mendoza |
| RF-06 | Búsqueda de productos | Santiago González |
| RF-07 | Carrito de compras | Santiago González |
| RF-08 | Cupones de descuento | Santiago González |
| RF-09 | Reseñas de productos | Santiago González |
| RF-10 | Comparar productos | Santiago González |
| RF-11 | Devoluciones | Santiago González |

## 🧱 Niveles de prueba

| Nivel | Herramientas | Dónde |
|---|---|---|
| **Unitarias (caja blanca y caja negra)** | PHPUnit + Hamcrest, *fakes*, *stubs*, *spies* y *mocks*, patrón AAA, principios FIRST, particiones de equivalencia y valores límite, cobertura con PCOV | [`tests/unit/`](tests/unit/README.md), [`tests/andres/`](tests/andres/README.md) |
| **Regresión y API** | Vitest contra la tienda encendida | [`tests/regresion/santiago/`](tests/regresion/santiago) |
| **Rendimiento** | Vitest (`performance-testing`) | [`tests/regresion/santiago/performance-testing`](tests/regresion/santiago/performance-testing) |
| **Aceptación (BDD)** | Gherkin + **Serenity/JS + Playwright** con el **patrón Screenplay** | [`e2e/santiago/serenityjs/`](e2e/santiago/serenityjs/README.md) |
| **E2E** | **Cypress** con estructura Screenplay: casos por interfaz (`*.web.cy.ts`) y por API (`*.api.cy.ts`) | [`e2e/santiago/cypress/`](e2e/santiago/cypress/README.md), [`e2e/andres/cypress/`](e2e/andres/cypress/README.md) |
| **Seguridad** | SonarQube, Semgrep, OWASP ZAP, Vitest, composer/npm audit | [`tests/seguridad/`](tests/seguridad/README.md) |

## ⚙️ Pipeline de Jenkins

```
Entorno → Tienda de prueba (Docker) → PHPUnit y cobertura → Pruebas contra la tienda → SonarQube → Dependencias
```

Definido en [`Jenkinsfile`](Jenkinsfile). El token de SonarQube se guarda como credencial de Jenkins, nunca en el repositorio. Los defectos documentados marcan la etapa en amarillo sin romper el build.

## ▶️ Cómo ejecutarlo

Requisitos: Docker Desktop (funciona también en Mac con chip Apple) y Node.js para las pruebas en JavaScript.

```bash
docker compose up -d opencart
```

Tienda en <http://localhost> y panel en <http://localhost/admin>. Cada carpeta de pruebas tiene su propio README con los comandos para correrla.

## 📄 Sobre OpenCart

Este repositorio es un fork de [opencart/opencart](https://github.com/opencart/opencart), fijado en la versión **4.1.0.3**. Las instrucciones originales de instalación y actualización están en [`INSTALL.md`](INSTALL.md) y [`UPGRADE.md`](UPGRADE.md). OpenCart se distribuye bajo la licencia [GPL-3.0](LICENSE.md).
