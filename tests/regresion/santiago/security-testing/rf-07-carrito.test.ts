import { expect } from 'chai'
import { describe, it } from 'vitest'
import { INYECCIONES_SQL, XSS_SCRIPT, revelaDetallesInternos, textoCompleto } from '../helpers/seguridad'
import { PRODUCTOS, agregarAlCarrito, cambiarCantidad, carritoDe, enviar, quitarDelCarrito, ruta, totalLlamado, visitante } from '../helpers/tienda'

/**
 * RF-07 — Carrito de compras · security-testing
 *
 * El carrito guarda lo que el visitante va a pagar. Nadie debe poder ver ni
 * cambiar el carrito de otro, ni fijar el precio desde el navegador, ni usar
 * los campos del formulario para llegar a la base de datos.
 */

const { iphone, imac } = PRODUCTOS

describe('RF-07 · Seguridad — carrito de compras', () => {
  describe('Cada visitante solo ve y cambia su propio carrito', () => {
    it('lo que agrega Ana no aparece en el carrito de Carlos', async () => {
      // Arrange
      const ana = visitante()
      const carlos = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, 2)

      // Assert
      expect((await carritoDe(carlos)).lineas).to.be.empty
    })

    it('Carlos no puede cambiar la cantidad de una línea de Ana', async () => {
      // Arrange
      const ana = visitante()
      const carlos = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)
      const lineaDeAna = (await carritoDe(ana)).lineas[0].clave

      // Act
      await cambiarCantidad(carlos, lineaDeAna, 50)

      // Assert
      expect((await carritoDe(ana)).lineas[0].cantidad).to.equal(2)
    })

    it('Carlos no puede quitar una línea de Ana', async () => {
      // Arrange
      const ana = visitante()
      const carlos = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)
      const lineaDeAna = (await carritoDe(ana)).lineas[0].clave

      // Act
      await quitarDelCarrito(carlos, lineaDeAna)

      // Assert
      expect((await carritoDe(ana)).lineas).to.have.lengthOf(1)
    })
  })

  describe('El precio lo pone la tienda, no el navegador', () => {
    it('mandar un precio en el formulario no cambia lo que se cobra', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await enviar(ana, 'checkout/cart.add', { product_id: iphone.id, quantity: 1, price: 1, total: 1, tax_class_id: 0 })
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.lineas[0].precio).to.equal(123.2)
      expect(totalLlamado(carrito, 'Total')).to.equal(123.2)
    })

    it('una cantidad negativa no deja un total negativo', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, imac.id, 1)

      // Act
      await agregarAlCarrito(ana, iphone.id, -5)
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, 'Total')).to.equal(122)
      for (const linea of carrito.lineas) expect(linea.cantidad).to.be.above(0)
    })

    it('editar a una cantidad negativa no deja líneas negativas', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)
      const { lineas } = await carritoDe(ana)

      // Act
      await cambiarCantidad(ana, lineas[0].clave, -4)
      const carrito = await carritoDe(ana)

      // Assert
      for (const linea of carrito.lineas) expect(linea.cantidad).to.be.above(0)
    })
  })

  describe('Inyección', () => {
    it.each(INYECCIONES_SQL)('product_id=%j (%s) no llega a la base como SQL', async (ataque) => {
      // Arrange
      const ana = visitante()

      // Act
      const res = await agregarAlCarrito(ana, ataque, 1)

      // Assert
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Product could not be found!' })
    })

    it.each(INYECCIONES_SQL)('key=%j (%s) al editar no rompe nada', async (ataque) => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)

      // Act
      const res = await cambiarCantidad(ana, ataque, 9)

      // Assert
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
      expect((await carritoDe(ana)).lineas[0].cantidad).to.equal(2)
    })

    it('un script en el product_id no vuelve en la respuesta', async () => {
      // Act
      const res = await agregarAlCarrito(visitante(), XSS_SCRIPT, 1)

      // Assert
      expect(textoCompleto(res)).to.not.include(XSS_SCRIPT)
    })

    it('un número fuera de rango no produce un error interno', async () => {
      // Act
      const res = await agregarAlCarrito(visitante(), iphone.id, '999999999999999999999999')

      // Assert
      expect(res.status).to.equal(200)
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
    })
  })

  describe('La cookie de sesión', () => {
    it('lleva SameSite=Strict: otro sitio no puede usarla para agregar al carrito', async () => {
      // Act
      const res = await visitante().get(ruta('checkout/cart'))

      // Assert
      const sesion = (res.headers['set-cookie'] as unknown as string[]).find((cookie) => cookie.startsWith('OCSESSID='))
      expect(sesion).to.match(/SameSite=Strict/i)
    })

    it('[DEF-SEG-01] lleva HttpOnly: un script de la página no puede leerla', async () => {
      // Act
      const res = await visitante().get(ruta('checkout/cart'))

      // Assert
      const sesion = (res.headers['set-cookie'] as unknown as string[]).find((cookie) => cookie.startsWith('OCSESSID='))
      expect(sesion).to.match(/HttpOnly/i)
    })

    it('el identificador de sesión no viaja en las direcciones de la página', async () => {
      // Arrange
      const ana = visitante()
      const res = await ana.get(ruta('checkout/cart'))
      const sesion = (res.headers['set-cookie'] as unknown as string[]).find((cookie) => cookie.startsWith('OCSESSID='))!
      const identificador = sesion.split(';')[0].split('=')[1]

      // Assert
      expect(res.text).to.not.include(identificador)
    })
  })
})
