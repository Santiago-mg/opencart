import type { Task } from '../../screenplay/actor'
import { productId } from '../../screenplay/testData'
import { send } from './StoreRequest'

export interface ReviewFields {
  author: string
  text: string
  rating: number
}

/**
 * RF-09: la ficha le da al formulario de reseñas un token (review_token) que
 * hay que devolver al enviarla. El actor abre la ficha y lo anota.
 */
export const GetReviewToken = {
  of: (product: string): Task => (actor) => {
    send(actor, 'product/product', { parameters: { product_id: productId(product) } })
    cy.wrap(null, { log: false }).then(() => {
      const html = String(actor.notes.get<{ body: unknown }>('lastResponse').body)
      actor.notes.set('reviewToken', html.match(/review_token=([a-f0-9]+)/)?.[1] ?? '')
    })
  },
}

/** RF-09: envía la reseña con el último token que anotó el actor. */
export const SendReviewViaApi = {
  about:
    (product: string, review: ReviewFields): Task =>
    (actor) => {
      send(actor, 'product/review.write', {
        parameters: () => ({ product_id: productId(product), review_token: actor.notes.get<string>('reviewToken') }),
        fields: { author: review.author, text: review.text, rating: review.rating },
      })
    },
}

/** Abre la ficha y envía la reseña en la misma visita, como haría una persona. */
export const WriteReviewViaApi = {
  about:
    (product: string, review: ReviewFields): Task =>
    (actor) => {
      actor.attemptsTo(GetReviewToken.of(product), SendReviewViaApi.about(product, review))
    },
}
