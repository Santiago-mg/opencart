import '../support/hooks'
import { Messages, PublishedReviews } from '../support/questions/Store'
import { actorCalled, type Actor } from '../support/screenplay/actor'
import { A_GOOD_REVIEW, TestData } from '../support/screenplay/testData'
import { ApproveReview } from '../support/tasks/admin/AdminPanel'
import { OpenReviews, WriteReview } from '../support/tasks/Reviews'

const REVIEW_RECEIVED = 'Thank you for your review. It has been submitted to the webmaster for approval.'

/** Escribe la reseña firmada con el autor de prueba del actor y la anota para encontrarla después. */
const writeReview = (actor: Actor, stars: number, product: string, text = A_GOOD_REVIEW) => {
  const author = TestData.reviewAuthor(actor.name)
  TestData.rememberReview(actor.name, { author, product, text, rating: stars })
  actor.attemptsTo(WriteReview.as(author).about(product, stars, text))
}

/**
 * Como cliente de la tienda
 * quiero escribir reseñas de los productos y leer las de otros clientes
 * para compartir mi experiencia y decidir mejor qué comprar.
 */
describe('Reseñas de productos (RF-09) — web', () => {
  it('[smoke] Escribir una reseña', () => {
    const carlos = actorCalled('Carlos')

    writeReview(carlos, 5, 'iPhone')

    carlos.sees(Messages.latestAlert()).toEqual(REVIEW_RECEIVED)
  })

  it('Una reseña nueva no se ve hasta que la administradora la aprueba', () => {
    const carlos = actorCalled('Carlos')
    const bruno = actorCalled('Bruno')
    writeReview(carlos, 5, 'iMac')
    carlos.sees(Messages.latestAlert()).toEqual(REVIEW_RECEIVED)

    bruno.attemptsTo(OpenReviews.of('iMac'))

    bruno.sees(PublishedReviews.by(TestData.reviewWrittenBy('Carlos').author)).toBeAbsent()
  })

  it('Cuando la administradora la aprueba, todos la ven con sus estrellas', () => {
    const carlos = actorCalled('Carlos')
    const bruno = actorCalled('Bruno')
    writeReview(carlos, 4, 'HTC Touch HD')
    carlos.sees(Messages.latestAlert()).toEqual(REVIEW_RECEIVED)
    actorCalled('Ana').attemptsTo(ApproveReview.of(TestData.reviewWrittenBy('Carlos')))

    bruno.attemptsTo(OpenReviews.of('HTC Touch HD'))

    bruno.sees(PublishedReviews.starsOf(TestData.reviewWrittenBy('Carlos').author)).toEqual(4)
  })

  it('Un texto demasiado corto no se acepta', () => {
    const carlos = actorCalled('Carlos')

    writeReview(carlos, 5, 'iPhone', 'Muy bueno')

    carlos.sees(PublishedReviews.fieldError('text')).toEqual('Review Text must be between 25 and 1000 characters!')
  })
})
