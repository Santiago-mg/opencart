import { Check, Task, Wait } from '@serenity-js/core';
import { isPresent, not } from '@serenity-js/assertions';
import { Clear, Click, Enter, isVisible } from '@serenity-js/web';

import { CartPage } from '../ui/CartPage';
import { ProductPage } from '../ui/ProductPage';
import { StorePage } from '../ui/StorePage';
import { OpenPage } from './OpenPage';

// Después de cada acción, la tienda agrega un aviso arriba de la página. Se
// espera a que exista y no a que "se vea": isVisible() de Serenity/JS también
// exige que el elemento esté dentro de la ventana, y tras hacer clic abajo en
// la página el aviso queda fuera de ella.
const waitForTheAlert = () => Wait.until(StorePage.alerts().first(), isPresent());

// El acordeón "Use Coupon Code" se abre y se cierra con el mismo botón: solo se
// pulsa si el campo del cupón todavía no está a la vista.
const openTheCouponSection = () =>
  Check.whether(CartPage.couponCode(), not(isVisible()))
    .andIfSo(Click.on(CartPage.couponSection()));

/** RF-07: desde la ficha del producto, elegir la cantidad y pulsar "Add to Cart". */
export const AddToCart = {
  units: (quantity: number, product: string) => Task.where(`#actor agrega ${ quantity } × ${ product } al carrito`,
    OpenPage.productDetail(product),
    Clear.theValueOf(ProductPage.quantity()),
    Enter.theValue(String(quantity)).into(ProductPage.quantity()),
    Click.on(ProductPage.addToCartButton()),
    waitForTheAlert(),
  ),
};

/** RF-07: en la página del carrito, escribir la cantidad nueva y pulsar el botón de actualizar. */
export const ChangeQuantity = {
  of: (product: string) => ({
    to: (quantity: number) => Task.where(`#actor cambia la cantidad de ${ product } a ${ quantity }`,
      OpenPage.cart(),
      Clear.theValueOf(CartPage.quantityOf(product)),
      Enter.theValue(String(quantity)).into(CartPage.quantityOf(product)),
      Click.on(CartPage.updateButtonOf(product)),
      waitForTheAlert(),
    ),
  }),
};

/** RF-07: el botón rojo de la línea. */
export const RemoveFromCart = {
  product: (product: string) => Task.where(`#actor quita ${ product } del carrito`,
    OpenPage.cart(),
    Click.on(CartPage.removeButtonOf(product)),
    Wait.until(CartPage.lineTotalOf(product), not(isPresent())),
  ),
};

/** RF-08: el acordeón "Use Coupon Code" del carrito. */
export const ApplyCoupon = {
  withCode: (code: string) => Task.where(`#actor aplica el cupón ${ code }`,
    OpenPage.cart(),
    openTheCouponSection(),
    Wait.until(CartPage.couponCode(), isVisible()),
    Clear.theValueOf(CartPage.couponCode()),
    Enter.theValue(code).into(CartPage.couponCode()),
    Click.on(CartPage.applyCouponButton()),
    waitForTheAlert(),
  ),
};

// No espera ningún aviso: lo que cambia (o no) lo revisa el paso Then. Hoy el
// botón no hace nada (DEF-08-05) y esperar el aviso escondería el motivo.
export const RemoveCoupon = {
  fromTheCart: () => Task.where('#actor quita el cupón del carrito',
    OpenPage.cart(),
    openTheCouponSection(),
    Wait.until(CartPage.removeCouponButton(), isVisible()),
    Click.on(CartPage.removeCouponButton()),
  ),
};
