import type { Task } from '../screenplay/actor'
import { ProductPage } from '../ui/pages'
import { OpenPage } from './OpenPage'

/** RF-09: abrir la ficha y la pestaña donde están las reseñas publicadas. */
export const OpenReviews = {
  of: (product: string): Task => (actor) => {
    OpenPage.productDetail(product)(actor)
    ProductPage.reviewsTab().click()
    ProductPage.reviewSubmit().should('be.visible')
  },
}

/** RF-09: el formulario "Write a review" de la pestaña Reviews. */
export const WriteReview = {
  as: (author: string) => ({
    about:
      (product: string, stars: number, text: string): Task =>
      (actor) => {
        OpenReviews.of(product)(actor)
        ProductPage.reviewAuthor().clear().type(author)
        ProductPage.reviewText().clear().type(text)
        ProductPage.reviewRating(stars).check()
        ProductPage.reviewSubmit().click()
      },
  }),
}
