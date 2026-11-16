<?php
declare(strict_types=1);

namespace OpenCart\Tests\Unit\Order;

use OpenCart\Tests\Support\CreatesOrders;
use OpenCart\Tests\TestCase;

/**
 * Tests the order filters exposed by the admin sale/order model.
 */
final class OrderFilterTest extends TestCase {
    use CreatesOrders;

    /**
     * @var array<string, int>
     */
    private array $orders = [];

    protected function setUp(): void {
        parent::setUp();

        // The transaction is rolled back in tearDown; clearing the table here
        // makes the assertions independent from any pre-existing development
        // data without permanently deleting it.
        $this->deleteAllOrders();

        $this->orders['alice'] = $this->createOrder([
            'customer_id'     => 10,
            'firstname'       => 'Alice',
            'lastname'        => 'Smith',
            'email'           => 'alice@example.com',
            'order_status_id' => 1,
            'total'           => '100.0000',
            'custom_field'    => '{"delivery":"morning"}',
            'payment_method'  => '{"name":"Cash On Delivery","code":"cod"}',
            'date_added'      => '2024-01-10 09:00:00',
            'date_modified'   => '2024-01-11 09:00:00',
        ]);

        $this->orders['bob'] = $this->createOrder([
            'customer_id'     => 11,
            'firstname'       => 'Bob',
            'lastname'        => 'Jones',
            'email'           => 'bob@example.com',
            'order_status_id' => 2,
            'total'           => '250.5000',
            'date_added'      => '2024-02-15 12:30:00',
            'date_modified'   => '2024-02-16 12:30:00',
        ]);

        $this->orders['carol'] = $this->createOrder([
            'customer_id'     => 12,
            'firstname'       => 'Carol',
            'lastname'        => 'White',
            'email'           => 'carol@example.com',
            'order_status_id' => 5,
            'total'           => '99.9900',
            'date_added'      => '2024-03-20 18:45:00',
            'date_modified'   => '2024-03-21 18:45:00',
        ]);

        // Abandoned / incomplete order: must be hidden by the default filter.
        $this->orders['dave'] = $this->createOrder([
            'customer_id'     => 13,
            'firstname'       => 'Dave',
            'lastname'        => 'Brown',
            'email'           => 'dave@example.com',
            'order_status_id' => 0,
            'total'           => '10.0000',
            'date_added'      => '2024-04-01 08:00:00',
            'date_modified'   => '2024-04-01 08:00:00',
        ]);

        // Same status and total as Alice, but a different date.
        $this->orders['eve'] = $this->createOrder([
            'customer_id'     => 14,
            'firstname'       => 'Eve',
            'lastname'        => 'Stone',
            'email'           => 'eve@example.com',
            'order_status_id' => 1,
            'total'           => '100.0000',
            'date_added'      => '2023-12-31 23:00:00',
            'date_modified'   => '2024-01-01 23:00:00',
        ]);
    }

    public function testDefaultListExcludesOrdersWithStatusZero(): void {
        $rows = $this->orders()->getOrders();

        $this->assertCount(4, $rows);
        $this->assertNotContains($this->orders['dave'], array_map(static fn(array $row): int => (int)$row['order_id'], $rows));
    }

    public function testFilterByOrderIdReturnsOnlyThatOrder(): void {
        $rows = $this->orders()->getOrders(['filter_order_id' => $this->orders['bob']]);

        $this->assertCount(1, $rows);
        $this->assertSame($this->orders['bob'], (int)$rows[0]['order_id']);
        $this->assertSame('Bob Jones', $rows[0]['customer']);
    }

    public function testFilterByCustomerNameIsPartialAndCaseInsensitive(): void {
        $orderModel = $this->orders();

        $byFirstName = $orderModel->getOrders(['filter_customer' => 'alice']);
        $this->assertSame([$this->orders['alice']], $this->ids($byFirstName));

        $byLastName = $orderModel->getOrders(['filter_customer' => 'SMITH']);
        $this->assertSame([$this->orders['alice']], $this->ids($byLastName));

        $byFullNamePart = $orderModel->getOrders(['filter_customer' => 'ice smi']);
        $this->assertSame([$this->orders['alice']], $this->ids($byFullNamePart));

        $unknown = $orderModel->getOrders(['filter_customer' => 'Nobody']);
        $this->assertSame([], $this->ids($unknown));
    }

    public function testFilterByOrderStatusId(): void {
        $rows = $this->orders()->getOrders(['filter_order_status_id' => 2]);

        $this->assertSame([$this->orders['bob']], $this->ids($rows));
    }

    public function testFilterByCommaSeparatedOrderStatusList(): void {
        $rows = $this->orders()->getOrders(['filter_order_status' => '1,5']);

        $this->assertEqualsCanonicalizing(
            [$this->orders['alice'], $this->orders['carol'], $this->orders['eve']],
            $this->ids($rows)
        );
    }

    public function testFilterByTotal(): void {
        $orderModel = $this->orders();

        $single = $orderModel->getOrders(['filter_total' => '250.5000']);
        $this->assertSame([$this->orders['bob']], $this->ids($single));

        $shared = $orderModel->getOrders(['filter_total' => 100]);
        $this->assertEqualsCanonicalizing(
            [$this->orders['alice'], $this->orders['eve']],
            $this->ids($shared)
        );
    }

    public function testFilterByDateRange(): void {
        $rows = $this->orders()->getOrders([
            'filter_date_from' => '2024-02-01',
            'filter_date_to'   => '2024-03-31',
        ]);

        $this->assertEqualsCanonicalizing(
            [$this->orders['bob'], $this->orders['carol']],
            $this->ids($rows)
        );
    }

    public function testFilterByDateFrom(): void {
        $rows = $this->orders()->getOrders(['filter_date_from' => '2024-03-01']);

        $this->assertSame([$this->orders['carol']], $this->ids($rows));
    }

    public function testFilterByDateTo(): void {
        $rows = $this->orders()->getOrders(['filter_date_to' => '2024-01-31']);

        $this->assertEqualsCanonicalizing(
            [$this->orders['alice'], $this->orders['eve']],
            $this->ids($rows)
        );
    }

    public function testFilterByDateModifiedRange(): void {
        $rows = $this->orders()->getOrders([
            'filter_date_modified_from' => '2024-02-16',
            'filter_date_modified_to'   => '2024-02-16',
        ]);

        $this->assertSame([$this->orders['bob']], $this->ids($rows));
    }

    public function testFiltersCanBeCombined(): void {
        $rows = $this->orders()->getOrders([
            'filter_customer'       => 'Alice',
            'filter_order_status_id' => 1,
            'filter_total'          => '100.0000',
            'filter_date_from'      => '2024-01-01',
            'filter_date_to'        => '2024-01-31',
        ]);

        $this->assertSame([$this->orders['alice']], $this->ids($rows));
    }

    public function testSortingAndPagination(): void {
        // OC 4.1.0.3: la lista blanca de orden usa el nombre de la columna con su
        // alias ('o.date_added', como lo manda admin/controller/sale/order.php);
        // 'date_added' es la clave corta de OpenCart 5.
        $rows = $this->orders()->getOrders([
            'sort'  => 'o.date_added',
            'order' => 'DESC',
            'start' => 0,
            'limit' => 2,
        ]);

        $this->assertSame([$this->orders['carol'], $this->orders['bob']], $this->ids($rows));
    }

    public function testTotalOrdersUsesTheSameFilters(): void {
        $orderModel = $this->orders();

        $this->assertSame(4, $orderModel->getTotalOrders());
        $this->assertSame(1, $orderModel->getTotalOrders(['filter_order_id' => $this->orders['carol']]));
        $this->assertSame(2, $orderModel->getTotalOrders(['filter_order_status' => '1']));
        $this->assertSame(2, $orderModel->getTotalOrders([
            'filter_date_from' => '2024-02-01',
            'filter_date_to'   => '2024-03-31',
        ]));
    }

    public function testResultContainsStatusNameAndDecodedJsonFields(): void {
        $rows = $this->orders()->getOrders(['filter_order_id' => $this->orders['alice']]);

        $this->assertCount(1, $rows);
        $row = $rows[0];

        $this->assertSame('Pending', $row['order_status']);
        $this->assertSame('Alice Smith', $row['customer']);
        $this->assertSame(['delivery' => 'morning'], $row['custom_field']);
        $this->assertSame(['name' => 'Cash On Delivery', 'code' => 'cod'], $row['payment_method']);
        $this->assertSame(100.0, (float)$row['total']);
    }

    private function orders(): object {
        return $this->model('sale/order');
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     *
     * @return array<int, int>
     */
    private function ids(array $rows): array {
        return array_map(static fn(array $row): int => (int)$row['order_id'], $rows);
    }
}
