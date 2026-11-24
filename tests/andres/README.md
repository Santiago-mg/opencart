# Pruebas PHPUnit de Andrés — RF1 a RF5 (OpenCart 4.1.0.3)

Son las pruebas que Andrés escribió para OpenCart 5, pasadas a OpenCart 4.1.0.3
y a PHPUnit 9.6. Prueban los modelos del panel de administración y la librería
de logs con la base de datos de verdad: cada prueba abre una transacción
(`START TRANSACTION`) y la deshace al final (`ROLLBACK`), así que la base queda
igual que antes. La caché se reemplaza por una en memoria y los logs se
escriben en `tmp/logs/`, nunca en los de la tienda.

## Qué cubren

| RF | Qué se prueba | Archivos | Pasan | Defecto (`@group defecto`) |
|---|---|---|---:|---|
| 1 | Filtros de pedidos en el panel: id, cliente, estado, total, fechas, orden y paginación (`admin/model/sale/order.php`) | `Unit/Order/OrderFilterTest.php`, `Regression/OrderFilterRegressionTest.php` | 24 | — |
| 2 | Idiomas: crear, editar, listar, borrar y sus URL SEO (`admin/model/localisation/language.php`) | `Unit/Localisation/LanguageTest.php`, `Regression/LocalisationRegressionTest.php` | 14 | — |
| 3 | Monedas: crear, editar, valor por código, listar y borrar (`admin/model/localisation/currency.php`) | `Unit/Localisation/CurrencyTest.php`, `Regression/LocalisationRegressionTest.php` | 12 | — |
| 4 | Zonas geográficas, tasas, clases y reglas de impuesto (`geo_zone.php`, `tax_rate.php`, `tax_class.php`) | `Unit/Localisation/GeoZoneTaxTest.php`, `Regression/GeoZoneTaxRegressionTest.php` | 12 | 4 pruebas: DEF-04-01 y DEF-04-02 |
| 5 | Logs en archivo (`system/library/log.php`) | `Unit/System/LogTest.php`, `Regression/LogRegressionTest.php` | 11 | — |
| | **Total** | | **73** | **4** |

### Defectos encontrados en 4.1.0.3

- **DEF-04-01**: el modelo `localisation/geo_zone` no tiene
  `getTotalZoneToGeoZoneByCountryId()`, pero `admin/controller/localisation/country.php`
  lo llama al borrar (línea 475), así que borrar un país desde el panel siempre da error.
- **DEF-04-02**: tampoco tiene `getTotalZoneToGeoZoneByZoneId()`, que llama
  `admin/controller/localisation/zone.php` al borrar (línea 453), así que borrar una
  zona desde el panel siempre da error.

El modelo los tiene con otro nombre (`getTotalZonesByCountryId()` y
`getTotalZonesByZoneId()`); OpenCart 5 lo corrigió renombrándolos. Las 4 pruebas
fallan solo por eso: si se agregan los dos métodos, pasan las 4 (20 aserciones).

## Cómo correrlas

### En el Mac, solo con Docker

Desde la raíz del repositorio, con la tienda arriba (`docker compose up -d opencart`):

```bash
# 1) Instalar PHPUnit 9.6 en tests/andres/vendor (solo la primera vez)
docker run --rm -v "$PWD":/app -w /app/tests/andres composer:2 composer install -q

# 2) Correr las pruebas con la imagen de la tienda (PHP 8.2 con mysqli),
#    en la misma red que MySQL
docker compose run --rm -u root -v "$PWD":/app -w /app/tests/andres \
  -e DB_HOSTNAME=mysql opencart vendor/bin/phpunit --exclude-group defecto
```

La imagen `composer:2` sirve para instalar, pero no para correr: no trae la
extensión `mysqli`. Y en Docker Desktop para Mac `--network host` no llega al
MySQL del Mac, por eso se usa la red de Compose y el nombre `mysql`.

### En el Mac con PHP y Composer instalados (por ejemplo con Homebrew)

```bash
cd tests/andres
composer install
vendor/bin/phpunit --exclude-group defecto
```

Por defecto se conecta a `127.0.0.1:3306`, usuario `root`, clave `opencart`,
base `opencart`, que es el MySQL que publica el `docker-compose.yml`. Como todo
se deshace al final, se puede correr sobre la base de la tienda; solo conviene
no usar la tienda mientras corren (tardan unos segundos).

### Con el PHPUnit del sistema (sin Composer)

Si `phpunit` 9.6 ya está instalado, no hace falta `vendor/`. Los datos de la
base se cambian con variables de entorno (`DB_HOSTNAME`, `DB_PORT`,
`DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PREFIX`):

```bash
cd tests/andres
DB_HOSTNAME=127.0.0.1 DB_USERNAME=oc DB_PASSWORD=ocpass DB_DATABASE=opencart_phpunit \
  phpunit --exclude-group defecto
```

### Con o sin los defectos

```bash
phpunit                          # las 77 (las 4 de defecto fallan a propósito)
phpunit --exclude-group defecto  # las 73 que deben pasar
phpunit --group defecto          # solo las 4 de defecto
phpunit --testsuite Regression   # solo las de regresión
phpunit --testdox                # con los nombres de las pruebas
```

Con Composer también están `composer test`, `composer test:sin-defectos` y
`composer test:defectos`.

## Qué cambió frente a la versión de OpenCart 5

Solo lo que es distinto entre las dos versiones; cada cambio tiene un
comentario `OC 4.1.0.3:` en el código.

- La suite vive en `tests/andres/` (en el Mac `tests/Unit` y `tests/unit` serían
  la misma carpeta) y usa PHPUnit 9.6 en lugar de 11.5.
- `DB` recibe los datos de conexión por posición, no en un arreglo.
- `getOrders()` ordena con `'o.date_added'` (en OpenCart 5 era `'date_added'`).
- `getLanguages()` viene indexado por código (`'zz-zz'`), no por `language_id`;
  por eso una prueba ahora se llama `testGetLanguagesReturnsRecordsKeyedByCode`.
- `geo_zone` no tiene `getZonesByCountryId()` y `tax_rate` no tiene
  `getTaxRatesByGeoZoneId()` (llegaron en OpenCart 5); se reemplazan con la API de
  4.1.0.3 (`Support/TaxRatesByGeoZone.php`).
- La caché en memoria borra por prefijo, como la caché real de OpenCart.

## Resultado

Corrida del 16/11/2026 (PHPUnit 9.6.17, PHP 8.3, MariaDB 10.11), guardada en `evidencia/`:

- `1-sin-defectos.txt`: 73 pruebas, 203 aserciones, todas pasan; también en
  orden aleatorio (semillas 11, 22 y 33) y dos veces seguidas con el mismo resultado.
- `2-defectos.txt`: las 4 pruebas de defecto fallan por los métodos que faltan.

Después de las corridas la base tenía exactamente los mismos registros que antes.
