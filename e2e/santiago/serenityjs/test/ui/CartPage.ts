import { By, PageElement, PageElements } from '@serenity-js/web';

const ROWS = "//div[@id='shopping-cart']//table/tbody/tr";
// La línea de un producto se reconoce por el nombre del producto.
const rowOf = (product: string) => `${ ROWS }[td[2]/a[normalize-space()='${ product }']]`;
const totalRow = (title: string) => `//tfoot[@id='checkout-total']/tr[td/strong[normalize-space()='${ title }']]`;

/** index.php?route=checkout/cart — RF-07 y RF-08 */
export const CartPage = {
  rows: () => PageElements.located(By.xpath(ROWS)).describedAs('líneas del carrito'),
  quantityOf: (product: string) => PageElement.located(By.xpath(`${ rowOf(product) }//input[@name='quantity']`)).describedAs(`cantidad de ${ product }`),
  updateButtonOf: (product: string) =>
    PageElement.located(By.xpath(`${ rowOf(product) }//button[contains(@formaction, 'checkout/cart.edit')]`)).describedAs(`botón actualizar de ${ product }`),
  removeButtonOf: (product: string) => PageElement.located(By.xpath(`${ rowOf(product) }//a[contains(@class, 'btn-danger')]`)).describedAs(`botón quitar de ${ product }`),
  lineTotalOf: (product: string) => PageElement.located(By.xpath(`${ rowOf(product) }/td[5]`)).describedAs(`total de la línea de ${ product }`),
  outOfStockMarkOf: (product: string) => PageElement.located(By.xpath(`${ rowOf(product) }//span[contains(@class, 'text-danger')]`)).describedAs(`marca *** de ${ product }`),
  total: (title: string) => PageElement.located(By.xpath(`${ totalRow(title) }/td[2]`)).describedAs(`renglón "${ title }"`),
  couponTotal: () => PageElement.located(By.xpath("//tfoot[@id='checkout-total']/tr[td/strong[starts-with(normalize-space(), 'Coupon (')]]/td[2]"))
    .describedAs('renglón del cupón'),
  totalTitles: () => PageElements.located(By.xpath("//tfoot[@id='checkout-total']/tr/td/strong")).describedAs('renglones de totales'),

  // Acordeón "Use Coupon Code"
  couponSection: () => PageElement.located(By.css("button[data-bs-target='#collapse-coupon']")).describedAs('sección "Use Coupon Code"'),
  couponCode: () => PageElement.located(By.css('#input-coupon')).describedAs('campo del cupón'),
  applyCouponButton: () => PageElement.located(By.css("button.btn-primary[form='form-coupon']")).describedAs('botón Apply Coupon'),
  removeCouponButton: () => PageElement.located(By.css("button.btn-danger[form='form-coupon']")).describedAs('botón Remove del cupón'),
};
