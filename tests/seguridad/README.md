# Pruebas de seguridad — RF-06 a RF-11

Seguridad de las seis funcionalidades de Santiago (búsqueda, carrito, cupones,
reseñas, comparar y devoluciones) en OpenCart 4.1.0.3, revisada desde cuatro
lados y organizada con el OWASP Top 10 (2021):

| Tipo | Herramienta | Qué revisa | Evidencia | Estado |
|---|---|---|---|---|
| Análisis estático | **SonarQube** | Solo los archivos de las funcionalidades probadas (RF-01 a RF-11; el resto de OpenCart queda aislado) (`sonar-project.properties`): vulnerabilidades, *security hotspots*, bugs | `evidencia/sonarqube/` | Hecho (16 nov): resultados abajo |
| Análisis estático (complementario) | **Semgrep** 1.185 | Los mismos 25 archivos con 260 reglas públicas de seguridad para PHP y de secretos | `evidencia/estatico/semgrep.*` | Hecho: 3 hallazgos, falsos positivos |
| Análisis dinámico | **Vitest** (`tests/regresion/santiago/security-testing`) | Ataques reales contra la tienda encendida: inyección SQL, XSS, permisos, sesión, cabeceras, abuso de la lógica | `evidencia/dinamico/vitest-seguridad.txt` | Hecho: 104 pruebas, 96 pasan, 8 defectos |
| Análisis dinámico (complementario) | **OWASP ZAP** | Escaneo pasivo de las páginas y acciones de las seis funcionalidades | `evidencia/dinamico/zap-reporte.*` | Hecho (16 nov): resultados abajo |
| Dependencias | **composer audit** | Las 16 librerías PHP de OpenCart (`composer.lock`) | `evidencia/dependencias/composer-audit.json` | Hecho (16 nov): resultados abajo (la revisión previa ya está hecha) |
| Dependencias | **npm audit** | Las librerías de los tres proyectos de pruebas en JavaScript | `evidencia/dependencias/npm-audit-*.json` | Hecho |

## Cómo correrlas

**En el Mac** (SonarQube, composer audit y ZAP necesitan Docker), con Docker
Desktop abierto, SonarQube en <http://localhost:9000> y la tienda encendida
(`docker compose up -d opencart`):

```bash
cd ~/Documents/opencart
SONAR_TOKEN=<tu token> bash tests/seguridad/analizar.sh
```

El token se crea en SonarQube → *My Account* → *Security* → *Generate Tokens*,
tipo **User Token**. El script analiza el proyecto `OpenCart-Santiago`, baja los
resultados a `evidencia/sonarqube/`, corre `composer audit` y el plan de ZAP
(`zap/plan.yaml`).

**Lo demás:**

```bash
# Dinámico (con la tienda encendida)
cd tests/regresion/santiago && npx vitest run security-testing --reporter=verbose

# Dependencias de los proyectos de pruebas
cd tests/regresion/santiago && npm audit
cd e2e/santiago/serenityjs && npm audit
cd e2e/santiago/cypress && npm audit

# Semgrep (con Docker; reglas oficiales de PHP)
docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep scan --config p/php \
  $(grep -o '^  upload/[^,\\]*' sonar-project.properties)
```

## Resultado de SonarQube (16 nov 2026)

Corrido en el Mac contra `http://localhost:9000`, proyecto `OpenCart-Santiago`
(10.677 líneas de código, solo los archivos de RF-01 a RF-11). Quality Gate: **OK**.

| Métrica | Valor | Calificación |
|---|---|---|
| Vulnerabilidades | 9 | D |
| Fiabilidad (reliability) | 60 | C |
| Mantenibilidad (maintainability) | 278 | A |
| Security hotspots | 0 | A |
| Duplicación | 24,6 % | - |
| Cobertura | 0 % | Las pruebas atacan la tienda encendida y no generan reporte de cobertura para Sonar |

- **Vulnerabilidades (9):** todas son la misma regla, `php:S4790` (algoritmo de hash débil, `md5`),
  en `catalog/model/catalog/product.php` (3), `admin/model/localisation/{currency,language}.php` (2 c/u),
  `geo_zone.php` y `tax_class.php` (1 c/u). Se usa para armar claves de caché, no para contraseñas,
  así que el riesgo real es bajo. Se documentan sin corregir (código de OpenCart).
- **Fiabilidad (60):** casi todos en plantillas Twig, son de accesibilidad (campos sin etiqueta,
  eventos de mouse sin teclado). La accesibilidad queda fuera de este alcance.
- **Evidencia:** `evidencia/sonarqube/{issues,hotspots,medidas,quality-gate}.json`.

## Hallazgos

Severidad: **Alta** si se explota sin permisos y cuesta dinero o expone datos;
**Media** si se explota con condiciones o es abuso de la lógica del negocio;
**Baja** si es difícil de explotar o el impacto es menor.
Validación: **Confirmado** (una prueba lo reproduce), **Falso positivo** o
**No aplica** (el código vulnerable existe, pero OpenCart no lo usa).

| ID | OWASP 2021 | Hallazgo | Detectado con | Severidad | Validación | Recomendación |
|---|---|---|---|---|---|---|
| DEF-08-04 | A04 Diseño inseguro | No hay límite de intentos al probar códigos de cupón: se pueden adivinar por fuerza bruta | Vitest | Media | Confirmado | Limitar intentos por sesión/IP (p. ej. 5 por minuto) y registrar los fallos |
| DEF-11-06 | A04 Diseño inseguro | Se acepta una devolución de un pedido que no existe | Vitest | Media | Confirmado | Validar que el pedido exista y sea del correo que lo pide antes de guardar |
| DEF-SEG-01 | A07 Fallas de autenticación | La cookie de sesión `OCSESSID` no lleva `HttpOnly`: un script podría robar la sesión | Vitest | Media | Confirmado | Agregar `'httponly' => true` al `setcookie` de `system/framework.php` |
| DEF-SEG-02 | A05 Configuración insegura | Sin `X-Frame-Options` ni CSP `frame-ancestors`: la tienda se puede incrustar en otro sitio (*clickjacking*) | Vitest | Media | Confirmado | Enviar `X-Frame-Options: SAMEORIGIN` y `Content-Security-Policy: frame-ancestors 'self'` |
| DEF-06-03 | A03 Inyección | `%` y `_` no se escapan en el `LIKE` de la búsqueda: buscar `%` trae todo el catálogo | Vitest | Media | Confirmado | Escapar `%`, `_` y `\` antes de armar el `LIKE` en `catalog/model/catalog/product.php` |
| DEF-09-02 | A04 Diseño inseguro | El token del formulario de reseñas sirve para enviar muchas reseñas (spam) | Vitest | Baja | Confirmado | Borrar el `review_token` de la sesión después de usarlo |
| DEF-SEG-03 | A05 Configuración insegura | `Access-Control-Allow-Origin: *` junto con `Allow-Credentials: true` en todas las respuestas | Vitest | Baja | Confirmado (los navegadores bloquean esa combinación, por eso no es explotable hoy) | Quitar esas cabeceras de `system/framework.php` o limitar el origen |
| DEF-09-01, DEF-11-05 | A05 Configuración insegura | Si falta un campo, la respuesta trae un aviso de PHP con la ruta del servidor | Vitest (regresión y API) | Baja | Confirmado | Validar con `isset` y no mostrar errores en producción (`display_errors = Off`) |
| SG-01 | A02 Fallas criptográficas | `md5()` en `catalog/model/catalog/product.php` (líneas 243, 739 y 810) | Semgrep | — | Falso positivo: arma la llave del caché, no protege datos | Ninguna |
| DEP-01 | A06 Componentes vulnerables | `twig/twig` 3.18.0 tiene 16 avisos (CVE-2025-24374 y otros del *sandbox*) | Revisión de dependencias | Baja | No aplica hoy: OpenCart usa `autoescape => false`, limpia las entradas en `Request` y no usa el *sandbox* | Actualizar Twig a la última 3.x |
| DEP-02 | A06 Componentes vulnerables | `aws/aws-sdk-php`, `guzzlehttp/guzzle`, `guzzlehttp/psr7` y `mtdowling/jmespath.php` tienen 7 avisos | Revisión de dependencias | Baja | No aplica: ningún archivo de OpenCart usa esas librerías | Quitar `aws/aws-sdk-php` de `composer.json` si no se usa, o actualizarlas |
| DEP-03 | A06 Componentes vulnerables | Vitest 2, Vite, Tinypool, Cypress 13 y Zod tienen avisos (2 críticos, 5 altos) | npm audit | Baja | No aplica a la tienda: son herramientas de prueba que no se instalan en el servidor | Subir Vitest y Cypress de versión mayor cuando el curso lo permita |

## Controles que sí funcionan

Las 96 pruebas dinámicas que pasan muestran que en estas funcionalidades:

- **A01 Control de acceso:** nadie puede cambiar o vaciar el carrito, la
  comparación o el cupón de otra persona, y sin sesión de administrador (ni con
  un `user_token` robado) no se crean cupones ni se aprueban reseñas o
  devoluciones.
- **A03 Inyección:** ningún parámetro (`search`, `sort`, `order`, `limit`,
  `category_id`, `product_id`, `key`, `coupon`, `author`, `text`, `product`…)
  deja pasar SQL, y lo que se escribe en reseñas y devoluciones se muestra como
  texto (sin XSS reflejado ni almacenado).
- **A04 Diseño:** el precio y el descuento los calcula la tienda: mandarlos en
  el formulario no cambia el total, y ningún total queda negativo.
- **A07 Sesión:** el identificador de sesión nunca viaja en la dirección y la
  cookie lleva `SameSite=Strict`.
- **A10 SSRF:** no aplica: ninguna de las seis funcionalidades pide direcciones
  desde el servidor (Semgrep tampoco encontró nada con su regla de SSRF).
