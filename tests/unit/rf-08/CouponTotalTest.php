<?php
namespace Tests\Rf08;

use Opencart\Catalog\Model\Marketing\Coupon;
use Opencart\Catalog\Model\Extension\Opencart\Total\Coupon as CouponTotal;
use Opencart\System\Library\Cart\Cart;
use Tests\Support\SessionStub;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-08 — Cupones · pruebas unitarias del cálculo del descuento
 * extension/opencart/catalog/model/total/coupon.php → getTotal()
 *
 * getTotal() agrega el renglón "Coupon (CÓDIGO)" a los totales del carrito.
 * Cubre la decisión «¿es de monto fijo?» del grafo de RF-08 y el tope del
 * descuento. El cupón válido y el carrito se reemplazan por dobles.
 */
class CouponTotalTest extends TestCase {
    /**
     * Calcula los totales de un carrito con esos productos y ese cupón, como
     * lo hace OpenCart: $totals, $taxes y $total se pasan por referencia.
     */
    private function totalesCon(array $cupon, array $productos, float $totalAntes): array {
        $cart = $this->createStub(Cart::class);
        $cart->method('getProducts')->willReturn($productos);
        $cart->method('getSubTotal')->willReturn((float)array_sum(array_column($productos, 'total')));

        $validador = $this->createStub(Coupon::class);
        $validador->method('getCoupon')->willReturn($cupon + ['code' => 'QA', 'product' => [], 'shipping' => 0]);

        $registry = registry([
            'cart' => $cart,
            'session' => new SessionStub(['coupon' => 'QA']),
            'model_marketing_coupon' => $validador,
        ]);

        $totals = [];
        $taxes = [];
        $total = $totalAntes;
        (new CouponTotal($registry))->getTotal($totals, $taxes, $total);

        return ['renglones' => $totals, 'total' => $total];
    }

    private const UN_IPHONE = [['product_id' => 40, 'total' => 101.0, 'tax_class_id' => 0]];

    public function test_un_cupon_del_10_por_ciento_descuenta_el_10_por_ciento_del_subtotal(): void {
        // Arrange
        $cupon = ['type' => 'P', 'discount' => 10];

        // Act
        $resultado = $this->totalesCon($cupon, self::UN_IPHONE, 101.0);

        // Assert
        assertThat($resultado['renglones'][0]['value'], is(closeTo(-10.1, 0.0001)));
        assertThat($resultado['total'], is(closeTo(90.9, 0.0001)));
    }

    public function test_un_cupon_de_monto_fijo_descuenta_exactamente_ese_valor(): void {
        // Act
        $resultado = $this->totalesCon(['type' => 'F', 'discount' => 10], self::UN_IPHONE, 101.0);

        // Assert
        assertThat($resultado['renglones'][0]['value'], is(closeTo(-10.0, 0.0001)));
    }

    public function test_un_monto_fijo_mayor_que_la_compra_solo_descuenta_hasta_el_subtotal(): void {
        // Act
        $resultado = $this->totalesCon(['type' => 'F', 'discount' => 500], self::UN_IPHONE, 101.0);

        // Assert
        assertThat($resultado['renglones'][0]['value'], is(closeTo(-101.0, 0.0001)));
        assertThat($resultado['total'], is(closeTo(0.0, 0.0001)));
    }

    public function test_un_monto_fijo_se_reparte_entre_los_productos_segun_lo_que_cuesta_cada_uno(): void {
        // Arrange: 100 + 300 = 400; un cupón de 40 descuenta 10 y 30.
        $productos = [
            ['product_id' => 40, 'total' => 100.0, 'tax_class_id' => 0],
            ['product_id' => 41, 'total' => 300.0, 'tax_class_id' => 0],
        ];

        // Act
        $resultado = $this->totalesCon(['type' => 'F', 'discount' => 40], $productos, 400.0);

        // Assert
        assertThat($resultado['renglones'][0]['value'], is(closeTo(-40.0, 0.0001)));
    }

    public function test_un_cupon_limitado_a_un_producto_solo_descuenta_sobre_ese_producto(): void {
        // Arrange
        $productos = [
            ['product_id' => 40, 'total' => 101.0, 'tax_class_id' => 0],
            ['product_id' => 41, 'total' => 100.0, 'tax_class_id' => 0],
        ];

        // Act
        $resultado = $this->totalesCon(['type' => 'P', 'discount' => 10, 'product' => [41]], $productos, 201.0);

        // Assert: el 10 % de los 100 del iMac, no de los 201.
        assertThat($resultado['renglones'][0]['value'], is(closeTo(-10.0, 0.0001)));
    }

    public function test_el_renglon_del_cupon_lleva_el_codigo_y_su_orden(): void {
        // Act
        $resultado = $this->totalesCon(['type' => 'P', 'discount' => 10], self::UN_IPHONE, 101.0);

        // Assert
        assertThat($resultado['renglones'][0], hasKeyValuePair('code', 'coupon'));
        assertThat($resultado['renglones'][0]['title'], containsString('QA'));
    }

    public function test_sin_cupon_en_la_sesion_no_agrega_ningun_renglon(): void {
        // Arrange
        $validador = $this->createMock(Coupon::class);
        $validador->expects($this->never())->method('getCoupon');
        $registry = registry(['model_marketing_coupon' => $validador, 'cart' => $this->createStub(Cart::class)]);
        $totals = [];
        $taxes = [];
        $total = 101.0;

        // Act
        (new CouponTotal($registry))->getTotal($totals, $taxes, $total);

        // Assert
        assertThat($totals, is(emptyArray()));
        assertThat($total, is(101.0));
    }
}
