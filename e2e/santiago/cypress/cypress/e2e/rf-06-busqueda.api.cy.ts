import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Html, theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { SearchViaHttp } from '../support/tasks/api/CatalogApi'

const NO_RESULTS = 'There is no product that matches the search criteria.'
// "Showing 1 to 4 of 4 (1 Pages)": solo números positivos.
const PAGINATION = /Showing \d+ to \d+ of \d+ \(\d+ Pages\)/

/** La página de resultados pedida directamente, sin abrir el navegador. */
describe('Búsqueda y filtrado de productos (RF-06) — HTTP', () => {
  it('Buscar "mac" responde 200 con los cuatro Mac', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchViaHttp.for('mac'))

    theResponseTo(carlos)
      .hasStatus(200)
      .satisfies('productos encontrados', (html) => {
        expect(Html.productNames(html)).to.have.members(['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro'])
      })
  })

  it('Una búsqueda sin coincidencias no trae lista de productos', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchViaHttp.for('zzzzqqq'))

    theResponseTo(carlos)
      .hasStatus(200)
      .satisfies('página sin resultados', (html) => {
        expect(Html.productNames(html)).to.be.empty
        expect(Html.contentText(html)).to.include(NO_RESULTS)
      })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-06-01] Un límite negativo no produce una paginación sin sentido', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(SearchViaHttp.for('mac', { limit: -1 }))

      // Hoy dice "Showing 1 to -1 of 4 (-4 Pages)".
      theResponseTo(carlos).satisfies('paginación', (html) => {
        expect(Html.contentText(html)).to.match(PAGINATION)
      })
    })

    it('[DEF-06-03] Buscar el símbolo "%" no devuelve el catálogo completo', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(SearchViaHttp.for('%'))

      theResponseTo(carlos).satisfies('productos encontrados', (html) => {
        expect(Html.productNames(html)).to.be.empty
      })
    })
  })
})
