import { Question } from '@serenity-js/core';
import { Page, Text, Value } from '@serenity-js/web';

import { CartPage } from '../ui/CartPage';
import { ComparePage } from '../ui/ComparePage';
import { ProductPage } from '../ui/ProductPage';
import { ReturnsPage } from '../ui/ReturnsPage';
import { SearchPage } from '../ui/SearchPage';
import { StorePage } from '../ui/StorePage';

const trimmed = (texts: string[]) => texts.map((text) => text.replace(/\s+/g, ' ').trim());

/** Mensajes que ve el cliente. */
export const Messages = {
  latestAlert: () => Text.of(StorePage.alerts().first()).trim().describedAs('aviso de la tienda'),
  paragraphs: () => Question.about('párrafos de la página', async (actor) => trimmed(await actor.answer(Text.ofAll(StorePage.contentParagraphs())))),
  currentAddress: () => Page.current().url().href,
};

/** RF-06: lo que muestra la lista de resultados. */
export const SearchResults = {
  inOrder: () => Question.about('productos encontrados, en orden', async (actor) => trimmed(await actor.answer(Text.ofAll(SearchPage.productNames())))),
  inAnyOrder: () => Question.about('productos encontrados', async (actor) => trimmed(await actor.answer(Text.ofAll(SearchPage.productNames()))).sort()),
};

/** RF-07 y RF-08: lo que muestra el carrito. */
export const Cart = {
  quantityOf: (product: string) => Value.of(CartPage.quantityOf(product)).describedAs(`cantidad de ${ product }`),
  lineTotalOf: (product: string) => Text.of(CartPage.lineTotalOf(product)).trim().describedAs(`total de la línea de ${ product }`),
  total: (title = 'Total') => Text.of(CartPage.total(title)).trim().describedAs(`renglón "${ title }"`),
  couponDiscount: () => Text.of(CartPage.couponTotal()).trim().describedAs('descuento del cupón'),
  totalTitles: () => Question.about('renglones de totales', async (actor) => trimmed(await actor.answer(Text.ofAll(CartPage.totalTitles())))),
  outOfStockMarkOf: (product: string) => CartPage.outOfStockMarkOf(product),
};

/** RF-09: las reseñas publicadas en la ficha. */
export const PublishedReviews = {
  authors: () => Question.about('autores de las reseñas publicadas', async (actor) => trimmed(await actor.answer(Text.ofAll(ProductPage.publishedReviewAuthors())))),
  starsOf: (author: string) => ProductPage.starsOfReviewBy(author).count().describedAs(`estrellas de la reseña de ${ author }`),
  fieldError: (field: 'author' | 'text' | 'rating') => Text.of(ProductPage.reviewError(field)).trim().describedAs(`error del campo ${ field }`),
};

/** RF-10: la tabla de comparación. */
export const Comparison = {
  products: () => Question.about('productos comparados', async (actor) => trimmed(await actor.answer(Text.ofAll(ComparePage.productNames())))),
  row: (name: string) => Question.about(`fila "${ name }"`, async (actor) => trimmed(await actor.answer(Text.ofAll(ComparePage.row(name))))),
  successMessage: () => Text.of(ComparePage.successMessage()).trim().describedAs('aviso de la comparación'),
};

/** RF-11: los errores del formulario de devoluciones. */
export const ReturnForm = {
  error: (field: string) => Text.of(ReturnsPage.error(field)).trim().describedAs(`error del campo ${ field }`),
};
