import '../support/hooks'
import { describeDefects } from '../support/defects'
import { theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { A_GOOD_REVIEW, TestData } from '../support/screenplay/testData'
import { GetReviewToken, SendReviewViaApi, WriteReviewViaApi } from '../support/tasks/api/ReviewsApi'

/** La acción product/review.write, la que llama el botón "Continue" del formulario de reseñas. */
describe('Reseñas de productos (RF-09) — API', () => {
  it('Una reseña completa responde { success }', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(WriteReviewViaApi.about('iPhone', { author: TestData.reviewAuthor('Carlos'), text: A_GOOD_REVIEW, rating: 5 }))

    theResponseTo(carlos)
      .hasStatus(200)
      .isJson()
      .isExactly({ success: 'Thank you for your review. It has been submitted to the webmaster for approval.' })
  })

  it('Los errores de validación vienen por campo', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(WriteReviewViaApi.about('iPhone', { author: 'ab', text: 'corto', rating: 9 }))

    theResponseTo(carlos).isExactly({
      error: {
        author: 'Review Name must be between 3 and 25 characters!',
        text: 'Review Text must be between 25 and 1000 characters!',
        rating: 'Please select a review rating!',
      },
    })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-09-02] El mismo token no sirve para enviar una segunda reseña', () => {
      const carlos = actorCalled('Carlos')
      const review = { author: TestData.reviewAuthor('Carlos'), text: A_GOOD_REVIEW, rating: 5 }
      carlos.attemptsTo(GetReviewToken.of('iPhone'), SendReviewViaApi.about('iPhone', review))

      carlos.attemptsTo(SendReviewViaApi.about('iPhone', review))

      // Hoy se pueden mandar cuantas reseñas se quiera con un solo token (spam).
      theResponseTo(carlos).satisfies('segunda reseña con el mismo token', (body) => {
        expect(body).to.not.have.property('success')
      })
    })
  })
})
