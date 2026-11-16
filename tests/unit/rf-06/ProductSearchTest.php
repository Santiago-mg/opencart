<?php
namespace Tests\Rf06;

use Opencart\Catalog\Model\Catalog\Product;
use Tests\Support\FakeDatabase;
use Tests\Support\TestCase;
use function Tests\Support\registry;

/**
 * RF-06 — Búsqueda y filtrado · pruebas unitarias de caja blanca
 * catalog/model/catalog/product.php → getProducts() y getTotalProducts()
 *
 * getProducts() arma la consulta SQL por pedazos según los filtros que
 * recibe en $data. Aquí la base de datos es un doble (FakeDatabase) que anota
 * la consulta, y la caché es un mock: así se revisa qué SQL se arma por cada
 * camino del código, sin MySQL.
 */
class ProductSearchTest extends TestCase {
    private FakeDatabase $db;
    private Product $model;

    protected function setUp(): void {
        // Arrange común: tienda 0, idioma 1, grupo de clientes 1 y caché vacía.
        $this->db = new FakeDatabase();
        $cache = $this->createStub(CacheDouble::class);
        $cache->method('get')->willReturn(null);
        $registry = registry(['db' => $this->db, 'cache' => $cache]);
        $registry->get('config')->set('config_language_id', 1);
        $this->model = new Product($registry);
    }

    /** El SQL que armó getProducts() con esos filtros. */
    private function sqlDe(array $filtros): string {
        $this->model->getProducts($filtros);
        return $this->db->lastQuery();
    }

    public function test_sin_filtros_solo_trae_productos_activos_y_ya_disponibles(): void {
        // Act
        $sql = $this->sqlDe([]);

        // Assert
        assertThat($sql, containsString("`p`.`status` = '1'"));
        assertThat($sql, containsString('`p`.`date_available` <= NOW()'));
        assertThat($sql, not(containsString('product_to_category')));
    }

    public function test_con_categoria_filtra_solo_esa_categoria(): void {
        // Act
        $sql = $this->sqlDe(['filter_category_id' => 20]);

        // Assert
        assertThat($sql, containsString("`p2c`.`category_id` = '20'"));
        assertThat($sql, not(containsString('category_path')));
    }

    public function test_con_subcategorias_filtra_la_categoria_y_todas_sus_hijas(): void {
        // Act
        $sql = $this->sqlDe(['filter_category_id' => 20, 'filter_sub_category' => 1]);

        // Assert
        assertThat($sql, containsString('category_path'));
        assertThat($sql, containsString("`cp`.`path_id` = '20'"));
    }

    public function test_la_categoria_se_convierte_a_numero_antes_de_ir_a_la_consulta(): void {
        // Act
        $sql = $this->sqlDe(['filter_category_id' => "20'; DROP TABLE oc_product; --"]);

        // Assert
        assertThat($sql, containsString("`p2c`.`category_id` = '20'"));
        assertThat($sql, not(containsString('DROP TABLE')));
    }

    public function test_cada_palabra_buscada_se_busca_en_el_nombre_unidas_con_or(): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => 'mac   book']);

        // Assert: los espacios repetidos no generan palabras vacías.
        assertThat($sql, containsString("`pd`.`name` LIKE '%mac%' OR `pd`.`name` LIKE '%book%'"));
        assertThat($sql, not(containsString("LIKE '%%'")));
    }

    public function test_sin_marcar_la_casilla_no_busca_en_la_descripcion(): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => 'intel']);

        // Assert
        assertThat($sql, not(containsString('`pd`.`description` LIKE')));
    }

    public function test_marcando_la_casilla_tambien_busca_en_la_descripcion(): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => 'intel', 'filter_description' => 1]);

        // Assert
        assertThat($sql, containsString("`pd`.`description` LIKE '%intel%'"));
    }

    public function test_tambien_encuentra_un_producto_por_su_modelo_exacto(): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => 'SAM1']);

        // Assert
        assertThat($sql, containsString("LCASE(`p`.`model`) = 'sam1'"));
    }

    public function test_las_comillas_del_texto_buscado_se_escapan(): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => "' OR 1=1 -- "]);

        // Assert
        assertThat($sql, containsString("LIKE '%\\'%'"));
        assertThat($sql, not(containsString("LIKE '%' OR 1=1")));
    }

    /** @dataProvider ordenesPermitidos */
    public function test_ordena_por_los_campos_de_la_lista_blanca(string $sort, string $orderBy): void {
        // Act
        $sql = $this->sqlDe(['sort' => $sort, 'order' => 'ASC']);

        // Assert
        assertThat($sql, containsString($orderBy));
    }

    public function ordenesPermitidos(): array {
        return [
            'por nombre' => ['pd.name', 'ORDER BY LCASE(pd.name)'],
            'por modelo' => ['p.model', 'ORDER BY LCASE(p.model)'],
            'por precio (oferta, descuento o normal)' => ['p.price', 'ORDER BY (CASE WHEN `special` IS NOT NULL'],
            'por calificación' => ['rating', 'ORDER BY rating'],
        ];
    }

    public function test_un_orden_que_no_esta_en_la_lista_blanca_se_ignora(): void {
        // Act
        $sql = $this->sqlDe(['sort' => 'p.price; DROP TABLE oc_product', 'order' => 'ASC']);

        // Assert
        assertThat($sql, containsString('ORDER BY `p`.`sort_order`'));
        assertThat($sql, not(containsString('DROP TABLE')));
    }

    /** @dataProvider direcciones */
    public function test_solo_desc_ordena_de_mayor_a_menor(string $order, string $esperado): void {
        // Act
        $sql = $this->sqlDe(['sort' => 'pd.name', 'order' => $order]);

        // Assert
        assertThat($sql, containsString($esperado));
    }

    public function direcciones(): array {
        return [
            'DESC' => ['DESC', ' DESC, LCASE(`pd`.`name`) DESC'],
            'ASC' => ['ASC', ' ASC, LCASE(`pd`.`name`) ASC'],
            'cualquier otra cosa' => ['desc; DROP', ' ASC, LCASE(`pd`.`name`) ASC'],
        ];
    }

    /**
     * Valores límite de la paginación del modelo.
     * @dataProvider paginas
     */
    public function test_corrige_el_inicio_y_el_limite_fuera_de_rango(int $start, int $limit, string $limitSql): void {
        // Act
        $sql = $this->sqlDe(['start' => $start, 'limit' => $limit]);

        // Assert
        assertThat($sql, endsWith($limitSql));
    }

    public function paginas(): array {
        return [
            'inicio -1 pasa a 0' => [-1, 10, ' LIMIT 0,10'],
            'inicio 0 se queda' => [0, 10, ' LIMIT 0,10'],
            'límite 0 pasa a 20' => [0, 0, ' LIMIT 0,20'],
            'límite 1 se queda' => [0, 1, ' LIMIT 0,1'],
            'segunda página de 10' => [10, 10, ' LIMIT 10,10'],
        ];
    }

    public function test_si_la_consulta_ya_esta_en_cache_no_va_a_la_base_de_datos(): void {
        // Arrange: un mock de la caché que ya tiene la respuesta.
        $guardado = [['product_id' => 40, 'name' => 'iPhone']];
        $cache = $this->createMock(CacheDouble::class);
        $cache->expects($this->once())->method('get')->willReturn($guardado);
        $cache->expects($this->never())->method('set');
        $db = new FakeDatabase();
        $model = new Product(registry(['db' => $db, 'cache' => $cache]));

        // Act
        $productos = $model->getProducts(['filter_search' => 'iphone']);

        // Assert
        assertThat($productos, is(equalTo($guardado)));
        assertThat($db->queries, is(emptyArray()));
    }

    public function test_si_no_esta_en_cache_consulta_una_vez_y_guarda_el_resultado(): void {
        // Arrange
        $cache = $this->createMock(CacheDouble::class);
        $cache->method('get')->willReturn(null);
        $cache->expects($this->once())->method('set')->with($this->stringStartsWith('product.'), $this->anything());
        $db = (new FakeDatabase())->answer('/FROM `oc_product_to_store`/', [['product_id' => 40]]);
        $model = new Product(registry(['db' => $db, 'cache' => $cache]));

        // Act
        $productos = $model->getProducts([]);

        // Assert
        assertThat($productos, arrayWithSize(1));
        assertThat($db->queries, arrayWithSize(1));
    }

    public function test_el_conteo_de_la_paginacion_usa_el_mismo_filtro_de_categoria(): void {
        // Arrange
        $this->db->answer('/AS `total`/', [['total' => 3]]);

        // Act
        $total = $this->model->getTotalProducts(['filter_category_id' => 20, 'filter_sub_category' => 1]);

        // Assert
        assertThat($total, is(3));
        assertThat($this->db->lastQuery(), containsString('AS `total`'));
        assertThat($this->db->lastQuery(), containsString("`cp`.`path_id` = '20'"));
    }

    /**
     * TDD — fase roja de DEF-06-03.
     *
     * En LIKE, "%" significa "cualquier texto" y "_" "cualquier carácter". Si
     * el cliente los escribe, deben llegar escapados (\% y \_) para buscarse
     * como texto. Hoy llegan tal cual y buscar "%" trae todo el catálogo.
     *
     * @group defecto
     * @dataProvider comodines
     */
    public function test_DEF_06_03_los_comodines_que_escribe_el_cliente_se_buscan_como_texto(string $comodin): void {
        // Act
        $sql = $this->sqlDe(['filter_search' => $comodin]);

        // Assert
        assertThat($sql, containsString('\\' . $comodin));
    }

    public function comodines(): array {
        return ['porcentaje' => ['%'], 'guion bajo' => ['_']];
    }
}

/** Lo que el modelo usa de la caché de OpenCart (para crear su doble). */
interface CacheDouble {
    public function get(string $key): mixed;

    public function set(string $key, mixed $value, int $expire = 0): void;
}
