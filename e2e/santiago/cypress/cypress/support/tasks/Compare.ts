import type { Task } from '../screenplay/actor'
import { productId } from '../screenplay/testData'
import { ComparePage, ProductPage, StorePage } from '../ui/pages'
import { OpenPage } from './OpenPage'

/** RF-10: el botón "Compare this Product" de la ficha. */
export const AddToComparison = {
  product: (product: string): Task => (actor) => {
    OpenPage.productDetail(product)(actor)
    ProductPage.compareButton().click()
    StorePage.latestAlert().should('exist')
  },
}

/** RF-10: el enlace "Remove" de la columna del producto. */
export const RemoveFromComparison = {
  product: (product: string): Task => (actor) => {
    OpenPage.comparison()(actor)
    ComparePage.removeLinkOf(productId(product)).click()
    ComparePage.successMessage().should('be.visible')
  },
}
