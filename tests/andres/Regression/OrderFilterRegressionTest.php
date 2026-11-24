<?php
declare(strict_types=1);

namespace OpenCart\Tests\Regression;

use OpenCart\Tests\Support\CreatesOrders;
use OpenCart\Tests\TestCase;

/**
 * Regression coverage for order filter edge cases and filter precedence.
 */
final class OrderFilterRegressionTest extends TestCase {
    use CreatesOrders;

    /**
     * @var array<string, int>
     */
    private array $orders = [];

    protected function setUp(): void {
        parent::setUp();

        $this->deleteAllOrders();

        $this->orders['quoted'] = $this->createOrder([
            'firstname'       => 'Alice',
            'lastname'        => "O'Brien",
            'email'           => 'quoted@example.com',
            'order_status_id' => 1,
            'total'           => '100.0000',
            'date_added'      => '2024-05-10 23:59:59',
        ]);

        $this->orders['abandoned'] = $this->createOrder([
            'firstname'       => 'Dave',
            'lastname'        => 'Brown',
            'email'           => 'abandoned@example.com',
            'order_status_id' => 0,
            'total'           => '0.0000',
            'date_added'      => '2024-05-11 00:00:00',
        ]);

        $this->orders['processing'] = $this->createOrder([
            'firstname'       => 'Bob',
            'lastname'        => 'Jones',
            'email'           => 'bob@example.com',
            'order_status_id' => 2,
            'total'           => '100.0000',
            'date_added'      => '2024-05-09 12:00:00',
        ]);

        $this->orders['complete'] = $this->createOrder([
            'firstname'       => 'Carol',
            'lastname'        => 'White',
            'email'           => 'carol@example.com',
            'order_status_id' => 5,
            'total'           => '50.0000',
            'date_added'      => '2024-05-08 12:00:00',
        ]);

        $this->orders['other'] = $this->createOrder([
            'firstname'       => 'Eve',
            'lastname'        => 'Stone',
            'email'           => 'unique@example.com',
            'order_status_id' => 1,
            'total'           => '100.0001',
            'date_added'      => '2024-05-07 12:00:00',
        ]);
    }

    public function testCustomerFilterHandlesApostrophes(): void {
        $model = $this->orders();

        $this->assertSame(
            [$this->orders['quoted']],
            $this->ids($model->getOrders(['filter_customer' => "o'brien"]))
        );

        $this->assertSame(
            [$this->orders['quoted']],
            $this->ids($model->getOrders(['filter_customer' => "O'Brien"]))
        );
    }

    public function testCustomerFilterDoesNotSearchEmailAddresses(): void {
        $rows = $this->orders()->getOrders(['filter_customer' => 'unique@example.com']);

        $this->assertSame([], $this->ids($rows));
    }

    public function testExplicitZeroStatusReturnsAbandonedOrders(): void {
        $rows = $this->orders()->getOrders(['filter_order_status_id' => '0']);

        $this->assertSame([$this->orders['abandoned']], $this->ids($rows));
    }

    public function testEmptyStatusFilterFallsBackToTheDefault(): void {
        $rows = $this->orders()->getOrders(['filter_order_status_id' => '']);

        $this->assertEqualsCanonicalizing(
            [
                $this->orders['quoted'],
                $this->orders['processing'],
                $this->orders['complete'],
                $this->orders['other'],
            ],
            $this->ids($rows)
        );
    }

    public function testStatusListTakesPrecedenceOverSingleStatusId(): void {
        $rows = $this->orders()->getOrders([
            'filter_order_status'    => '5',
            'filter_order_status_id' => 2,
        ]);

        $this->assertSame([$this->orders['complete']], $this->ids($rows));
    }

    public function testDateRangeUsesCalendarDaysAndIgnoresTime(): void {
        $rows = $this->orders()->getOrders([
            'filter_date_from' => '2024-05-10',
            'filter_date_to'   => '2024-05-10',
        ]);

        $this->assertSame([$this->orders['quoted']], $this->ids($rows));
    }

    public function testTotalFilterUsesExactValue(): void {
        $model = $this->orders();

        $this->assertEqualsCanonicalizing(
            [$this->orders['quoted'], $this->orders['processing']],
            $this->ids($model->getOrders(['filter_total' => '100.0000']))
        );

        $this->assertSame(
            [$this->orders['other']],
            $this->ids($model->getOrders(['filter_total' => '100.0001']))
        );
    }

    public function testInvalidSortFallsBackToOrderId(): void {
        $rows = $this->orders()->getOrders(['sort' => 'not_a_real_column']);
        $ids = $this->ids($rows);

        $sorted = $ids;
        sort($sorted);

        $this->assertCount(4, $ids);
        $this->assertSame($sorted, $ids);
    }

    public function testNegativeStartAndZeroLimitAreNormalized(): void {
        $model = $this->orders();

        $rows = $model->getOrders(['start' => -10, 'limit' => 0]);
        $this->assertCount(4, $rows);

        $rows = $model->getOrders(['start' => 1, 'limit' => 2]);
        $this->assertCount(2, $rows);
    }

    public function testDefaultOrderingIsOrderIdAscending(): void {
        $ids = $this->ids($this->orders()->getOrders());

        $sorted = $ids;
        sort($sorted);

        $this->assertCount(4, $ids);
        $this->assertSame($sorted, $ids);
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
