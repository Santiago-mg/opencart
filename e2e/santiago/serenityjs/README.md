# Pruebas E2E de OpenCart con Gherkin y Serenity/JS — RF-06 a RF-16

Pruebas de aceptación escritas en **Gherkin** (Cucumber) y automatizadas con
**Serenity/JS + Playwright** usando el **patrón Screenplay**, con la misma
estructura de las de CelularPro (`e2e/santiago/serenityjs`).

Corren contra la tienda real encendida. Las funcionalidades de clientes
(RF-06 a RF-11) usan un navegador; las de administración (RF-12 a RF-16)
preparan y revisan los datos por HTTP, entrando al panel como lo haría la
administradora. Como OpenCart no tiene pantalla para crear pedidos, RF-12
inserta pedidos de demostración directamente en MySQL y los borra al terminar.

## 1. Encender la tienda

```bash
cd ~/Documents/opencart
docker compose up -d opencart
```

Tienda en <http://localhost>, panel en <http://localhost/admin> (`admin` / `admin`).
Si corre en otro lado se configuran estas variables:

| Variable | Por defecto | Para qué |
|---|---|---|
| `OPENCART_URL` | `http://localhost` | dirección de la tienda y del panel |
| `OPENCART_ADMIN_USER` | `admin` | usuario del panel |
| `OPENCART_ADMIN_PASSWORD` | `admin` | contraseña del panel |
| `OPENCART_DB_HOST` | `127.0.0.1` | MySQL, para los pedidos de RF-12 y la limpieza de RF-15 |
| `OPENCART_DB_PORT` | `3306` | puerto de MySQL |
| `OPENCART_DB_USER` | `opencart` | usuario de MySQL |
| `OPENCART_DB_PASSWORD` | `opencart` | contraseña de MySQL |
| `OPENCART_DB_NAME` | `opencart` | base de datos |
| `OPENCART_DB_PREFIX` | `oc_` | prefijo de las tablas |
| `OPENCART_LOG_FILE` | `upload/system/storage/logs/qa-e2e.log` | registro que usan los escenarios de RF-16 |
| `CHROMIUM_PATH` | — | un Chromium ya instalado, si Playwright no encuentra el suyo |
| `HEADLESS` | `true` | `false` muestra la ventana del navegador |

## 2. Correr las pruebas

```bash
cd e2e/santiago/serenityjs
npm install
npx playwright install chromium   # solo la primera vez
npm test                          # los 57 escenarios
```

Si Playwright pide una versión de Chromium que no está descargada, se puede
apuntar a una instalación existente:

```bash
CHROMIUM_PATH=/ruta/a/chrome npm test
```

| Comando | Qué corre |
|---|---|
| `npm test` | todos los escenarios |
| `npm run test:sin-defectos` | los 48 que describen lo que funciona (deben pasar todos) |
| `npm run test:defectos` | los 9 que demuestran defectos de OpenCart (hoy fallan) |
| `npm run test:smoke` | uno por funcionalidad |
| `npm test -- --tags @rf-12` | una sola funcionalidad (`@rf-06` … `@rf-16`) |
| `HEADLESS=false npm test` | con la ventana del navegador a la vista |
| `npm run test:report` | abre el reporte HTML de la última corrida |

## Qué se prueba

| RF | Funcionalidad | Escenarios | Defectos (`@defecto`) |
|---|---|---:|---|
| 06 | Búsqueda y filtrado | 7 | DEF-06-03: buscar `%` devuelve todo el catálogo |
| 07 | Carrito de compras | 6 | DEF-07-03: el total de la línea no es precio × cantidad |
| 08 | Cupones de descuento | 5 | DEF-08-05: el botón *Remove* del cupón no hace nada |
| 09 | Reseñas de productos | 4 | — |
| 10 | Comparar productos | 4 | DEF-10-01: la disponibilidad muestra las unidades exactas |
| 11 | Devoluciones | 3 | DEF-11-01: acepta un número de pedido negativo |
| 12 | Filtrado de pedidos en el panel | 7 | — |
| 13 | Idiomas | 8 | DEF-13-01: habilitar/deshabilitar desde la lista no cambia el estado |
| 14 | Monedas | 5 | DEF-14-01: habilitar/deshabilitar desde la lista no cambia el estado |
| 15 | Zonas geográficas e impuestos | 5 | DEF-15-01: no se puede borrar una zona geográfica; DEF-15-02: guardar una tasa responde con un error |
| 16 | Registro de errores | 3 | — |
| | **Total** | **57** | **9** |

### Defectos encontrados en OpenCart 5.0.0.0 Alpha

- **DEF-13-01**: `localisation/language.enable` y `.disable` fallan con
  `Undefined property: Proxy::editStatus`: el modelo de idiomas no tiene ese
  método. El estado solo se cambia desde el formulario del idioma.
- **DEF-14-01**: `localisation/currency.disable` y `.enable` fallan con
  `Undefined property: Proxy::editStatus`. El estado solo se cambia desde el
  formulario de la moneda.
- **DEF-15-01**: `localisation/geo_zone.delete` falla con
  `Too few arguments to function … deleteGeoZone(), 2 passed … exactly 3 expected`.
  Por eso la limpieza de las zonas de prueba se hace por SQL.
- **DEF-15-02**: `localisation/tax_rate.save` inserta la tasa pero el evento
  `event/tax_rate.php` falla con `Undefined array key 1` y el panel responde
  con ese texto en vez del JSON de éxito.

DEF-08-05 solo se ve en el navegador: el botón está dentro del carrito y el
código que quita productos (`$('#shopping-cart').on('click', '.btn-danger', …)`
en `checkout/cart.twig`) atrapa también su clic, así que nunca se llama a
`coupon.remove`. Las pruebas de Vitest, que hablan por HTTP, no podían verlo.

## RF-12 a RF-16: cómo se preparan los datos

- **RF-12 (pedidos)**: no existe una pantalla de administración para crear
  pedidos. El paso `Given la tienda tiene estos pedidos:` inserta filas en
  `oc_order` con un correo `qa-pedido-…` y el `After` las borra. Los filtros se
  aplican en `sale/order.list` tal como los envía el formulario del panel.
- **RF-13 (idiomas)** y **RF-14 (monedas)**: se crean y editan por las rutas
  `save` del panel, y se comprueban en sus listas y formularios. Los idiomas
  además comprueban que un código repetido se rechace y que el idioma por
  defecto no se pueda borrar. Crear un idioma copia las descripciones de todas
  las entidades y puede tardar más de 10 segundos, así que `CallAnApi` usa un
  límite de 30 segundos.
- **RF-15 (zonas e impuestos)**: las zonas geográficas se crean por el panel.
  Como el panel no puede borrar zonas (DEF-15-01) ni crear tasas sin devolver
  un error (DEF-15-02), la limpieza de zonas, tasas y clases se hace por SQL.
- **RF-16 (registro)**: el visor del panel lista todos los `.log` de
  `upload/system/storage/logs`. Las pruebas crean su propio `qa-e2e.log` con
  entradas conocidas, lo abren y lo vacían desde `tool/log`, y lo borran al
  terminar. Así no mezclan sus datos con `error.log` ni con las tareas que
  OpenCart ejecuta en segundo plano.

## Estructura

```
features/
  rf-06 … rf-16 *.feature   → los escenarios en Gherkin
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
| Preguntas | `Text.of`, `Value.of`, `Question.about` en `test/questions` |
| Verificación | `Ensure.eventually(pregunta, equals(...))` |

Cada escenario usa datos únicos (código de cupón, autor de la reseña, apellido
de la devolución, nombre de idioma, moneda, zona o pedido) y al terminar borra
lo que creó, pase o falle. Ese borrado se hace desde el panel cuando la pantalla
funciona y por SQL cuando OpenCart tiene el defecto correspondiente.

## Cómo se comprobó

La suite original (RF-06 a RF-11) se validó contra OpenCart 4.1.0.3: 29
escenarios, 24 que pasan y 5 `@defecto`. Las funcionalidades nuevas se
validaron contra la instalación actual (OpenCart 5.0.0.0 Alpha): los 24
escenarios de RF-12 a RF-16 sin `@defecto` pasan, y los 4 `@defecto`
(DEF-13-01, DEF-14-01, DEF-15-01 y DEF-15-02) fallan por los defectos
documentados. Al terminar no quedan pedidos, idiomas, monedas, zonas, tasas ni
clases de prueba.
