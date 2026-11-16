import { defineConfig } from 'cypress'

/**
 * Dónde está corriendo OpenCart.
 *
 * Por defecto es la dirección del docker-compose del proyecto
 * (`docker compose up -d opencart`): la tienda en http://localhost y el panel
 * en http://localhost/admin con admin / admin. Si corre en otro lado, se
 * cambian con las variables OPENCART_URL, OPENCART_ADMIN_USER y
 * OPENCART_ADMIN_PASSWORD.
 */
export default defineConfig({
  e2e: {
    baseUrl: process.env.OPENCART_URL ?? 'http://localhost',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    retries: 0,
  },
  env: {
    adminUser: process.env.OPENCART_ADMIN_USER ?? 'admin',
    adminPassword: process.env.OPENCART_ADMIN_PASSWORD ?? 'admin',
  },
})
