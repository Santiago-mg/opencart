import type { Task } from '../screenplay/actor'
import { CATEGORIES } from '../screenplay/testData'
import { SearchPage, StorePage } from '../ui/pages'
import { OpenPage } from './OpenPage'

const typeTheTerm = (term: string) => SearchPage.searchBox().clear().type(term)

// Al buscar, la tienda recarga la página con el término en el título: "Search - mac".
const waitForTheResultsOf = (term: string) => StorePage.mainHeading().should('contain.text', term)

/** RF-06: escribir en el buscador, elegir criterios y pulsar "Search". */
export const SearchProducts = {
  for: (term: string): Task => (actor) => {
    OpenPage.search()(actor)
    typeTheTerm(term)
    SearchPage.searchButton().click()
    waitForTheResultsOf(term)
  },
  inDescriptionsFor: (term: string): Task => (actor) => {
    OpenPage.search()(actor)
    typeTheTerm(term)
    SearchPage.searchInDescriptions().check()
    SearchPage.searchButton().click()
    waitForTheResultsOf(term)
  },
  inCategory: (term: string, category: string, includingSubcategories: boolean): Task => (actor) => {
    OpenPage.search()(actor)
    typeTheTerm(term)
    SearchPage.category().select(CATEGORIES[category])
    // La casilla de subcategorías se habilita sola al elegir una categoría.
    if (includingSubcategories) SearchPage.includeSubcategories().check()
    SearchPage.searchButton().click()
    waitForTheResultsOf(term)
  },
}

/** RF-06: la lista "Sort By" recarga la página con el orden elegido. */
export const SortResults = {
  by: (option: string): Task => () => {
    SearchPage.sortBy().select(option)
    cy.url().should('include', 'sort=')
  },
}
