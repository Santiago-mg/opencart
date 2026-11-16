describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('OpenCart is reachable', function() {
    cy.visit('localhost:80')
    
  });
})