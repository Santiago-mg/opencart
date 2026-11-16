<?php
declare(strict_types=1);

namespace OpenCart\Tests\Unit\Localisation;

use OpenCart\Tests\Support\TaxRatesByGeoZone;
use OpenCart\Tests\TestCase;

/**
 * Tests geo zones combined with tax rates and tax classes.
 */
final class GeoZoneTaxTest extends TestCase {
    use TaxRatesByGeoZone;

    private const COUNTRY_ID = 9999;
    private const ZONE_ID_A = 90001;
    private const ZONE_ID_B = 90002;

    /**
     * DEF-04-01 y DEF-04-02: el modelo localisation/geo_zone de OpenCart 4.1.0.3 no tiene
     * getTotalZoneToGeoZoneByCountryId() ni getTotalZoneToGeoZoneByZoneId(), que son
     * los métodos que llaman admin/controller/localisation/country.php y zone.php al
     * borrar, así que borrar un país o una zona desde el panel siempre termina en error.
     * @group defecto
     */
    public function testAddGeoZoneWithZones(): void {
        $model = $this->geoZones();

        $geoZoneId = $model->addGeoZone([
            'name'             => 'PHPUnit Geo Zone',
            'description'      => 'Geo zone created by the test suite',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_A],
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_B],
            ],
        ]);

        $geoZone = $model->getGeoZone($geoZoneId);

        $this->assertSame('PHPUnit Geo Zone', $geoZone['name']);
        $this->assertSame('Geo zone created by the test suite', $geoZone['description']);

        $zones = $model->getZones($geoZoneId);

        $this->assertCount(2, $zones);
        $this->assertSame(2, $model->getTotalZones($geoZoneId));
        // OC 4.1.0.3: geo_zone no tiene getZonesByCountryId() (llegó en OpenCart 5);
        // se filtran por país las zonas de la zona geográfica.
        $this->assertCount(2, array_filter(
            $model->getZones($geoZoneId),
            static fn(array $zone): bool => (int)$zone['country_id'] === self::COUNTRY_ID
        ));
        $this->assertSame(2, $model->getTotalZoneToGeoZoneByCountryId(self::COUNTRY_ID));
        $this->assertSame(1, $model->getTotalZoneToGeoZoneByZoneId(self::ZONE_ID_A));
        $this->assertSame(1, $model->getTotalZoneToGeoZoneByZoneId(self::ZONE_ID_B));
    }

    /**
     * DEF-04-02: el modelo localisation/geo_zone de OpenCart 4.1.0.3 no tiene
     * getTotalZoneToGeoZoneByZoneId(), que es el método que llama
     * admin/controller/localisation/zone.php al borrar, así que borrar una zona
     * desde el panel siempre termina en error.
     * @group defecto
     */
    public function testEditGeoZoneReplacesItsZones(): void {
        $model = $this->geoZones();

        $geoZoneId = $model->addGeoZone([
            'name'             => 'PHPUnit Geo Zone',
            'description'      => 'Before',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_A],
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_B],
            ],
        ]);

        $model->editGeoZone($geoZoneId, [
            'name'             => 'Renamed Geo Zone',
            'description'      => 'After',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_B],
            ],
        ]);

        $geoZone = $model->getGeoZone($geoZoneId);
        $zones = $model->getZones($geoZoneId);

        $this->assertSame('Renamed Geo Zone', $geoZone['name']);
        $this->assertSame('After', $geoZone['description']);
        $this->assertCount(1, $zones);
        $this->assertSame(self::ZONE_ID_B, (int)$zones[0]['zone_id']);
        $this->assertSame(0, $model->getTotalZoneToGeoZoneByZoneId(self::ZONE_ID_A));
    }

    /**
     * DEF-04-01: el modelo localisation/geo_zone de OpenCart 4.1.0.3 no tiene
     * getTotalZoneToGeoZoneByCountryId(), que es el método que llama
     * admin/controller/localisation/country.php al borrar, así que borrar un país
     * desde el panel siempre termina en error.
     * @group defecto
     */
    public function testDeleteGeoZoneRemovesItsZones(): void {
        $model = $this->geoZones();

        $geoZoneId = $model->addGeoZone([
            'name'             => 'PHPUnit Geo Zone',
            'description'      => 'To be deleted',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_A],
            ],
        ]);

        $model->deleteGeoZone($geoZoneId);

        $this->assertSame([], $model->getGeoZone($geoZoneId));
        $this->assertSame([], $model->getZones($geoZoneId));
        $this->assertSame(0, $model->getTotalZones($geoZoneId));
        $this->assertSame(0, $model->getTotalZoneToGeoZoneByCountryId(self::COUNTRY_ID));
    }

    public function testGetGeoZonesSupportsSortingAndPagination(): void {
        $model = $this->geoZones();
        $model->addGeoZone(['name' => 'AAA PHPUnit Geo Zone', 'description' => '']);
        $model->addGeoZone(['name' => 'ZZZ PHPUnit Geo Zone', 'description' => '']);

        $geoZones = $model->getGeoZones([
            'sort'  => 'name',
            'order' => 'DESC',
            'start' => 0,
            'limit' => 1,
        ]);

        $this->assertCount(1, $geoZones);
        $this->assertSame('ZZZ PHPUnit Geo Zone', $geoZones[0]['name']);
    }

    public function testAddTaxRateLinkedToGeoZoneAndCustomerGroups(): void {
        $geoZoneId = $this->createGeoZone();
        $model = $this->taxRates();

        $taxRateId = $model->addTaxRate([
            'name'                     => 'PHPUnit Tax Rate',
            'rate'                     => 21.5,
            'type'                     => 'P',
            'geo_zone_id'              => $geoZoneId,
            'tax_rate_customer_group'  => [1, 2],
        ]);

        $taxRate = $model->getTaxRate($taxRateId);

        $this->assertSame('PHPUnit Tax Rate', $taxRate['name']);
        $this->assertEqualsWithDelta(21.5, (float)$taxRate['rate'], 0.0001);
        $this->assertSame('P', $taxRate['type']);
        $this->assertSame($geoZoneId, (int)$taxRate['geo_zone_id']);
        $this->assertSame('PHPUnit Geo Zone', $taxRate['geo_zone']);
        $this->assertSame([1, 2], array_map('intval', $model->getCustomerGroups($taxRateId)));
        $this->assertSame(1, $model->getTotalTaxRatesByGeoZoneId($geoZoneId));

        $this->assertNotEmpty(array_filter(
            $model->getTaxRates(),
            static fn(array $rate): bool => (int)$rate['tax_rate_id'] === $taxRateId
        ));
    }

    public function testEditTaxRateReplacesCustomerGroups(): void {
        $geoZoneId = $this->createGeoZone();
        $model = $this->taxRates();

        $taxRateId = $model->addTaxRate([
            'name'                    => 'PHPUnit Tax Rate',
            'rate'                    => 10,
            'type'                    => 'F',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [1, 2],
        ]);

        $model->editTaxRate($taxRateId, [
            'name'                    => 'Renamed Tax Rate',
            'rate'                    => 7.5,
            'type'                    => 'P',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [3],
        ]);

        $taxRate = $model->getTaxRate($taxRateId);

        $this->assertSame('Renamed Tax Rate', $taxRate['name']);
        $this->assertEqualsWithDelta(7.5, (float)$taxRate['rate'], 0.0001);
        $this->assertSame('P', $taxRate['type']);
        $this->assertSame([3], array_map('intval', $model->getCustomerGroups($taxRateId)));
    }

    public function testDeleteTaxRateRemovesCustomerGroups(): void {
        $geoZoneId = $this->createGeoZone();
        $model = $this->taxRates();

        $taxRateId = $model->addTaxRate([
            'name'                    => 'PHPUnit Tax Rate',
            'rate'                    => 10,
            'type'                    => 'F',
            'geo_zone_id'             => $geoZoneId,
            'tax_rate_customer_group' => [1],
        ]);

        $model->deleteTaxRate($taxRateId);

        $this->assertSame([], $model->getTaxRate($taxRateId));
        $this->assertSame([], $model->getCustomerGroups($taxRateId));
        $this->assertSame(0, $model->getTotalTaxRatesByGeoZoneId($geoZoneId));
    }

    public function testTaxClassStoresRulesAndOrdersThemByPriority(): void {
        $geoZoneId = $this->createGeoZone();
        $rates = $this->taxRates();

        $firstRateId = $rates->addTaxRate([
            'name'        => 'PHPUnit First Rate',
            'rate'        => 5,
            'type'        => 'F',
            'geo_zone_id' => $geoZoneId,
        ]);

        $secondRateId = $rates->addTaxRate([
            'name'        => 'PHPUnit Second Rate',
            'rate'        => 10,
            'type'        => 'P',
            'geo_zone_id' => $geoZoneId,
        ]);

        $classes = $this->taxClasses();

        $taxClassId = $classes->addTaxClass([
            'title'       => 'PHPUnit Tax Class',
            'description' => 'Tax class used by the test suite',
            'tax_rule'    => [
                ['tax_rate_id' => $secondRateId, 'based' => 'payment', 'priority' => 2],
                ['tax_rate_id' => $firstRateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);

        $taxClass = $classes->getTaxClass($taxClassId);

        $this->assertSame('PHPUnit Tax Class', $taxClass['title']);
        $this->assertSame('Tax class used by the test suite', $taxClass['description']);

        $rules = $classes->getTaxRules($taxClassId);

        $this->assertCount(2, $rules);
        $this->assertSame($firstRateId, (int)$rules[0]['tax_rate_id']);
        $this->assertSame('store', $rules[0]['based']);
        $this->assertSame($secondRateId, (int)$rules[1]['tax_rate_id']);
        $this->assertSame('payment', $rules[1]['based']);
        $this->assertSame(1, $classes->getTotalTaxRulesByTaxRateId($firstRateId));
        $this->assertSame(1, $classes->getTotalTaxRulesByTaxRateId($secondRateId));

        $this->assertNotEmpty(array_filter(
            $classes->getTaxClasses(),
            static fn(array $class): bool => (int)$class['tax_class_id'] === $taxClassId
        ));
    }

    public function testGeoZoneDrivesTaxRules(): void {
        $geoZoneId = $this->createGeoZone();

        $taxRateId = $this->taxRates()->addTaxRate([
            'name'        => 'PHPUnit Geo Rate',
            'rate'        => 19,
            'type'        => 'P',
            'geo_zone_id' => $geoZoneId,
        ]);

        $this->taxClasses()->addTaxClass([
            'title'       => 'PHPUnit Geo Tax Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $taxRateId, 'based' => 'payment', 'priority' => 1],
            ],
        ]);

        // OC 4.1.0.3: tax_rate no tiene getTaxRatesByGeoZoneId() (llegó en OpenCart 5);
        // ver Support/TaxRatesByGeoZone.php.
        $rules = $this->getTaxRatesByGeoZoneId($geoZoneId);

        $this->assertCount(1, $rules);
        $this->assertSame($taxRateId, (int)$rules[0]['tax_rate_id']);
        $this->assertSame('PHPUnit Geo Rate', $rules[0]['name']);
        $this->assertEqualsWithDelta(19.0, (float)$rules[0]['rate'], 0.0001);
        $this->assertSame('P', $rules[0]['type']);
        $this->assertSame('PHPUnit Geo Zone', $rules[0]['geo_zone']);
        $this->assertSame(1, (int)$rules[0]['priority']);
    }

    public function testEditTaxClassReplacesRules(): void {
        $geoZoneId = $this->createGeoZone();
        $rates = $this->taxRates();

        $firstRateId = $rates->addTaxRate([
            'name'        => 'PHPUnit First Rate',
            'rate'        => 5,
            'type'        => 'F',
            'geo_zone_id' => $geoZoneId,
        ]);
        $secondRateId = $rates->addTaxRate([
            'name'        => 'PHPUnit Second Rate',
            'rate'        => 10,
            'type'        => 'P',
            'geo_zone_id' => $geoZoneId,
        ]);

        $classes = $this->taxClasses();

        $taxClassId = $classes->addTaxClass([
            'title'       => 'PHPUnit Tax Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $firstRateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);

        $classes->editTaxClass($taxClassId, [
            'title'       => 'Renamed Tax Class',
            'description' => 'Updated',
            'tax_rule'    => [
                ['tax_rate_id' => $secondRateId, 'based' => 'payment', 'priority' => 1],
            ],
        ]);

        $rules = $classes->getTaxRules($taxClassId);

        $this->assertSame('Renamed Tax Class', $classes->getTaxClass($taxClassId)['title']);
        $this->assertCount(1, $rules);
        $this->assertSame($secondRateId, (int)$rules[0]['tax_rate_id']);
        $this->assertSame(0, $classes->getTotalTaxRulesByTaxRateId($firstRateId));
    }

    public function testDeleteTaxClassRemovesRules(): void {
        $geoZoneId = $this->createGeoZone();
        $rateId = $this->taxRates()->addTaxRate([
            'name'        => 'PHPUnit Rate',
            'rate'        => 5,
            'type'        => 'F',
            'geo_zone_id' => $geoZoneId,
        ]);

        $classes = $this->taxClasses();
        $taxClassId = $classes->addTaxClass([
            'title'       => 'PHPUnit Tax Class',
            'description' => '',
            'tax_rule'    => [
                ['tax_rate_id' => $rateId, 'based' => 'store', 'priority' => 1],
            ],
        ]);

        $classes->deleteTaxClass($taxClassId);

        $this->assertSame([], $classes->getTaxClass($taxClassId));
        $this->assertSame([], $classes->getTaxRules($taxClassId));
        $this->assertSame(0, $classes->getTotalTaxRulesByTaxRateId($rateId));
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

    private function createGeoZone(): int {
        return $this->geoZones()->addGeoZone([
            'name'             => 'PHPUnit Geo Zone',
            'description'      => 'Geo zone used by tax tests',
            'zone_to_geo_zone' => [
                ['country_id' => self::COUNTRY_ID, 'zone_id' => self::ZONE_ID_A],
            ],
        ]);
    }
}
