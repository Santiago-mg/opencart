<?php
declare(strict_types=1);

namespace OpenCart\Tests\Unit\System;

use Opencart\System\Library\Log;
use OpenCart\Tests\TestCase;

/**
 * Tests the file based logging library.
 */
final class LogTest extends TestCase {
    private const FILENAME = 'phpunit_test.log';

    protected function setUp(): void {
        parent::setUp();

        $this->removeLogFile();
    }

    protected function tearDown(): void {
        $this->removeLogFile();

        parent::tearDown();
    }

    public function testConstructorCreatesTheLogFile(): void {
        new Log(self::FILENAME);

        $this->assertFileExists(DIR_LOGS . self::FILENAME);
        $this->assertSame('', file_get_contents(DIR_LOGS . self::FILENAME));
    }

    public function testWriteAddsATimestampedLine(): void {
        $log = new Log(self::FILENAME);
        $log->write('Hello world');

        $content = file_get_contents(DIR_LOGS . self::FILENAME);

        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} - Hello world\n$/',
            $content
        );
    }

    public function testWriteAppendsEachMessage(): void {
        $log = new Log(self::FILENAME);
        $log->write('First');
        $log->write('Second');

        $lines = file(DIR_LOGS . self::FILENAME, FILE_IGNORE_NEW_LINES);

        $this->assertCount(2, $lines);
        $this->assertStringEndsWith(' - First', $lines[0]);
        $this->assertStringEndsWith(' - Second', $lines[1]);
    }

    public function testWriteFormatsArraysAndObjects(): void {
        $log = new Log(self::FILENAME);
        $log->write(['foo' => 'bar', 'number' => 42]);

        $object = new \stdClass();
        $object->name = 'OpenCart';
        $log->write($object);

        $content = file_get_contents(DIR_LOGS . self::FILENAME);

        $this->assertStringContainsString('[foo] => bar', $content);
        $this->assertStringContainsString('[number] => 42', $content);
        $this->assertStringContainsString('stdClass Object', $content);
        $this->assertStringContainsString('[name] => OpenCart', $content);
    }

    public function testExistingLogContentIsPreserved(): void {
        file_put_contents(DIR_LOGS . self::FILENAME, "existing line\n");

        $log = new Log(self::FILENAME);
        $log->write('New line');

        $lines = file(DIR_LOGS . self::FILENAME, FILE_IGNORE_NEW_LINES);

        $this->assertSame('existing line', $lines[0]);
        $this->assertCount(2, $lines);
        $this->assertStringEndsWith(' - New line', $lines[1]);
    }

    public function testDifferentLogFilesAreIndependent(): void {
        $first = new Log(self::FILENAME);
        $second = new Log('phpunit_other.log');

        $first->write('First file');
        $second->write('Second file');

        $this->assertStringContainsString('First file', file_get_contents(DIR_LOGS . self::FILENAME));
        $this->assertStringNotContainsString('Second file', file_get_contents(DIR_LOGS . self::FILENAME));
        $this->assertStringContainsString('Second file', file_get_contents(DIR_LOGS . 'phpunit_other.log'));

        @unlink(DIR_LOGS . 'phpunit_other.log');
    }

    private function removeLogFile(): void {
        if (is_file(DIR_LOGS . self::FILENAME)) {
            unlink(DIR_LOGS . self::FILENAME);
        }
    }
}
