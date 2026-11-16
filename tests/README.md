# OpenCart PHPUnit test suite

Automated tests for the admin order filtering, language/currency configuration,
geo zones and tax rules, and file logging.

## Requirements

- The Docker stack must be running (`make up`).
- PHP 8.2+ with `mysqli`, `mbstring`, `dom` and `xml` (all present in the `php`
  container).

PHPUnit is a development dependency of this directory only; it is not added to
the application's `composer.json` and does not touch the vendored libraries in
`upload/system/storage/vendor`.

## Running the tests

From the repository root:

```bash
make test
```

Or directly:

```bash
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www/tests && composer install --no-interaction --prefer-dist'
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www && tests/vendor/bin/phpunit -c phpunit.xml'
```

Run a single test file:

```bash
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www && tests/vendor/bin/phpunit -c phpunit.xml tests/Unit/Order/OrderFilterTest.php'
```

Run only the regression suite:

```bash
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www && tests/vendor/bin/phpunit -c phpunit.xml --testsuite Regression'
```

## Feature unit suite (RF-06 to RF-11)

The PHPUnit suite from the `proyecto-4.1.0.3` branch is kept in `tests/unit`
and runs independently of the suite above. It needs its own dependencies:

```bash
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www/tests/unit && composer install --no-interaction --prefer-dist'
docker compose --env-file=./docker/.env.docker exec -T php \
  sh -c 'cd /var/www/tests/unit && vendor/bin/phpunit --exclude-group defecto'
```

Use `--group defecto` to run the seven red-phase tests that intentionally fail
until the corresponding OpenCart defects are fixed. See `tests/unit/README.md`
for the full feature breakdown.

## How isolation works

`tests/bootstrap.php` builds a normal OpenCart registry (`Config`, `DB`,
`Loader`, `Factory`, `Event`) but does not start an HTTP request or a session.
The cache is replaced with an in-memory implementation so tests cannot pollute
`upload/system/storage/cache`.

Each test starts a MySQL transaction in `TestCase::setUp()` and issues a
`ROLLBACK` in `tearDown()`. Test records are therefore never persisted, even
when they are inserted, edited or deleted. `OrderFilterTest` also clears the
order table inside the transaction so its counts do not depend on existing
development orders.

Log files are written to `tests/tmp/logs/`, which is ignored by Git, so the
real application logs are untouched.

The database connection is read from the same environment variables used by
the PHP container (`DB_DRIVER`, `DB_HOSTNAME`, `DB_USERNAME`, `DB_PASSWORD`,
`DB_DATABASE`, `DB_PORT`, `DB_PREFIX`).

## What is covered

| Area | Test file |
| --- | --- |
| Orders by ID, customer name, status, total, date range, sorting/pagination and totals | `tests/Unit/Order/OrderFilterTest.php` |
| Language creation, configuration, listing, extension filtering and deletion | `tests/Unit/Localisation/LanguageTest.php` |
| Currency creation, configuration, value updates, listing and deletion | `tests/Unit/Localisation/CurrencyTest.php` |
| Geo zones, zone assignment, tax rates, tax classes and tax rules | `tests/Unit/Localisation/GeoZoneTaxTest.php` |
| Log file creation, append behaviour, formatting and isolation | `tests/Unit/System/LogTest.php` |
| Order filter precedence, escaped names, calendar-day dates, exact totals, sort/limit fallbacks | `tests/Regression/OrderFilterRegressionTest.php` |
| Language SEO cascade and safe delete/edit, currency precision and update isolation | `tests/Regression/LocalisationRegressionTest.php` |
| Geo zone edit semantics, tax rate/class/rule isolation and customer-group replacement | `tests/Regression/GeoZoneTaxRegressionTest.php` |
| Falsy values, multiline messages, append-only instances and timestamp format | `tests/Regression/LogRegressionTest.php` |
