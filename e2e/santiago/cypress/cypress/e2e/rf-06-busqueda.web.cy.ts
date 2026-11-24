import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Messages, SearchResults } from '../support/questions/Store'
import { actorCalled } from '../support/screenplay/actor'
import { SearchProducts, SortResults } from '../support/tasks/SearchProducts'

const NO_RESULTS = 'There is no product that matches the search criteria.'

/**
 * Como cliente de la tienda
 * quiero buscar productos y filtrarlos por categoría
 * para encontrar rápido lo que quiero comprar.
 */
describe('Búsqueda y filtrado de productos (RF-06) — web', () => {
  it('[smoke] Buscar productos por su nombre', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchProducts.for('mac'))

    carlos.sees(SearchResults.names()).toHaveMembers(['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro'])
  })

  it('Buscar también en la descripción de los productos', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchProducts.inDescriptionsFor('intel'))

    carlos.sees(SearchResults.names()).toHaveMembers(['iMac', 'MacBook', 'MacBook Pro', 'Sony VAIO'])
  })

  // "Mac" es una subcategoría de "Desktops": el iMac solo aparece si se incluyen las subcategorías.
  const byCategory = [
    { scope: 'sin subcategorías', includingSubcategories: false, products: ['MacBook', 'MacBook Air'] },
    { scope: 'incluyendo subcategorías', includingSubcategories: true, products: ['iMac', 'MacBook', 'MacBook Air'] },
  ]

  byCategory.forEach(({ scope, includingSubcategories, products }) => {
    it(`Filtrar por categoría ${scope}`, () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(SearchProducts.inCategory('mac', 'Desktops', includingSubcategories))

      carlos.sees(SearchResults.names()).toHaveMembers(products)
    })
  })

  it('Ordenar los resultados por precio, de mayor a menor', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchProducts.for('mac'), SortResults.by('Price (High > Low)'))

    carlos.sees(SearchResults.names()).toEqual(['MacBook Pro', 'MacBook Air', 'MacBook', 'iMac'])
  })

  it('Una búsqueda sin coincidencias avisa que no hay productos', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(SearchProducts.for('zzzzqqq'))

    carlos.sees(Messages.paragraphs()).toInclude(NO_RESULTS)
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-06-03] Buscar el símbolo "%" no devuelve el catálogo completo', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(SearchProducts.for('%'))

      carlos.sees(Messages.paragraphs()).toInclude(NO_RESULTS)
    })
  })
})
