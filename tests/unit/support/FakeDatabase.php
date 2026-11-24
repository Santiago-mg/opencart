<?php
namespace Tests\Support;

/**
 * Doble de la base de datos (un "fake"): en vez de MySQL, responde según
 * reglas que programa cada prueba y anota todas las consultas que recibe.
 *
 *   $db->answer('/FROM `oc_coupon` WHERE `code`/', [['coupon_id' => 1, ...]]);
 *   ...
 *   assertThat($db->lastQuery(), containsString("LIKE '%mac%'"));
 */
class FakeDatabase {
    /** @var array<int, array{0: string, 1: array}> */
    private array $rules = [];

    /** @var string[] */
    public array $queries = [];

    /** Cuando una consulta coincide con el patrón, devuelve esas filas. */
    public function answer(string $pattern, array $rows): self {
        $this->rules[] = [$pattern, $rows];
        return $this;
    }

    public function query(string $sql): object {
        $this->queries[] = $sql;
        foreach ($this->rules as [$pattern, $rows]) {
            if (preg_match($pattern, $sql)) {
                return (object)['num_rows' => count($rows), 'row' => $rows[0] ?? [], 'rows' => $rows];
            }
        }
        return (object)['num_rows' => 0, 'row' => [], 'rows' => []];
    }

    /** Igual que mysqli::real_escape_string para lo que importa aquí: comillas y barras. */
    public function escape(string $value): string {
        return addslashes($value);
    }

    public function getLastId(): int {
        return 77;
    }

    public function lastQuery(): string {
        return end($this->queries) ?: '';
    }

    /** Las consultas que contienen ese texto. */
    public function queriesContaining(string $text): array {
        return array_values(array_filter($this->queries, fn (string $sql) => str_contains($sql, $text)));
    }
}
