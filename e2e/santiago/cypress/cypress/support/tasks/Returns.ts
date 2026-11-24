import type { Task } from '../screenplay/actor'
import type { ReturnRequest } from '../screenplay/testData'
import { ReturnsPage } from '../ui/pages'
import { OpenPage } from './OpenPage'

/** RF-11: llenar el formulario "Product Returns" y pulsar "Submit". */
export const RequestReturn = {
  of: (request: ReturnRequest): Task => (actor) => {
    OpenPage.returnForm()(actor)
    ReturnsPage.orderId().clear().type(request.orderId)
    ReturnsPage.firstName().clear().type(request.firstName)
    ReturnsPage.lastName().clear().type(request.lastName)
    ReturnsPage.email().clear().type(request.email)
    ReturnsPage.product().clear().type(request.product)
    ReturnsPage.model().clear().type(request.model)
    // Motivo 1: "Dead On Arrival"
    ReturnsPage.reason(1).check()
    ReturnsPage.submit().click()
  },
}

export const SubmitTheReturnForm = {
  empty: (): Task => (actor) => {
    OpenPage.returnForm()(actor)
    ReturnsPage.submit().click()
  },
}
