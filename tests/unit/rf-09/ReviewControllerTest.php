<?php
namespace Tests\Rf09;

use Opencart\Catalog\Controller\Product\Review;
use Opencart\Catalog\Model\Account\Order;
use Opencart\Catalog\Model\Catalog\Product;
use Opencart\Catalog\Model\Catalog\Review as ReviewModel;
use Opencart\Catalog\Model\Setting\Extension;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\Support\ConfigStub;
use Tests\Support\CustomerStub;
use Tests\Support\RequestStub;
use Tests\Support\ResponseSpy;
use Tests\Support\SessionStub;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-09 — Reseñas · pruebas unitarias
 * catalog/controller/product/review.php → write()
 *
 * write() valida la reseña y, si todo está bien, la guarda con el modelo.
 * Caja blanca: un caso por cada decisión del grafo de RF-09. Caja negra:
 * particiones de equivalencia y valores límite del nombre, el texto y la
 * calificación. El modelo que guarda es un mock: se verifica que se llame
 * una sola vez cuando la reseña es válida y nunca cuando no lo es.
 */
class ReviewControllerTest extends TestCase {
    private const TOKEN = 'token-de-la-ficha';

    private ConfigStub $config;
    private CustomerStub $customer;
    private SessionStub $session;
    private ResponseSpy $response;
    /** @var ReviewModel&MockObject */
    private ReviewModel $reviews;
    /** @var Product&MockObject */
    private Product $products;
    private Order $orders;

    protected function setUp(): void {
        $this->config = new ConfigStub(['config_language' => 'en-gb', 'config_review_status' => 1, 'config_review_guest' => 1, 'config_review_purchased' => 0, 'config_captcha' => '']);
        $this->customer = new CustomerStub();
        $this->session = new SessionStub(['review_token' => self::TOKEN]);
        $this->response = new ResponseSpy();
        $this->reviews = $this->createMock(ReviewModel::class);
        $this->products = $this->createStub(Product::class);
        $this->products->method('getProduct')->willReturnCallback(fn (int $id) => $id === 40 ? ['product_id' => 40, 'name' => 'iPhone'] : []);
        $this->orders = $this->createStub(Order::class);
    }

    /** Envía el formulario de reseña del producto con ese token. */
    private function escribir(array $campos, int $productoId = 40, string $token = self::TOKEN): array {
        $extensiones = $this->createStub(Extension::class);
        $extensiones->method('getExtensionByCode')->willReturn([]);
        $registry = registry([
            'config' => $this->config,
            'customer' => $this->customer,
            'session' => $this->session,
            'response' => $this->response,
            'request' => new RequestStub(['product_id' => $productoId, 'review_token' => $token], $campos),
            'model_catalog_review' => $this->reviews,
            'model_catalog_product' => $this->products,
            'model_account_order' => $this->orders,
            'model_setting_extension' => $extensiones,
        ]);
        (new Review($registry))->write();
        return $this->response->json();
    }

    private function valida(array $cambios = []): array {
        return $cambios + ['author' => 'Santiago QA', 'text' => 'Llegó a tiempo y funciona muy bien.', 'rating' => 5];
    }

    // ── Camino base ────────────────────────────────────────────────────────

    public function test_una_resena_valida_se_guarda_una_vez_y_se_agradece(): void {
        // Arrange
        $this->reviews->expects($this->once())->method('addReview')->with(40, $this->valida());

        // Act
        $json = $this->escribir($this->valida());

        // Assert
        assertThat($json, is(equalTo(['success' => 'Thank you for your review. It has been submitted to the webmaster for approval.'])));
    }

    // ── Una decisión a la vez (caminos independientes) ─────────────────────

    public function test_con_un_token_distinto_al_de_la_ficha_no_se_guarda(): void {
        // Arrange
        $this->reviews->expects($this->never())->method('addReview');

        // Act
        $json = $this->escribir($this->valida(), token: 'otro-token');

        // Assert
        assertThat($json['error']['warning'], is('Warning: Review token invalid!'));
    }

    public function test_con_las_resenas_deshabilitadas_no_se_guarda(): void {
        // Arrange
        $this->config->set('config_review_status', 0);
        $this->reviews->expects($this->never())->method('addReview');

        // Act
        $json = $this->escribir($this->valida());

        // Assert
        assertThat($json['error']['warning'], is('Reviews are disabled!'));
    }

    public function test_un_producto_que_no_existe_no_se_puede_resenar(): void {
        // Arrange
        $this->reviews->expects($this->never())->method('addReview');

        // Act
        $json = $this->escribir($this->valida(), productoId: 999);

        // Assert
        assertThat($json['error']['warning'], is('Warning: Product could not be found!'));
    }

    public function test_si_no_se_permiten_invitados_hay_que_iniciar_sesion(): void {
        // Arrange
        $this->config->set('config_review_guest', 0);

        // Act
        $json = $this->escribir($this->valida());

        // Assert
        assertThat($json['error']['warning'], is('You must login to review the product!'));
    }

    public function test_si_se_exige_compra_previa_un_cliente_que_no_lo_compro_no_puede(): void {
        // Arrange
        $this->config->set('config_review_purchased', 1);
        $this->customer->id = 8;

        // Act
        $json = $this->escribir($this->valida());

        // Assert
        assertThat($json['error'], hasKeyValuePair('purchased', 'You must have purchased this product before you can write a review!'));
    }

    public function test_con_varios_campos_mal_avisa_de_todos_a_la_vez(): void {
        // Act
        $json = $this->escribir(['author' => 'ab', 'text' => 'corto', 'rating' => 0]);

        // Assert
        assertThat(array_keys($json['error']), containsInAnyOrder('author', 'text', 'rating'));
    }

    // ── Particiones y valores límite ───────────────────────────────────────

    /** @dataProvider nombres */
    public function test_el_nombre_debe_tener_entre_3_y_25_caracteres(int $largo, bool $valido): void {
        // Act
        $json = $this->escribir($this->valida(['author' => str_repeat('a', $largo)]));

        // Assert
        assertThat(isset($json['error']['author']), is(!$valido));
    }

    public function nombres(): array {
        return ['2' => [2, false], '3' => [3, true], '25' => [25, true], '26' => [26, false]];
    }

    /** @dataProvider textos */
    public function test_el_texto_debe_tener_entre_25_y_1000_caracteres(int $largo, bool $valido): void {
        // Act
        $json = $this->escribir($this->valida(['text' => str_repeat('x', $largo)]));

        // Assert
        assertThat(isset($json['error']['text']), is(!$valido));
    }

    public function textos(): array {
        return ['24' => [24, false], '25' => [25, true], '1000' => [1000, true], '1001' => [1001, false]];
    }

    /** @dataProvider calificaciones */
    public function test_la_calificacion_debe_estar_entre_1_y_5(int $estrellas, bool $valida): void {
        // Act
        $json = $this->escribir($this->valida(['rating' => $estrellas]));

        // Assert
        assertThat(isset($json['error']['rating']), is(!$valida));
    }

    public function calificaciones(): array {
        return ['0' => [0, false], '1' => [1, true], '5' => [5, true], '6' => [6, false]];
    }

    // ── Defectos (fase roja del TDD) ───────────────────────────────────────

    /**
     * DEF-09-01: si al formulario le falta un campo, PHP avisa "Undefined array
     * key" y ese aviso sale pegado a la respuesta. Debería responder el error
     * del campo sin avisos.
     * @group defecto
     */
    public function test_DEF_09_01_sin_calificacion_responde_el_error_sin_avisos_de_php(): void {
        // Act
        $json = $this->escribir(['author' => 'Santiago QA', 'text' => 'Llegó a tiempo y funciona muy bien.']);

        // Assert
        assertThat($json['error'], hasKey('rating'));
    }

    /**
     * DEF-09-02: el token de la ficha sigue sirviendo después de enviar una
     * reseña, así que con un solo token se pueden mandar todas las que se quiera.
     * @group defecto
     */
    public function test_DEF_09_02_despues_de_guardar_la_resena_el_token_ya_no_sirve(): void {
        // Act
        $this->escribir($this->valida());

        // Assert
        assertThat($this->session->data, not(hasKey('review_token')));
    }
}
