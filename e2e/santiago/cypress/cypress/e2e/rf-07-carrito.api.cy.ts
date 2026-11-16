import '../support/hooks'
import { describeDefects } from '../support/defects'
import { theResponseTo } from '../support/questions/Api'
import { actorCalled } from '../support/screenplay/actor'
import { NONEXISTENT_PRODUCT, productId } from '../support/screenplay/testData'
import { AddToCartViaApi } from '../support/tasks/api/CartApi'

/** La acción checkout/cart.add, la que llama el botón "Add to Cart". */
describe('Carrito de compras (RF-07) — API', () => {
  it('Agregar un producto responde { success } con su nombre', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(AddToCartViaApi.units(1, productId('iPhone')))

    theResponseTo(carlos)
      .hasStatus(200)
      .isJson()
      .satisfies('mensaje de éxito', (body) => {
        expect(body).to.have.all.keys('success')
        expect(body.success).to.match(/^Success: You have added .*iPhone.* to your .*shopping cart.*!$/)
      })
  })

  it('Un producto que no existe responde error.warning', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(AddToCartViaApi.units(1, NONEXISTENT_PRODUCT))

    theResponseTo(carlos)
      .hasStatus(200)
      .satisfies('error', (body) => {
        expect(body.error).to.deep.equal({ warning: 'Warning: Product could not be found!' })
      })
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-07-01] Con cantidad 0 no responde "success", porque no agrega nada', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(AddToCartViaApi.units(0, productId('iPhone')))

      theResponseTo(carlos).satisfies('respuesta', (body) => {
        expect(body).to.not.have.property('success')
      })
    })
  })
})
