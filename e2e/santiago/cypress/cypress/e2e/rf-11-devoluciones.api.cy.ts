import '../support/hooks'
import { describeDefects } from '../support/defects'
import { theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { TestData } from '../support/screenplay/testData'
import { RequestReturnViaApi } from '../support/tasks/api/ReturnsApi'

/** La acción account/returns.save, la que llama el botón "Submit" del formulario de devoluciones. */
describe('Devoluciones (RF-11) — API', () => {
  it('Una solicitud completa responde { redirect } a la confirmación', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(RequestReturnViaApi.of(TestData.returnRequest('Carlos')))

    theResponseTo(carlos)
      .hasStatus(200)
      .isJson()
      .satisfies('respuesta', (body) => {
        expect(body).to.have.all.keys('redirect')
        expect(body.redirect).to.include('route=account/returns.success')
      })
  })

  it('Los errores vienen por campo dentro de error', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(RequestReturnViaApi.of(TestData.returnRequest('Carlos'), { order_id: '', email: 'x', return_reason_id: 0 }))

    theResponseTo(carlos).satisfies('errores', (body) => {
      expect(body).to.have.all.keys('error')
      expect(body.error).to.have.all.keys('order_id', 'email', 'reason')
    })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-11-01] Un número de pedido negativo no se acepta', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(RequestReturnViaApi.of(TestData.returnRequest('Carlos', 'iPhone', '-5')))

      // Hoy responde { redirect } a la confirmación y la devolución queda guardada con pedido -5.
      theResponseTo(carlos).satisfies('respuesta', (body) => {
        expect(body).to.have.nested.property('error.order_id')
      })
    })
  })
})
