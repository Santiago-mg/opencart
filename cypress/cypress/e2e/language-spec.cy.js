describe('template spec', () => {
  it('adds French language', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    cy.visit('http://localhost/admin/');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('admin');
    cy.get('button[type="submit"]').click();

    cy.get('.btn-close').click();
    // 3. Navigate via sidebar (System > Localisation > Languages)
    cy.get('[href="#collapse-8"]').click();
    cy.get('[href="#collapse-8-2"]').should('be.visible').click();
    cy.get('#collapse-8-2 > :nth-child(2) > a').should('be.visible').click();

    // 4. Click Add New
    cy.get('.float-end > .btn-primary').click();

    // 5. Fill out form fields
    // cy.get('[name="name"]').type('Français');
    // cy.get('[name="code"]').type('fr-fr');
    // cy.get('[name="locale"]').type('fr-FR,fr_FR.UTF-8,fr_FR,fr,french');
    // cy.get('#input-status').check(); // Enable the language
    //
    // // 6. Click Save using a specific selector
    // cy.get('.float-end > button[type="submit"]').click();
  });

  it('sees whether french was added', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    cy.visit('http://localhost/admin/');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('admin');
    cy.get('button[type="submit"]').click();

    cy.get('.btn-close').click();
    // 3. Navigate via sidebar (System > Localisation > Languages)
    cy.get('[href="#collapse-8"]').click();
    cy.get('[href="#collapse-8-2"]').should('be.visible').click();
    cy.get('#collapse-8-2 > :nth-child(2) > a').should('be.visible').click();

	cy.get('tbody > :nth-child(2) > :nth-child(2)').should('contain', 'Français');
  });

  it('sees whether french was added', () => {
    // 1. Ensure desktop viewport so the left sidebar is visible
    cy.viewport(1280, 800);

    cy.visit('http://localhost/admin/');
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').type('admin');
    cy.get('button[type="submit"]').click();

    cy.get('.btn-close').click();

	cy.get('[href="#collapse-1"]').click();
	cy.get('#collapse-1 > :nth-child(2) > a').click();

	cy.get('[name="filter_name"]').type('iPod Touch');

	cy.get('#button-filter').click();
  });

});
