/**
 * Dónde está corriendo OpenCart. La tienda se abre con rutas relativas porque
 * Cypress ya conoce `baseUrl` (cypress.config.ts, variable OPENCART_URL). El
 * usuario del panel sale de las variables OPENCART_ADMIN_USER y
 * OPENCART_ADMIN_PASSWORD (por defecto admin / admin).
 */
export const environment = {
  admin: {
    get username(): string {
      return Cypress.env('adminUser') as string
    },
    get password(): string {
      return Cypress.env('adminPassword') as string
    },
  },
}

/**
 * Cómo se presentan las peticiones que no salen del navegador (cy.request).
 * Un navegador siempre manda este encabezado y el panel de OpenCart falla sin
 * él, así que se manda siempre.
 */
export const BROWSER = 'Mozilla/5.0 (pruebas E2E de OpenCart con Cypress)'

type Parameters = Record<string, string | number>

const query = (parameters: Parameters): string =>
  Object.entries(parameters)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

/** Dirección de una página o acción de la tienda: pageAt('product/search', { search: 'mac' }) */
export const pageAt = (route: string, parameters: Parameters = {}): string =>
  `/index.php?route=${route}&${query({ language: 'en-gb', ...parameters })}`

/** Dirección de una pantalla del panel; el panel exige el user_token en todas. */
export const panelAt = (route: string, userToken: string, parameters: Parameters = {}): string =>
  `/admin/index.php?route=${route}&${query({ user_token: userToken, ...parameters })}`

/** Los campos como los manda un formulario HTML: a=1&b=2&selected[]=3&selected[]=4 */
export const asForm = (fields: Record<string, string | number | Array<string | number>>): string =>
  Object.entries(fields)
    .flatMap(([key, value]) => (Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]))
    .map(([key, value]) => `${encodeURIComponent(String(key))}=${encodeURIComponent(String(value))}`)
    .join('&')
