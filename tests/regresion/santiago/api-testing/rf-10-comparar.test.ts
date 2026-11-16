import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRODUCTOS, PRODUCTO_INEXISTENTE, compararProducto, enviar, listaDeComparacion, ruta, visitante } from '../helpers/tienda'

/**
 * RF-10 — Comparar productos · API testing
 * POST product/compare.add { product_id }
 * GET  product/compare            (la tabla)
 * GET  product/compare&remove=ID  (quitar y volver a la tabla)
 *
 * El contrato de agregar a la comparación (JSON) y el de la página.
 */

const { iphone, imac } = PRODUCTOS

describe('RF-10 · API — comparar productos', () => {
  describe('POST product/compare.add', () => {
    it('200 y JSON con las claves success y total', async () => {
      // Act
      const res = await compararProducto(visitante(), iphone.id)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^application\/json/)
      expect(res.body).to.have.all.keys('success', 'total')
      expect(res.body.total).to.equal('Product Compare (1)')
    })

    it('el mensaje nombra el producto y enlaza a su ficha y a la comparación', async () => {
      // Act
      const res = await compararProducto(visitante(), iphone.id)

      // Assert
      expect(res.body.success).to.match(/^Success: You have added <a href="[^"]*product_id=40">iPhone<\/a> to your <a href="[^"]*route=product\/compare[^"]*">product comparison<\/a>!$/)
    })

    it.each([
      ['un producto que no existe', { product_id: PRODUCTO_INEXISTENTE }],
      ['un product_id con letras', { product_id: 'abc' }],
      ['sin product_id', {}],
    ])('%s: { error } y no cambia la lista', async (_caso, campos) => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, imac.id)

      // Act
      const res = await enviar(ana, 'product/compare.add', campos)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ error: 'Warning: Product could not be found!' })
      expect((await listaDeComparacion(ana)).productos.map((p) => p.nombre)).to.deep.equal(['iMac'])
    })
  })

  describe('GET product/compare', () => {
    it('200 y HTML con el título "Product Comparison"', async () => {
      // Act
      const res = await visitante().get(ruta('product/compare'))

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^text\/html/)
      expect(res.text).to.include('<h1>Product Comparison</h1>')
    })

    it('cada columna trae un botón para agregar al carrito y un enlace para quitarla', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)
      await compararProducto(ana, imac.id)

      // Act
      const { html } = await listaDeComparacion(ana)

      // Assert
      const quitar = [...html.matchAll(/<a href="[^"]*remove=(\d+)"[^>]*>Remove<\/a>/g)].map((m) => Number(m[1]))
      expect(quitar).to.deep.equal([iphone.id, imac.id])
      expect([...html.matchAll(/name="product_id" value="(\d+)"/g)].map((m) => Number(m[1]))).to.include.members([iphone.id, imac.id])
    })

    it('la tabla trae las filas de datos en el orden de siempre', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)

      // Act
      const { html } = await listaDeComparacion(ana)

      // Assert
      const filas = [...html.matchAll(/<tr>\s*<td>([A-Z][A-Za-z ()x]+)<\/td>/g)].map((m) => m[1])
      expect(filas.slice(0, 9)).to.deep.equal(['Product', 'Image', 'Price', 'Model', 'Brand', 'Availability', 'Rating', 'Summary', 'Weight'])
    })
  })

  describe('GET product/compare&remove', () => {
    it('302 de vuelta a la página de comparación', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)

      // Act
      const res = await ana.get(ruta('product/compare', { remove: iphone.id })).redirects(0).ok(() => true)

      // Assert
      expect(res.status).to.equal(302)
      expect(res.headers.location).to.include('route=product/compare')
      expect(res.headers.location).to.not.include('remove=')
    })
  })
})
