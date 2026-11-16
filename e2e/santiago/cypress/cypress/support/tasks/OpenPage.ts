import type { Task } from '../screenplay/actor'
import { pageAt } from '../screenplay/environment'
import { productId } from '../screenplay/testData'
import { ProductPage, ReturnsPage, SearchPage, StorePage } from '../ui/pages'

const visit = (path: string) => cy.visit(path, { failOnStatusCode: false })

/** Abre una página de la tienda y espera a que termine de cargar lo importante. */
export const OpenPage = {
  search: (): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('product/search'))
    SearchPage.searchBox().should('be.visible')
  },
  productDetail: (product: string): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('product/product', { product_id: productId(product) }))
    ProductPage.addToCartButton().should('be.visible')
  },
  cart: (): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('checkout/cart'))
    StorePage.mainHeading().should('exist')
  },
  comparison: (): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('product/compare'))
    StorePage.mainHeading().should('exist')
  },
  returnForm: (): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('account/returns.add'))
    ReturnsPage.orderId().should('be.visible')
  },
}

/** Solo navega: sirve cuando se espera que la tienda no deje entrar y mande a otra página. */
export const TryToOpen = {
  checkout: (): Task => (actor) => {
    actor.takesTheBrowser()
    visit(pageAt('checkout/checkout'))
  },
}
