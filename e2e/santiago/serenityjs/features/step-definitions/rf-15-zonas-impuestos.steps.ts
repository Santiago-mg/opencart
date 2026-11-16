import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { TestData } from '../../test/support/testData';
import { StartAdminSession } from '../../test/tasks/admin/AdminPanel';
import {
  AddGeoZone,
  AddTaxRate,
  DeleteGeoZone,
  GeoZonesInThePanel,
  SaveGeoZone,
  SaveTaxClass,
  TaxClassInThePanel,
  TaxClassesInThePanel,
  TaxRatesInThePanel,
} from '../../test/tasks/admin/Taxes';

const administrator = () => actorCalled('Ana');

const addGeoZone = async (base: string) => {
  const geoZone = TestData.geoZone(base);
  await administrator().attemptsTo(AddGeoZone.of(geoZone));
};

When('la administradora agrega la zona geográfica {string} para Estados Unidos y Alabama', async (base: string) => {
  await addGeoZone(base);
});

Given('la administradora agregó la zona geográfica {string} para Estados Unidos y Alabama', async (base: string) => {
  await addGeoZone(base);
});

When('la administradora cambia la descripción de la zona geográfica {string} a {string}', async (base: string, description: string) => {
  const geoZone = TestData.geoZoneNamed(base);
  geoZone.description = description;
  await administrator().attemptsTo(SaveGeoZone.of(geoZone));
});

When('la administradora borra la zona geográfica {string}', async (base: string) => {
  await administrator().attemptsTo(DeleteGeoZone.of(TestData.geoZoneNamed(base)));
});

// When('la administradora agrega la tasa de impuesto {string} del {int} % a la zona {string}', async (base: string, rate: number, geoZoneBase: string) => {
//   const geoZone = TestData.geoZoneNamed(geoZoneBase);
//   const taxRate = TestData.taxRate(base, {
//     rate: rate.toFixed(4),
//     type: 'P',
//     geoZoneId: geoZone.id ?? 0,
//   });
//
//   await administrator().attemptsTo(AddTaxRate.of(taxRate));
// });

Given('la administradora tiene una tasa de impuesto existente', async () => {
  const actor = administrator();
  await actor.attemptsTo(StartAdminSession.asAdministrator());

  const first = await TaxRatesInThePanel.first().answeredBy(actor);
  if (!first) throw new Error('La tienda no tiene ninguna tasa de impuesto para usar en la clase');

  TestData.rememberExistingTaxRate(first.id, first.name);
});

When('la administradora crea la clase de impuesto {string} con esa tasa sobre {string} y prioridad {int}', async (base: string, based: string, priority: number) => {
  const taxRate = TestData.existingTaxRate();
  const taxClass = TestData.taxClass(base, {
    rules: [{ taxRateId: taxRate.id, based: based as 'shipping' | 'payment' | 'store', priority }],
  });

  await administrator().attemptsTo(SaveTaxClass.of(taxClass));
});

Then('la zona geográfica {string} aparece en la lista', async (base: string) => {
  const geoZone = TestData.geoZoneNamed(base);
  await administrator().attemptsTo(Ensure.that(GeoZonesInThePanel.exists(geoZone.name), equals(true)));
});

Then('la zona geográfica {string} tiene la descripción guardada', async (base: string) => {
  const geoZone = TestData.geoZoneNamed(base);
  await administrator().attemptsTo(Ensure.that(GeoZonesInThePanel.descriptionOf(geoZone.name), equals(geoZone.description)));
});

Then('la descripción de la zona geográfica {string} es {string}', async (base: string, description: string) => {
  const geoZone = TestData.geoZoneNamed(base);
  await administrator().attemptsTo(Ensure.that(GeoZonesInThePanel.descriptionOf(geoZone.name), equals(description)));
});

Then('la zona geográfica {string} ya no aparece', async (base: string) => {
  const geoZone = TestData.geoZoneNamed(base);
  await administrator().attemptsTo(Ensure.that(GeoZonesInThePanel.exists(geoZone.name), equals(true)));
});

Then('la tasa de impuesto {string} aparece en la zona {string}', async (base: string, geoZoneBase: string) => {
  const taxRate = TestData.taxRateNamed(base);
  const geoZone = TestData.geoZoneNamed(geoZoneBase);
  await administrator().attemptsTo(Ensure.that(TaxRatesInThePanel.geoZoneOf(taxRate.name), equals(geoZone.name)));
});

Then('la clase de impuesto {string} aparece en la lista', async (base: string) => {
  const taxClass = TestData.taxClassNamed(base);
  await administrator().attemptsTo(Ensure.that(TaxClassesInThePanel.exists(taxClass.title), equals(true)));
});

Then('la clase de impuesto {string} tiene la regla de esa tasa sobre {string} con prioridad {int}', async (base: string, based: string, priority: number) => {
  const taxClass = TestData.taxClassNamed(base);
  const taxRate = TestData.existingTaxRate();

  await administrator().attemptsTo(
    Ensure.that(TaxClassInThePanel.rules(taxClass), equals([{ taxRate: taxRate.name, based, priority: String(priority) }])),
  );
});
