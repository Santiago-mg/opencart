import { actorCalled, resetCast } from './screenplay/actor'
import { TestData } from './screenplay/testData'
import { CleanUp, StartAdminSession } from './tasks/admin/AdminPanel'

/**
 * Lo que se hace antes y después de CADA prueba. Cada archivo de pruebas lo
 * importa en su primera línea (`import '../support/hooks'`).
 *
 * Por qué no vive en `support/e2e.ts`: Cypress empaqueta ese archivo aparte de
 * cada prueba, y cada paquete trae su propia copia de los módulos. Si el
 * reinicio estuviera allá, vaciaría una copia del registro de datos distinta a
 * la que usa la prueba. Aquí, el reinicio y la prueba comparten la misma copia.
 */

// Cada prueba empieza con su propio reparto y sus propios datos (otro cupón,
// otro autor de reseñas). Cypress ya borra las cookies entre pruebas, así que
// cada prueba empieza con un carrito y una comparación vacíos.
beforeEach(() => {
  resetCast()
  TestData.reset()
})

// Lo que creó la prueba se borra al terminar, pase o falle, para no dejar
// cupones, reseñas ni devoluciones de prueba en la tienda.
afterEach(() => {
  const coupons = TestData.couponsToRemove()
  const customers = TestData.customersToRemove()
  actorCalled('Ana').attemptsTo(
    StartAdminSession.asAdministrator(),
    CleanUp.coupons(coupons),
    CleanUp.reviewsSignedWith('QA'),
    CleanUp.returnsOf(customers),
  )
})
