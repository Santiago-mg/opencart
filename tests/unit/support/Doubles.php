<?php
namespace Tests\Support;

/**
 * Dobles sencillos (stubs) de los servicios que OpenCart guarda en el
 * Registry. Cada uno guarda en propiedades públicas lo que la prueba quiere
 * programar o revisar después.
 */

/** config: devuelve los valores que programó la prueba. */
class ConfigStub {
    public function __construct(public array $values = []) {}

    public function get(string $key): mixed {
        return $this->values[$key] ?? null;
    }

    public function set(string $key, mixed $value): void {
        $this->values[$key] = $value;
    }
}

/** request: lo que llegó en la dirección (get) y en el formulario (post). */
class RequestStub {
    public array $server = ['REMOTE_ADDR' => '127.0.0.1'];

    public function __construct(public array $get = [], public array $post = []) {}
}

/** session: los datos de la sesión del visitante. */
class SessionStub {
    public function __construct(public array $data = []) {}

    public function getId(): string {
        return 'sesion-de-prueba';
    }
}

/** response: guarda lo que el controlador respondió. */
class ResponseSpy {
    public string $output = '';
    public array $headers = [];

    public function addHeader(string $header): void {
        $this->headers[] = $header;
    }

    public function setOutput(string $output): void {
        $this->output = $output;
    }

    /** La respuesta JSON ya decodificada. */
    public function json(): array {
        return json_decode($this->output, true) ?? [];
    }
}

/**
 * language: los textos reales del archivo de idioma en inglés, para que las
 * pruebas comparen los mensajes que ve el cliente.
 */
class LanguageStub {
    private array $texts = [];

    public function load(string $file, string $prefix = ''): void {
        // Los idiomas de las extensiones viven en extension/<autor>/catalog/language/.
        $path = str_starts_with($file, 'extension/')
            ? preg_replace('#^extension/([^/]+)/#', 'extension/$1/catalog/language/en-gb/', $file)
            : 'catalog/language/en-gb/' . $file;

        // OpenCart 5 moved the storefront product languages to the catalog/
        // directory; fall back to the new location when the old one is gone.
        if (!is_file(OPENCART . $path . '.php')) {
            $renamed = preg_replace('#^catalog/language/en-gb/product/#', 'catalog/language/en-gb/catalog/', $path);

            if ($renamed !== $path && is_file(OPENCART . $renamed . '.php')) {
                $path = $renamed;
            }
        }

        $_ = [];
        if (is_file(OPENCART . $path . '.php')) {
            require OPENCART . $path . '.php';
        }
        foreach ($_ as $key => $text) {
            $this->texts[($prefix ? $prefix . '_' : '') . $key] = $text;
        }
    }

    public function get(string $key): string {
        return $this->texts[$key] ?? $key;
    }
}

/**
 * load: OpenCart lo usa para cargar idiomas y modelos. Aquí los modelos ya
 * están en el Registry como dobles, así que solo carga el idioma.
 */
class LoaderStub {
    public function __construct(private LanguageStub $language) {}

    public function language(string $file, string $prefix = ''): void {
        $this->language->load($file, $prefix);
    }

    public function model(string $route): void {}

    public function controller(string $route, mixed ...$args): string {
        return '';
    }
}

/** url: arma las direcciones como texto, sin dominio. */
class UrlStub {
    public function link(string $route, string $args = '', bool $js = false): string {
        return 'index.php?route=' . $route . ($args ? '&' . $args : '');
    }
}

/** customer: un visitante sin cuenta, salvo que la prueba diga otra cosa. */
class CustomerStub {
    public function __construct(public int $id = 0) {}

    public function isLogged(): bool {
        return $this->id > 0;
    }

    public function getId(): int {
        return $this->id;
    }
}

/** Arma un Registry con los servicios que comparten casi todas las pruebas. */
function registry(array $services = []): \Opencart\System\Engine\Registry {
    $registry = new \Opencart\System\Engine\Registry();
    $language = new LanguageStub();
    $defaults = [
        'config' => new ConfigStub(['config_language' => 'en-gb', 'config_store_id' => 0, 'config_customer_group_id' => 1]),
        'language' => $language,
        'load' => new LoaderStub($language),
        'url' => new UrlStub(),
        'customer' => new CustomerStub(),
        'session' => new SessionStub(),
        'response' => new ResponseSpy(),
        'request' => new RequestStub(),
    ];
    foreach ($services + $defaults as $key => $service) {
        $registry->set($key, $service);
    }
    return $registry;
}
