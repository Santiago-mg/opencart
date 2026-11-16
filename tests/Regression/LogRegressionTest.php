<?php
declare(strict_types=1);

namespace OpenCart\Tests\Regression;

use Opencart\System\Library\Log;
use OpenCart\Tests\TestCase;

/**
 * Regression coverage for logging edge cases.
 */
final class LogRegressionTest extends TestCase {
    private const FILENAME = 'phpunit_regression.log';

    protected function setUp(): void {
        parent::setUp();

        $this->removeLogFiles();
    }

    protected function tearDown(): void {
        $this->removeLogFiles();

        parent::tearDown();
    }

    public function testFalsyValuesAreStillLogged(): void {
        $log = new Log(self::FILENAME);

        $log->write(0);
        $log->write(false);
        $log->write(null);
        $log->write('');

        $lines = file(DIR_LOGS . self::FILENAME, FILE_IGNORE_NEW_LINES);

        $this->assertCount(4, $lines);
        $this->assertStringEndsWith(' - 0', $lines[0]);
        $this->assertStringEndsWith(' - ', $lines[1]);
        $this->assertStringEndsWith(' - ', $lines[2]);
        $this->assertStringEndsWith(' - ', $lines[3]);
    }

    public function testMultilineMessagesPreserveLineBreaks(): void {
        $log = new Log(self::FILENAME);
        $log->write("line1\nline2");

        $content = file_get_contents(DIR_LOGS . self::FILENAME);

        $this->assertStringEndsWith(" - line1\nline2\n", $content);

        $lines = file(DIR_LOGS . self::FILENAME, FILE_IGNORE_NEW_LINES);

        $this->assertCount(2, $lines);
        $this->assertStringEndsWith('line1', $lines[0]);
        $this->assertSame('line2', $lines[1]);
    }

    public function testNoExtraBlankLinesAreAdded(): void {
        $log = new Log(self::FILENAME);
        $log->write('one');
        $log->write('two');

        $content = file_get_contents(DIR_LOGS . self::FILENAME);

        $this->assertStringEndsWith(" - two\n", $content);
        $this->assertStringNotContainsString("\n\n", $content);
    }

    public function testNewInstanceDoesNotTruncateExistingLog(): void {
        (new Log(self::FILENAME))->write('first');
        (new Log(self::FILENAME))->write('second');

        $lines = file(DIR_LOGS . self::FILENAME, FILE_IGNORE_NEW_LINES);

        $this->assertCount(2, $lines);
        $this->assertStringEndsWith(' - first', $lines[0]);
        $this->assertStringEndsWith(' - second', $lines[1]);
    }

    public function testTimestampUsesTheExpectedFormat(): void {
        $log = new Log(self::FILENAME);
        $log->write('timestamped');

        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - timestamped\n$/',
            file_get_contents(DIR_LOGS . self::FILENAME)
        );
    }

    private function removeLogFiles(): void {
        foreach ([self::FILENAME, 'phpunit_regression_other.log'] as $file) {
            if (is_file(DIR_LOGS . $file)) {
                unlink(DIR_LOGS . $file);
            }
        }
    }
}
