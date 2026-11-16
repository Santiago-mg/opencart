<?php
namespace Tests\Rf07;

use Opencart\System\Library\Cart\Cart;
use Tests\Support\FakeDatabase;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-07 — Carrito · pruebas unitarias de caja blanca
 * system/library/cart/cart.php → add(), update(), remove(), getProducts(), hasStock()
 *
 * El carrito vive en la tabla oc_cart. La base de datos es un doble
 * (FakeDatabase) que responde las consultas del carrito y del producto, así
 * se recorren los caminos del grafo de RF-07 sin MySQL.
 */
class CartTest extends TestCase {
    private FakeDatabase $db;

    protected function setUp(): void {
        $this->db = new FakeDatabase();
    }

    /** Un carrito con esa base de datos (el constructor ya lee las líneas). */
    private function carrito(): Cart {
        return new Cart(registry(['db' => $this->db, 'tax' => new \stdClass(), 'weight' => new \stdClass()]));
    }

    /** Una línea del carrito y su producto en la base. */
    private function conLinea(int $cantidad, int $existencias = 970, int $minimo = 1, bool $productoActivo = true): void {
        $this->db->answer('/^SELECT \* FROM `oc_cart`/', [[
            'cart_id' => 3, 'product_id' => 40, 'quantity' => $cantidad, 'option' => '[]', 'override' => '', 'subscription_plan_id' => 0,
        ]]);
        $this->db->answer('/FROM `oc_product_to_store` `p2s`/', $productoActivo ? [[
            'product_id' => 40, 'name' => 'iPhone', 'price' => 101.0, 'quantity' => $existencias, 'minimum' => $minimo,
            'points' => 0, 'weight' => 0, 'variant' => '', 'master_id' => 0, 'tax_class_id' => 9,
        ]] : []);
    }

    public function test_agregar_un_producto_nuevo_crea_una_linea(): void {
        // Arrange
        $this->db->answer('/SELECT COUNT\(\*\) AS `total` FROM `oc_cart`/', [['total' => 0]]);
        $carrito = $this->carrito();

        // Act
        $carrito->add(40, 2);

        // Assert
        assertThat($this->db->lastQuery(), startsWith('INSERT INTO `oc_cart`'));
        assertThat($this->db->lastQuery(), containsString("`quantity` = '2'"));
    }

    public function test_agregar_otra_vez_el_mismo_producto_suma_la_cantidad(): void {
        // Arrange
        $this->db->answer('/SELECT COUNT\(\*\) AS `total` FROM `oc_cart`/', [['total' => 1]]);
        $carrito = $this->carrito();

        // Act
        $carrito->add(40, 2);

        // Assert
        assertThat($this->db->lastQuery(), containsString('SET `quantity` = (`quantity` + 2)'));
    }

    public function test_cambiar_la_cantidad_solo_toca_la_linea_de_esta_sesion(): void {
        // Arrange
        $carrito = $this->carrito();

        // Act
        $carrito->update(3, 5);

        // Assert
        assertThat($this->db->lastQuery(), containsString("SET `quantity` = '5' WHERE `cart_id` = '3'"));
        assertThat($this->db->lastQuery(), containsString("`session_id` = 'sesion-de-prueba'"));
    }

    public function test_quitar_solo_borra_la_linea_de_esta_sesion(): void {
        // Arrange
        $carrito = $this->carrito();

        // Act
        $carrito->remove(3);

        // Assert
        assertThat($this->db->lastQuery(), startsWith('DELETE FROM `oc_cart` WHERE `cart_id` = \'3\''));
        assertThat($this->db->lastQuery(), containsString("`session_id` = 'sesion-de-prueba'"));
    }

    public function test_la_linea_trae_el_precio_y_el_total_de_la_cantidad(): void {
        // Arrange
        $this->conLinea(3);

        // Act
        $productos = $this->carrito()->getProducts();

        // Assert
        assertThat($productos[3], hasKeyValuePair('quantity', 3));
        assertThat($productos[3]['total'], is(closeTo(303.0, 0.0001)));
    }

    public function test_una_linea_con_cantidad_cero_se_borra_al_leer_el_carrito(): void {
        // Arrange
        $this->conLinea(0);

        // Act
        $productos = $this->carrito()->getProducts();

        // Assert
        assertThat($productos, is(emptyArray()));
        assertThat($this->db->queriesContaining("DELETE FROM `oc_cart` WHERE `cart_id` = '3'"), not(emptyArray()));
    }

    public function test_una_linea_de_un_producto_deshabilitado_se_borra(): void {
        // Arrange
        $this->conLinea(1, productoActivo: false);

        // Act
        $productos = $this->carrito()->getProducts();

        // Assert
        assertThat($productos, is(emptyArray()));
    }

    /**
     * Valores límite de las existencias: hay 5 unidades.
     * @dataProvider existencias
     */
    public function test_marca_sin_stock_cuando_se_piden_mas_unidades_de_las_que_hay(int $pedidas, bool $hayStock): void {
        // Arrange
        $this->conLinea($pedidas, existencias: 5);

        // Act
        $carrito = $this->carrito();

        // Assert
        assertThat($carrito->getProducts()[3]['stock_status'], is($hayStock));
        assertThat($carrito->hasStock(), is($hayStock));
    }

    public function existencias(): array {
        return ['4 de 5' => [4, true], '5 de 5' => [5, true], '6 de 5' => [6, false]];
    }

    public function test_un_producto_agotado_nunca_tiene_stock(): void {
        // Arrange
        $this->conLinea(1, existencias: 0);

        // Act
        $carrito = $this->carrito();

        // Assert
        assertThat($carrito->hasStock(), is(false));
    }

    /** @dataProvider minimos */
    public function test_revisa_la_cantidad_minima_del_producto(int $pedidas, bool $cumple): void {
        // Arrange: el producto se vende de a mínimo 2.
        $this->conLinea($pedidas, minimo: 2);

        // Act
        $carrito = $this->carrito();

        // Assert
        assertThat($carrito->getProducts()[3]['minimum_status'], is($cumple));
        assertThat($carrito->hasMinimum(), is($cumple));
    }

    public function minimos(): array {
        return ['1 (menos del mínimo)' => [1, false], '2 (justo el mínimo)' => [2, true], '3' => [3, true]];
    }

    public function test_cuenta_las_unidades_de_todas_las_lineas(): void {
        // Arrange
        $this->conLinea(4);

        // Act
        $carrito = $this->carrito();

        // Assert
        assertThat($carrito->countProducts(), is(4));
        assertThat($carrito->hasProducts(), is(true));
    }

    public function test_un_carrito_vacio_no_tiene_productos(): void {
        // Act
        $carrito = $this->carrito();

        // Assert
        assertThat($carrito->hasProducts(), is(false));
        assertThat($carrito->countProducts(), is(0));
    }
}
