// Original de Andrés: cypress/e2e/geo.cy.js (la prueba se llamaba 'create')
describe('RF-04 Zonas geográficas e impuestos', () => {
   it('creates the "Colombia Antioquia" geo zone and deletes it', function() {
    cy.login();

    // System > Localisation > Geo Zones
    cy.get('#menu-system a[href="#collapse-8"]').click();
    cy.get('#collapse-8 a[href="#collapse-8-2"]').click();
    cy.get('#collapse-8-2 li:nth-child(10) a').click();
    cy.get('#content h1').should('contain', 'Geo Zones');

    cy.get('#content i.fa-plus').click();
    cy.get('[name="name"]').click();
    cy.get('[name="name"]').type('Colombia Antioquia');
    cy.get('[name="description"]').click();
    cy.get('[name="description"]').type('IVA para Antioquia');
    cy.get('#button-geo-zone i.fa-solid').click();
    // Colombia (country_id 47) y Antioquia (zone_id 721); los departamentos se cargan al escoger el país
    cy.get('#zone-to-geo-zone-row-0 [name="zone_to_geo_zone[0][country_id]"]').select('Colombia');
    cy.get('#zone-to-geo-zone-row-0 [name="zone_to_geo_zone[0][zone_id]"]').should('contain', 'Antioquia');
    cy.get('#zone-to-geo-zone-row-0 [name="zone_to_geo_zone[0][zone_id]"]').select('Antioquia');
    cy.get('#content i.fa-floppy-disk').click();
    cy.get('#alert .alert-success').should('contain', 'Success: You have modified geo zones!');
    cy.get('#alert button.btn-close').click();

    // Vuelve a la lista por la miga de pan y la zona aparece
    cy.get('#content li:nth-child(2) a').click();
    cy.get('#geo-zone tbody').should('contain', 'Colombia Antioquia');

    // Borra justo esa zona (su propia fila, no la primera de la lista)
	cy.contains('#geo-zone tbody tr', 'Colombia Antioquia').find('[name="selected[]"]').check();
	cy.get('.btn-danger > .fa-regular').click(); // OpenCart pide confirmar; Cypress acepta solo
    cy.get('#alert .alert-success').should('contain', 'Success: You have modified geo zones!');
    cy.get('#geo-zone tbody').should('not.contain', 'Colombia Antioquia');
  });
})
