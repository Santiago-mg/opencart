<?php
declare(strict_types=1);

namespace OpenCart\Tests\Support;

/**
 * OC 4.1.0.3: el modelo localisation/tax_rate de 4.1.0.3 no tiene
 * getTaxRatesByGeoZoneId() (llegó en OpenCart 5). Este helper arma el mismo
 * resultado —una fila por regla de impuesto cuya tasa pertenece a la zona
 * geográfica— usando solo la API de 4.1.0.3: TaxClass::getTaxClasses(),
 * TaxClass::getTaxRules() y TaxRate::getTaxRate().
 */
trait TaxRatesByGeoZone {
    /**
     * @return array<int, array<string, mixed>>
     */
    private function getTaxRatesByGeoZoneId(int $geoZoneId): array {
        $classes = $this->model('localisation/tax_class');
        $rates = $this->model('localisation/tax_rate');

        $rows = [];

        foreach ($classes->getTaxClasses() as $class) {
            foreach ($classes->getTaxRules((int)$class['tax_class_id']) as $rule) {
                $rate = $rates->getTaxRate((int)$rule['tax_rate_id']);

                if ($rate && (int)$rate['geo_zone_id'] === $geoZoneId) {
                    $rows[] = [
                        'tax_rule_id'  => $rule['tax_rule_id'],
                        'tax_rate_id'  => $rule['tax_rate_id'],
                        'tax_class_id' => $rule['tax_class_id'],
                        'name'         => $rate['name'],
                        'rate'         => $rate['rate'],
                        'type'         => $rate['type'],
                        'priority'     => $rule['priority'],
                        'geo_zone'     => $rate['geo_zone'],
                    ];
                }
            }
        }

        return $rows;
    }
}
