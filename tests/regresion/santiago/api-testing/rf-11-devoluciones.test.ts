import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { ESTADO_DEVOLUCION, type Panel, borrarDevolucionesDe, cambiarEstadoDeDevolucion, devolucionesEnElPanel, iniciarSesionEnElPanel } from '../helpers/panel'
import { revelaDetallesInternos } from '../helpers/seguridad'
import { type Devolucion, clienteDe, devolucion, enviarDevolucion, ruta, solicitarDevolucion, tokenDeDevolucion, visitante } from '../helpers/tienda'

/**
 * RF-11 — Devoluciones · API testing
 * Tienda: GET  account/returns.add                       (formulario con su token)
 *         POST account/returns.save&return_token { order_id, firstname, ... }
 * Panel:  POST sale/returns.addHistory&return_id { return_status_id, comment, notify }
 *
 * El contrato JSON de enviar la solicitud y el de cambiarle el estado.
 */

let panel: Panel
const clientes: string[] = []

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

describe('RF-11 · API — devoluciones', () => {
  describe('GET account/returns.add', () => {
    it('200 y un formulario con un token de 26 caracteres en su dirección de envío', async () => {
      // Act
      const res = await visitante().get(ruta('account/returns.add'))

      // Assert
      expect(res.status).to.equal(200)
      expect(res.text).to.match(/route=account\/returns\.save[^"]*return_token=[a-f0-9]{26}"/)
    })

    it('ofrece los cinco motivos de devolución', async () => {
      // Act
      const res = await visitante().get(ruta('account/returns.add'))

      // Assert
      const motivos = [...res.text.matchAll(/name="return_reason_id" value="(\d+)"/g)].map((m) => Number(m[1]))
      expect(motivos).to.have.members([1, 2, 3, 4, 5])
    })
  })

  describe('POST account/returns.save', () => {
    it('solicitud válida: 200 y { redirect } a la confirmación', async () => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion())

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^application\/json/)
      expect(res.body).to.have.all.keys('redirect')
      expect(res.body.redirect).to.include('route=account/returns.success')
    })

    it.each([
      ['sin token', ''],
      ['con un token inventado', 'f'.repeat(26)],
    ])('%s: { redirect } de vuelta al formulario y no se guarda', async (_caso, token) => {
      // Arrange
      const carlos = visitante()
      await tokenDeDevolucion(carlos)
      const datos = nuevaDevolucion()

      // Act
      const res = await enviarDevolucion(carlos, token, datos)

      // Assert
      expect(res.body).to.have.all.keys('redirect')
      expect(res.body.redirect).to.include('route=account/returns.add')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
    })

    it('los errores vienen por campo dentro de error', async () => {
      // Act
      const res = await solicitarDevolucion(visitante(), nuevaDevolucion({ order_id: '', email: 'x', return_reason_id: 0 }))

      // Assert
      expect(res.body).to.have.all.keys('error')
      expect(res.body.error).to.have.all.keys('order_id', 'email', 'reason')
    })

    it('[DEF-11-05] sin el campo oculto product_id, la respuesta sigue siendo JSON', async () => {
      // Arrange: el formulario lo manda vacío; aquí no se manda.
      const { product_id: _sinEsto, ...sinProductId } = nuevaDevolucion()

      // Act
      const res = await solicitarDevolucion(visitante(), sinProductId)

      // Assert: hoy llega un aviso de PHP con la ruta del servidor antes del JSON.
      expect(res.body, 'la respuesta no es JSON').to.not.have.property('respuestaNoJson')
      expect(revelaDetallesInternos(JSON.stringify(res.body))).to.equal(false)
    })
  })

  describe('POST sale/returns.addHistory (panel)', () => {
    it('cambio de estado: 200 y { success }', async () => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      const res = await cambiarEstadoDeDevolucion(panel, registrada.return_id, ESTADO_DEVOLUCION.completa, 'Listo')

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ success: 'Success: You have modified returns!' })
    })

    it('una devolución que no existe: { error }', async () => {
      // Act
      const res = await cambiarEstadoDeDevolucion(panel, 99999999, ESTADO_DEVOLUCION.completa)

      // Assert
      expect(res.body).to.have.all.keys('error')
    })

    it('[DEF-11-03] el error de "devolución no encontrada" es una frase, no el nombre interno del texto', async () => {
      // Act
      const res = await cambiarEstadoDeDevolucion(panel, 99999999, ESTADO_DEVOLUCION.completa)

      // Assert: hoy responde literalmente "error_return".
      expect(res.body.error).to.not.equal('error_return')
    })
  })
})
