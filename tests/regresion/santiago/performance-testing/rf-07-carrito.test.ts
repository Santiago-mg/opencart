import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { PRODUCTOS, agregarAlCarrito, cambiarCantidad, carritoDe, totalLlamado, visitante } from '../helpers/tienda'

/**
 * RF-07 — Carrito de compras · performance-testing
 *
 * Línea base, presupuesto y comparación: cuánto tarda agregar, cuánto tarda
 * pintar el carrito y cuánto crece ese tiempo cuando el carrito tiene muchas
 * líneas (la tienda consulta cada producto, sus descuentos y sus impuestos).
 */

const { iphone } = PRODUCTOS
// Diez productos de demostración sin opciones obligatorias.
const DIEZ_PRODUCTOS = [28, 29, 31, 32, 33, 34, 36, 40, 41, 43]

async function carritoCon(productos: number[]) {
  const ana = visitante()
  for (const id of productos) await agregarAlCarrito(ana, id, 1)
  return ana
}

describe('RF-07 · Performance — carrito de compras', () => {
  it('línea base: el carrito que se mide suma bien', async () => {
    // Arrange
    const ana = await carritoCon([iphone.id])

    // Act
    const carrito = await carritoDe(ana)

    // Assert
    expect(totalLlamado(carrito, 'Total')).to.equal(123.2)
  })

  it('agregar un producto cumple el presupuesto educativo', async () => {
    // Arrange
    const ana = visitante()
    await agregarAlCarrito(ana, iphone.id, 1) // calentamiento

    // Act
    const { resultado: res, ms } = await medir(() => agregarAlCarrito(ana, iphone.id, 1))

    // Assert
    expect(res.body).to.have.property('success')
    expect(ms, `Agregar tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('pintar un carrito de diez productos cumple el presupuesto', async () => {
    // Arrange
    const ana = await carritoCon(DIEZ_PRODUCTOS)
    await carritoDe(ana) // calentamiento

    // Act
    const tiempos = await repetir(() => carritoDe(ana), 5)

    // Assert
    expect((await carritoDe(ana)).lineas).to.have.lengthOf(10)
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('un carrito de diez productos no tarda diez veces lo que tarda uno de un producto', async () => {
    // Arrange
    const pequeno = await carritoCon([iphone.id])
    const grande = await carritoCon(DIEZ_PRODUCTOS)
    await carritoDe(pequeno)
    await carritoDe(grande)

    // Act
    const conUno = mediana(await repetir(() => carritoDe(pequeno), 5))
    const conDiez = mediana(await repetir(() => carritoDe(grande), 5))

    // Assert
    expect(conDiez, `1 producto ${conUno.toFixed(1)} ms · 10 productos ${conDiez.toFixed(1)} ms`).to.be.below(conUno * 10 + 100)
  })

  it('cambiar la cantidad veinte veces seguidas se mantiene dentro del presupuesto', async () => {
    // Arrange
    const ana = await carritoCon([iphone.id])
    const { lineas } = await carritoDe(ana)
    let cantidad = 1

    // Act
    const tiempos = await repetir(() => cambiarCantidad(ana, lineas[0].clave, ++cantidad), 20)

    // Assert
    expect((await carritoDe(ana)).lineas[0].cantidad).to.equal(21)
    expect(Math.max(...tiempos), `La más lenta tardó ${Math.max(...tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('una cantidad enorme no vuelve lento el carrito', async () => {
    // Arrange
    const ana = visitante()
    await agregarAlCarrito(ana, iphone.id, 1_000_000)

    // Act
    const { resultado: carrito, ms } = await medir(() => carritoDe(ana))

    // Assert
    expect(carrito.lineas[0].cantidad).to.equal(1_000_000)
    expect(ms, `El carrito tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })
})
