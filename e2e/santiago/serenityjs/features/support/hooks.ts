import { After, Before } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';

import { CleanUp, StartAdminSession } from '../../test/tasks/admin/AdminPanel';
import { Database } from '../../test/support/database';
import { Logs } from '../../test/support/logs';
import { TestData } from '../../test/support/testData';

// Cada escenario empieza con sus propios datos (otro cupón, otro autor de reseñas).
Before(() => TestData.reset());

// RF-05 trabaja sobre el registro de errores de la tienda: se guarda una copia
// y se deja vacío al empezar; al terminar se devuelve como estaba.
Before({ tags: '@rf-05' }, async () => {
  await Logs.create();
});

// Lo que creó el escenario se borra al terminar, pase o falle, para no dejar
// cupones, reseñas, devoluciones, pedidos, idiomas, monedas, zonas ni clases de
// impuesto de prueba en la tienda.
After(async () => {
  const orders = TestData.ordersToRemove();
  const languages = TestData.languagesToRemove();

  try {
    await actorCalled('Ana').attemptsTo(
      StartAdminSession.asAdministrator(),
      CleanUp.coupons(TestData.couponsToRemove()),
      CleanUp.reviewsSignedWith('QA'),
      CleanUp.returnsOf(TestData.customersToRemove()),
      CleanUp.languages(languages),
      CleanUp.currencies(TestData.currenciesToRemove()),
      CleanUp.taxClasses(TestData.taxClassesToRemove()),
      CleanUp.geoZones(TestData.geoZonesToRemove()),
    );
  } finally {
    // Lo que el panel no puede borrar se borra en la base: los pedidos de RF-01
    // (no tienen pantalla) y lo que OpenCart deja al borrar un idioma.
    await Database.removeOrders(orders);
    await Database.removeLanguageLeftovers(languages);
    await Logs.restore();
  }
});
