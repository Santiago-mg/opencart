<?php
declare(strict_types=1);

namespace OpenCart\Tests;

use Opencart\System\Engine\Config;
use Opencart\System\Engine\Registry;
use Opencart\System\Library\DB;
use OpenCart\Tests\Support\InMemoryCache;
use OpenCart\Tests\Support\TestEnvironment;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

/**
 * Base test case.
 *
 * Every test runs inside a database transaction which is rolled back during
 * tearDown, so the development database is never modified permanently.
 */
abstract class TestCase extends PHPUnitTestCase {
    protected Registry $registry;
    protected Config $config;
    protected DB $db;
    protected InMemoryCache $cache;

    protected function setUp(): void {
        parent::setUp();

        $this->registry = TestEnvironment::registry();
        $this->config = TestEnvironment::config();
        $this->db = TestEnvironment::db();
        $this->cache = TestEnvironment::cache();

        $this->cache->clear();

        $this->config->set('config_language_id', 1);
        $this->config->set('config_currency', 'USD');

        $this->db->query('START TRANSACTION');
    }

    protected function tearDown(): void {
        $this->db->query('ROLLBACK');
        $this->cache->clear();

        parent::tearDown();
    }

    /**
     * Loads an admin model through the real OpenCart loader and returns its proxy.
     */
    protected function model(string $route): object {
        $this->registry->get('load')->model($route);

        return $this->registry->get('model_' . str_replace('/', '_', $route));
    }

    /**
     * Runs a query and returns all rows.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function rows(string $sql): array {
        return $this->db->query($sql)->rows;
    }

    /**
     * Runs a query and returns the first row.
     *
     * @return array<string, mixed>
     */
    protected function row(string $sql): array {
        return $this->db->query($sql)->row;
    }
}
