import type { Actor } from '../../screenplay/actor'
import { BROWSER, asForm, pageAt } from '../../screenplay/environment'
import type { ApiResponse } from '../../questions/Api'

type Parameters = Record<string, string | number>
type Fields = Record<string, string | number>

interface SendOptions {
  /** Datos que van en la dirección. Puede ser una función si dependen de algo que el actor anota antes (un token). */
  parameters?: Parameters | (() => Parameters)
  /** Campos del formulario. Si hay campos, la petición es POST, como la mandan las pantallas de la tienda. */
  fields?: Fields
}

/**
 * OpenCart responde JSON en sus acciones. Si llega otra cosa (por ejemplo un
 * aviso de PHP antes del JSON), no se lanza un error: se deja el texto en
 * `respuestaNoJson` para que la prueba pueda decir qué llegó.
 */
const readBody = (contentType: string, body: unknown): unknown => {
  if (typeof body !== 'string' || !contentType.includes('json')) return body
  try {
    return JSON.parse(body)
  } catch {
    return { respuestaNoJson: body }
  }
}

/**
 * Hace una petición a la tienda sin pasar por las pantallas y anota la
 * respuesta en la libreta del actor. Cypress manda y guarda la cookie de la
 * sesión, así que el actor tiene su propio carrito igual que en el navegador.
 */
export const send = (actor: Actor, route: string, options: SendOptions = {}) =>
  cy
    .wrap(null, { log: false })
    .then(() => {
      const parameters = typeof options.parameters === 'function' ? options.parameters() : options.parameters
      return cy.request({
        method: options.fields ? 'POST' : 'GET',
        url: pageAt(route, parameters),
        headers: { 'User-Agent': BROWSER, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: options.fields ? asForm(options.fields) : undefined,
        failOnStatusCode: false,
        followRedirect: false,
      })
    })
    .then((response) => {
      const contentType = String(response.headers['content-type'] ?? '')
      actor.notes.set('lastResponse', {
        status: response.status,
        contentType,
        body: readBody(contentType, response.body),
      } satisfies ApiResponse)
    })
