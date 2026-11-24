import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import {
  type Panel, anotarCuponParaBorrar, borrarCuponesDePrueba, codigoUnico, cupon, enviarAlPanel, iniciarSesionEnElPanel, publicarCupon,
} from '../helpers/panel'
import { CUPON_APLICADO, CUPON_RECHAZADO, PRODUCTOS, agregarAlCarrito, aplicarCupon, enviar, quitarCupon, visitante } from '../helpers/tienda'

/**
 * RF-08 — Cupones de descuento · API testing
 * Tienda: POST extension/opencart/checkout/coupon.save { coupon } · coupon.remove
 * Panel:  POST marketing/coupon.save { name, code, type, discount, total, ... }
 *
 * El contrato JSON de aplicar y quitar un cupón en la tienda, y el de
 * publicarlo en el panel con sus validaciones de nombre y código.
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

/** Intenta guardar un cupón en el panel y, si quedó creado, lo anota para borrarlo. */
async function guardarEnElPanel(datos: object) {
  const res = await enviarAlPanel(panel, 'marketing/coupon.save', { coupon_id: 0, ...datos })
  anotarCuponParaBorrar(res.body.coupon_id)
  return res
}

describe('RF-08 · API — cupones de descuento', () => {
  describe('POST extension/opencart/checkout/coupon.save', () => {
    it('cupón válido: 200 y { success }', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, valido.code)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^application\/json/)
      expect(res.body).to.deep.equal({ success: CUPON_APLICADO })
    })

    it.each([
      ['un código que no existe', 'NO-EXISTE-123'],
      ['un código vacío', ''],
    ])('%s: 200 y { error } con un único mensaje', async (_caso, codigo) => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, codigo)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ error: CUPON_RECHAZADO })
    })

    it('sin el campo coupon responde lo mismo que un código vacío', async () => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await enviar(ana, 'extension/opencart/checkout/coupon.save', {})

      // Assert
      expect(res.body).to.deep.equal({ error: CUPON_RECHAZADO })
    })
  })

  describe('POST extension/opencart/checkout/coupon.remove', () => {
    it('quitar un cupón aplicado responde { success }', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, valido.code)

      // Act
      const res = await quitarCupon(ana)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.have.all.keys('success')
    })

    it('[DEF-08-01] el mensaje al quitar el cupón es una frase, no el nombre interno del texto', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, valido.code)

      // Act
      const res = await quitarCupon(ana)

      // Assert: hoy responde literalmente "text_remove".
      expect(res.body.success).to.not.equal('text_remove')
      expect(res.body.success).to.match(/^Success: /)
    })

    it('[DEF-08-01] quitar sin tener cupón responde un error legible', async () => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await quitarCupon(ana)

      // Assert: hoy responde literalmente "error_remove".
      expect(res.body).to.have.all.keys('error')
      expect(res.body.error).to.not.equal('error_remove')
    })
  })

  describe('POST marketing/coupon.save (panel)', () => {
    it('cupón nuevo: { coupon_id, success }', async () => {
      // Act
      const res = await guardarEnElPanel(cupon())

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.have.all.keys('coupon_id', 'success')
      expect(res.body.coupon_id).to.be.a('number')
      expect(res.body.success).to.equal('Success: You have modified coupons!')
    })

    it('código repetido: error.code y no se crea', async () => {
      // Arrange
      const existente = await publicarCupon(panel, cupon())

      // Act
      const res = await guardarEnElPanel(cupon({ code: existente.code }))

      // Assert
      expect(res.body).to.deep.equal({ error: { code: 'Warning: Coupon code is already in use!' } })
    })

    it.each([
      [2, false],
      [3, true],
      [20, true],
      [21, false],
    ])('código de %i caracteres → ¿se acepta? %s (valores límite)', async (largo, seAcepta) => {
      // Arrange
      const codigo = codigoUnico('Z').padEnd(largo, 'X').slice(0, largo)

      // Act
      const res = await guardarEnElPanel(cupon({ code: codigo }))

      // Assert
      if (seAcepta) {
        expect(res.body).to.have.property('coupon_id')
      } else {
        expect(res.body.error).to.deep.equal({ code: 'Code must be between 3 and 20 characters!' })
      }
    })

    it.each([
      [2, false],
      [3, true],
      [128, true],
      [129, false],
    ])('nombre de %i caracteres → ¿se acepta? %s (valores límite)', async (largo, seAcepta) => {
      // Act
      const res = await guardarEnElPanel(cupon({ name: 'N'.repeat(largo) }))

      // Assert
      if (seAcepta) {
        expect(res.body).to.have.property('coupon_id')
      } else {
        expect(res.body.error).to.deep.equal({ name: 'Coupon Name must be between 3 and 128 characters!' })
      }
    })

    it.each([
      ['un porcentaje mayor que 100', { type: 'P' as const, discount: 150 }],
      ['un descuento negativo', { type: 'F' as const, discount: -20 }],
    ])('[DEF-08-03] el panel no deja guardar %s', async (_caso, cambios) => {
      // Act
      const res = await guardarEnElPanel(cupon(cambios))

      // Assert: hoy lo guarda sin avisar.
      expect(res.body).to.have.property('error')
      expect(res.body).to.not.have.property('coupon_id')
    })
  })
})
