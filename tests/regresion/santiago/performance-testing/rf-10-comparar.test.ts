import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { PRODUCTOS, compararProducto, listaDeComparacion, visitante } from '../helpers/tienda'

/**
 * RF-10 — Comparar productos · performance-testing
 *
 * La página de comparación consulta, por cada producto, su marca, su estado
 * de existencias y sus atributos. El límite de cuatro productos es lo que
 * mantiene ese trabajo acotado: aquí se mide y se comprueba que se respete.
 */

const { iphone, imac, macbook, macbookAir } = PRODUCTOS

async function listaCon(productos: number[]) {
  const ana = visitante()
  for (const id of productos) await compararProducto(ana, id)
  return ana
}

describe('RF-10 · Performance — comparar productos', () => {
  it('línea base: la lista que se mide tiene los cuatro productos', async () => {
    // Arrange
    const ana = await listaCon([iphone.id, imac.id, macbook.id, macbookAir.id])

    // Act
    const { productos } = await listaDeComparacion(ana)

    // Assert
    expect(productos.map((p) => p.nombre)).to.deep.equal(['iPhone', 'iMac', 'MacBook', 'MacBook Air'])
  })

  it('agregar a la comparación cumple el presupuesto educativo', async () => {
    // Arrange
    const ana = visitante()
    await compararProducto(ana, iphone.id) // calentamiento

    // Act
    const { resultado: res, ms } = await medir(() => compararProducto(ana, imac.id))

    // Assert
    expect(res.body).to.have.property('success')
    expect(ms, `Tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('la tabla con cuatro productos cumple el presupuesto', async () => {
    // Arrange
    const ana = await listaCon([iphone.id, imac.id, macbook.id, macbookAir.id])
    await listaDeComparacion(ana) // calentamiento

    // Act
    const tiempos = await repetir(() => listaDeComparacion(ana), 5)

    // Assert
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('comparar cuatro productos no tarda cuatro veces lo que tarda uno', async () => {
    // Arrange
    const conUno = await listaCon([iphone.id])
    const conCuatro = await listaCon([iphone.id, imac.id, macbook.id, macbookAir.id])
    await listaDeComparacion(conUno)
    await listaDeComparacion(conCuatro)

    // Act
    const uno = mediana(await repetir(() => listaDeComparacion(conUno), 5))
    const cuatro = mediana(await repetir(() => listaDeComparacion(conCuatro), 5))

    // Assert
    expect(cuatro, `1 producto ${uno.toFixed(1)} ms · 4 productos ${cuatro.toFixed(1)} ms`).to.be.below(uno * 4 + 100)
  })

  it('por más productos que se agreguen, la tabla nunca pasa de cuatro columnas', async () => {
    // Arrange: los 10 productos de demostración sin opciones obligatorias.
    const ana = await listaCon([28, 29, 31, 32, 33, 34, 36, 40, 41, 43])

    // Act
    const { resultado, ms } = await medir(() => listaDeComparacion(ana))

    // Assert
    expect(resultado.productos).to.have.lengthOf(4)
    expect(ms, `Tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })
})
