<?php
/**
 * PHPUnit bootstrap for OpenCart 4.1.0.3.
 *
 * Builds a minimal OpenCart registry (config, database, loader and cache) without
 * starting an HTTP request or a session, then exposes it to the test suite.
 */
declare(strict_types=1);

// OC 4.1.0.3: con Composer se usa vendor/autoload.php; sin él se usa el
// PHPUnit global (phpunit 9.6 instalado en el sistema), que ya trae su autoload.
if (is_file(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// OC 4.1.0.3: la suite vive en tests/andres, así que la raíz está dos niveles arriba.
$root   = dirname(__DIR__, 2);
$upload = $root . '/upload/';

// Application
define('APPLICATION', 'Admin');

// Directories
define('DIR_OPENCART', $upload);
define('DIR_APPLICATION', DIR_OPENCART . 'admin/');
define('DIR_SYSTEM', DIR_OPENCART . 'system/');
define('DIR_EXTENSION', DIR_OPENCART . 'extension/');
define('DIR_IMAGE', DIR_OPENCART . 'image/');
define('DIR_STORAGE', DIR_SYSTEM . 'storage/');
define('DIR_CATALOG', DIR_OPENCART . 'catalog/');
define('DIR_LANGUAGE', DIR_APPLICATION . 'language/');
define('DIR_TEMPLATE', DIR_APPLICATION . 'view/template/');
define('DIR_CONFIG', DIR_SYSTEM . 'config/');
define('DIR_CACHE', DIR_STORAGE . 'cache/');
define('DIR_DOWNLOAD', DIR_STORAGE . 'download/');
define('DIR_SESSION', DIR_STORAGE . 'session/');
define('DIR_UPLOAD', DIR_STORAGE . 'upload/');

// Logs are redirected to an isolated directory so tests never touch the
// application's real log files.
define('DIR_LOGS', __DIR__ . '/tmp/logs/');

// HTTP
// OC 4.1.0.3: igual que el admin/config.php que escribe el instalador de 4.1.0.3,
// HTTP_CATALOG es la URL de la tienda y HTTP_SERVER la del panel (…/admin/).
define('HTTP_CATALOG', getenv('OPENCART_HTTP_SERVER') ?: 'http://localhost/');
define('HTTP_SERVER', HTTP_CATALOG . 'admin/');
define('HTTPS_SERVER', HTTP_SERVER);
define('OPENCART_SERVER', 'https://www.opencart.com/');

// Database
// OC 4.1.0.3: valores por defecto del docker-compose.yml del proyecto
// (MySQL publicado en 127.0.0.1:3306, usuario root, clave opencart, base opencart).
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'mysqli');
define('DB_HOSTNAME', getenv('DB_HOSTNAME') ?: '127.0.0.1');
define('DB_USERNAME', getenv('DB_USERNAME') ?: 'root');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'opencart');
define('DB_DATABASE', getenv('DB_DATABASE') ?: 'opencart');
define('DB_PREFIX', getenv('DB_PREFIX') ?: 'oc_');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_SSL_KEY', getenv('DB_SSL_KEY') ?: '');
define('DB_SSL_CERT', getenv('DB_SSL_CERT') ?: '');
define('DB_SSL_CA', getenv('DB_SSL_CA') ?: '');

// OpenCart core classes
require_once DIR_SYSTEM . 'engine/autoloader.php';
require_once DIR_SYSTEM . 'engine/config.php';
require_once DIR_SYSTEM . 'helper/general.php';

// Test support
require_once __DIR__ . '/Support/InMemoryCache.php';
require_once __DIR__ . '/Support/CreatesOrders.php';
require_once __DIR__ . '/Support/TaxRatesByGeoZone.php';
require_once __DIR__ . '/Support/TestEnvironment.php';
require_once __DIR__ . '/TestCase.php';

if (!is_dir(DIR_LOGS)) {
    mkdir(DIR_LOGS, 0777, true);
}

\OpenCart\Tests\Support\TestEnvironment::boot();
