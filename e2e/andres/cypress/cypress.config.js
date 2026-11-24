const { defineConfig } = require("cypress");

// Por defecto la tienda está en http://localhost y el panel en
// http://localhost/admin con admin / admin. Si corre en otro lado se cambia con
// OPENCART_URL, OPENCART_ADMIN_USER y OPENCART_ADMIN_PASSWORD.
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.OPENCART_URL ?? "http://localhost",
    // El menú de la izquierda del panel y el filtro de productos solo se ven en pantalla ancha
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    adminUser: process.env.OPENCART_ADMIN_USER ?? "admin",
    adminPassword: process.env.OPENCART_ADMIN_PASSWORD ?? "admin",
  },
});
