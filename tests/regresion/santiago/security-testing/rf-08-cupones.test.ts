import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { type Panel, borrarCuponesDePrueba, cupon, iniciarSesionEnElPanel, publicarCupon } from '../helpers/panel'
import { INYECCIONES_SQL, XSS_SCRIPT, revelaDetallesInternos, textoCompleto } from '../helpers/seguridad'
import {
  CUPON_APLICADO, CUPON_RECHAZADO, NAVEGADOR, PRODUCTOS, URL_TIENDA,
  agregarAlCarrito, aplicarCupon, carritoDe, enviar, totalLlamado, visitante,
} from '../helpers/tienda'
import request from 'supertest'

/**
 * RF-08 — Cupones de descuento · security-testing
 *
 * Un cupón es dinero: solo la administradora puede crearlos, el descuento lo
 * calcula la tienda (no el navegador) y el campo del código no se puede usar
 * para llegar a la base de datos ni para adivinar códigos sin límite.
 */

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarCuponesDePrueba(panel)
})

async function clienteConUnIphone() {
  const ana = visitante()
  await agregarAlCarrito(ana, PRODUCTOS.iphone.id, 1)
  return ana
}

/** Intenta publicar un cupón en el panel sin ser la administradora. */
const publicarSinPermiso = (quien: ReturnType<typeof request.agent>, token: string, datos: object) =>
  quien.post(`/admin/index.php?route=marketing/coupon.save&user_token=${token}`).type('form').send({ coupon_id: 0, ...datos })

describe('RF-08 · Seguridad — cupones de descuento', () => {
  describe('Solo la administradora publica cupones', () => {
    it.each([
      ['sin sesión y sin token', () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR), () => ''],
      ['sin sesión, con un token inventado', () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR), () => 'a'.repeat(32)],
      ['sin sesión, con el token de la administradora (robado)', () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR), () => panel.token],
      ['con la sesión de la administradora, pero con otro token', () => panel.agente, () => 'b'.repeat(32)],
    ])('%s: el cupón no se crea', async (_caso, quien, token) => {
      // Arrange
      const intruso = cupon({ type: 'P', discount: 100 })

      // Act
      const res = await publicarSinPermiso(quien(), token(), intruso)
      const ana = await clienteConUnIphone()
      const uso = await aplicarCupon(ana, intruso.code)

      // Assert: llega la pantalla de ingreso, no un "success", y el código no sirve.
      expect(res.text).to.not.include('coupon_id')
      expect(uso.body.error).to.equal(CUPON_RECHAZADO)
    })
  })

  describe('El descuento lo calcula la tienda', () => {
    it('mandar el descuento en el formulario no lo cambia', async () => {
      // Arrange
      const diezPorCiento = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }))
      const ana = await clienteConUnIphone()

      // Act
      await enviar(ana, 'extension/opencart/checkout/coupon.save', { coupon: diezPorCiento.code, discount: 100, type: 'F', total: 0 })
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, `Coupon (${diezPorCiento.code})`)).to.equal(-10.1)
    })

    it('el cupón de Ana no descuenta en el carrito de Carlos', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      const carlos = await clienteConUnIphone()

      // Act
      await aplicarCupon(ana, valido.code)

      // Assert
      expect(totalLlamado(await carritoDe(carlos), 'Total')).to.equal(123.2)
    })

    it('ni con un cupón del 100 % el total queda negativo', async () => {
      // Arrange
      const gratis = await publicarCupon(panel, cupon({ type: 'P', discount: 100 }))
      const ana = await clienteConUnIphone()

      // Act
      await aplicarCupon(ana, gratis.code)
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, 'Total')).to.be.at.least(0)
    })
  })

  describe('Inyección por el campo del código', () => {
    it.each(INYECCIONES_SQL)('coupon=%j (%s) se rechaza como un código cualquiera', async (ataque) => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, ataque)

      // Assert
      expect(res.body).to.deep.equal({ error: CUPON_RECHAZADO })
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
    })

    it('un script como código no vuelve en la respuesta ni en el carrito', async () => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, XSS_SCRIPT)
      const carrito = await carritoDe(ana)

      // Assert
      expect(textoCompleto(res)).to.not.include(XSS_SCRIPT)
      expect(carrito.html).to.not.include(XSS_SCRIPT)
    })

    it('un código de 5.000 caracteres se rechaza sin error interno', async () => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, 'A'.repeat(5000))

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ error: CUPON_RECHAZADO })
    })
  })

  describe('Adivinar códigos', () => {
    it('el mensaje de rechazo es el mismo exista o no el cupón: no revela cuáles códigos son reales', async () => {
      // Arrange
      const vencido = await publicarCupon(panel, cupon({ date_end: '2020-01-01' }))
      const ana = await clienteConUnIphone()

      // Act
      const existePeroVencio = await aplicarCupon(ana, vencido.code)
      const noExiste = await aplicarCupon(ana, 'NO-EXISTE-123')

      // Assert
      expect(existePeroVencio.body).to.deep.equal(noExiste.body)
    })

    it('[DEF-08-04] después de veinte códigos equivocados seguidos la tienda frena los intentos', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      for (let intento = 0; intento < 20; intento++) await aplicarCupon(ana, `ADIVINA${intento}`)

      // Act
      const res = await aplicarCupon(ana, valido.code)

      // Assert: hoy el intento 21 pasa como si nada; no hay ningún límite.
      expect(res.body.success).to.not.equal(CUPON_APLICADO)
    })
  })
})
