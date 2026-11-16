// ***********************************************
// Comandos propios de las pruebas.
//
// https://on.cypress.io/custom-commands
// ***********************************************

// cy.login(): entra al panel de administración, los mismos pasos que estaban
// repetidos al comienzo de cada prueba del panel.
Cypress.Commands.add('login', (usuario = Cypress.env('adminUser'), clave = Cypress.env('adminPassword')) => {
  cy.visit('/admin/');

  cy.get('[name="username"]').click();
  cy.get('[name="username"]').type(usuario);
  cy.get('[name="password"]').click();
  cy.get('[name="password"]').type(clave, { log: false });
  cy.get('#form-login button.btn').click();

  // Al entrar, OpenCart lleva al tablero y la dirección trae el user_token
  cy.url().should('include', 'user_token=');
  cy.get('#menu').should('be.visible');

  // OpenCart 4.1.0.3 abre en el tablero un aviso de seguridad (carpeta install/,
  // carpeta storage/...). Solo se cierra si aparece.
  cy.get('body').then(($body) => {
    if ($body.find('#modal-security').length) {
      cy.get('#modal-security button.btn-close').click();
      cy.get('#modal-security').should('not.be.visible');
    }
  });
});
