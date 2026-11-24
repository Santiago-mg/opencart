import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Cart, Messages } from '../support/questions/Store'
import { actorCalled } from '../support/screenplay/actor'
import { AddToCart, ChangeQuantity, RemoveFromCart } from '../support/tasks/ManageCart'
import { OpenPage, TryToOpen } from '../support/tasks/OpenPage'

const EMPTY_CART = 'Your shopping cart is empty!'

/**
 * Como cliente de la tienda
 * quiero agregar, cambiar y quitar productos del carrito
 * para comprar exactamente lo que necesito.
 */
describe('Carrito de compras (RF-07) — web', () => {
  it('[smoke] Agregar un producto desde su ficha', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(AddToCart.units(2, 'iPhone'))

    carlos.sees(Messages.latestAlert()).toEqual('Success: You have added iPhone to your shopping cart!')
    carlos.attemptsTo(OpenPage.cart())
    carlos.sees(Cart.quantityOf('iPhone')).toEqual('2')
    carlos.sees(Cart.total()).toEqual('$246.40')
  })

  it('Cambiar la cantidad recalcula el total', () => {
    const carlos = actorCalled('Carlos')
    carlos.attemptsTo(AddToCart.units(1, 'iPhone'))

    carlos.attemptsTo(ChangeQuantity.of('iPhone').to(3))

    carlos.sees(Messages.latestAlert()).toEqual('Success: You have modified your shopping cart!')
    carlos.sees(Cart.total()).toEqual('$369.60')
  })

  it('Quitar el único producto deja el carrito vacío', () => {
    const carlos = actorCalled('Carlos')
    carlos.attemptsTo(AddToCart.units(1, 'iPhone'))

    carlos.attemptsTo(RemoveFromCart.product('iPhone'))

    carlos.sees(Messages.paragraphs()).toInclude(EMPTY_CART)
  })

  it('Con un producto agotado no se puede pasar a pagar', () => {
    const carlos = actorCalled('Carlos')
    carlos.attemptsTo(AddToCart.units(1, 'Samsung Galaxy Tab 10.1'))

    carlos.attemptsTo(TryToOpen.checkout())

    carlos.sees(Messages.currentAddress()).toInclude('route=checkout/cart')
    carlos.sees(Cart.outOfStockMarkOf('Samsung Galaxy Tab 10.1')).toEqual('***')
  })

  it('El carrito de un cliente no se mezcla con el de otro', () => {
    const carlos = actorCalled('Carlos')
    const bruno = actorCalled('Bruno')
    carlos.attemptsTo(AddToCart.units(1, 'iPhone'))

    bruno.attemptsTo(OpenPage.cart())

    bruno.sees(Messages.paragraphs()).toInclude(EMPTY_CART)
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-07-03] El total de una línea es el precio por la cantidad', () => {
      const carlos = actorCalled('Carlos')
      carlos.attemptsTo(AddToCart.units(3, 'iPhone'))

      carlos.attemptsTo(OpenPage.cart())

      // 3 × $123.20 = $369.60; hoy la línea muestra $365.60 (la ecotasa se suma una sola vez).
      carlos.sees(Cart.lineTotalOf('iPhone')).toEqual('$369.60')
    })
  })
})
