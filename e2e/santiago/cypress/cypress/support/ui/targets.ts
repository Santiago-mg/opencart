/**
 * Dónde está cada cosa en la pantalla (la capa "UI" del patrón Screenplay).
 *
 * Los selectores de OpenCart 4.1.0.3 (`#input-search`, la fila del carrito que
 * tiene tal producto...) solo aparecen aquí. Si mañana cambia la pantalla, se
 * arregla en este archivo y las pruebas siguen igual.
 */

export const norm = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()

type ElementFilter = (index: number, element: HTMLElement) => boolean

/** Filtro de jQuery: elementos cuyo texto, tal como está escrito, es exactamente `text`. */
export const hasText = (text: string): ElementFilter => (_i, element) => norm(element.textContent) === text

/** Filtro: elementos cuyo texto empieza por `prefix`. */
export const startsWithText = (prefix: string): ElementFilter => (_i, element) =>
  norm(element.textContent).startsWith(prefix)

/** Filtro: elementos que tienen adentro algún `selector` cuyo texto es exactamente `text`. */
export const hasDescendantText = (selector: string, text: string): ElementFilter => (_i, element) =>
  Array.from(element.querySelectorAll(selector)).some((inner) => norm(inner.textContent) === text)

/** Lo que se repite en todas las páginas de la tienda. */
export const Store = {
  // Los avisos que la tienda agrega arriba de la página después de una acción
  // (el más nuevo queda de primero).
  alerts: '#alert .alert',
  heading: '#content h1',
  paragraphs: '#content p',
}

/** index.php?route=product/search — RF-06 */
export const Search = {
  searchBox: '#input-search',
  searchButton: '#button-search',
  searchInDescriptions: '#input-description',
  category: '#input-category',
  includeSubcategories: '#input-sub-category',
  sortBy: '#input-sort',
  productNames: '.product-thumb h4 a',
}

/** index.php?route=product/product&product_id=… — RF-07, RF-09 y RF-10 */
export const Product = {
  quantity: '#input-quantity',
  addToCart: '#button-cart',
  // La ficha tiene dos botones de comparar; el grande es el del producto.
  compare: "button.btn-lg[formaction*='product/compare.add']",

  // Pestaña "Reviews" y formulario "Write a review"
  reviewsTab: "a[href='#tab-review']",
  reviewAuthor: '#input-author',
  reviewText: '#input-text',
  reviewRating: (stars: number) => `#form-review input[name='rating'][value='${stars}']`,
  reviewSubmit: '#button-review',
  reviewError: (field: string) => `#error-${field}`,

  // Cada reseña publicada es una tabla con el autor en negrita y las estrellas llenas.
  publishedReviews: '#review table',
  reviewAuthorName: 'strong',
  fullStars: 'i.fa-solid.fa-star',
}

/** index.php?route=checkout/cart — RF-07 y RF-08 */
export const Cart = {
  rows: '#shopping-cart table tbody tr',
  // La línea de un producto se reconoce por el nombre del producto (columna 2).
  rowOf: (product: string): ElementFilter => hasDescendantText('td:nth-child(2) > a', product),
  inRow: {
    quantity: "input[name='quantity']",
    update: "button[formaction*='checkout/cart.edit']",
    remove: 'a.btn-danger',
    // Columnas: imagen | producto | cantidad | precio unitario | total
    lineTotal: 'td:nth-child(5)',
    outOfStockMark: 'span.text-danger',
  },
  totals: '#checkout-total tr',
  totalTitle: 'td:nth-child(1) strong',
  totalValue: 'td:nth-child(2)',

  // Acordeón "Use Coupon Code"
  couponSection: "button[data-bs-target='#collapse-coupon']",
  couponCode: '#input-coupon',
  applyCoupon: "button.btn-primary[form='form-coupon']",
  removeCoupon: "button.btn-danger[form='form-coupon']",
}

/** index.php?route=product/compare — RF-10 */
export const Compare = {
  // Cada fila empieza con el nombre del dato ("Product", "Price"...).
  rows: '#content table tbody tr',
  rowNamed: (name: string): ElementFilter => (_i, row) => norm(row.querySelector('td')?.textContent) === name,
  valueCells: 'td:not(:first-child)',
  productNames: 'td:not(:first-child) strong',
  // El enlace "Remove" de cada columna termina en remove=<id del producto>.
  removeLinkOf: (productId: number) => `a.btn-danger[href$='remove=${productId}']`,
  successMessage: '#product-compare > .alert-success',
}

/** index.php?route=account/returns.add — RF-11 */
export const Returns = {
  orderId: '#input-order-id',
  firstName: '#input-firstname',
  lastName: '#input-lastname',
  email: '#input-email',
  product: '#input-product',
  model: '#input-model',
  reason: (reasonId: number) => `#input-return-reason-${reasonId}`,
  submit: '#form-return button[type=submit]',
  error: (field: string) => `#error-${field}`,
}
