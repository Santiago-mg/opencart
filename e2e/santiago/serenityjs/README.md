# Pruebas E2E de OpenCart con Gherkin y Serenity/JS — RF-01 a RF-11

Pruebas de aceptación escritas en **Gherkin** (Cucumber) y automatizadas con
**Serenity/JS + Playwright** usando el **patrón Screenplay**, con la misma
estructura de las de CelularPro.

Corren contra la tienda real encendida (OpenCart **4.1.0.3**):

- **RF-01 a RF-05 (Andrés Mendoza)**: funciones del panel de administración.
  La administradora (Ana) prepara y revisa los datos por HTTP, enviando los
  mismos formularios que usa el panel.
- **RF-06 a RF-11 (Santiago González)**: funciones de la tienda. Los clientes
  (Carlos y Bruno) usan un navegador; lo único que se prepara por HTTP es lo
  que le toca a la administradora (publicar un cupón, aprobar una reseña…).

## 1. Encender la tienda

```bash
cd ~/Documents/opencart
docker compose up -d opencart
```

Tienda en <http://localhost>, panel en <http://localhost/admin> (`admin` / `admin`).
Si algo corre en otro lado, se cambia con estas variables:

| Variable | Por defecto | Para qué |
|---|---|---|
| `OPENCART_URL` | `http://localhost` | dirección de la tienda y del panel |
| `OPENCART_ADMIN_USER` | `admin` | usuario del panel |
| `OPENCART_ADMIN_PASSWORD` | `admin` | contraseña del panel |
| `OPENCART_DB_HOST` | `127.0.0.1` | MySQL (RF-01 y la limpieza de RF-02) |
| `OPENCART_DB_PORT` | `3306` | puerto de MySQL |
| `OPENCART_DB_USER` | `root` | usuario de MySQL |
| `OPENCART_DB_PASSWORD` | `opencart` | contraseña de MySQL |
| `OPENCART_DB_NAME` | `opencart` | base de datos |
| `OPENCART_DB_PREFIX` | `oc_` | prefijo de las tablas |
| `OPENCART_LOG_FILE` | `upload/system/storage/logs/error.log` (del repositorio) | registro de errores que usa RF-05 |
| `CHROMIUM_PATH` | — | un Chromium ya instalado, si Playwright no encuentra el suyo |
| `HEADLESS` | `true` | `false` muestra la ventana del navegador |

Los valores por defecto son los del `docker-compose.yml`: MySQL 5.7 publicado
en el puerto 3306 con `root` / `opencart`, y la carpeta `upload/` montada como
`/var/www/html`, así que el `error.log` de la tienda se ve desde el Mac.

## 2. Correr las pruebas

```bash
cd e2e/santiago/serenityjs
npm install
npx playwright install chromium   # solo la primera vez
npm test                          # los 53 escenarios
```

| Comando | Qué corre |
|---|---|
| `npm test` | todos los escenarios |
| `npm run test:sin-defectos` | los 47 que describen lo que funciona (deben pasar todos) |
| `npm run test:defectos` | los 6 que demuestran defectos de OpenCart (hoy fallan) |
| `npm run test:smoke` | uno por funcionalidad |
| `npm test -- --tags @rf-02` | una sola funcionalidad (`@rf-01` … `@rf-11`) |
| `HEADLESS=false npm test` | con la ventana del navegador a la vista |
| `npm run typecheck` | revisa los tipos de TypeScript |
| `npm run test:report` | abre el reporte HTML de la última corrida |

## Qué se prueba

| RF | Funcionalidad | De | Escenarios | Defectos (`@defecto`) |
|---|---|---|---:|---|
| 01 | Filtrado de pedidos en el panel | Andrés | 7 | — |
| 02 | Idiomas | Andrés | 7 | DEF-02-02: la lista de idiomas no marca el idioma por defecto |
| 03 | Monedas | Andrés | 4 | — |
| 04 | Zonas geográficas e impuestos | Andrés | 3 | — |
| 05 | Registro de errores | Andrés | 3 | — |
| 06 | Búsqueda y filtrado | Santiago | 7 | DEF-06-03: buscar `%` devuelve todo el catálogo |
| 07 | Carrito de compras | Santiago | 6 | DEF-07-03: el total de la línea no es precio × cantidad |
| 08 | Cupones de descuento | Santiago | 5 | DEF-08-05: el botón *Remove* del cupón no hace nada |
| 09 | Reseñas de productos | Santiago | 4 | — |
| 10 | Comparar productos | Santiago | 4 | DEF-10-01: la disponibilidad muestra las unidades exactas |
| 11 | Devoluciones | Santiago | 3 | DEF-11-01: acepta un número de pedido negativo |
| | **Total** | | **53** | **6** |

**DEF-02-02.** Al intentar borrar el idioma por defecto, el panel lo rechaza
bien, pero la lista de idiomas no marca cuál es el idioma por defecto. El
controlador (`localisation/language`) le agrega " (Default)" al nombre cuando
el código es igual a `config_language`, pero en el panel de 4.1.0.3 esa
configuración no existe (se llama `config_language_catalog` y
`config_language_admin`), así que la marca nunca aparece. La lista de monedas,
en cambio, sí muestra "US Dollar **(Default)**". Por el mismo motivo nunca se
ejecuta la validación `error_default` al borrar.

**DEF-08-05** solo se ve en el navegador: el botón está dentro del carrito y el
código que quita productos (`$('#shopping-cart').on('click', '.btn-danger', …)`
en `checkout/cart.twig`) atrapa también su clic, así que nunca se llama a
`coupon.remove`. Las pruebas de Vitest, que hablan por HTTP, no podían verlo.

**Hallazgo sin escenario.** Al crear un idioma, OpenCart copia las
descripciones de los planes de suscripción para ese idioma; al borrarlo desde
el panel no las borra (quedan en `oc_subscription_plan_description`). Por eso
la limpieza de RF-02 las quita por SQL.

## Las pruebas de Andrés: de OpenCart 5 a 4.1.0.3

Andrés escribió RF-01 a RF-05 contra OpenCart 5.0 (rama `master`). Aquí se
pasaron a 4.1.0.3 con los mismos escenarios, pasos, actores y datos; solo se
cambió lo que es distinto en esta versión (rutas, columnas de las listas,
formato del total de los pedidos, etc.).

| Antes (OpenCart 5) | Ahora (4.1.0.3) |
|---|---|
| `rf-12-pedidos` | `rf-01-pedidos` |
| `rf-13-idiomas` | `rf-02-idiomas` |
| `rf-14-monedas` | `rf-03-monedas` |
| `rf-15-zonas-impuestos` | `rf-04-zonas-impuestos` |
| `rf-16-registros` | `rf-05-registros` |

Lo que no se trajo, porque no aplica a 4.1.0.3:

- **DEF-13-01 y DEF-14-01** (serían DEF-02-01 y DEF-03-01): deshabilitar un
  idioma o una moneda *desde la lista*. En 4.1.0.3 la lista no tiene esos
  botones (`localisation/language.disable` y `currency.disable` responden
  "Page Not Found!"); el estado se cambia en el formulario, y eso sí se prueba.
- **DEF-15-01 y DEF-15-02**, que Andrés ya había quitado: en 4.1.0.3 borrar una
  zona geográfica y crear una tasa de impuesto funcionan.

## Cómo se preparan los datos

- **RF-01 (pedidos)**: el panel no tiene pantalla para crear pedidos. El paso
  `Given la tienda tiene estos pedidos:` los inserta en `oc_order` (con un
  correo `qa-pedido-…`) y el `After` los borra.
- **RF-02 (idiomas) y RF-03 (monedas)**: se crean, editan y borran con las
  rutas `save` y `delete` del panel. En 4.1.0.3 estas listas no tienen columna
  de estado: un idioma o una moneda deshabilitados se ven con la fila atenuada.
- **RF-04 (zonas e impuestos)**: las zonas y las clases de impuesto se crean y
  se borran desde el panel; la clase usa una tasa que ya trae la tienda.
- **RF-05 (registro de errores)**: se usa el `error.log` real de la tienda. Al
  empezar se guarda una copia y se deja vacío; al terminar se devuelve como
  estaba, sin las entradas de la prueba.

## Estructura

```
features/
  rf-01 … rf-11 *.feature   → los escenarios en Gherkin
  step-definitions/         → cada paso traducido a tareas y preguntas
  support/                  → serenity.config.ts (actores y reportes) y hooks.ts (limpieza)
test/
  support/                  → environment.ts, testData.ts, database.ts y logs.ts
  tasks/                    → lo que hace un actor (SearchProducts, AddToCart, ApplyCoupon…)
  tasks/admin/              → lo que hace la administradora en el panel, por HTTP
  questions/                → lo que el actor mira (SearchResults, Cart, Comparison…)
  ui/                       → los selectores de cada pantalla, solo aquí
```

| Pieza de Screenplay | Aquí |
|---|---|
| Actores | Carlos y Bruno (clientes, cada uno con su navegador) y Ana (administradora) |
| Habilidades | `BrowseTheWebWithPlaywright`, `CallAnApi`, `TakeNotes` |
| Tareas | `Task.where(...)` en `test/tasks` |
| Preguntas | `Text.of`, `Value.of`, `Question.about` en `test/questions` y `test/tasks/admin` |
| Verificación | `Ensure.that(...)` y `Ensure.eventually(...)` |

Cada escenario usa datos únicos (código de cupón, autor de la reseña, apellido
de la devolución, nombre de idioma, moneda, zona o pedido) y al terminar borra
lo que creó, pase o falle.

## Cómo se comprobó

Dos corridas seguidas de `npm test` contra OpenCart 4.1.0.3 con los datos de
demostración: 53 escenarios, 47 que pasan y 6 que fallan (los seis
`@defecto`), y `npm run test:sin-defectos` con 47 de 47. Al terminar no quedó
ningún cupón, reseña, devolución, pedido, idioma, moneda, zona geográfica ni
clase de impuesto de prueba, y el `error.log` quedó igual que antes.
