<?php
declare(strict_types=1);

namespace OpenCart\Tests\Regression;

use OpenCart\Tests\TestCase;

/**
 * Regression coverage for language and currency configuration paths.
 */
final class LocalisationRegressionTest extends TestCase {
    public function testAddingLanguageCreatesSeoUrlsForEveryLanguage(): void {
        $model = $this->languages();
        $model->addLanguage($this->languageData());

        $languages = $model->getLanguages();
        $stores = (int)$this->row("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "store`")['total'];

        $seoTotal = (int)$this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "seo_url`
             WHERE `key` = 'language' AND `value` = 'zz-zz'"
        )['total'];

        $this->assertSame(count($languages) * (1 + $stores), $seoTotal);

        $defaultStoreRows = $this->rows(
            "SELECT `language_id` FROM `" . DB_PREFIX . "seo_url`
             WHERE `key` = 'language' AND `value` = 'zz-zz' AND `store_id` = '0'"
        );

        $this->assertEqualsCanonicalizing(
            array_keys($languages),
            array_map(static fn(array $row): int => (int)$row['language_id'], $defaultStoreRows)
        );
    }

    public function testDeletingLanguageRemovesItsSeoUrls(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $before = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "seo_url`
             WHERE `language_id` = '" . (int)$languageId . "' OR `value` = 'zz-zz'"
        );
        $this->assertGreaterThan(0, (int)$before['total']);

        $model->deleteLanguage($languageId);

        $after = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "seo_url`
             WHERE `language_id` = '" . (int)$languageId . "' OR `value` = 'zz-zz'"
        );
        $this->assertSame(0, (int)$after['total']);
    }

    public function testDeletingLanguageKeepsDescriptionsOfOtherLanguages(): void {
        $model = $this->languages();

        $before = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status` WHERE `language_id` = '1'"
        );

        $languageId = $model->addLanguage($this->languageData());
        $model->deleteLanguage($languageId);

        $after = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status` WHERE `language_id` = '1'"
        );

        $this->assertSame((int)$before['total'], (int)$after['total']);
    }

    public function testEditingLanguageKeepsItsDescriptions(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $before = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status`
             WHERE `language_id` = '" . (int)$languageId . "'"
        );

        $model->editLanguage($languageId, $this->languageData(['name' => 'Edited Language']));

        $after = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status`
             WHERE `language_id` = '" . (int)$languageId . "'"
        );

        $this->assertSame((int)$before['total'], (int)$after['total']);
        $this->assertSame('Edited Language', $model->getLanguage($languageId)['name']);
    }

    public function testCurrencyValuePrecisionIsPreserved(): void {
        $model = $this->currencies();

        $currencyId = $model->addCurrency($this->currencyData([
            'code'  => 'ZZP',
            'value' => 1.23456789,
        ]));

        $currency = $model->getCurrency($currencyId);

        $this->assertSame('1.23456789', $currency['value']);
        $this->assertEqualsWithDelta(1.23456789, (float)$currency['value'], 0.00000001);
    }

    public function testEditValueByCodeDoesNotAffectOtherCurrencies(): void {
        $model = $this->currencies();

        $firstId = $model->addCurrency($this->currencyData(['code' => 'ZZA', 'value' => 1.1]));
        $secondId = $model->addCurrency($this->currencyData(['code' => 'ZZB', 'value' => 2.2]));

        $model->editValueByCode('ZZA', 3.3);

        $this->assertEqualsWithDelta(3.3, (float)$model->getCurrency($firstId)['value'], 0.00000001);
        $this->assertEqualsWithDelta(2.2, (float)$model->getCurrency($secondId)['value'], 0.00000001);
    }

    public function testDeletingCurrencyDoesNotAffectOtherCurrencies(): void {
        $model = $this->currencies();
        $before = $model->getTotalCurrencies();

        $firstId = $model->addCurrency($this->currencyData(['code' => 'ZZA']));
        $secondId = $model->addCurrency($this->currencyData(['code' => 'ZZB']));

        $model->deleteCurrency($firstId);

        $this->assertSame($before + 1, $model->getTotalCurrencies());
        $this->assertSame([], $model->getCurrency($firstId));
        $this->assertSame($secondId, (int)$model->getCurrencyByCode('ZZB')['currency_id']);
    }

    private function languages(): object {
        return $this->model('localisation/language');
    }

    private function currencies(): object {
        return $this->model('localisation/currency');
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function languageData(array $overrides = []): array {
        return $overrides + [
            'name'       => 'Regression Language',
            'code'       => 'zz-zz',
            'locale'     => 'zz_ZZ',
            'extension'  => '',
            'sort_order' => 0,
            'status'     => 1,
        ];
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function currencyData(array $overrides = []): array {
        return $overrides + [
            'title'         => 'Regression Currency',
            'code'          => 'ZZZ',
            'symbol_left'   => 'Z$',
            'symbol_right'  => '',
            'decimal_place' => 2,
            'value'         => 1.0,
            'status'        => 1,
        ];
    }
}
