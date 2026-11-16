<?php
declare(strict_types=1);

namespace OpenCart\Tests\Unit\Localisation;

use OpenCart\Tests\TestCase;

/**
 * Tests the admin language model (creation, configuration, listing and deletion).
 */
final class LanguageTest extends TestCase {
    public function testAddLanguageCreatesTheLanguageRecord(): void {
        $model = $this->languages();
        $before = $model->getTotalLanguages();

        $languageId = $model->addLanguage($this->languageData());

        $this->assertGreaterThan(0, $languageId);
        $this->assertSame($before + 1, $model->getTotalLanguages());

        $language = $model->getLanguage($languageId);

        $this->assertSame('Test Language', $language['name']);
        $this->assertSame('zz-zz', $language['code']);
        $this->assertSame('zz_ZZ', $language['locale']);
        $this->assertSame('', $language['extension']);
        $this->assertSame(3, (int)$language['sort_order']);
        $this->assertSame(1, (int)$language['status']);
        $this->assertSame(HTTP_CATALOG . 'catalog/language/zz-zz/zz-zz.png', $language['image']);
    }

    public function testAddLanguageCanBeCreatedDisabled(): void {
        $model = $this->languages();

        $languageId = $model->addLanguage($this->languageData([
            'name'   => 'Disabled Language',
            'code'   => 'zz-zy',
            'locale' => 'zz_ZY',
            'status' => 0,
        ]));

        $language = $model->getLanguage($languageId);

        $this->assertSame(0, (int)$language['status']);
    }

    public function testAddLanguageCopiesOrderStatusDescriptions(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $source = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status` WHERE `language_id` = '1'"
        );
        $copy = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status` WHERE `language_id` = '" . (int)$languageId . "'"
        );

        $this->assertGreaterThan(0, (int)$source['total']);
        $this->assertSame((int)$source['total'], (int)$copy['total']);
    }

    public function testGetLanguageByCode(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $language = $model->getLanguageByCode('zz-zz');

        $this->assertSame($languageId, (int)$language['language_id']);
        $this->assertSame('Test Language', $language['name']);
    }

    public function testGetLanguageReturnsEmptyArrayForUnknownId(): void {
        $this->assertSame([], $this->languages()->getLanguage(999999));
    }

    public function testEditLanguageUpdatesConfiguration(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $model->editLanguage($languageId, $this->languageData([
            'name'       => 'Renamed Language',
            'code'       => 'zz-zx',
            'locale'     => 'zz_ZX',
            'extension'  => 'opencart',
            'sort_order' => 42,
            'status'     => 0,
        ]));

        $language = $model->getLanguage($languageId);

        $this->assertSame('Renamed Language', $language['name']);
        $this->assertSame('zz-zx', $language['code']);
        $this->assertSame('zz_ZX', $language['locale']);
        $this->assertSame('opencart', $language['extension']);
        $this->assertSame(42, (int)$language['sort_order']);
        $this->assertSame(0, (int)$language['status']);
        $this->assertStringContainsString('extension/opencart/catalog/language/zz-zx/zz-zx.png', $language['image']);
    }

    public function testGetLanguagesReturnsRecordsKeyedByLanguageId(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData());

        $languages = $model->getLanguages();

        $this->assertArrayHasKey($languageId, $languages);
        $this->assertSame('zz-zz', $languages[$languageId]['code']);
        $this->assertStringContainsString('language/zz-zz/zz-zz.png', $languages[$languageId]['image']);
    }

    public function testGetLanguagesSupportsSortingAndPagination(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData(['code' => '00-00']));

        $languages = $model->getLanguages([
            'sort'  => 'code',
            'order' => 'ASC',
            'start' => 0,
            'limit' => 1,
        ]);

        $this->assertCount(1, $languages);
        $this->assertArrayHasKey($languageId, $languages);
    }

    public function testGetLanguagesByExtension(): void {
        $model = $this->languages();
        $languageId = $model->addLanguage($this->languageData(['extension' => 'phpunit_test_extension']));

        $languages = $model->getLanguagesByExtension('phpunit_test_extension');

        $this->assertCount(1, $languages);
        $this->assertSame($languageId, (int)$languages[0]['language_id']);
    }

    public function testDeleteLanguageRemovesTheRecordAndItsDescriptions(): void {
        $model = $this->languages();
        $before = $model->getTotalLanguages();
        $languageId = $model->addLanguage($this->languageData());

        $model->deleteLanguage($languageId);

        $this->assertSame($before, $model->getTotalLanguages());
        $this->assertSame([], $model->getLanguage($languageId));

        $orderStatus = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "order_status` WHERE `language_id` = '" . (int)$languageId . "'"
        );
        $seoUrls = $this->row(
            "SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "seo_url` WHERE `language_id` = '" . (int)$languageId . "'"
        );

        $this->assertSame(0, (int)$orderStatus['total']);
        $this->assertSame(0, (int)$seoUrls['total']);
    }

    private function languages(): object {
        return $this->model('localisation/language');
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function languageData(array $overrides = []): array {
        return $overrides + [
            'name'       => 'Test Language',
            'code'       => 'zz-zz',
            'locale'     => 'zz_ZZ',
            'extension'  => '',
            'sort_order' => 3,
            'status'     => 1,
        ];
    }
}
