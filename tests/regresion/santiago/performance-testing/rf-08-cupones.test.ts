import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { type Cupon, type Panel, borrarCuponesDePrueba, cupon, iniciarSesionEnElPanel, publicarCupon } from '../helpers/panel'
import { CUPON_APLICADO, PRODUCTOS, agregarAlCarrito, aplicarCupon, carritoDe, totalLlamado, visitante } from '../helpers/tienda'

/**
 * RF-08 — Cupones de descuento · performance-testing
 *
 * Validar un cupón consulta sus fechas, sus usos y los productos del carrito.
 * Se mide cuánto tarda aplicarlo y cuánto encarece pintar el carrito.
 */

let panel: Panel
let diezPorCiento: Cupon

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
  diezPorCiento = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }))
})

afterAll(async () => {
  await borrarCuponesDePrueba(panel)
})

async function clienteConUnIphone() {
  const ana = visitante()
  await agregarAlCarrito(ana, PRODUCTOS.iphone.id, 1)
  return ana
}

describe('RF-08 · Performance — cupones de descuento', () => {
  it('línea base: el cupón que se mide descuenta lo correcto', async () => {
    // Arrange
    const ana = await clienteConUnIphone()

    // Act
    await aplicarCupon(ana, diezPorCiento.code)
    const carrito = await carritoDe(ana)

    // Assert
    expect(totalLlamado(carrito, `Coupon (${diezPorCiento.code})`)).to.equal(-10.1)
  })

  it('aplicar un cupón válido cumple el presupuesto educativo', async () => {
    // Arrange
    const ana = await clienteConUnIphone()
    await aplicarCupon(ana, diezPorCiento.code) // calentamiento

    // Act
    const { resultado: res, ms } = await medir(() => aplicarCupon(ana, diezPorCiento.code))

    // Assert
    expect(res.body.success).to.equal(CUPON_APLICADO)
    expect(ms, `Aplicar el cupón tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('rechazar un código que no existe es igual de rápido', async () => {
    // Arrange
    const ana = await clienteConUnIphone()
    await aplicarCupon(ana, 'NO-EXISTE-123') // calentamiento

    // Act
    const tiempos = await repetir(() => aplicarCupon(ana, 'NO-EXISTE-123'), 5)

    // Assert
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('el carrito con cupón no tarda el doble que el carrito sin cupón', async () => {
    // Arrange
    const sinCupon = await clienteConUnIphone()
    const conCupon = await clienteConUnIphone()
    await aplicarCupon(conCupon, diezPorCiento.code)
    await carritoDe(sinCupon)
    await carritoDe(conCupon)

    // Act
    const base = mediana(await repetir(() => carritoDe(sinCupon), 5))
    const conDescuento = mediana(await repetir(() => carritoDe(conCupon), 5))

    // Assert
    expect(conDescuento, `sin cupón ${base.toFixed(1)} ms · con cupón ${conDescuento.toFixed(1)} ms`).to.be.below(base * 2 + 100)
  })

  it('un cupón limitado a productos, con diez productos en el carrito, cumple el presupuesto', async () => {
    // Arrange
    const soloImac = await publicarCupon(panel, cupon(), [PRODUCTOS.imac.id])
    const ana = visitante()
    for (const id of [28, 29, 31, 32, 33, 34, 36, 40, 41, 43]) await agregarAlCarrito(ana, id, 1)

    // Act
    const { resultado: res, ms } = await medir(() => aplicarCupon(ana, soloImac.code))

    // Assert
    expect(res.body.success).to.equal(CUPON_APLICADO)
    expect(ms, `Tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })
})
