import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import {
  ESTADO_DEVOLUCION, type Panel,
  borrarDevolucionesDe, cambiarEstadoDeDevolucion, devolucionesEnElPanel, iniciarSesionEnElPanel,
} from '../helpers/panel'
import {
  type Devolucion, clienteDe, contenidoDe, devolucion, enviarDevolucion, ruta, solicitarDevolucion, tokenDeDevolucion, visitante,
} from '../helpers/tienda'

/**
 * RF-11 — Devoluciones · regression-testing
 * Tienda: account/returns.add (formulario) · account/returns.save
 * Panel:  sale/returns · sale/returns.addHistory
 *
 * El recorrido de una devolución: el cliente la solicita, queda registrada
 * con el estado inicial y la administradora le cambia el estado. Y las reglas
 * del formulario con sus valores límite.
 */

let panel: Panel
const clientes: string[] = []

/** Una solicitud nueva, anotada para borrarla del panel al terminar. */
function nuevaDevolucion(cambios: Devolucion = {}): Devolucion {
  const datos = devolucion(cambios)
  clientes.push(clienteDe(datos))
  return datos
}

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  for (const cliente of clientes) await borrarDevolucionesDe(panel, cliente)
})

describe('RF-11 · Regresión — devoluciones', () => {
  describe('Solicitar una devolución', () => {
    it('una solicitud completa lleva a la página de confirmación', async () => {
      // Arrange
      const carlos = visitante()

      // Act
      const res = await solicitarDevolucion(carlos, nuevaDevolucion())
      const confirmacion = await carlos.get(ruta('account/returns.success'))

      // Assert
      expect(res.body.redirect).to.include('route=account/returns.success')
      expect(contenidoDe(confirmacion.text)).to.include('Thank you for submitting your return request.')
    })

    it('queda registrada en el panel con el pedido, el producto, el modelo y el estado inicial', async () => {
      // Arrange
      const datos = nuevaDevolucion({ order_id: 4321, product: 'MacBook', model: 'Product 16' })

      // Act
      await solicitarDevolucion(visitante(), datos)
      const enElPanel = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Assert
      expect(enElPanel).to.have.lengthOf(1)
      expect(enElPanel[0]).to.include({ pedido: '4321', cliente: clienteDe(datos), producto: 'MacBook', modelo: 'Product 16', estado: 'Awaiting Products' })
    })

    it('el teléfono y el comentario son opcionales', async () => {
      // Arrange
      const datos = nuevaDevolucion({ telephone: '', comment: '' })

      // Act
      const res = await solicitarDevolucion(visitante(), datos)

      // Assert
      expect(res.body.redirect).to.include('route=account/returns.success')
    })

    it('no hace falta tener cuenta: un visitante puede solicitarla', async () => {
      // Act
      const formulario = await visitante().get(ruta('account/returns.add'))

      // Assert
      expect(formulario.status).to.equal(200)
      expect(formulario.text).to.include('id="input-order-id"')
    })
  })

  describe('Reglas del formulario', () => {
    it('con el formulario vacío, avisa de cada campo obligatorio', async () => {
      // Act
      const res = await solicitarDevolucion(visitante(), {})

      // Assert
      expect(res.body.error).to.deep.equal({
        order_id: 'Order ID required!',
        firstname: 'First Name must be between 1 and 32 characters!',
        lastname: 'Last Name must be between 1 and 32 characters!',
        email: 'E-Mail Address does not appear to be valid!',
        product: 'Product Name must be greater than 3 and less than 255 characters!',
        model: 'Product Model must be greater than 3 and less than 64 characters!',
        reason: 'You must select a return product reason!',
      })
    })

    it.each(['sin-arroba', 'a@', '@dominio.com', 'con espacio@correo.com'])('el correo %j no se acepta', async (correo) => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion({ email: correo }))

      // Assert
      expect(res.body.error).to.deep.equal({ email: 'E-Mail Address does not appear to be valid!' })
    })

    it.each([
      [1, true],
      [32, true],
      [33, false],
    ])('nombre de %i caracteres → ¿se acepta? %s (valores límite)', async (largo, seAcepta) => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion({ firstname: 'S'.repeat(largo) }))

      // Assert
      if (seAcepta) {
        expect(res.body.redirect).to.include('route=account/returns.success')
      } else {
        expect(res.body.error).to.deep.equal({ firstname: 'First Name must be between 1 and 32 characters!' })
      }
    })

    it.each([
      [255, true],
      [256, false],
    ])('producto de %i caracteres → ¿se acepta? %s (valores límite)', async (largo, seAcepta) => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion({ product: 'P'.repeat(largo) }))

      // Assert
      expect('redirect' in res.body && String(res.body.redirect).includes('returns.success')).to.equal(seAcepta)
    })

    it('sin motivo de devolución no se acepta', async () => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion({ return_reason_id: 0 }))

      // Assert
      expect(res.body.error).to.deep.equal({ reason: 'You must select a return product reason!' })
    })

    it('una solicitud rechazada no llega al panel', async () => {
      // Arrange
      const datos = nuevaDevolucion({ email: 'sin-arroba' })

      // Act
      await solicitarDevolucion(visitante(), datos)

      // Assert
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
    })

    it('[DEF-11-04] el mensaje del producto coincide con la regla: un nombre de 2 caracteres se rechaza', async () => {
      // Arrange: el mensaje dice "greater than 3", pero la tienda acepta desde 1.
      const datos = nuevaDevolucion({ product: 'ab' })

      // Act
      const res = await solicitarDevolucion(visitante(), datos)

      // Assert
      expect(res.body.error).to.deep.equal({ product: 'Product Name must be greater than 3 and less than 255 characters!' })
    })

    it.each([
      ['con letras', 'abc'],
      ['negativo', -5],
    ])('[DEF-11-01] un número de pedido %s no se acepta', async (_caso, pedido) => {
      // Arrange
      const datos = nuevaDevolucion({ order_id: pedido })

      // Act
      const res = await solicitarDevolucion(visitante(), datos)

      // Assert: hoy se guarda (con pedido 0 o -5) y aparece así en el panel.
      expect(res.body.error).to.have.property('order_id')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
    })

    it.each([0, -3])('[DEF-11-01] una cantidad de %i unidades no se acepta', async (cantidad) => {
      // Arrange
      const datos = nuevaDevolucion({ quantity: cantidad })

      // Act
      const res = await solicitarDevolucion(visitante(), datos)

      // Assert: el panel sí exige cantidad ≥ 1; la tienda no valida nada.
      expect(res.body).to.have.property('error')
    })
  })

  describe('El formulario se envía una sola vez', () => {
    it('el mismo formulario no se puede enviar dos veces: la segunda vuelve al formulario', async () => {
      // Arrange
      const carlos = visitante()
      const token = await tokenDeDevolucion(carlos)
      const datos = nuevaDevolucion()
      await enviarDevolucion(carlos, token, datos)

      // Act
      const segunda = await enviarDevolucion(carlos, token, datos)

      // Assert
      expect(segunda.body.redirect).to.include('route=account/returns.add')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.have.lengthOf(1)
    })
  })

  describe('La administradora cambia el estado', () => {
    it.each([
      ['Pending', ESTADO_DEVOLUCION.pendiente],
      ['Complete', ESTADO_DEVOLUCION.completa],
    ])('al pasarla a "%s", el panel la muestra con ese estado', async (nombre, estado) => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      const res = await cambiarEstadoDeDevolucion(panel, registrada.return_id, estado, 'Revisado por la administradora')
      const [despues] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Assert
      expect(res.body.success).to.equal('Success: You have modified returns!')
      expect(despues.estado).to.equal(nombre)
    })

    it('cada cambio queda en el historial con su comentario', async () => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      await cambiarEstadoDeDevolucion(panel, registrada.return_id, ESTADO_DEVOLUCION.completa, 'Producto recibido y reembolsado')
      const historial = await panel.agente.get(`/admin/index.php?route=sale/returns.history&user_token=${panel.token}&return_id=${registrada.return_id}`)

      // Assert
      expect(historial.text).to.include('Producto recibido y reembolsado')
      expect(historial.text).to.include('Complete')
    })

    it('[DEF-11-02] no se puede poner un estado que no existe', async () => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      const res = await cambiarEstadoDeDevolucion(panel, registrada.return_id, 99, 'Estado inventado')
      const [despues] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Assert: hoy responde "success" y la devolución queda con el estado en blanco.
      expect(res.body).to.have.property('error')
      expect(despues.estado).to.equal('Awaiting Products')
    })
  })
})
