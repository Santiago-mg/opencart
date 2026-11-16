import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Cart, Messages } from '../support/questions/Store'
import { actorCalled } from '../support/screenplay/actor'
import { TestData, YESTERDAY } from '../support/screenplay/testData'
import { PublishCoupon } from '../support/tasks/admin/AdminPanel'
import { AddToCart, ApplyCoupon, RemoveCoupon } from '../support/tasks/ManageCart'

const REJECTED = 'Warning: Coupon is either invalid, expired or reached its usage limit!'

/**
 * Como cliente de la tienda
 * quiero usar un cupón de descuento en el carrito
 * para pagar menos por mi compra.
 *
 * La administradora (Ana) prepara el cupón por el panel, sin abrir sus
 * pantallas. Carlos siempre tiene un iPhone en el carrito ($123.20).
 */
describe('Cupones de descuento (RF-08) — web', () => {
  beforeEach(() => {
    actorCalled('Carlos').attemptsTo(AddToCart.units(1, 'iPhone'))
  })

  it('[smoke] Aplicar un cupón vigente del 10 %', () => {
    const carlos = actorCalled('Carlos')
    const coupon = TestData.coupon({ type: 'P', discount: 10 })
    actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))

    carlos.attemptsTo(ApplyCoupon.withCode(coupon.code))

    carlos.sees(Messages.latestAlert()).toEqual('Success: Your coupon discount has been applied!')
    carlos.sees(Cart.couponDiscount()).toEqual('$-10.10')
    carlos.sees(Cart.total()).toEqual('$111.08')
  })

  it('Un cupón de monto fijo descuenta exactamente ese valor', () => {
    const carlos = actorCalled('Carlos')
    const coupon = TestData.coupon({ type: 'F', discount: 10 })
    actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))

    carlos.attemptsTo(ApplyCoupon.withCode(coupon.code))

    carlos.sees(Cart.couponDiscount()).toEqual('$-10.00')
    carlos.sees(Cart.total()).toEqual('$111.20')
  })

  const rejected = [
    { reason: 'vencido', changes: { dateStart: '2020-01-01', dateEnd: YESTERDAY } },
    { reason: 'con compra mínima de $500', changes: { total: 500 } },
  ]

  rejected.forEach(({ reason, changes }) => {
    it(`Un cupón ${reason} se rechaza y el total no cambia`, () => {
      const carlos = actorCalled('Carlos')
      const coupon = TestData.coupon(changes)
      actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))

      carlos.attemptsTo(ApplyCoupon.withCode(coupon.code))

      carlos.sees(Messages.latestAlert()).toEqual(REJECTED)
      carlos.sees(Cart.total()).toEqual('$123.20')
    })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-08-05] Quitar el cupón devuelve el total original', () => {
      const carlos = actorCalled('Carlos')
      const coupon = TestData.coupon({ type: 'P', discount: 10 })
      actorCalled('Ana').attemptsTo(PublishCoupon.called(coupon))
      carlos.attemptsTo(ApplyCoupon.withCode(coupon.code))

      carlos.attemptsTo(RemoveCoupon.fromTheCart())

      // Hoy el botón "Remove" no hace nada: el carrito lo intercepta como si fuera quitar un producto.
      carlos.sees(Cart.couponRow()).toBeAbsent()
      carlos.sees(Cart.total()).toEqual('$123.20')
    })
  })
})
