# Pruebas E2E de OpenCart con Cypress (Andrés Mendoza)

Pruebas de las funcionalidades de Andrés sobre **OpenCart 4.1.0.3**: idiomas,
monedas, zonas geográficas e impuestos, y registro de errores. Son las mismas
pruebas que él grabó con Cypress, arregladas para que corran en esta versión y
para que cada una compruebe algo.

## Cómo correrlas

1. Encender la tienda (desde la carpeta del repositorio):

   ```bash
   docker compose up -d opencart
   ```

   La tienda queda en <http://localhost> y el panel en <http://localhost/admin> (`admin` / `admin`).
   Si está en otra dirección o con otro usuario: `OPENCART_URL`, `OPENCART_ADMIN_USER` y `OPENCART_ADMIN_PASSWORD`.

2. Correr las pruebas:

   ```bash
   cd e2e/andres/cypress
   npm install        # la primera vez: instala Cypress 16.3.0 y su navegador
   npm test           # todas, sin abrir ventana
   npm run cy:open    # la ventana de Cypress, para ver cada paso
   ```

   Para correr un solo archivo: `npx cypress run --spec cypress/e2e/rf-04-zonas-geograficas.cy.js`.

## Qué se prueba

| Archivo | Original de Andrés | Qué comprueba |
|---|---|---|
| `00-tienda-disponible.cy.js` | `spec.cy.js` | La tienda abre (se ve el logo y el selector de moneda). |
| `rf-02-idiomas.cy.js` | `language-spec.cy.js` | Crea el idioma Français (`fr-fr`), lo ve en la lista, filtra los productos por "iPod Touch" (sale uno solo) y al final borra el Français. |
| `rf-03-monedas.cy.js` | `currency.cy.js` | Cambia la moneda de la tienda a Euro y los precios salen con "€". |
| `rf-04-zonas-geograficas.cy.js` | `geo.cy.js` | Crea la zona "Colombia Antioquia" (Colombia / Antioquia), la ve en la lista y borra esa misma zona. |
| `rf-05-registros.cy.js` | `logging-copy-1.cy.js` | Provoca un error en la tienda, lo ve en *Error Logs*, lo descarga (la descarga trae el archivo) y limpia el registro (queda vacío también al recargar). |

`logging.cy.js` solo tenía la prueba de ejemplo de Cypress (`example.cypress.io`) y no se pasó.

Las pruebas dejan la tienda como estaba: borran el idioma y la zona que crean.
Ojo: la de registros **vacía el archivo de errores** de la tienda (`error.log`).

## Estructura

```
cypress.config.js        → dirección de la tienda y usuario del panel
cypress/e2e/             → las pruebas, un archivo por funcionalidad
cypress/support/
  commands.js            → cy.login(): entra al panel y cierra el aviso de seguridad si sale
  e2e.js                 → carga commands.js
```
