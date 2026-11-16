<?php
declare(strict_types=1);

namespace OpenCart\Tests\Support;

/**
 * Shared helpers for tests that need real order rows.
 */
trait CreatesOrders {
    /**
     * @param array<string, mixed> $data
     */
    private function createOrder(array $data): int {
        $row = $data + [
            'store_id'              => 0,
            'store_name'            => 'Default',
            'customer_id'           => 0,
            'firstname'             => 'Test',
            'lastname'              => 'Customer',
            'email'                 => 'test@example.com',
            'custom_field'          => '',
            'payment_custom_field'  => '',
            'payment_method'        => '',
            'shipping_custom_field' => '',
            'shipping_method'       => '',
            'total'                 => '0.0000',
            'order_status_id'       => 1,
            'language_id'           => 1,
            'language_code'         => 'en-gb',
            'currency_code'         => 'USD',
            'currency_value'        => '1.00000000',
            'date_added'            => '2024-01-01 00:00:00',
            'date_modified'         => '2024-01-01 00:00:00',
        ];

        $columns = [];

        foreach ($row as $column => $value) {
            $columns[] = "`" . $column . "` = '" . $this->db->escape((string)$value) . "'";
        }

        $this->db->query("INSERT INTO `" . DB_PREFIX . "order` SET " . implode(', ', $columns));

        return $this->db->getLastId();
    }

    /**
     * Removes all orders inside the current test transaction.
     */
    private function deleteAllOrders(): void {
        $this->db->query("DELETE FROM `" . DB_PREFIX . "order`");
    }
}
