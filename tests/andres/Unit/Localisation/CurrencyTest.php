<?php
declare(strict_types=1);

namespace OpenCart\Tests\Unit\Localisation;

use OpenCart\Tests\TestCase;

/**
 * Tests the admin currency model (creation, configuration, values and deletion).
 */
final class CurrencyTest extends TestCase {
    public function testAddCurrencyCreatesTheCurrencyRecord(): void {
        $model = $this->currencies();
        $before = $model->getTotalCurrencies();

        $currencyId = $model->addCurrency($this->currencyData());

        $this->assertGreaterThan(0, $currencyId);
        $this->assertSame($before + 1, $model->getTotalCurrencies());

        $currency = $model->getCurrency($currencyId);

        $this->assertSame('Test Dollar', $currency['title']);
        $this->assertSame('ZZZ', $currency['code']);
        $this->assertSame('Z$', $currency['symbol_left']);
        $this->assertSame('', $currency['symbol_right']);
        $this->assertSame(2, (int)$currency['decimal_place']);
        $this->assertEqualsWithDelta(1.25, (float)$currency['value'], 0.00000001);
        $this->assertSame(1, (int)$currency['status']);
        $this->assertNotEmpty($currency['date_modified']);
    }

    public function testAddCurrencyCanBeCreatedDisabled(): void {
        $model = $this->currencies();

        $currencyId = $model->addCurrency($this->currencyData([
            'title'  => 'Disabled Currency',
            'code'   => 'ZZY',
            'status' => 0,
        ]));

        $currency = $model->getCurrency($currencyId);

        $this->assertSame(0, (int)$currency['status']);
    }

    public function testGetCurrencyByCode(): void {
        $model = $this->currencies();
        $currencyId = $model->addCurrency($this->currencyData());

        $currency = $model->getCurrencyByCode('ZZZ');

        $this->assertSame($currencyId, (int)$currency['currency_id']);
        $this->assertSame('Test Dollar', $currency['title']);
    }

    public function testGetCurrencyReturnsEmptyArrayForUnknownId(): void {
        $this->assertSame([], $this->currencies()->getCurrency(999999));
    }

    public function testEditCurrencyUpdatesConfiguration(): void {
        $model = $this->currencies();
        $currencyId = $model->addCurrency($this->currencyData());

        $model->editCurrency($currencyId, $this->currencyData([
            'title'         => 'Renamed Dollar',
            'code'          => 'ZZX',
            'symbol_left'   => '',
            'symbol_right'  => ' ZX',
            'decimal_place' => 4,
            'value'         => 2.5,
            'status'        => 0,
        ]));

        $currency = $model->getCurrency($currencyId);

        $this->assertSame('Renamed Dollar', $currency['title']);
        $this->assertSame('ZZX', $currency['code']);
        $this->assertSame('', $currency['symbol_left']);
        $this->assertSame(' ZX', $currency['symbol_right']);
        $this->assertSame(4, (int)$currency['decimal_place']);
        $this->assertEqualsWithDelta(2.5, (float)$currency['value'], 0.00000001);
        $this->assertSame(0, (int)$currency['status']);
    }

    public function testEditValueByCodeUpdatesOnlyTheValue(): void {
        $model = $this->currencies();
        $currencyId = $model->addCurrency($this->currencyData());

        $model->editValueByCode('ZZZ', 1.98765432);

        $currency = $model->getCurrency($currencyId);

        $this->assertSame('Test Dollar', $currency['title']);
        $this->assertEqualsWithDelta(1.98765432, (float)$currency['value'], 0.00000001);
    }

    public function testGetCurrenciesReturnsRecordsKeyedByCode(): void {
        $model = $this->currencies();
        $model->addCurrency($this->currencyData());

        $currencies = $model->getCurrencies();

        $this->assertArrayHasKey('ZZZ', $currencies);
        $this->assertSame('Test Dollar', $currencies['ZZZ']['title']);
    }

    public function testGetCurrenciesSupportsSortingAndPagination(): void {
        $model = $this->currencies();
        $model->addCurrency($this->currencyData(['title' => 'ZZZ Test Currency', 'code' => 'ZZZ']));

        $currencies = $model->getCurrencies([
            'sort'  => 'title',
            'order' => 'DESC',
            'start' => 0,
            'limit' => 1,
        ]);

        $this->assertCount(1, $currencies);
        $this->assertArrayHasKey('ZZZ', $currencies);
    }

    public function testDeleteCurrencyRemovesTheRecord(): void {
        $model = $this->currencies();
        $before = $model->getTotalCurrencies();
        $currencyId = $model->addCurrency($this->currencyData());

        $model->deleteCurrency($currencyId);

        $this->assertSame($before, $model->getTotalCurrencies());
        $this->assertSame([], $model->getCurrency($currencyId));
        $this->assertSame([], $model->getCurrencyByCode('ZZZ'));
    }

    private function currencies(): object {
        return $this->model('localisation/currency');
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function currencyData(array $overrides = []): array {
        return $overrides + [
            'title'         => 'Test Dollar',
            'code'          => 'ZZZ',
            'symbol_left'   => 'Z$',
            'symbol_right'  => '',
            'decimal_place' => 2,
            'value'         => 1.25,
            'status'        => 1,
        ];
    }
}
