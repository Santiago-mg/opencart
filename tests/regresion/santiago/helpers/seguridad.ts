/**
 * Datos de ataque para security-testing.
 *
 * Son el equivalente de las pruebas de sanitizar_entrada() del curso: texto
 * que, si la tienda lo metiera tal cual en una consulta SQL o en el HTML de
 * una página, cambiaría la consulta (inyección SQL) o ejecutaría código en el
 * navegador de otra persona (XSS).
 */
export const XSS_SCRIPT = "<script>alert('x')</script>"
export const XSS_IMAGEN = '<img src="x" onerror="alert(1)">'

/** [texto, qué intenta] — para recorrer con it.each (como @pytest.mark.parametrize). */
export const INYECCIONES_SQL: Array<[string, string]> = [
  ["' OR 1=1 -- ", 'condición siempre verdadera'],
  ["'; DROP TABLE oc_product; -- ", 'consulta apilada'],
  ["' UNION SELECT username, password FROM oc_user -- ", 'unión con la tabla de usuarios'],
  ["') OR ('1'='1", 'cierre de paréntesis'],
]

/** ¿La respuesta deja ver cómo está hecho el servidor? (rutas de archivos, avisos de PHP o errores de SQL) */
export function revelaDetallesInternos(texto: string): boolean {
  return /<b>(Warning|Notice|Fatal error)<\/b>|\.php<\/b> on line|SQLSTATE|Error No: \d+|You have an error in your SQL syntax|\/upload\/(catalog|system|admin)\//.test(texto)
}

/** ¿El HTML trae el ataque tal cual, sin escapar? */
export const traeHtmlInyectado = (html: string): boolean => html.includes(XSS_SCRIPT) || html.includes(XSS_IMAGEN)

/** Lo que llegó en la respuesta, sea JSON o texto, como una sola cadena para revisarla. */
export const textoCompleto = (res: { body: unknown; text?: string }): string => `${res.text ?? ''}${JSON.stringify(res.body ?? '')}`
