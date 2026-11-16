describe('template spec', () => {
  it('download', function() {
    cy.visit('http://localhost/admin')

    cy.get('[name="username"]').click();
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').click();
    cy.get('[name="password"]').type('admin');
    cy.get('#form-login button.btn').click();
    cy.get('#modal-security button.btn-close').click();
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-3"]').click();
    cy.get('#collapse-8-3 li:nth-child(4) > a').click();
    cy.get('#tab-log-0 a.btn').click();
  });

  it('clear', function() {
    cy.visit('http://localhost/admin')

    cy.get('[name="username"]').click();
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').click();
    cy.get('[name="password"]').type('admin');
    cy.get('#form-login button.btn').click();
    cy.get('#modal-security button.btn-close').click();
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-3"]').click();
    cy.get('#collapse-8-3 li:nth-child(4) > a').click();
    cy.get(':nth-child(2) > .btn').should('be.visible');
  });
})
