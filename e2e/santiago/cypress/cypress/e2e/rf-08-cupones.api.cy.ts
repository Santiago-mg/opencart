import '../support/hooks'
import { describeDefects } from '../support/defects'
import { theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { TestData, productId } from '../support/screenplay/testData'
import { PublishCoupon } from '../support/tasks/admin/AdminPanel'
import { AddToCartViaApi, ApplyCouponViaApi, RemoveCouponViaApi } from '../support/tasks/api/CartApi'

/** Las acciones del acordeón "Use Coupon Code". Carlos siempre tiene un iPhone en el carrito. */
describe('Cupones de descuento (RF-08) — API', () => {
  beforeEach(() => {
    actorCalled('Carlos').attemptsTo(AddToCartViaApi.units(1, productId('iPhone')))
  })

  it('Un cupón vigente responde { success }', () => {
    const carlos = actorCalled('Carlos')
    const coupon = TestData.coupon()
    actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))

    carlos.attemptsTo(ApplyCouponViaApi.withCode(coupon.code))

    theResponseTo(carlos).hasStatus(200).isJson().isExactly({ success: 'Success: Your coupon discount has been applied!' })
  })

  it('Un código que no existe responde el aviso de cupón inválido', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(ApplyCouponViaApi.withCode('NOEXISTE123'))

    theResponseTo(carlos)
      .hasStatus(200)
      .isExactly({ error: 'Warning: Coupon is either invalid, expired or reached its usage limit!' })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-08-01] El mensaje al quitar el cupón es una frase, no el nombre interno del texto', () => {
      const carlos = actorCalled('Carlos')
      const coupon = TestData.coupon()
      actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))
      carlos.attemptsTo(ApplyCouponViaApi.withCode(coupon.code))

      carlos.attemptsTo(RemoveCouponViaApi.fromTheCart())

      // Hoy responde { success: "text_remove" }: falta el texto en el archivo de idioma.
      theResponseTo(carlos).satisfies('mensaje al quitar el cupón', (body) => {
        expect(body.success).to.match(/^Success: /)
      })
    })
  })
})
