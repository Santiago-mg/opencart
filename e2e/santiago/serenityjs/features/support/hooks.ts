import { After, Before } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';

import { CleanUp, StartAdminSession } from '../../test/tasks/admin/AdminPanel';
import { Database } from '../../test/support/database';
import { Logs } from '../../test/support/logs';
import { TestData } from '../../test/support/testData';

// Cada escenario empieza con sus propios datos (otro cupón, otro autor de reseñas).
Before(() => TestData.reset());

// RF-16 usa un archivo de registro propio: se crea vacío al empezar y se borra
// al terminar, pase o falle.
Before({ tags: '@rf-16' }, async () => {
  await Logs.create();
});

// Lo que creó el escenario se borra al terminar, pase o falle, para no dejar
// cupones, reseñas, devoluciones, pedidos, idiomas, monedas ni impuestos de
// prueba en la tienda.
After(async () => {
  const orders = TestData.ordersToRemove();
  const languages = TestData.languagesToRemove();
  const currencies = TestData.currenciesToRemove();
  const geoZones = TestData.geoZonesToRemove();
  const taxRates = TestData.taxRatesToRemove();
  const taxClasses = TestData.taxClassesToRemove();

  try {
    await actorCalled('Ana').attemptsTo(
      StartAdminSession.asAdministrator(),
      CleanUp.coupons(TestData.couponsToRemove()),
      CleanUp.reviewsSignedWith('QA'),
      CleanUp.returnsOf(TestData.customersToRemove()),
      CleanUp.languages(languages),
      CleanUp.currencies(currencies),
    );
  } finally {
    // El panel de esta versión no puede borrar zonas geográficas, así que la
    // limpieza de impuestos se hace directamente en la base.
    await Database.removeTaxClasses(taxClasses);
    await Database.removeTaxRates(taxRates);
    await Database.removeGeoZones(geoZones);
    await Database.removeOrders(orders);
    await Logs.remove();
  }
});
