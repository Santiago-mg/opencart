// Original de Andrés: cypress/e2e/spec.cy.js
// Se quitó la prueba de ejemplo que visitaba https://example.cypress.io.
describe('OpenCart', () => {
  it('OpenCart is reachable', function() {
    cy.visit('/');
    cy.get('#logo').should('be.visible');
    cy.get('#form-currency').should('exist');
  });
})
