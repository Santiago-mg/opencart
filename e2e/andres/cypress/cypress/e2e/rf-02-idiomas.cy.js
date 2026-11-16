// Original de Andrés: cypress/e2e/language-spec.cy.js
// La tercera prueba también se llamaba 'sees whether french was added', pero lo
// que hace es filtrar productos por "iPod Touch"; se le cambió el nombre.
describe('RF-02 Idiomas', () => {
  it('adds French language', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    // 2. Log in to the admin
    cy.login();

    // 3. Navigate via sidebar (System > Localisation > Languages)
    cy.get('[href="#collapse-8"]').click();
    cy.get('[href="#collapse-8-2"]').should('be.visible').click();
    cy.get('#collapse-8-2 > :nth-child(2) > a').should('be.visible').click();

    // 4. Click Add New
    cy.get('.float-end > .btn-primary').click();

    // 5. Fill out form fields
    cy.get('[name="name"]').type('Français');
    cy.get('[name="code"]').type('fr-fr');
    cy.get('[name="locale"]').type('fr-FR,fr_FR.UTF-8,fr_FR,fr,french');
    cy.get('#input-status').check(); // Enable the language

    // 6. Click Save using a specific selector
    cy.get('.float-end > button[type="submit"]').click();
    cy.get('#alert .alert-success').should('contain', 'Success: You have modified languages!');
  });

  it('sees whether french was added', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    cy.login();

    // 3. Navigate via sidebar (System > Localisation > Languages)
    cy.get('[href="#collapse-8"]').click();
    cy.get('[href="#collapse-8-2"]').should('be.visible').click();
    cy.get('#collapse-8-2 > :nth-child(2) > a').should('be.visible').click();

	cy.contains('#language tbody tr', 'Français').should('contain', 'fr-fr');
  });

  it('filters the products by "iPod Touch"', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    cy.login();

    // Catalog > Products
	cy.get('[href="#collapse-1"]').click();
	cy.get('#collapse-1 > :nth-child(2) > a').click();

	cy.get('[name="filter_name"]').type('iPod Touch');

	cy.get('#button-filter').click();

	cy.get('#product tbody tr').should('have.length', 1);
	cy.get('#product tbody tr').should('contain', 'iPod Touch');
  });

  it('deletes French language', () => {
    // Limpieza: deja la tienda como estaba
    cy.viewport(1280, 800);

    cy.login();

    cy.get('[href="#collapse-8"]').click();
    cy.get('[href="#collapse-8-2"]').should('be.visible').click();
    cy.get('#collapse-8-2 > :nth-child(2) > a').should('be.visible').click();

	cy.contains('#language tbody tr', 'Français').find('[name="selected[]"]').check();
	cy.get('.btn-danger > .fa-regular').click(); // OpenCart pide confirmar; Cypress acepta solo
    cy.get('#alert .alert-success').should('contain', 'Success: You have modified languages!');
    cy.get('#language tbody').should('not.contain', 'Français');
  });

});
