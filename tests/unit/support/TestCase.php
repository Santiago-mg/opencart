<?php
namespace Tests\Support;

/**
 * Clase base de las pruebas: PHPUnit con las aserciones fluidas de Hamcrest.
 *
 * assertThat() de Hamcrest lanza el error cuando algo no se cumple, pero
 * PHPUnit no se entera de cuántas verificaciones hubo y marcaría la prueba
 * como "sin aserciones". Aquí se le suman al terminar cada prueba.
 */
abstract class TestCase extends \PHPUnit\Framework\TestCase {
    protected function tearDown(): void {
        $this->addToAssertionCount(\Hamcrest\MatcherAssert::getCount());
        \Hamcrest\MatcherAssert::resetCount();
        parent::tearDown();
    }
}
