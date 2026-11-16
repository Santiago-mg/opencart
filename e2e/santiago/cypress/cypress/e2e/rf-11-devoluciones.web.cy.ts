import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Messages, ReturnForm } from '../support/questions/Store'
import { actorCalled } from '../support/screenplay/actor'
import { TestData } from '../support/screenplay/testData'
import { LookUpReturns, returnStatusesNotedBy } from '../support/tasks/admin/AdminPanel'
import { RequestReturn, SubmitTheReturnForm } from '../support/tasks/Returns'

const RETURN_RECEIVED =
  'Thank you for submitting your return request. Your request has been sent to the relevant department for processing.'

/**
 * Como cliente de la tienda
 * quiero solicitar la devolución de un producto
 * para que la tienda me lo cambie o me devuelva el dinero.
 */
describe('Devoluciones (RF-11) — web', () => {
  it('[smoke] Solicitar la devolución de un producto', () => {
    const carlos = actorCalled('Carlos')
    const ana = actorCalled('Ana')
    const request = TestData.returnRequest('Carlos', 'iPhone', '1234')

    carlos.attemptsTo(RequestReturn.of(request))

    carlos.sees(Messages.paragraphs()).toInclude(RETURN_RECEIVED)
    ana.attemptsTo(LookUpReturns.of(`${request.firstName} ${request.lastName}`))
    returnStatusesNotedBy(ana).toEqual(['Awaiting Products'])
  })

  it('El formulario vacío avisa de los campos obligatorios', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SubmitTheReturnForm.empty())

    carlos.sees(ReturnForm.error('order-id')).toEqual('Order ID required!')
    carlos.sees(ReturnForm.error('reason')).toEqual('You must select a return product reason!')
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-11-01] Un número de pedido negativo no se acepta', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(RequestReturn.of(TestData.returnRequest('Carlos', 'iPhone', '-5')))

      // Hoy la tienda la acepta y muestra el mensaje de "gracias".
      carlos.sees(ReturnForm.error('order-id')).toBeVisible()
    })
  })
})
