<?php
namespace Tests\Rf08;

use Opencart\Catalog\Model\Catalog\Product;
use Opencart\Catalog\Model\Marketing\Coupon;
use Opencart\System\Library\Cart\Cart;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\Support\TestCase;
use Tests\Support\CustomerStub;
use function Tests\Support\registry;

/**
 * RF-08 — Cupones · pruebas unitarias de caja blanca
 * catalog/model/marketing/coupon.php → getCoupon()
 *
 * getCoupon() decide si un código se puede usar. Cada prueba recorre uno de
 * los caminos independientes del grafo de RF-08 (Diagramas/Grafos/rf8-graph):
 * el camino base (todo válido) y uno por cada decisión que lo rechaza.
 *
 * La base de datos, el carrito y el cliente se reemplazan por dobles:
 *   - el propio modelo es un doble parcial: se prueba getCoupon() de verdad y
 *     se programan las consultas que hace (getCouponByCode, getTotalHistories...)
 *   - el carrito es un stub que dice cuánto suma y qué productos tiene.
 */
class CouponModelTest extends TestCase {
    /** @var Coupon&MockObject */
    private Coupon $model;
    private Cart $cart;
    private CustomerStub $customer;

    protected function setUp(): void {
        // Arrange común: un carrito de 101 con un iPhone y un visitante sin cuenta.
        $this->cart = $this->createStub(Cart::class);
        $this->cart->method('getSubTotal')->willReturn(101.0);
        $this->cart->method('getProducts')->willReturn([['product_id' => 40, 'total' => 101.0]]);
        $this->customer = new CustomerStub();

        $registry = registry([
            'cart' => $this->cart,
            'customer' => $this->customer,
            'model_catalog_product' => $this->createStub(Product::class),
        ]);

        $this->model = $this->getMockBuilder(Coupon::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getCouponByCode', 'getTotalHistories', 'getTotalHistoriesByCustomerId', 'getProducts', 'getCategories'])
            ->getMock();
        // getCoupon() se llama a sí mismo a través del Registry ($this->model_marketing_coupon).
        $registry->set('model_marketing_coupon', $this->model);

        $this->model->method('getProducts')->willReturn([]);
        $this->model->method('getCategories')->willReturn([]);
        $this->model->method('getTotalHistories')->willReturn(0);
    }

    /** Un cupón vigente del 10 %, sin compra mínima ni límites; cada prueba cambia lo que necesita. */
    private function existe(array $cambios = []): void {
        $this->model->method('getCouponByCode')->willReturn($cambios + [
            'coupon_id' => 5, 'code' => 'QA10', 'type' => 'P', 'discount' => 10, 'total' => 0,
            'logged' => 0, 'shipping' => 0, 'uses_total' => 0, 'uses_customer' => 0,
            'date_start' => '2026-01-01', 'date_end' => '2027-01-01',
        ]);
    }

    /** Camino 1 (base): todas las decisiones en «Sí». */
    public function test_un_cupon_vigente_y_sin_restricciones_se_puede_usar(): void {
        // Arrange
        $this->existe();

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat($cupon, hasKeyValuePair('code', 'QA10'));
        assertThat($cupon, hasKeyValuePair('product', emptyArray()));
    }

    /** Camino 2: el código no existe (o está deshabilitado: getCouponByCode solo trae los activos). */
    public function test_un_codigo_que_no_existe_se_rechaza(): void {
        // Arrange
        $this->model->method('getCouponByCode')->willReturn([]);

        // Act
        $cupon = $this->model->getCoupon('NO-EXISTE');

        // Assert
        assertThat($cupon, is(emptyArray()));
    }

    /** Camino 2: existe pero está fuera de fechas. */
    public function test_un_cupon_que_vencio_o_que_aun_no_empieza_se_rechaza(): void {
        // Arrange
        $this->existe(['date_start' => '2020-01-01', 'date_end' => '2020-12-31']);

        // Act
        $vencido = $this->model->getCoupon('QA10');

        // Assert
        assertThat($vencido, is(emptyArray()));
    }

    /** Una fecha «0000-00-00» significa «sin límite». */
    public function test_sin_fechas_el_cupon_no_vence(): void {
        // Arrange
        $this->existe(['date_start' => '0000-00-00', 'date_end' => '0000-00-00']);

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat($cupon, not(emptyArray()));
    }

    /**
     * Camino 3: compra mínima. Valores límite alrededor del subtotal (101).
     * @dataProvider minimos
     */
    public function test_la_compra_minima_se_compara_con_el_subtotal(float $minimo, bool $sirve): void {
        // Arrange
        $this->existe(['total' => $minimo]);

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat(count($cupon) > 0, is($sirve));
    }

    public function minimos(): array {
        return [
            'mínimo 100.99 (menor)' => [100.99, true],
            'mínimo 101 (igual)' => [101.0, true],
            'mínimo 101.01 (mayor)' => [101.01, false],
        ];
    }

    /** Camino 4: el cupón ya se usó todas las veces permitidas. */
    public function test_un_cupon_sin_usos_disponibles_se_rechaza(): void {
        // Arrange: se puede usar 10 veces y ya se usó 10.
        $model = $this->rehacerConHistorial(10);

        // Act
        $cupon = $model->getCoupon('QA10');

        // Assert
        assertThat($cupon, is(emptyArray()));
    }

    /** uses_total = 0 significa «sin límite», aunque tenga muchos usos. */
    public function test_con_usos_ilimitados_no_importa_cuantas_veces_se_haya_usado(): void {
        // Arrange
        $model = $this->rehacerConHistorial(500, ['uses_total' => 0]);

        // Act
        $cupon = $model->getCoupon('QA10');

        // Assert
        assertThat($cupon, not(emptyArray()));
    }

    /** Camino 5: el cupón exige iniciar sesión y el visitante no tiene cuenta. */
    public function test_un_cupon_solo_para_clientes_registrados_se_rechaza_a_un_invitado(): void {
        // Arrange
        $this->existe(['logged' => 1]);

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat($cupon, is(emptyArray()));
    }

    /** Camino 5: el cliente ya lo usó las veces que tenía permitidas (mock: se verifica la llamada). */
    public function test_un_cliente_que_ya_agoto_sus_usos_no_puede_usarlo_otra_vez(): void {
        // Arrange
        $this->customer->id = 8;
        $this->existe(['uses_customer' => 1]);
        $this->model->expects($this->once())
            ->method('getTotalHistoriesByCustomerId')
            ->with(5, 8)
            ->willReturn(1);

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat($cupon, is(emptyArray()));
    }

    /** A un invitado no se le cuentan los usos por cliente (no se consulta la base). */
    public function test_a_un_invitado_no_se_le_consultan_los_usos_por_cliente(): void {
        // Arrange
        $this->existe(['uses_customer' => 1]);
        $this->model->expects($this->never())->method('getTotalHistoriesByCustomerId');

        // Act
        $cupon = $this->model->getCoupon('QA10');

        // Assert
        assertThat($cupon, not(emptyArray()));
    }

    /** Camino 6: el cupón es solo para el iMac (41) y en el carrito hay un iPhone (40). */
    public function test_un_cupon_de_otro_producto_se_rechaza(): void {
        // Arrange
        $model = $this->rehacerConProductos([41]);

        // Act
        $cupon = $model->getCoupon('QA10');

        // Assert
        assertThat($cupon, is(emptyArray()));
    }

    /** Camino 6 (rama «Sí»): el producto del cupón está en el carrito y queda anotado. */
    public function test_un_cupon_del_producto_que_esta_en_el_carrito_lo_incluye(): void {
        // Arrange
        $model = $this->rehacerConProductos([40]);

        // Act
        $cupon = $model->getCoupon('QA10');

        // Assert
        assertThat($cupon['product'], is(equalTo([40])));
    }

    /** Doble parcial nuevo cuyo historial dice que el cupón se usó $usos veces. */
    private function rehacerConHistorial(int $usos, array $cambios = []): Coupon {
        $model = $this->nuevoDoble($cambios);
        $model->method('getTotalHistories')->willReturn($usos);
        $model->method('getProducts')->willReturn([]);
        return $model;
    }

    /** Doble parcial nuevo cuyo cupón está limitado a esos productos. */
    private function rehacerConProductos(array $productos): Coupon {
        $model = $this->nuevoDoble();
        $model->method('getTotalHistories')->willReturn(0);
        $model->method('getProducts')->willReturn($productos);
        return $model;
    }

    private function nuevoDoble(array $cambios = []): Coupon {
        $registry = registry(['cart' => $this->cart, 'customer' => $this->customer, 'model_catalog_product' => $this->createStub(Product::class)]);
        $model = $this->getMockBuilder(Coupon::class)
            ->setConstructorArgs([$registry])
            ->onlyMethods(['getCouponByCode', 'getTotalHistories', 'getTotalHistoriesByCustomerId', 'getProducts', 'getCategories'])
            ->getMock();
        $registry->set('model_marketing_coupon', $model);
        $model->method('getCouponByCode')->willReturn($cambios + [
            'coupon_id' => 5, 'code' => 'QA10', 'type' => 'P', 'discount' => 10, 'total' => 0, 'logged' => 0, 'shipping' => 0,
            'uses_total' => 10, 'uses_customer' => 0, 'date_start' => '2026-01-01', 'date_end' => '2027-01-01',
        ]);
        $model->method('getCategories')->willReturn([]);
        return $model;
    }
}
