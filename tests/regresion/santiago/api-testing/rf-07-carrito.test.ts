import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRODUCTO_INEXISTENTE, PRODUCTOS, agregarAlCarrito, cambiarCantidad, carritoDe, enviar, quitarDelCarrito, visitante } from '../helpers/tienda'

/**
 * RF-07 — Carrito de compras · API testing
 * POST checkout/cart.add    { product_id, quantity, option[] }
 * POST checkout/cart.edit   { key, quantity }
 * GET  checkout/cart.remove&key
 *
 * El contrato JSON de las tres acciones: qué claves trae la respuesta cuando
 * sale bien, cuáles cuando sale mal y con qué mensajes.
 */

const { iphone, cinema } = PRODUCTOS

describe('RF-07 · API — carrito de compras', () => {
  describe('POST checkout/cart.add', () => {
    it('200 y JSON con una sola clave: success', async () => {
      // Act
      const res = await agregarAlCarrito(visitante(), iphone.id, 1)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^application\/json/)
      expect(res.body).to.have.all.keys('success')
    })

    it('el mensaje nombra el producto y enlaza a su ficha y al carrito', async () => {
      // Act
      const res = await agregarAlCarrito(visitante(), iphone.id, 1)

      // Assert
      expect(res.body.success).to.match(/^Success: You have added <a href="[^"]*product_id=40">iPhone<\/a> to your <a href="[^"]*route=checkout\/cart[^"]*">shopping cart<\/a>!$/)
    })

    it('sin cantidad agrega una unidad', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await enviar(ana, 'checkout/cart.add', { product_id: iphone.id })

      // Assert
      expect((await carritoDe(ana)).lineas[0].cantidad).to.equal(1)
    })

    it('producto inexistente: error.warning y a dónde volver', async () => {
      // Act
      const res = await agregarAlCarrito(visitante(), PRODUCTO_INEXISTENTE, 1)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.have.all.keys('error', 'redirect')
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Product could not be found!' })
    })

    it('sin product_id responde lo mismo que un producto inexistente', async () => {
      // Act
      const res = await enviar(visitante(), 'checkout/cart.add', { quantity: 1 })

      // Assert
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Product could not be found!' })
    })

    it('producto con opciones obligatorias sin elegir: un error por cada opción y no se agrega', async () => {
      // Arrange: el Apple Cinema 30" tiene 9 opciones obligatorias.
      const ana = visitante()

      // Act
      const res = await agregarAlCarrito(ana, cinema.id, 2)

      // Assert
      const errores = Object.entries(res.body.error as Record<string, string>)
      expect(errores).to.have.lengthOf(9)
      for (const [clave, mensaje] of errores) {
        expect(clave).to.match(/^option_\d+$/)
        expect(mensaje).to.match(/ required!$/)
      }
      expect(res.body.redirect).to.include(`product_id=${cinema.id}`)
      expect((await carritoDe(ana)).lineas).to.be.empty
    })

    it.each([
      ['0', 0],
      ['negativa', -3],
      ['con letras', 'abc'],
      ['vacía', ''],
    ])('[DEF-07-01] con cantidad %s no responde "success", porque no agrega nada', async (_caso, cantidad) => {
      // Arrange
      const ana = visitante()

      // Act
      const res = await agregarAlCarrito(ana, iphone.id, cantidad)

      // Assert: el carrito queda vacío, así que la respuesta debería ser un error.
      expect((await carritoDe(ana)).lineas).to.be.empty
      expect(res.body).to.not.have.property('success')
    })
  })

  describe('POST checkout/cart.edit', () => {
    it('200 y { success } al cambiar la cantidad de una línea propia', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      const { lineas } = await carritoDe(ana)

      // Act
      const res = await cambiarCantidad(ana, lineas[0].clave, 4)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ success: 'Success: You have modified your shopping cart!' })
    })

    it('[DEF-07-02] editar una línea que no existe no responde "success"', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)

      // Act
      const res = await cambiarCantidad(ana, 99999999, 3)

      // Assert
      expect(res.body).to.not.have.property('success')
    })
  })

  describe('GET checkout/cart.remove&key', () => {
    it('200 y { success } al quitar una línea y quedar otras', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      await agregarAlCarrito(ana, PRODUCTOS.imac.id, 1)
      const { lineas } = await carritoDe(ana)

      // Act
      const res = await quitarDelCarrito(ana, lineas[0].clave)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ success: 'Success: You have removed an item from your shopping cart!' })
      expect((await carritoDe(ana)).lineas).to.have.lengthOf(1)
    })

    it('al quitar la última línea responde { redirect } hacia el carrito vacío', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      const { lineas } = await carritoDe(ana)

      // Act
      const res = await quitarDelCarrito(ana, lineas[0].clave)

      // Assert
      expect(res.body).to.have.all.keys('redirect')
      expect(res.body.redirect).to.include('route=checkout/cart')
      expect((await carritoDe(ana)).lineas).to.be.empty
    })

    it('[DEF-07-02] quitar una línea que no existe no responde "success"', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)

      // Act
      const res = await quitarDelCarrito(ana, 99999999)

      // Assert
      expect(res.body).to.not.have.property('success')
    })
  })
})
