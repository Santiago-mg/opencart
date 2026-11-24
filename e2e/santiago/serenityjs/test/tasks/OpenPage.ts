import { Task, Wait } from '@serenity-js/core';
import { isPresent } from '@serenity-js/assertions';
import { isVisible, Navigate } from '@serenity-js/web';

import { pageAt } from '../support/environment';
import { productId } from '../support/testData';
import { ProductPage } from '../ui/ProductPage';
import { ReturnsPage } from '../ui/ReturnsPage';
import { SearchPage } from '../ui/SearchPage';
import { StorePage } from '../ui/StorePage';

/** Abre una página de la tienda y espera a que termine de cargar lo importante. */
export const OpenPage = {
  search: () => Task.where('#actor abre la búsqueda de productos',
    Navigate.to(pageAt('product/search')),
    Wait.until(SearchPage.searchBox(), isVisible()),
  ),
  productDetail: (product: string) => Task.where(`#actor abre la ficha de ${ product }`,
    Navigate.to(pageAt('product/product', { product_id: productId(product) })),
    Wait.until(ProductPage.addToCartButton(), isVisible()),
  ),
  cart: () => Task.where('#actor abre el carrito',
    Navigate.to(pageAt('checkout/cart')),
    Wait.until(StorePage.mainHeading(), isPresent()),
  ),
  comparison: () => Task.where('#actor abre la comparación de productos',
    Navigate.to(pageAt('product/compare')),
    Wait.until(StorePage.mainHeading(), isPresent()),
  ),
  returnForm: () => Task.where('#actor abre el formulario de devoluciones',
    Navigate.to(pageAt('account/returns.add')),
    Wait.until(ReturnsPage.orderId(), isVisible()),
  ),
};

/** Solo navega: sirve cuando se espera que la tienda no deje entrar y mande a otra página. */
export const TryToOpen = {
  checkout: () => Task.where('#actor intenta pasar a pagar',
    Navigate.to(pageAt('checkout/checkout')),
  ),
};
