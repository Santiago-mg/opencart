import { Cart, Compare, Product, Returns, Search, Store, hasDescendantText } from './targets'

/**
 * Los elementos de cada pantalla, listos para usar con Cypress. Cada función
 * devuelve una búsqueda (`cy.get(...)`) que Cypress repite sola hasta
 * encontrar el elemento, así que no hace falta escribir esperas.
 */

export const StorePage = {
  alerts: () => cy.get(Store.alerts),
  latestAlert: () => cy.get(Store.alerts).first(),
  mainHeading: () => cy.get(Store.heading),
  paragraphs: () => cy.get(Store.paragraphs),
}

/** RF-06 */
export const SearchPage = {
  searchBox: () => cy.get(Search.searchBox),
  searchButton: () => cy.get(Search.searchButton),
  searchInDescriptions: () => cy.get(Search.searchInDescriptions),
  category: () => cy.get(Search.category),
  includeSubcategories: () => cy.get(Search.includeSubcategories),
  sortBy: () => cy.get(Search.sortBy),
  productNames: () => cy.get(Search.productNames),
}

/** RF-07, RF-09 y RF-10 */
export const ProductPage = {
  quantity: () => cy.get(Product.quantity),
  addToCartButton: () => cy.get(Product.addToCart),
  compareButton: () => cy.get(Product.compare),
  reviewsTab: () => cy.get(Product.reviewsTab),
  reviewAuthor: () => cy.get(Product.reviewAuthor),
  reviewText: () => cy.get(Product.reviewText),
  reviewRating: (stars: number) => cy.get(Product.reviewRating(stars)),
  reviewSubmit: () => cy.get(Product.reviewSubmit),
  reviewError: (field: 'author' | 'text' | 'rating') => cy.get(Product.reviewError(field)),
  publishedReviewAuthors: () => cy.get(`${Product.publishedReviews} ${Product.reviewAuthorName}`),
  reviewBy: (author: string) => cy.get(Product.publishedReviews).filter(hasDescendantText(Product.reviewAuthorName, author)),
  fullStarsOfReviewBy: (author: string) => ProductPage.reviewBy(author).find(Product.fullStars),
}

/** RF-07 y RF-08 */
export const CartPage = {
  rows: () => cy.get(Cart.rows),
  row: (product: string) => cy.get(Cart.rows).filter(Cart.rowOf(product)),
  quantityOf: (product: string) => CartPage.row(product).find(Cart.inRow.quantity),
  updateButtonOf: (product: string) => CartPage.row(product).find(Cart.inRow.update),
  removeButtonOf: (product: string) => CartPage.row(product).find(Cart.inRow.remove),
  lineTotalOf: (product: string) => CartPage.row(product).find(Cart.inRow.lineTotal),
  outOfStockMarkOf: (product: string) => CartPage.row(product).find(Cart.inRow.outOfStockMark),
  totalRow: (title: string) => cy.get(Cart.totals).filter(hasDescendantText(Cart.totalTitle, title)),
  total: (title: string) => CartPage.totalRow(title).find(Cart.totalValue),
  // El renglón del cupón se llama "Coupon (CÓDIGO)".
  couponRow: () => cy.get(Cart.totals).filter((_i, row) => (row.querySelector(Cart.totalTitle)?.textContent ?? '').trim().startsWith('Coupon (')),
  couponDiscount: () => CartPage.couponRow().find(Cart.totalValue),
  couponSection: () => cy.get(Cart.couponSection),
  couponCode: () => cy.get(Cart.couponCode),
  applyCouponButton: () => cy.get(Cart.applyCoupon),
  removeCouponButton: () => cy.get(Cart.removeCoupon),
}

/** RF-10 */
export const ComparePage = {
  productNames: () => cy.get(Compare.rows).filter(Compare.rowNamed('Product')).find(Compare.productNames),
  row: (name: string) => cy.get(Compare.rows).filter(Compare.rowNamed(name)).find(Compare.valueCells),
  removeLinkOf: (productId: number) => cy.get(Compare.removeLinkOf(productId)),
  successMessage: () => cy.get(Compare.successMessage),
}

/** RF-11 */
export const ReturnsPage = {
  orderId: () => cy.get(Returns.orderId),
  firstName: () => cy.get(Returns.firstName),
  lastName: () => cy.get(Returns.lastName),
  email: () => cy.get(Returns.email),
  product: () => cy.get(Returns.product),
  model: () => cy.get(Returns.model),
  reason: (reasonId: number) => cy.get(Returns.reason(reasonId)),
  submit: () => cy.get(Returns.submit),
  error: (field: string) => cy.get(Returns.error(field)),
}
