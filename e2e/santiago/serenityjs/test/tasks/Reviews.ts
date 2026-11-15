import { Task, Wait } from '@serenity-js/core';
import { isPresent } from '@serenity-js/assertions';
import { Click, Enter } from '@serenity-js/web';

import { ProductPage } from '../ui/ProductPage';
import { StorePage } from '../ui/StorePage';
import { OpenPage } from './OpenPage';

/** RF-09: el formulario "Write a review" de la pestaña Reviews. */
export const WriteReview = {
  as: (author: string) => ({
    about: (product: string, stars: number, text: string) =>
      Task.where(`#actor escribe una reseña de ${ stars } estrellas sobre ${ product }`,
        OpenReviews.of(product),
        Enter.theValue(author).into(ProductPage.reviewAuthor()),
        Enter.theValue(text).into(ProductPage.reviewText()),
        Click.on(ProductPage.reviewRating(stars)),
        Click.on(ProductPage.reviewSubmit()),
      ),
  }),
};

/** RF-09: abrir la ficha y la pestaña donde están las reseñas publicadas. */
export const OpenReviews = {
  of: (product: string) => Task.where(`#actor abre las reseñas de ${ product }`,
    OpenPage.productDetail(product),
    Click.on(ProductPage.reviewsTab()),
    // La pestaña está abajo en la página: se espera a que el formulario exista.
    Wait.until(ProductPage.reviewSubmit(), isPresent()),
  ),
};

/** Espera a que la tienda responda el envío de la reseña (aviso arriba o error en un campo). */
export const WaitForTheReviewAnswer = () => Task.where('#actor espera la respuesta de la tienda',
  Wait.until(StorePage.alerts().first(), isPresent()),
);
