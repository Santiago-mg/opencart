<?php
declare(strict_types=1);

namespace OpenCart\Tests\Support;

use Opencart\System\Engine\Autoloader;
use Opencart\System\Engine\Config;
use Opencart\System\Engine\Event;
use Opencart\System\Engine\Factory;
use Opencart\System\Engine\Loader;
use Opencart\System\Engine\Registry;
use Opencart\System\Library\DB;

/**
 * Builds and holds the OpenCart registry used by the test suite.
 */
final class TestEnvironment {
    private static ?Registry $registry = null;

    public static function boot(): void {
        if (self::$registry !== null) {
            return;
        }

        $autoloader = new Autoloader();
        $autoloader->register('Opencart\\Admin', DIR_APPLICATION);
        $autoloader->register('Opencart\\Catalog', DIR_CATALOG);
        $autoloader->register('Opencart\\Extension', DIR_EXTENSION);
        $autoloader->register('Opencart\\System', DIR_SYSTEM);

        $registry = new Registry();

        $config = new Config();
        $config->set('application', 'Admin');
        $config->set('config_language_id', 1);
        $config->set('config_currency', 'USD');
        $config->set('config_store_id', 0);

        $db = new DB([
            'engine'   => DB_DRIVER,
            'hostname' => DB_HOSTNAME,
            'username' => DB_USERNAME,
            'password' => DB_PASSWORD,
            'database' => DB_DATABASE,
            'port'     => DB_PORT,
            'ssl_key'  => DB_SSL_KEY,
            'ssl_cert' => DB_SSL_CERT,
            'ssl_ca'   => DB_SSL_CA,
        ]);

        $cache = new InMemoryCache();
        $event = new Event($registry);
        $loader = new Loader($registry);
        $factory = new Factory($registry);

        $registry->set('autoloader', $autoloader);
        $registry->set('config', $config);
        $registry->set('db', $db);
        $registry->set('cache', $cache);
        $registry->set('event', $event);
        $registry->set('load', $loader);
        $registry->set('factory', $factory);

        self::$registry = $registry;
    }

    public static function registry(): Registry {
        return self::$registry;
    }

    public static function db(): DB {
        return self::$registry->get('db');
    }

    public static function config(): Config {
        return self::$registry->get('config');
    }

    public static function cache(): InMemoryCache {
        return self::$registry->get('cache');
    }
}
