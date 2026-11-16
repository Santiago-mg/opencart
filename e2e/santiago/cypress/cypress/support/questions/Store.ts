import { countOf, textOf, textsOf, type Question } from '../screenplay/question'
import { CartPage, ComparePage, ProductPage, ReturnsPage, SearchPage, StorePage } from '../ui/pages'

/** Mensajes que ve el cliente. */
export const Messages = {
  latestAlert: () => textOf('aviso de la tienda', StorePage.latestAlert),
  paragraphs: () => textsOf('párrafos de la página', StorePage.paragraphs),
  // La dirección de la página en la que quedó el navegador (por ejemplo, tras una redirección).
  currentAddress: (): Question<string> => ({
    description: 'dirección de la página',
    locate: () => cy.get<HTMLElement>('body'),
    read: ($body) => $body[0].ownerDocument.location.href,
  }),
}

/** RF-06: lo que muestra la lista de resultados. */
export const SearchResults = {
  // Se compara con toHaveMembers (en cualquier orden) o con toEqual (en este orden).
  names: () => textsOf('productos encontrados', SearchPage.productNames),
}

/** RF-07 y RF-08: lo que muestra el carrito. */
export const Cart = {
  quantityOf: (product: string): Question<string> => ({
    description: `cantidad de ${product}`,
    locate: () => CartPage.quantityOf(product),
    read: ($input) => String($input.val()),
  }),
  lineTotalOf: (product: string) => textOf(`total de la línea de ${product}`, () => CartPage.lineTotalOf(product)),
  total: (title = 'Total') => textOf(`renglón "${title}"`, () => CartPage.total(title)),
  couponDiscount: () => textOf('descuento del cupón', CartPage.couponDiscount),
  couponRow: () => textOf('renglón del cupón', CartPage.couponRow),
  outOfStockMarkOf: (product: string) => textOf(`marca *** de ${product}`, () => CartPage.outOfStockMarkOf(product)),
}

/** RF-09: las reseñas publicadas en la ficha y los errores del formulario. */
export const PublishedReviews = {
  by: (author: string) => textOf(`reseña de ${author}`, () => ProductPage.reviewBy(author)),
  starsOf: (author: string) => countOf(`estrellas de la reseña de ${author}`, () => ProductPage.fullStarsOfReviewBy(author)),
  fieldError: (field: 'author' | 'text' | 'rating') => textOf(`error del campo ${field}`, () => ProductPage.reviewError(field)),
}

/** RF-10: la tabla de comparación. */
export const Comparison = {
  products: () => textsOf('productos comparados', ComparePage.productNames),
  row: (name: string) => textsOf(`fila "${name}"`, () => ComparePage.row(name)),
  successMessage: () => textOf('aviso de la comparación', ComparePage.successMessage),
}

/** RF-11: los errores del formulario de devoluciones. */
export const ReturnForm = {
  error: (field: string) => textOf(`error del campo ${field}`, () => ReturnsPage.error(field)),
}
