import type { Actor, Task } from '../../screenplay/actor'
import { BROWSER, asForm, environment, panelAt } from '../../screenplay/environment'
import { productId, type Coupon, type WrittenReview } from '../../screenplay/testData'

/**
 * El panel de administración, usado por HTTP (cy.request) para PREPARAR datos
 * y revisar el resultado, sin pasar por sus pantallas. Es lo mismo que hacen
 * las pruebas de Serenity/JS con la habilidad CallAnApi.
 *
 * OpenCart no tiene una API REST para el panel: sus pantallas envían
 * formularios. Por eso aquí se envían esos mismos formularios. La cookie de la
 * sesión la guarda Cypress solo; el user_token que el panel exige en cada
 * dirección se anota en la libreta del actor.
 */

type Fields = Record<string, string | number | Array<string | number>>

/** Envía una petición al panel con el token que el actor anotó al iniciar sesión. */
const callThePanel = (actor: Actor, route: string, options: { parameters?: Record<string, string | number>; fields?: Fields } = {}) =>
  cy.wrap(null, { log: false }).then(() =>
    cy.request({
      method: options.fields ? 'POST' : 'GET',
      url: panelAt(route, actor.notes.get<string>('userToken'), options.parameters),
      headers: { 'User-Agent': BROWSER, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: options.fields ? asForm(options.fields) : undefined,
      failOnStatusCode: false,
    }),
  )

/** Los identificadores (casillas selected[]) de las filas de una lista del panel. */
const idsInTheList = (html: string): number[] =>
  [...html.matchAll(/name="selected\[\]" value="(\d+)"/g)].map((match) => Number(match[1]))

/** Inicia sesión en el panel y anota el user_token. */
export const StartAdminSession = {
  asAdministrator: (): Task => (actor) => {
    // Con log: false la contraseña no queda escrita en el reporte.
    cy.request({ url: '/admin/index.php?route=common/login', headers: { 'User-Agent': BROWSER }, log: false })
      .then((loginPage) => {
        const loginToken = String(loginPage.body).match(/login_token=([a-f0-9]+)/)?.[1] ?? ''
        return cy.request({
          method: 'POST',
          url: `/admin/index.php?route=common/login.login&login_token=${loginToken}`,
          headers: { 'User-Agent': BROWSER, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: asForm({ username: environment.admin.username, password: environment.admin.password }),
          log: false,
        })
      })
      .then((answer) => {
        const userToken = String(answer.body?.redirect ?? '').match(/user_token=([a-f0-9]+)/)?.[1]
        expect(userToken, 'user_token del panel (¿usuario y contraseña del panel?)').to.be.a('string')
        actor.notes.set('userToken', userToken)
      })
  },
}

/** RF-08: Marketing > Coupons > Add New. */
export const PublishCoupon = {
  called:
    (coupon: Coupon): Task =>
    (actor) => {
      StartAdminSession.asAdministrator()(actor)
      callThePanel(actor, 'marketing/coupon.save', {
        fields: {
          coupon_id: 0,
          name: `Cupón de prueba ${coupon.code}`,
          code: coupon.code,
          type: coupon.type,
          discount: coupon.discount,
          total: coupon.total,
          logged: 0,
          shipping: 0,
          date_start: coupon.dateStart,
          date_end: coupon.dateEnd,
          uses_total: 0,
          uses_customer: 0,
          status: 1,
        },
      }).then((answer) => {
        expect(answer.body, 'respuesta del panel al guardar el cupón').to.have.property('coupon_id')
        coupon.id = Number(answer.body.coupon_id)
      })
    },
}

/** RF-09: Catalog > Reviews > editar la reseña y marcarla como habilitada. */
export const ApproveReview = {
  of:
    (review: WrittenReview): Task =>
    (actor) => {
      StartAdminSession.asAdministrator()(actor)
      callThePanel(actor, 'catalog/review.list', { parameters: { filter_author: review.author } }).then((list) => {
        const [reviewId] = idsInTheList(String(list.body))
        expect(reviewId, `reseña de "${review.author}" en el panel`).to.be.a('number')
        callThePanel(actor, 'catalog/review.save', {
          fields: {
            review_id: reviewId,
            author: review.author,
            product_id: productId(review.product),
            text: review.text,
            rating: review.rating,
            date_added: new Date().toISOString().slice(0, 10),
            status: 1,
          },
        })
      })
    },
}

/** Limpieza al final de cada prueba: borra lo que la prueba creó (support/hooks.ts). */
export const CleanUp = {
  coupons:
    (coupons: Coupon[]): Task =>
    (actor) => {
      cy.wrap(null, { log: false }).then(() => {
        const ids = coupons.map((coupon) => coupon.id).filter((id): id is number => id !== undefined)
        if (ids.length > 0) callThePanel(actor, 'marketing/coupon.delete', { fields: { 'selected[]': ids } })
      })
    },
  // El panel muestra las reseñas de a 10: se borra página por página hasta que no quede ninguna.
  reviewsSignedWith:
    (prefix: string): Task =>
    (actor) => {
      const deletePage = (pagesLeft: number): void => {
        callThePanel(actor, 'catalog/review.list', { parameters: { filter_author: prefix } }).then((list) => {
          const ids = idsInTheList(String(list.body))
          if (ids.length === 0 || pagesLeft === 0) return
          callThePanel(actor, 'catalog/review.delete', { fields: { 'selected[]': ids } }).then(() => deletePage(pagesLeft - 1))
        })
      }
      deletePage(20)
    },
  returnsOf:
    (customers: string[]): Task =>
    (actor) => {
      for (const customer of customers) {
        callThePanel(actor, 'sale/returns.list', { parameters: { filter_customer: customer } }).then((list) => {
          const ids = idsInTheList(String(list.body))
          if (ids.length > 0) callThePanel(actor, 'sale/returns.delete', { fields: { 'selected[]': ids } })
        })
      }
    },
}

/**
 * RF-11: lo que la administradora ve en Sales > Returns. Anota en su libreta
 * los estados de las devoluciones del cliente para revisarlos después.
 */
export const LookUpReturns = {
  of:
    (customer: string): Task =>
    (actor) => {
      StartAdminSession.asAdministrator()(actor)
      callThePanel(actor, 'sale/returns.list', { parameters: { filter_customer: customer } }).then((list) => {
        const html = String(list.body)
        const body = html.slice(html.indexOf('<tbody>'))
        // Columnas: casilla | id | pedido | cliente | producto | modelo | estado | fecha | editar
        const statuses = body
          .split(/<tr[\s>]/)
          .slice(1)
          .filter((row) => row.includes('name="selected[]"'))
          .map((row) => [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1].replace(/<[^>]+>/g, '').trim())[6])
        actor.notes.set('returnStatuses', statuses)
      })
    },
}

/** Lo que la administradora anotó al revisar las devoluciones. */
export const returnStatusesNotedBy = (actor: Actor) => {
  const verifier = {
    toEqual(expected: string[]) {
      cy.wrap(null, { log: false }).then(() => {
        expect(actor.notes.get<string[]>('returnStatuses'), 'estados de las devoluciones en el panel').to.deep.equal(expected)
      })
      return verifier
    },
  }
  return verifier
}
