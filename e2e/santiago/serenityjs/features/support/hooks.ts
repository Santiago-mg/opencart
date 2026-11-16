import { After, Before } from '@cucumber/cucumber';
import { actorCalled } from '@serenity-js/core';

import { CleanUp, StartAdminSession } from '../../test/tasks/admin/AdminPanel';
import { TestData } from '../../test/support/testData';

// Cada escenario empieza con sus propios datos (otro cupón, otro autor de reseñas).
Before(() => TestData.reset());

// Lo que creó el escenario se borra al terminar, pase o falle, para no dejar
// cupones, reseñas ni devoluciones de prueba en la tienda.
After(async () => {
  await actorCalled('Ana').attemptsTo(
    StartAdminSession.asAdministrator(),
    CleanUp.coupons(TestData.couponsToRemove()),
    CleanUp.reviewsSignedWith('QA'),
    CleanUp.returnsOf(TestData.customersToRemove()),
  );
});
