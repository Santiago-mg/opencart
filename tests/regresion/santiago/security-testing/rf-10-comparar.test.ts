import { expect } from 'chai'
import { describe, it } from 'vitest'
import { INYECCIONES_SQL, XSS_SCRIPT, revelaDetallesInternos, textoCompleto, traeHtmlInyectado } from '../helpers/seguridad'
import { PRODUCTOS, compararProducto, listaDeComparacion, ruta, visitante } from '../helpers/tienda'

/**
 * RF-10 — Comparar productos · security-testing
 *
 * La lista de comparación vive en la sesión del visitante. No debe mezclarse
 * con la de otro, no debe crecer sin límite y los identificadores que llegan
 * por el formulario o por la dirección se tratan como números, no como SQL
 * ni como HTML.
 */

const { iphone, imac } = PRODUCTOS

describe('RF-10 · Seguridad — comparar productos', () => {
  it('la lista de Ana no aparece en la sesión de Carlos', async () => {
    // Arrange
    const ana = visitante()
    const carlos = visitante()

    // Act
    await compararProducto(ana, iphone.id)

    // Assert
    expect((await listaDeComparacion(carlos)).productos).to.be.empty
  })

  it('Carlos no puede quitar un producto de la lista de Ana', async () => {
    // Arrange
    const ana = visitante()
    const carlos = visitante()
    await compararProducto(ana, iphone.id)

    // Act
    await carlos.get(ruta('product/compare', { remove: iphone.id })).redirects(0).ok(() => true)

    // Assert
    expect((await listaDeComparacion(ana)).productos.map((p) => p.nombre)).to.deep.equal(['iPhone'])
  })

  it('treinta peticiones seguidas no hacen crecer la lista por encima de cuatro', async () => {
    // Arrange
    const ana = visitante()
    const productos = [28, 29, 31, 32, 33, 34, 36, 40, 41, 43]

    // Act
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      for (const id of productos) await compararProducto(ana, id)
    }

    // Assert
    expect((await listaDeComparacion(ana)).productos).to.have.lengthOf(4)
  })

  describe('Inyección', () => {
    it.each(INYECCIONES_SQL)('product_id=%j (%s) se responde como producto inexistente', async (ataque) => {
      // Act
      const res = await compararProducto(visitante(), ataque)

      // Assert
      expect(res.body).to.deep.equal({ error: 'Warning: Product could not be found!' })
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
    })

    it.each(INYECCIONES_SQL)('remove=%j (%s) no rompe la página ni borra la lista', async (ataque) => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)
      await compararProducto(ana, imac.id)

      // Act
      const res = await ana.get(ruta('product/compare', { remove: ataque })).redirects(0).ok(() => true)

      // Assert
      expect(res.status).to.be.oneOf([200, 302])
      expect(revelaDetallesInternos(res.text ?? '')).to.equal(false)
      expect((await listaDeComparacion(ana)).productos).to.have.lengthOf(2)
    })

    it('un script en product_id no vuelve en la respuesta', async () => {
      // Act
      const res = await compararProducto(visitante(), XSS_SCRIPT)

      // Assert
      expect(textoCompleto(res)).to.not.include(XSS_SCRIPT)
    })

    it('un script en remove no vuelve en la página', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)

      // Act
      const res = await ana.get(ruta('product/compare', { remove: XSS_SCRIPT }))

      // Assert
      expect(traeHtmlInyectado(res.text)).to.equal(false)
    })
  })

  it('un producto deshabilitado o inexistente no se puede colar en la comparación', async () => {
    // Arrange
    const ana = visitante()

    // Act
    await compararProducto(ana, 0)
    await compararProducto(ana, -40)

    // Assert
    expect((await listaDeComparacion(ana)).productos).to.be.empty
  })
})
