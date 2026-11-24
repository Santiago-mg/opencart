// Original de Andrés: cypress/e2e/currency.cy.js
describe('RF-03 Monedas', () => {
  it('Changes the currency of the page', function() {
    cy.visit('/index.php?route=common/home&language=en-gb');
	cy.get('#form-currency > .dropdown > .dropdown-toggle').click();
	// La primera moneda de la lista es el Euro
	cy.get('#form-currency > .dropdown > .dropdown-menu > :nth-child(1) > .dropdown-item').should('contain', 'Euro').click();
	// La página se recarga con la moneda nueva
	cy.get('#form-currency > .dropdown > .dropdown-toggle').should('contain', '€');
	cy.get(':nth-child(1) > .product-thumb > .content > .description > .price > .price-new').should('contain', '€');
  });
})
