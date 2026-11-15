# Pruebas E2E de OpenCart con Gherkin y Serenity/JS — RF-06 a RF-11

Pruebas de aceptación escritas en **Gherkin** (Cucumber) y automatizadas con
**Serenity/JS + Playwright** usando el **patrón Screenplay**, con la misma
estructura de las de CelularPro (`e2e/santiago/serenityjs`).

Corren contra la tienda real encendida: un navegador hace lo que haría una
persona. Lo único que se prepara por HTTP es lo que le toca a la
administradora (publicar un cupón, aprobar una reseña, revisar una devolución),
igual que en CelularPro se preparaban los datos por la API.

## 1. Encender la tienda

```bash
cd ~/Documents/opencart
docker compose up -d opencart
```

Tienda en <http://localhost>, panel en <http://localhost/admin> (`admin` / `admin`).
Si corre en otro lado: `OPENCART_URL`, `OPENCART_ADMIN_USER` y `OPENCART_ADMIN_PASSWORD`.

## 2. Correr las pruebas

```bash
cd e2e/santiago/serenityjs
npm install
npx playwright install chromium   # solo la primera vez
npm test                          # los 29 escenarios
```

| Comando | Qué corre |
|---|---|
| `npm test` | todos los escenarios |
| `npm run test:sin-defectos` | los 24 que describen lo que funciona (deben pasar todos) |
| `npm run test:defectos` | los 5 que demuestran defectos de OpenCart (hoy fallan) |
| `npm run test:smoke` | uno por funcionalidad |
| `npm test -- --tags @rf-08` | una sola funcionalidad (`@rf-06` … `@rf-11`) |
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
| | **Total** | **29** | **5** |

DEF-08-05 solo se ve en el navegador: el botón está dentro del carrito y el
código que quita productos (`$('#shopping-cart').on('click', '.btn-danger', …)`
en `checkout/cart.twig`) atrapa también su clic, así que nunca se llama a
`coupon.remove`. Las pruebas de Vitest, que hablan por HTTP, no podían verlo.

## Estructura

```
features/
  rf-06 … rf-11 *.feature   → los escenarios en Gherkin
  step-definitions/         → cada paso traducido a tareas y preguntas
  support/                  → serenity.config.ts (actores y reportes) y hooks.ts (limpieza)
test/
  support/                  → environment.ts (direcciones) y testData.ts (datos únicos)
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
de la devolución) y al terminar borra desde el panel lo que creó, pase o falle.

## Cómo se comprobó

Dos corridas seguidas contra OpenCart 4.1.0.3 con los datos de demostración:
29 escenarios con 24 que pasan y 5 que fallan (los cinco `@defecto`), y
`npm run test:sin-defectos` con 24 de 24. Al terminar no quedó ningún cupón,
reseña ni devolución de prueba en la base de datos.
