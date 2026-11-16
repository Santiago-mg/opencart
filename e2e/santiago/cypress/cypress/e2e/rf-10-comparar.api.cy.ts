import '../support/hooks'
import { theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { NONEXISTENT_PRODUCT } from '../support/screenplay/testData'
import { CompareViaApi } from '../support/tasks/api/CatalogApi'

/** La acción product/compare.add, la que llama el botón "Compare this Product". */
describe('Comparar productos (RF-10) — API', () => {
  it('Agregar a la comparación responde { success, total }', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(CompareViaApi.product('iPhone'))

    theResponseTo(carlos)
      .hasStatus(200)
      .isJson()
      .satisfies('respuesta', (body) => {
        expect(body).to.have.all.keys('success', 'total')
        expect(body.total).to.equal('Product Compare (1)')
      })
  })

  it('Un producto que no existe responde un error', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(CompareViaApi.productWithId(NONEXISTENT_PRODUCT))

    theResponseTo(carlos).hasStatus(200).isExactly({ error: 'Warning: Product could not be found!' })
  })
})
