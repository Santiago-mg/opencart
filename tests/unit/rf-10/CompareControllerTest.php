<?php
namespace Tests\Rf10;

use Opencart\Catalog\Controller\Product\Compare;
use Opencart\Catalog\Model\Catalog\Product;
use Tests\Support\RequestStub;
use Tests\Support\ResponseSpy;
use Tests\Support\SessionStub;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-10 — Comparar productos · pruebas unitarias de caja blanca
 * catalog/controller/product/compare.php → add()
 *
 * La lista de comparación vive en la sesión ($session->data['compare']).
 * Cada prueba recorre un camino del grafo de RF-10: producto inexistente,
 * producto repetido, lista llena y lista con espacio.
 */
class CompareControllerTest extends TestCase {
    private SessionStub $session;
    private ResponseSpy $response;

    protected function setUp(): void {
        $this->session = new SessionStub();
        $this->response = new ResponseSpy();
    }

    /** Pulsa "Compare this Product" en el producto con ese id. */
    private function comparar(int $productoId): array {
        $productos = $this->createStub(Product::class);
        $productos->method('getProduct')->willReturnCallback(
            fn (int $id) => in_array($id, [40, 41, 43, 44, 45]) ? ['product_id' => $id, 'name' => "Producto $id"] : []
        );
        $registry = registry([
            'session' => $this->session,
            'response' => $this->response,
            'request' => new RequestStub([], ['product_id' => $productoId]),
            'model_catalog_product' => $productos,
        ]);
        (new Compare($registry))->add();
        return $this->response->json();
    }

    private function lista(): array {
        return array_values($this->session->data['compare']);
    }

    public function test_el_primer_producto_crea_la_lista_y_el_contador_dice_1(): void {
        // Act
        $json = $this->comparar(40);

        // Assert
        assertThat($this->lista(), is(equalTo([40])));
        assertThat($json['total'], is('Product Compare (1)'));
        assertThat($json['success'], containsString('Producto 40'));
    }

    public function test_un_producto_que_no_existe_responde_error_y_no_toca_la_lista(): void {
        // Arrange
        $this->session->data['compare'] = [41];

        // Act
        $json = $this->comparar(999);

        // Assert
        assertThat($json, is(equalTo(['error' => 'Warning: Product could not be found!'])));
        assertThat($this->lista(), is(equalTo([41])));
    }

    public function test_un_producto_repetido_no_se_duplica_pasa_al_final(): void {
        // Arrange
        $this->session->data['compare'] = [40, 41];

        // Act
        $json = $this->comparar(40);

        // Assert
        assertThat($this->lista(), is(equalTo([41, 40])));
        assertThat($json['total'], is('Product Compare (2)'));
    }

    public function test_con_tres_productos_el_cuarto_entra_sin_sacar_a_nadie(): void {
        // Arrange (valor límite: justo antes de llenarse)
        $this->session->data['compare'] = [40, 41, 43];

        // Act
        $this->comparar(44);

        // Assert
        assertThat($this->lista(), is(equalTo([40, 41, 43, 44])));
    }

    public function test_con_la_lista_llena_el_quinto_entra_y_sale_el_mas_antiguo(): void {
        // Arrange
        $this->session->data['compare'] = [40, 41, 43, 44];

        // Act
        $json = $this->comparar(45);

        // Assert
        assertThat($this->lista(), is(equalTo([41, 43, 44, 45])));
        assertThat($json['total'], is('Product Compare (4)'));
    }

    public function test_con_la_lista_llena_repetir_uno_no_saca_a_ningun_otro(): void {
        // Arrange
        $this->session->data['compare'] = [40, 41, 43, 44];

        // Act
        $this->comparar(41);

        // Assert
        assertThat($this->lista(), is(equalTo([40, 43, 44, 41])));
    }

    public function test_la_respuesta_es_json(): void {
        // Act
        $this->comparar(40);

        // Assert
        assertThat($this->response->headers, hasItem('Content-Type: application/json'));
    }
}
