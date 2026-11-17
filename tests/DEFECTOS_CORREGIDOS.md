# Defectos corregidos en OpenCart 4.1.0.3 (17 nov 2026)

Las pruebas de regresión documentaban 37 defectos reales de OpenCart como pruebas
rojas (fase roja). Se corrigieron en el código de la tienda y ahora todas pasan
(fase verde): **Vitest 347/347**, **PHPUnit 110/110** (Santiago) y **77/77** (Andrés).

| Defecto | Qué pasaba | Dónde se corrigió |
|---|---|---|
| DEF-06-01 / 06-02 | `limit` negativo o `page` ≤ 0 daba paginación sin sentido | `catalog/controller/product/search.php` |
| DEF-06-03 | buscar `%` o `_` devolvía todo el catálogo | `catalog/model/catalog/product.php` (`addcslashes` en los `LIKE`) |
| DEF-07-01 / 07-02 | el carrito aceptaba cantidad 0 y editar/quitar claves inexistentes respondía "success" | `catalog/controller/checkout/cart.php`, `catalog/language/en-gb/checkout/cart.php` |
| DEF-07-03 | el total de la línea no era precio × cantidad | `catalog/model/checkout/cart.php` |
| DEF-08-01 / 08-04 | mensajes de cupón sin texto (`text_remove`, `error_remove`) y sin límite de intentos | `extension/opencart/catalog/controller/checkout/coupon.php` y su idioma |
| DEF-08-02 | el cupón vencía el día anterior a su fecha final | `catalog/model/marketing/coupon.php` |
| DEF-08-03 | el panel aceptaba descuentos negativos o de más del 100 % | `admin/controller/marketing/coupon.php` |
| DEF-08-05 | el botón *Remove* del cupón no hacía nada (lo atrapaba el manejador de quitar productos) | `catalog/view/template/checkout/cart.twig` (`a.btn-danger`) |
| DEF-09-01 | reseña sin campos mostraba avisos de PHP antes del JSON | `catalog/controller/product/review.php` |
| DEF-09-02 | un mismo token publicaba reseñas sin límite | `catalog/controller/product/review.php` (token de un solo uso) |
| DEF-10-01 | comparar mostraba las unidades exactas en vez de "In Stock" | `catalog/controller/product/compare.php` |
| DEF-11-01 | la devolución aceptaba pedido negativo o con letras y cantidad ≤ 0 | `catalog/controller/account/returns.php` |
| DEF-11-02 | el panel aceptaba un estado de devolución inexistente | `admin/controller/sale/returns.php` |
| DEF-11-03 | el error era el texto interno `error_return` | `admin/language/en-gb/sale/returns.php` |
| DEF-11-04 | el mensaje decía "mayor que 3" pero se aceptaba 1 carácter | `catalog/controller/account/returns.php` |
| DEF-11-05 | sin `product_id` aparecían avisos de PHP | `catalog/controller/account/returns.php` |
| DEF-11-06 | se aceptaban devoluciones de pedidos que no existen | `catalog/controller/account/returns.php` + `catalog/model/account/returns.php` (`hasOrder`) |
| DEF-11-07 | nunca se exigía aceptar las condiciones de devolución | `catalog/controller/account/returns.php` |
| DEF-SEG-01 | cookie de sesión sin `HttpOnly` | `system/framework.php`, `catalog/controller/startup/session.php` |
| DEF-SEG-02 | sin `X-Frame-Options` | `system/framework.php` |
| DEF-SEG-03 | `Access-Control-Allow-Credentials: true` abierto | `system/framework.php` |
| DEF-04-01 / 04-02 | borrar país o zona fallaba: el modelo de zonas geográficas no tenía los métodos que llaman los controladores | `admin/model/localisation/geo_zone.php` |
| DEF-02-02 | la lista de idiomas no marcaba el idioma por defecto ni se validaba al borrarlo | `admin/controller/localisation/language.php` (`config_language_catalog`) |

## Pedidos de prueba

La tienda ahora rechaza devoluciones de pedidos que no existen, y la tienda de
demostración no trae pedidos. Antes de correr las pruebas de RF-11 hay que sembrar
los pedidos 1234 y 4321:

```bash
mysql -uroot opencart < tests/regresion/santiago/sembrar-pedido.sql
```

El pipeline de Jenkins lo hace solo (etapa *Pruebas contra la tienda*).
