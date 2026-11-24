<?php
namespace Tests\Rf11;

use Opencart\Catalog\Controller\Account\Returns;
use Opencart\Catalog\Model\Account\Returns as ReturnsModel;
use Opencart\Catalog\Model\Catalog\Information;
use Opencart\Catalog\Model\Setting\Extension;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\Support\ConfigStub;
use Tests\Support\RequestStub;
use Tests\Support\ResponseSpy;
use Tests\Support\SessionStub;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-11 — Devoluciones · pruebas unitarias
 * catalog/controller/account/returns.php → save()
 *
 * save() valida el formulario de devolución y, si todo está bien, la guarda.
 * Caja blanca: un caso por cada decisión del grafo de RF-11. Caja negra:
 * particiones y valores límite de los campos. El modelo que guarda es un mock.
 */
class ReturnsControllerTest extends TestCase {
    private const TOKEN = 'token-del-formulario';

    private ConfigStub $config;
    private SessionStub $session;
    private ResponseSpy $response;
    /** @var ReturnsModel&MockObject */
    private ReturnsModel $returns;
    private array $informacion = [];

    protected function setUp(): void {
        $this->config = new ConfigStub(['config_language' => 'en-gb', 'config_telephone_required' => 0, 'config_captcha' => '', 'config_return_id' => 0]);
        $this->session = new SessionStub(['return_token' => self::TOKEN]);
        $this->response = new ResponseSpy();
        $this->returns = $this->createMock(ReturnsModel::class);
        $this->returns->method('hasOrder')->willReturn(true);
    }

    private function enviar(array $campos, string $token = self::TOKEN): array {
        $extensiones = $this->createStub(Extension::class);
        $extensiones->method('getExtensionByCode')->willReturn([]);
        $paginas = $this->createStub(Information::class);
        $paginas->method('getInformation')->willReturn($this->informacion);
        $registry = registry([
            'config' => $this->config,
            'session' => $this->session,
            'response' => $this->response,
            'request' => new RequestStub(['return_token' => $token], $campos),
            'model_account_returns' => $this->returns,
            'model_setting_extension' => $extensiones,
            'model_catalog_information' => $paginas,
        ]);
        (new Returns($registry))->save();
        return $this->response->json();
    }

    private function completa(array $cambios = []): array {
        return $cambios + [
            'order_id' => 1234, 'firstname' => 'Santiago', 'lastname' => 'González', 'email' => 'santiago@example.com',
            'telephone' => '3001234567', 'product' => 'iPhone', 'product_id' => 40, 'model' => 'product 11', 'quantity' => 1,
            'return_reason_id' => 1, 'opened' => 0, 'comment' => 'Llegó rota', 'date_ordered' => '2026-11-01',
        ];
    }

    public function test_una_solicitud_completa_se_guarda_una_vez_y_lleva_a_la_confirmacion(): void {
        // Arrange
        $this->returns->expects($this->once())->method('addReturn')->with($this->arrayHasKey('order_id'));

        // Act
        $json = $this->enviar($this->completa());

        // Assert
        assertThat($json['redirect'], containsString('account/returns.success'));
    }

    public function test_despues_de_guardar_el_token_ya_no_sirve(): void {
        // Act
        $this->enviar($this->completa());

        // Assert
        assertThat($this->session->data, not(hasKey('return_token')));
    }

    public function test_con_otro_token_vuelve_al_formulario_sin_guardar(): void {
        // Arrange
        $this->returns->expects($this->never())->method('addReturn');

        // Act
        $json = $this->enviar($this->completa(), token: 'inventado');

        // Assert
        assertThat($json['redirect'], containsString('account/returns.add'));
    }

    public function test_con_el_formulario_vacio_avisa_de_cada_campo_obligatorio(): void {
        // Arrange
        $this->returns->expects($this->never())->method('addReturn');

        // Act
        $json = $this->enviar([]);

        // Assert
        assertThat(array_keys($json['error']), containsInAnyOrder('order_id', 'firstname', 'lastname', 'email', 'product', 'model', 'reason'));
        assertThat($json['error']['order_id'], is('Order ID required!'));
    }

    /** @dataProvider correos */
    public function test_el_correo_debe_tener_un_formato_valido(string $correo, bool $valido): void {
        // Act
        $json = $this->enviar($this->completa(['email' => $correo]));

        // Assert
        assertThat(isset($json['error']['email']), is(!$valido));
    }

    public function correos(): array {
        return [
            'válido' => ['ana@tienda.com', true],
            'sin arroba' => ['ana.tienda.com', false],
            'sin dominio' => ['ana@', false],
            'con espacios' => ['ana maria@tienda.com', false],
        ];
    }

    /** @dataProvider nombres */
    public function test_el_nombre_debe_tener_entre_1_y_32_caracteres(int $largo, bool $valido): void {
        // Act
        $json = $this->enviar($this->completa(['firstname' => str_repeat('S', $largo)]));

        // Assert
        assertThat(isset($json['error']['firstname']), is(!$valido));
    }

    public function nombres(): array {
        return ['0' => [0, false], '1' => [1, true], '32' => [32, true], '33' => [33, false]];
    }

    public function test_sin_motivo_no_se_acepta(): void {
        // Act
        $json = $this->enviar($this->completa(['return_reason_id' => 0]));

        // Assert
        assertThat($json['error'], hasKeyValuePair('reason', 'You must select a return product reason!'));
    }

    public function test_si_la_tienda_exige_telefono_uno_de_2_digitos_no_se_acepta(): void {
        // Arrange
        $this->config->set('config_telephone_required', 1);

        // Act
        $json = $this->enviar($this->completa(['telephone' => '12']));

        // Assert
        assertThat($json['error'], hasKey('telephone'));
    }

    // ── Defectos (fase roja del TDD) ───────────────────────────────────────

    /**
     * DEF-11-01: el número de pedido solo se revisa con !$order_id, así que
     * "-5" o "abc" pasan como válidos.
     * @group defecto
     * @dataProvider pedidosInvalidos
     */
    public function test_DEF_11_01_un_numero_de_pedido_invalido_no_se_acepta(string $pedido): void {
        // Act
        $json = $this->enviar($this->completa(['order_id' => $pedido]));

        // Assert
        assertThat($json, hasKey('error'));
        assertThat($json['error'], hasKey('order_id'));
    }

    public function pedidosInvalidos(): array {
        return ['negativo' => ['-5'], 'con letras' => ['abc']];
    }

    /**
     * DEF-11-07: si la tienda tiene una página de condiciones de devolución,
     * el cliente debe aceptarla. El código revisa !isset($post_info['agree']),
     * pero ese campo siempre existe (vale 0 por defecto), así que nunca exige
     * aceptar las condiciones.
     * @group defecto
     */
    public function test_DEF_11_07_si_hay_condiciones_de_devolucion_hay_que_aceptarlas(): void {
        // Arrange
        $this->config->set('config_return_id', 4);
        $this->informacion = ['information_id' => 4, 'title' => 'Políticas de devolución'];

        // Act: el formulario llega sin la casilla "agree".
        $json = $this->enviar($this->completa());

        // Assert
        assertThat($json, hasKey('error'));
    }

    /**
     * DEF-11-06: la devolución solo se acepta si el pedido existe.
     */
    public function test_un_pedido_que_no_existe_no_se_acepta(): void {
        // Arrange
        $this->returns = $this->createMock(ReturnsModel::class);
        $this->returns->method('hasOrder')->willReturn(false);
        $this->returns->expects($this->never())->method('addReturn');

        // Act
        $json = $this->enviar($this->completa(['order_id' => 99999999]));

        // Assert
        assertThat($json['error'], hasKey('order_id'));
    }
}
