# Pruebas E2E de OpenCart con Cypress — RF-06 a RF-11

Los mismos 29 casos de [`../serenityjs/`](../serenityjs/README.md), escritos con
**Cypress** y organizados con la misma idea de **Screenplay**: actores que hacen
tareas y preguntan por lo que ven. Cypress no trae Screenplay (es de
Serenity/JS), así que la estructura está armada a mano, igual que en las
pruebas de Cypress de CelularPro.

Además de los casos de la interfaz (`*.web.cy.ts`), cada funcionalidad tiene
casos que llaman directamente a las acciones de la tienda con `cy.request`
(`*.api.cy.ts`): lo que responde OpenCart cuando la pantalla le manda el
formulario.

## 1. Encender la tienda

```bash
cd ~/Documents/opencart
docker compose up -d opencart
```

Tienda en <http://localhost>, panel en <http://localhost/admin> (`admin` / `admin`).
Si corre en otro lado: `OPENCART_URL`, `OPENCART_ADMIN_USER` y `OPENCART_ADMIN_PASSWORD`.

## 2. Correr las pruebas

```bash
cd e2e/santiago/cypress
npm install                 # instala Cypress y descarga su navegador (solo la primera vez)
npm test                    # los 47 casos, sin abrir ventana
```

| Comando | Qué corre |
|---|---|
| `npm test` | todos los casos (36 pasan y 11 fallan: son los defectos encontrados) |
| `npm run test:sin-defectos` | salta los 11 de defectos: los 36 restantes deben pasar todos |
| `npm run cy:open` | la ventana interactiva de Cypress, para ver cada paso |
| `npm run test:web` | los 29 de la interfaz |
| `npm run test:api` | los 18 de las acciones de la tienda |
| `npm run test:rf-08` | una sola funcionalidad (`rf-06` … `rf-11`) |
| `npm run typecheck` | revisa los tipos de TypeScript sin correr nada |

Requiere Node.js 22.22.2 o 24.15.0 en adelante dentro de esas ramas.

## Qué se prueba

| RF | Funcionalidad | Web | API | Defectos (fallan hoy) |
|---|---|---:|---:|---|
| 06 | Búsqueda y filtrado | 7 | 4 | DEF-06-03 (`%` trae todo el catálogo), DEF-06-01 (límite negativo) |
| 07 | Carrito de compras | 6 | 3 | DEF-07-03 (total de la línea), DEF-07-01 (cantidad 0 responde "success") |
| 08 | Cupones de descuento | 5 | 3 | DEF-08-05 (el botón *Remove* no hace nada), DEF-08-01 (`text_remove`) |
| 09 | Reseñas de productos | 4 | 3 | DEF-09-02 (el token de la reseña se puede reutilizar) |
| 10 | Comparar productos | 4 | 2 | DEF-10-01 (la disponibilidad muestra las unidades) |
| 11 | Devoluciones | 3 | 3 | DEF-11-01 (pedido negativo, en la web y en la API) |
| | **Total** | **29** | **18** | **11** |

Los casos de defectos están dentro de `describeDefects('Defectos encontrados', …)`
y llevan el código del defecto en el nombre (`[DEF-07-03] …`). Fallan a
propósito: describen lo que OpenCart debería hacer (fase roja de TDD) y van a
pasar cuando se corrija el código.

## Estructura

```
cypress/
  e2e/                    → los casos: un archivo por funcionalidad y tipo (web / api)
  support/
    hooks.ts              → antes de cada prueba: reparto y datos nuevos;
                            después: borra cupones, reseñas y devoluciones de prueba
    defects.ts            → describeDefects (se salta con test:sin-defectos)
    screenplay/           → actor.ts (Actor, libreta de notas), question.ts
                            (Questions y verificaciones), testData.ts, environment.ts
    tasks/                → lo que hace un actor en la tienda (SearchProducts,
                            AddToCart, ApplyCoupon, WriteReview, RequestReturn...)
    tasks/api/            → lo mismo, llamando a las acciones de la tienda (cy.request)
    tasks/admin/          → lo que prepara la administradora en el panel (cupones,
                            aprobar reseñas, revisar devoluciones), por HTTP
    questions/            → lo que el actor mira (Cart, SearchResults, Comparison...)
                            y lo que responde la tienda (theResponseTo)
    ui/targets.ts         → los selectores, solo aquí
    ui/pages.ts           → cada pantalla, lista para usar con cy.get
```

| Pieza de Screenplay | En Serenity/JS | Aquí |
|---|---|---|
| Actor | `actorCalled('Carlos')` | `actorCalled('Carlos')` (`screenplay/actor.ts`) |
| Tarea | `Task.where(...)` | función `(actor) => { ... }` (`tasks/`) |
| Pregunta | `Text.of(...)`, `Question.about(...)` | `textOf(...)`, `textsOf(...)`, `countOf(...)` |
| Verificación | `Ensure.eventually(pregunta, equals(x))` | `actor.sees(pregunta).toEqual(x)` |
| Page object | `PageElement`, `By.css(...)` | `ui/pages.ts` |

Un caso se lee igual que en Gherkin:

```ts
const carlos = actorCalled('Carlos')
const coupon = TestData.coupon({ type: 'P', discount: 10 })
actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))   // Given

carlos.attemptsTo(ApplyCoupon.withCode(coupon.code))          // When

carlos.sees(Cart.couponDiscount()).toEqual('$-10.10')         // Then
carlos.sees(Cart.total()).toEqual('$111.08')
```

Actores: **Carlos** y **Bruno** son clientes (cada uno con su propia sesión:
cuando el navegador pasa de uno a otro se borran las cookies) y **Ana** es la
administradora, que solo usa el panel por HTTP.
