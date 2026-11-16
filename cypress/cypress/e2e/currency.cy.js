describe('template spec', () => {
  it('Changes the currency of the page', function() {
    cy.visit('http://localhost/index.php?route=common/home&language=en-gb');
	cy.get('#form-currency > .dropdown > .dropdown-toggle').click();
	cy.get('#form-currency > .dropdown > .dropdown-menu > :nth-child(1) > .dropdown-item').click();
	cy.get(':nth-child(1) > .product-thumb > .content > .description > .price > .price-new').should('contain', '€');
  });
})
