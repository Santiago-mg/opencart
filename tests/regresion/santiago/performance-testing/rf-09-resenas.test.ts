import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { type Panel, aprobarResenaDe, borrarResenasDe, iniciarSesionEnElPanel } from '../helpers/panel'
import { PRODUCTOS, RESENA_RECIBIDA, publicarResena, resena, resenasPublicadas, ruta, visitante } from '../helpers/tienda'

/**
 * RF-09 — Reseñas de productos · performance-testing
 *
 * Línea base, presupuesto y comparación: cuánto tarda enviar una reseña y
 * cuánto tarda la lista pública cuando el producto ya tiene varias aprobadas.
 */

const { imac } = PRODUCTOS

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarResenasDe(panel, 'QA')
})

describe('RF-09 · Performance — reseñas de productos', () => {
  it('línea base: la reseña que se mide se recibe correctamente', async () => {
    // Act
    const res = await publicarResena(visitante(), imac.id, resena())

    // Assert
    expect(res.body.success).to.equal(RESENA_RECIBIDA)
  })

  it('enviar una reseña (abrir la ficha y enviar el formulario) cumple el presupuesto', async () => {
    // Arrange
    await publicarResena(visitante(), imac.id, resena()) // calentamiento

    // Act
    const { resultado: res, ms } = await medir(() => publicarResena(visitante(), imac.id, resena()))

    // Assert
    expect(res.body.success).to.equal(RESENA_RECIBIDA)
    expect(ms, `Tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('una reseña de 1.000 caracteres tarda lo mismo que una corta', async () => {
    // Arrange
    const corta = () => publicarResena(visitante(), imac.id, resena({ text: 'x'.repeat(25) }))
    const larga = () => publicarResena(visitante(), imac.id, resena({ text: 'x'.repeat(1000) }))
    await corta()
    await larga()

    // Act
    const conPoco = mediana(await repetir(corta, 5))
    const conMucho = mediana(await repetir(larga, 5))

    // Assert
    expect(conMucho, `25 caracteres ${conPoco.toFixed(1)} ms · 1.000 caracteres ${conMucho.toFixed(1)} ms`).to.be.below(conPoco * 2 + 100)
  })

  it('la lista pública con doce reseñas aprobadas cumple el presupuesto y muestra cinco por página', async () => {
    // Arrange
    for (let i = 0; i < 12; i++) {
      const nueva = resena({ rating: (i % 5) + 1 })
      await publicarResena(visitante(), imac.id, nueva)
      await aprobarResenaDe(panel, nueva.author!, { product_id: imac.id, text: nueva.text!, rating: (i % 5) + 1 })
    }
    const lector = visitante()
    await resenasPublicadas(lector, imac.id) // calentamiento

    // Act
    const tiempos = await repetir(() => resenasPublicadas(lector, imac.id), 5)
    const { resenas } = await resenasPublicadas(lector, imac.id)

    // Assert
    expect(resenas).to.have.lengthOf(5)
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('la ficha de un producto con reseñas no tarda el doble que la de uno sin reseñas', async () => {
    // Arrange
    const lector = visitante()
    const conResenas = () => lector.get(ruta('product/product', { product_id: imac.id }))
    const sinResenas = () => lector.get(ruta('product/product', { product_id: PRODUCTOS.macbookPro.id }))
    await conResenas()
    await sinResenas()

    // Act
    const base = mediana(await repetir(sinResenas, 5))
    const conDoce = mediana(await repetir(conResenas, 5))

    // Assert
    expect(conDoce, `sin reseñas ${base.toFixed(1)} ms · con reseñas ${conDoce.toFixed(1)} ms`).to.be.below(base * 2 + 100)
  })
})
