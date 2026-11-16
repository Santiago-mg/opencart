<?php
/**
 * Arranque de las pruebas unitarias.
 *
 * Carga solo lo que necesitan las clases que se prueban: el núcleo de
 * OpenCart (Registry, Model, Controller), las funciones de ayuda (oc_strlen,
 * oc_validate_length...) y Hamcrest para las aserciones fluidas. No arranca
 * la tienda ni se conecta a la base de datos: todo lo de afuera se reemplaza
 * por dobles de prueba.
 */

define('OPENCART', realpath(__DIR__ . '/../../upload') . '/');
define('DB_PREFIX', 'oc_');
define('DIR_SYSTEM', OPENCART . 'system/');
define('DIR_IMAGE', OPENCART . 'image/');

require_once DIR_SYSTEM . 'engine/registry.php';
require_once DIR_SYSTEM . 'engine/model.php';
require_once DIR_SYSTEM . 'engine/controller.php';
require_once DIR_SYSTEM . 'helper/general.php';
require_once DIR_SYSTEM . 'helper/validation.php';

// Hamcrest: el mismo estilo de PyHamcrest del repositorio del curso
// (assertThat(valor, equalTo(...))). En Composer es hamcrest/hamcrest-php.
$hamcrest = is_file(__DIR__ . '/vendor/autoload.php') ? __DIR__ . '/vendor/autoload.php' : 'Hamcrest/autoload.php';
require_once $hamcrest;
\Hamcrest\Util::registerGlobalFunctions();

/**
 * Las clases de OpenCart siguen la carpeta de su espacio de nombres:
 *   Opencart\Catalog\Model\Marketing\Coupon  → catalog/model/marketing/coupon.php
 *   Opencart\System\Library\Cart\Cart        → system/library/cart/cart.php
 */
spl_autoload_register(function (string $class): void {
    $parts = explode('\\', $class);
    if (array_shift($parts) !== 'Opencart') {
        return;
    }
    $path = strtolower(implode('/', $parts));
    // Las extensiones viven en su propia carpeta:
    //   Opencart\Catalog\Model\Extension\Opencart\Total\Coupon → extension/opencart/catalog/model/total/coupon.php
    $path = preg_replace('#^(catalog|admin)/(model|controller)/extension/([^/]+)/#', 'extension/$3/$1/$2/', $path);
    $file = OPENCART . $path . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});

require_once __DIR__ . '/support/FakeDatabase.php';
require_once __DIR__ . '/support/Doubles.php';
require_once __DIR__ . '/support/TestCase.php';
