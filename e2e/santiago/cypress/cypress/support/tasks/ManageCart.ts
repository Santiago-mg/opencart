import type { Task } from '../screenplay/actor'
import { CartPage, ProductPage, StorePage } from '../ui/pages'
import { OpenPage } from './OpenPage'

// Después de cada acción, la tienda agrega un aviso arriba de la página.
const waitForTheAlert = () => StorePage.latestAlert().should('exist')

// El acordeón "Use Coupon Code" se abre y se cierra con el mismo botón: solo
// se pulsa si el campo del cupón todavía no está a la vista.
const openTheCouponSection = () =>
  CartPage.couponCode().then(($code) => {
    if (!$code.is(':visible')) CartPage.couponSection().click()
  })

/** RF-07: desde la ficha del producto, elegir la cantidad y pulsar "Add to Cart". */
export const AddToCart = {
  units: (quantity: number, product: string): Task => (actor) => {
    OpenPage.productDetail(product)(actor)
    ProductPage.quantity().clear().type(String(quantity))
    ProductPage.addToCartButton().click()
    waitForTheAlert()
  },
}

/** RF-07: en la página del carrito, escribir la cantidad nueva y pulsar el botón de actualizar. */
export const ChangeQuantity = {
  of: (product: string) => ({
    to:
      (quantity: number): Task =>
      (actor) => {
        OpenPage.cart()(actor)
        CartPage.quantityOf(product).clear().type(String(quantity))
        CartPage.updateButtonOf(product).click()
        waitForTheAlert()
      },
  }),
}

/** RF-07: el botón rojo de la línea. */
export const RemoveFromCart = {
  product: (product: string): Task => (actor) => {
    OpenPage.cart()(actor)
    CartPage.removeButtonOf(product).click()
    CartPage.lineTotalOf(product).should('not.exist')
  },
}

/** RF-08: el acordeón "Use Coupon Code" del carrito. */
export const ApplyCoupon = {
  withCode: (code: string): Task => (actor) => {
    OpenPage.cart()(actor)
    openTheCouponSection()
    CartPage.couponCode().should('be.visible').clear().type(code)
    CartPage.applyCouponButton().click()
    waitForTheAlert()
  },
}

// No espera ningún aviso: lo que cambia (o no) lo revisa la prueba. Hoy el
// botón no hace nada (DEF-08-05) y esperar el aviso escondería el motivo.
export const RemoveCoupon = {
  fromTheCart: (): Task => (actor) => {
    OpenPage.cart()(actor)
    openTheCouponSection()
    CartPage.removeCouponButton().should('be.visible').click()
  },
}
