# Pruebas unitarias de OpenCart con PHPUnit — RF-06 a RF-11

Pruebas unitarias del código PHP de mis seis funcionalidades: el modelo, el
controlador o la librería donde está la lógica, probados uno por uno, sin la
tienda encendida y sin base de datos. Es el punto 6 de la rúbrica (TDD y
pruebas unitarias) y la parte de código de las pruebas de caja blanca (punto 5).

| Lo que pide la rúbrica | Dónde se ve |
|---|---|
| Patrón **AAA** | cada prueba separa `// Arrange`, `// Act` y `// Assert` |
| **Aserciones fluidas** | Hamcrest, la versión PHP de PyHamcrest del curso: `assertThat($cupon, hasKeyValuePair('code', 'QA10'))` |
| **Test doubles** | *fake* de la base de datos (`support/FakeDatabase.php`), *stubs* de config, sesión, petición e idioma (`support/Doubles.php`), *spy* de la respuesta y dobles parciales de los modelos |
| **Mocks** | `expects($this->once())` / `expects($this->never())`: el modelo guarda la reseña o la devolución una sola vez si es válida y nunca si no; la caché evita volver a la base |
| **FIRST** | *Fast*: 109 pruebas en menos de 0,1 s · *Independent*: corren en orden aleatorio (`executionOrder="random"`) · *Repeatable*: no dependen de la base ni de la hora · *Self-validating*: pasan o fallan solas · *Timely*: las de `@group defecto` se escribieron antes de la corrección |
| **Caja blanca** | un caso por cada camino independiente de los grafos de `Diagramas OpenCart/Grafos` |
| **Caja negra** | `@dataProvider` con particiones de equivalencia y valores límite (nombre 2/3/25/26, texto 24/25/1000/1001, calificación 0/1/5/6, existencias 4/5/6, compra mínima 100.99/101/101.01…) |
| **TDD** | las 7 pruebas `@group defecto` son la **fase roja**: describen el comportamiento correcto y hoy fallan por un defecto de OpenCart |
| **Cobertura** | PCOV, por método probado (ver abajo) |

## Qué se prueba

| RF | Código probado | Pruebas que pasan | Fase roja (`@group defecto`) |
|---|---|---:|---|
| 06 | `catalog/model/catalog/product.php` → `getProducts()`, `getTotalProducts()` | 25 | DEF-06-03: `%` y `_` no se escapan en el `LIKE` |
| 07 | `system/library/cart/cart.php` → `add()`, `update()`, `remove()`, `getProducts()`, `hasStock()`, `hasMinimum()` | 16 | — |
| 08 | `catalog/model/marketing/coupon.php` → `getCoupon()` y `extension/opencart/catalog/model/total/coupon.php` → `getTotal()` | 21 | — |
| 09 | `catalog/controller/product/review.php` → `write()` | 19 | DEF-09-01: falta un campo y sale un aviso de PHP · DEF-09-02: el token sirve para varias reseñas |
| 10 | `catalog/controller/product/compare.php` → `add()` | 7 | — |
| 11 | `catalog/controller/account/returns.php` → `save()` | 14 | DEF-11-01: acepta pedidos `-5` y `abc` · DEF-11-07: nunca exige aceptar las condiciones de devolución |
| | **Total** | **102** | **7** |

DEF-11-07 es nuevo: solo se ve probando el controlador por dentro. El código
revisa `!isset($post_info['agree'])`, pero ese campo siempre existe porque se
completa con `0` por defecto, así que la casilla de condiciones nunca es
obligatoria.

## Cómo correrlas

Con PHP 8.2 o más y Composer:

```bash
cd tests/unit
composer install
composer test                # las 109 (las 7 de defecto fallan a propósito)
composer test:sin-defectos   # las 102 que deben pasar
composer test:defectos       # solo la fase roja del TDD
composer test:cobertura      # con cobertura (necesita la extensión pcov o xdebug)
```

Sin PHP en el computador, con Docker:

```bash
docker run --rm -v "$PWD/../..":/app -w /app/tests/unit composer:2 \
  sh -c "composer install -q && vendor/bin/phpunit --exclude-group defecto"
```

Una funcionalidad sola: `vendor/bin/phpunit rf-08`. Con los nombres en
español: `vendor/bin/phpunit --testdox`.

> **Compatibilidad con OpenCart 5:** la suite quedó adaptada a
> `5.0.0.0 Alpha`. Los dobles de prueba resuelven los controladores y archivos
> de idioma que se movieron de `product/` a `catalog/`, y el bootstrap ya no
> exige `validation.php` porque esas funciones viven en `general.php`.

## Resultados

Corrida del 15/11/2026 (PHPUnit 9.6.17, PHP 8.3, OpenCart 4.1.0.3), guardada en `evidencia/`:

- `1-sin-defectos.txt`: 102 pruebas, 150 aserciones, todas pasan. Se repitió con
  las semillas de orden aleatorio 11, 22 y 33 con el mismo resultado.
- `2-fase-roja-tdd-defectos.txt`: las 7 pruebas de defectos fallan.
- `3-cobertura.txt`: cobertura por archivo.

Cobertura de líneas de los métodos probados:

| Método | Cobertura |
|---|---:|
| `product/compare.php` → `add()` | 95,5 % |
| `product/review.php` → `write()` | 90,7 % |
| `marketing/coupon.php` → `getCoupon()` | 88,2 % |
| `account/returns.php` → `save()` | 86,3 % |
| `catalog/product.php` → `getProducts()` | 82,1 % |
| `total/coupon.php` → `getTotal()` | 77,6 % |
| `cart.php` → `getProducts()` | 42,3 % (no se cubren opciones, suscripciones ni descuentos por cantidad) |
| `catalog/product.php` → `getTotalProducts()` | 29,8 % |
| `cart.php` → `add`, `update`, `remove`, `hasStock`, `hasMinimum`, `countProducts`, `hasProducts` | 100 % |
| **Total de los métodos probados** | **67,8 %** (339 de 500 líneas) |

Lo que falta del TDD (la corrección que hace pasar la fase roja y la
refactorización) queda pendiente a propósito, hasta decidir qué se corrige.
