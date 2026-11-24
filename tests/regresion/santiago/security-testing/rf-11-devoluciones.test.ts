import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import request from 'supertest'
import { ESTADO_DEVOLUCION, type Panel, borrarDevolucionesDe, devolucionesEnElPanel, iniciarSesionEnElPanel, rutaPanel } from '../helpers/panel'
import { INYECCIONES_SQL, XSS_IMAGEN, XSS_SCRIPT, revelaDetallesInternos, textoCompleto, traeHtmlInyectado } from '../helpers/seguridad'
import {
  type Devolucion, NAVEGADOR, URL_TIENDA,
  clienteDe, devolucion, enviarDevolucion, solicitarDevolucion, tokenDeDevolucion, visitante,
} from '../helpers/tienda'

/**
 * RF-11 — Devoluciones · security-testing
 *
 * El formulario de devoluciones lo puede llenar cualquiera, sin cuenta, y lo
 * que escribe lo lee después la administradora en el panel. Aquí se comprueba
 * que el formulario no se pueda enviar desde otro sitio, que el visitante no
 * pueda decidir el estado de su devolución y que lo que escribe no se ejecute
 * en el navegador de la administradora.
 */

let panel: Panel
const clientes: string[] = []

function nuevaDevolucion(cambios: Devolucion = {}): Devolucion {
  const datos = devolucion(cambios)
  clientes.push(clienteDe(datos))
  return datos
}

const sinSesion = () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR)

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  for (const cliente of clientes) await borrarDevolucionesDe(panel, cliente)
})

describe('RF-11 · Seguridad — devoluciones', () => {
  describe('El formulario solo se envía desde la tienda (token)', () => {
    it('el token del formulario de Ana no le sirve a Carlos', async () => {
      // Arrange
      const tokenDeAna = await tokenDeDevolucion(visitante())
      const carlos = visitante()
      await tokenDeDevolucion(carlos)
      const datos = nuevaDevolucion()

      // Act
      const res = await enviarDevolucion(carlos, tokenDeAna, datos)

      // Assert
      expect(res.body.redirect).to.include('route=account/returns.add')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
    })

    it('sin haber abierto el formulario no se puede enviar una solicitud', async () => {
      // Arrange
      const datos = nuevaDevolucion()

      // Act
      const res = await enviarDevolucion(visitante(), 'a'.repeat(26), datos)

      // Assert
      expect(res.body.redirect).to.include('route=account/returns.add')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
    })
  })

  describe('El visitante no decide lo que le corresponde a la administradora', () => {
    it('mandar return_status_id en el formulario no cambia el estado inicial', async () => {
      // Arrange
      const datos = nuevaDevolucion({ return_status_id: ESTADO_DEVOLUCION.completa, return_action_id: 1 })

      // Act
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Assert
      expect(registrada.estado).to.equal('Awaiting Products')
    })

    it.each([
      ['sin sesión', () => 'c'.repeat(32)],
      ['sin sesión, con el token de la administradora', () => panel.token],
    ])('%s no se puede cambiar el estado desde el panel', async (_caso, token) => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      await sinSesion()
        .post(rutaPanel('sale/returns.addHistory', token(), { return_id: registrada.return_id }))
        .type('form')
        .send({ return_status_id: ESTADO_DEVOLUCION.completa, comment: 'intruso', notify: 0 })
      const [despues] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Assert
      expect(despues.estado).to.equal('Awaiting Products')
    })

    it('sin sesión, la lista de devoluciones del panel no muestra datos de los clientes', async () => {
      // Arrange
      const datos = nuevaDevolucion()
      await solicitarDevolucion(visitante(), datos)

      // Act
      const res = await sinSesion().get(rutaPanel('sale/returns.list', panel.token))

      // Assert: llega la pantalla de ingreso.
      expect(res.text).to.not.include(String(datos.lastname))
      expect(res.text).to.include('name="username"')
    })
  })

  describe('XSS almacenado: lo que escribe el cliente lo lee la administradora', () => {
    it.each([
      ['un script en el nombre del producto', { product: XSS_SCRIPT }],
      ['una imagen con onerror en el modelo', { model: XSS_IMAGEN }],
    ])('%s se muestra como texto en la lista del panel', async (_caso, cambios) => {
      // Arrange
      const datos = nuevaDevolucion(cambios)
      await solicitarDevolucion(visitante(), datos)

      // Act
      const lista = await panel.agente.get(rutaPanel('sale/returns.list', panel.token, { filter_customer: clienteDe(datos) }))

      // Assert
      expect(lista.text).to.include(String(datos.lastname))
      expect(traeHtmlInyectado(lista.text)).to.equal(false)
    })

    it('un script en el comentario se muestra como texto al abrir la devolución en el panel', async () => {
      // Arrange
      const datos = nuevaDevolucion({ comment: `${XSS_SCRIPT} ${XSS_IMAGEN}` })
      await solicitarDevolucion(visitante(), datos)
      const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))

      // Act
      const ficha = await panel.agente.get(rutaPanel('sale/returns.form', panel.token, { return_id: registrada.return_id }))

      // Assert
      expect(ficha.text).to.include(String(datos.lastname))
      expect(traeHtmlInyectado(ficha.text)).to.equal(false)
    })
  })

  describe('Inyección SQL', () => {
    it.each(INYECCIONES_SQL)('product=%j (%s) se guarda como texto', async (ataque) => {
      // Arrange
      const datos = nuevaDevolucion({ product: ataque })

      // Act
      const res = await solicitarDevolucion(visitante(), datos)

      // Assert
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
      expect(res.body.redirect).to.include('route=account/returns.success')
      expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.have.lengthOf(1)
    })

    it.each(INYECCIONES_SQL)('filter_customer=%j (%s) en el panel no rompe la lista', async (ataque) => {
      // Act
      const lista = await panel.agente.get(rutaPanel('sale/returns.list', panel.token, { filter_customer: ataque }))

      // Assert
      expect(lista.status).to.equal(200)
      expect(revelaDetallesInternos(lista.text)).to.equal(false)
    })
  })

  it('[DEF-11-06] no se acepta la devolución de un pedido que no existe', async () => {
    // Arrange: el pedido 99999999 no existe (la tienda de pruebas solo tiene sembrados el 1234 y el 4321).
    const datos = nuevaDevolucion({ order_id: 99999999 })

    // Act
    const res = await solicitarDevolucion(visitante(), datos)

    // Assert: hoy cualquiera registra devoluciones de pedidos inventados o ajenos.
    expect(res.body).to.have.property('error')
    expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.be.empty
  })
})
