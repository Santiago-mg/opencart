import type { Actor } from '../screenplay/actor'
import { Search, norm } from '../ui/targets'

/** Lo que respondió la tienda la última vez que este actor le pidió algo sin el navegador. */
export interface ApiResponse {
  status: number
  contentType: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
}

export const lastResponseOf = (actor: Actor): ApiResponse => actor.notes.get<ApiResponse>('lastResponse')

/**
 * Verificaciones sobre la última respuesta. Se anotan en la misma cola de
 * Cypress, así que corren después de la petición que las precede.
 */
export const theResponseTo = (actor: Actor) => {
  const verifier = {
    hasStatus(status: number) {
      cy.wrap(null, { log: false }).then(() => {
        expect(lastResponseOf(actor).status, 'estado HTTP de la respuesta').to.equal(status)
      })
      return verifier
    },
    isJson() {
      cy.wrap(null, { log: false }).then(() => {
        expect(lastResponseOf(actor).contentType, 'tipo de contenido').to.match(/^application\/json/)
        expect(lastResponseOf(actor).body, 'la respuesta no es JSON').to.not.have.property('respuestaNoJson')
      })
      return verifier
    },
    isExactly(expected: unknown) {
      cy.wrap(null, { log: false }).then(() => {
        expect(lastResponseOf(actor).body, 'cuerpo de la respuesta').to.deep.equal(expected)
      })
      return verifier
    },
    satisfies(description: string, check: (body: ApiResponse['body']) => void) {
      cy.wrap(null, { log: false }).then(() => {
        try {
          check(lastResponseOf(actor).body)
        } catch (error) {
          throw new Error(`${description}: ${(error as Error).message}`)
        }
      })
      return verifier
    },
  }
  return verifier
}

/**
 * Para las respuestas en HTML (la página de resultados): se leen con el mismo
 * selector que usan las pruebas de la interfaz, sin abrir el navegador.
 */
export const Html = {
  page: (html: string): Document => new DOMParser().parseFromString(html, 'text/html'),
  productNames: (html: string): string[] =>
    Array.from(Html.page(html).querySelectorAll(Search.productNames)).map((element) => norm(element.textContent)),
  contentText: (html: string): string => norm(Html.page(html).querySelector('#content')?.textContent),
}
