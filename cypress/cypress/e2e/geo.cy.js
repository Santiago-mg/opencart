describe('template spec', () => {
   it('create', function() {
    cy.visit('http://localhost/admin')

    cy.get('[name="username"]').click();
    cy.get('[name="username"]').type('admin');
    cy.get('[name="password"]').click();
    cy.get('[name="password"]').type('admin');
    cy.get('#form-login button.btn').click();
    cy.get('#modal-security button.btn-close').click();
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-2"]').click();
    cy.get('#collapse-8-2 li:nth-child(10) a').click();
    cy.get('#content i.fa-plus').click();
    cy.get('[name="name"]').click();
    cy.get('[name="name"]').type('Colombia Antioquia');
    cy.get('[name="description"]').click();
    cy.get('[name="description"]').type('IVA para Antioquia');
    cy.get('#button-geo-zone i.fa-solid').click();
    cy.get('#zone-to-geo-zone-row-0 [name="zone_to_geo_zone[0][country_id]"]').select('47');
    cy.get('#zone-to-geo-zone-row-0 [name="zone_to_geo_zone[0][zone_id]"]').select('721');
    cy.get('#content i.fa-floppy-disk').click();
    cy.get('#alert button.btn-close').click();
    cy.get('#content li:nth-child(2) a').click();
	cy.get(':nth-child(1) > .text-center > [name="selected[]"]').click();
	cy.get('.btn-danger > .fa-regular').click();
  });
})
