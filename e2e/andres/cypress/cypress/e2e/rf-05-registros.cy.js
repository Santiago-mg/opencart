// Original de Andrés: cypress/e2e/logging-copy-1.cy.js
// (logging.cy.js solo tenía la prueba de ejemplo de https://example.cypress.io y se quitó)
describe('RF-05 Registro de errores', () => {
  beforeEach(() => {
    // Una búsqueda con un parámetro mal formado hace que la tienda escriba un
    // error en su registro, así el registro nunca está vacío al comenzar.
    cy.request({ url: '/index.php?route=product/search&search[]=rf-05', failOnStatusCode: false });
  });

  it('download', function() {
    cy.login();

    // System > Maintenance > Error Logs
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-3"]').click();
    cy.get('#collapse-8-3 li:nth-child(4) > a').click();

    // El error que se provocó está en el registro
    cy.get('#input-log-0').invoke('val').should('contain', 'product/search.php');

    cy.get('#tab-log-0 a.btn').click();

    // La descarga responde con el archivo del registro
    cy.get('#tab-log-0 a.btn').invoke('attr', 'href').then((href) => {
      cy.request(href).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
        expect(respuesta.headers['content-disposition']).to.contain('attachment').and.to.contain('error.log');
        expect(respuesta.body).to.contain('product/search.php');
      });
    });
  });

  it('clear', function() {
    cy.login();

    // System > Maintenance > Error Logs
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-3"]').click();
    cy.get('#collapse-8-3 li:nth-child(4) > a').click();

    cy.get('#input-log-0').invoke('val').should('not.be.empty');
    cy.get('#tab-log-0 :nth-child(2) > .btn').should('be.visible');
    cy.get('#tab-log-0 :nth-child(2) > .btn').click(); // OpenCart pide confirmar; Cypress acepta solo
    cy.get('#alert .alert-success').should('contain', 'Success: You have successfully cleared your error log!');
    cy.get('#input-log-0').should('have.value', '');

    // Al recargar, el registro sigue vacío: se borró el archivo, no solo el cuadro de texto
    cy.reload();
    cy.get('#input-log-0').should('have.value', '');
  });
})
