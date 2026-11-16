<?php
declare(strict_types=1);

namespace OpenCart\Tests\Regression;

use OpenCart\Tests\TestCase;

/**
 * Regression coverage for geo zone and tax rule isolation.
 */
final class GeoZoneTaxRegressionTest extends TestCase {
    private const COUNTRY_ID = 8888;
    private const ZONE_ID = 80001;

    public function testEditingGeoZoneWithoutZoneListClearsAssignments(): void {
        $model = $this->geoZones();

        $geoZoneId = $model->addGeoZone([
            'name'             => 'PHPUnit Geo Zone',
            'description'      => 'Before',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID],
            ],
        ]);

        $model->editGeoZone($geoZoneId, [
            'name'        => 'PHPUnit Geo Zone',
            'description' => 'After',
        ]);

        $this->assertSame([], $model->getZones($geoZoneId));
        $this->assertSame(0, $model->getTotalZones($geoZoneId));
        $this->assertSame(0, $model->getTotalZoneToGeoZoneByCountryId(self::COUNTRY_ID));
    }

    public function testDeletingOneTaxClassKeepsRulesOfAnotherClass(): void {
        $geoZoneId = $this->createGeoZone();
        $rateId = $this->createTaxRate($geoZoneId);
        $classes = $this->taxClasses();

        $firstClassId = $classes->addTaxClass([
            'title'       => 'First Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $rateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);

        $secondClassId = $classes->addTaxClass([
            'title'       => 'Second Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $rateId, 'based' => 'payment', 'priority' => 1],
            ],
        ]);

        $classes->deleteTaxClass($firstClassId);

        $this->assertSame([], $classes->getTaxRules($firstClassId));
        $this->assertCount(1, $classes->getTaxRules($secondClassId));
        $this->assertSame(1, $classes->getTotalTaxRulesByTaxRateId($rateId));
    }

    public function testTaxRatesAreIsolatedByGeoZone(): void {
        $firstZoneId = $this->createGeoZone('First Geo Zone');
        $secondZoneId = $this->createGeoZone('Second Geo Zone');

        $firstRateId = $this->createTaxRate($firstZoneId, 'First Rate');
        $secondRateId = $this->createTaxRate($secondZoneId, 'Second Rate');

        $classes = $this->taxClasses();
        $classes->addTaxClass([
            'title'       => 'First Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $firstRateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);
        $classes->addTaxClass([
            'title'       => 'Second Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $secondRateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);

        $rates = $this->taxRates()->getTaxRatesByGeoZoneId($firstZoneId);

        $this->assertCount(1, $rates);
        $this->assertSame($firstRateId, (int)$rates[0]['tax_rate_id']);
        $this->assertSame('First Geo Zone', $rates[0]['geo_zone']);
    }

    public function testTotalTaxRatesByGeoZoneCountsRatesNotRules(): void {
        $geoZoneId = $this->createGeoZone();
        $rateId = $this->createTaxRate($geoZoneId);
        $classes = $this->taxClasses();

        $classes->addTaxClass([
            'title'       => 'First Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $rateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);
        $classes->addTaxClass([
            'title'       => 'Second Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $rateId, 'based' => 'payment', 'priority' => 1],
            ],
        ]);

        $this->assertSame(1, $this->taxRates()->getTotalTaxRatesByGeoZoneId($geoZoneId));
        $this->assertCount(2, $this->taxRates()->getTaxRatesByGeoZoneId($geoZoneId));
    }

    public function testTaxRateCustomerGroupsAreReplacedNotDuplicated(): void {
        $geoZoneId = $this->createGeoZone();
        $model = $this->taxRates();

        $taxRateId = $model->addTaxRate([
            'name'                    => 'PHPUnit Rate',
            'rate'                    => 5,
            'type'                    => 'F',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [1, 2],
        ]);

        $model->editTaxRate($taxRateId, [
            'name'                    => 'PHPUnit Rate',
            'rate'                    => 5,
            'type'                    => 'F',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [2],
        ]);

        $model->editTaxRate($taxRateId, [
            'name'                    => 'PHPUnit Rate',
            'rate'                    => 5,
            'type'                    => 'F',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [2],
        ]);

        $this->assertSame(
            [2],
            array_map('intval', $model->getCustomerGroups($taxRateId))
        );
    }

    private function geoZones(): object {
        return $this->model('localisation/geo_zone');
    }

    private function taxRates(): object {
        return $this->model('localisation/tax_rate');
    }

    private function taxClasses(): object {
        return $this->model('localisation/tax_class');
    }

    private function createGeoZone(string $name = 'PHPUnit Geo Zone'): int {
        return $this->geoZones()->addGeoZone([
            'name'             => $name,
            'description'      => 'Geo zone used by regression tests',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID],
            ],
        ]);
    }

    private function createTaxRate(int $geoZoneId, string $name = 'PHPUnit Rate'): int {
        return $this->taxRates()->addTaxRate([
            'name'        => $name,
            'rate'        => 10,
            'type'        => 'P',
            'geo_zone_id' => $geoZoneId,
        ]);
    }
}
