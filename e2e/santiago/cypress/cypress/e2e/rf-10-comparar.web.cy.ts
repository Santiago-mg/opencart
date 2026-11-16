import '../support/hooks'
import { describeDefects } from '../support/defects'
import { Comparison } from '../support/questions/Store'
import { actorCalled } from '../support/screenplay/actor'
import { AddToComparison, RemoveFromComparison } from '../support/tasks/Compare'
import { OpenPage } from '../support/tasks/OpenPage'

/**
 * Como cliente de la tienda
 * quiero poner varios productos lado a lado
 * para comparar sus precios y características.
 */
describe('Comparar productos (RF-10) — web', () => {
  it('[smoke] Comparar dos productos', () => {
    const carlos = actorCalled('Carlos')

    carlos.attemptsTo(AddToComparison.product('iPhone'), AddToComparison.product('iMac'))

    carlos.attemptsTo(OpenPage.comparison())
    carlos.sees(Comparison.products()).toEqual(['iPhone', 'iMac'])
    carlos.sees(Comparison.row('Price')).toEqual(['$123.20', '$122.00'])
  })

  it('La comparación admite como máximo cuatro productos', () => {
    const carlos = actorCalled('Carlos')
    carlos.attemptsTo(
      AddToComparison.product('iPhone'),
      AddToComparison.product('iMac'),
      AddToComparison.product('MacBook'),
      AddToComparison.product('MacBook Air'),
    )

    carlos.attemptsTo(AddToComparison.product('MacBook Pro'))

    // Al llegar el quinto, sale el primero que se agregó.
    carlos.attemptsTo(OpenPage.comparison())
    carlos.sees(Comparison.products()).toEqual(['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro'])
  })

  it('Quitar un producto de la comparación', () => {
    const carlos = actorCalled('Carlos')
    carlos.attemptsTo(AddToComparison.product('iPhone'), AddToComparison.product('iMac'))

    carlos.attemptsTo(RemoveFromComparison.product('iMac'))

    carlos.sees(Comparison.successMessage()).toEqual('Success: You have modified your product comparison!')
    carlos.sees(Comparison.products()).toEqual(['iPhone'])
  })

  describeDefects('Defectos encontrados', () => {
    it('[DEF-10-01] La disponibilidad dice "In Stock", igual que en la ficha', () => {
      const carlos = actorCalled('Carlos')

      carlos.attemptsTo(AddToComparison.product('iPhone'))

      // Hoy muestra la cantidad de unidades en bodega en lugar de "In Stock".
      carlos.attemptsTo(OpenPage.comparison())
      carlos.sees(Comparison.row('Availability')).toEqual(['In Stock'])
    })
  })
})
