import type { Task } from '../../screenplay/actor'
import { productId, type ReturnRequest } from '../../screenplay/testData'
import { send } from './StoreRequest'

/** Todos los campos que manda el formulario "Product Returns". */
const fieldsOf = (request: ReturnRequest): Record<string, string | number> => ({
  order_id: request.orderId,
  date_ordered: '2026-11-01',
  firstname: request.firstName,
  lastname: request.lastName,
  email: request.email,
  telephone: '3001234567',
  product: request.product,
  product_id: productId(request.product),
  model: request.model,
  quantity: 1,
  // Motivo 1: "Dead On Arrival"
  return_reason_id: 1,
  opened: 0,
  comment: 'Llegó con la pantalla rota',
})

/**
 * RF-11: el formulario trae un token (return_token) en su dirección de envío.
 * El actor abre el formulario, anota el token y lo envía en la misma visita.
 */
export const RequestReturnViaApi = {
  of: (request: ReturnRequest, changes: Record<string, string | number> = {}): Task => (actor) => {
    send(actor, 'account/returns.add')
    cy.wrap(null, { log: false }).then(() => {
      const html = String(actor.notes.get<{ body: unknown }>('lastResponse').body)
      actor.notes.set('returnToken', html.match(/return_token=([a-f0-9]+)/)?.[1] ?? '')
    })
    send(actor, 'account/returns.save', {
      parameters: () => ({ return_token: actor.notes.get<string>('returnToken') }),
      fields: { ...fieldsOf(request), ...changes },
    })
  },
}
