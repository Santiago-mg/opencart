<?php
declare(strict_types=1);

namespace OpenCart\Tests\Support;

/**
 * In-memory replacement for the OpenCart cache adapters.
 *
 * Models only rely on get/set/delete. Keeping the cache in memory makes each
 * test independent and prevents test data from leaking into the real cache.
 */
final class InMemoryCache {
    /**
     * @var array<string, mixed>
     */
    private array $data = [];

    /**
     * @return mixed
     */
    public function get(string $key) {
        return $this->data[$key] ?? [];
    }

    /**
     * @param mixed $value
     */
    public function set(string $key, $value, int $expire = 0): void {
        $this->data[$key] = $value;
    }

    public function delete(string $key): void {
        unset($this->data[$key]);
    }

    public function clear(): void {
        $this->data = [];
    }
}
