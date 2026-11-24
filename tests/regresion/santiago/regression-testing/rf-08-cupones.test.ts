import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { AYER, MANANA, type Panel, borrarCuponesDePrueba, cupon, editarCupon, iniciarSesionEnElPanel, publicarCupon } from '../helpers/panel'
import {
  CUPON_APLICADO, CUPON_RECHAZADO, PRODUCTOS,
  agregarAlCarrito, aplicarCupon, carritoDe, quitarCupon, totalLlamado, visitante,
} from '../helpers/tienda'

/**
 * RF-08 — Cupones de descuento · regression-testing
 * extension/opencart/checkout/coupon.save · coupon.remove
 *
 * Las reglas de un cupón: cuánto descuenta (porcentaje o monto fijo), cuándo
 * está vigente, cuál es la compra mínima y a qué productos aplica. Cada
 * prueba publica su propio cupón desde el panel y al final se borran todos.
 */

const { iphone, imac } = PRODUCTOS
const HOY = new Date().toISOString().slice(0, 10)

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarCuponesDePrueba(panel)
})

/** Un visitante con un iPhone en el carrito (subtotal 101, total 123.20). */
async function clienteConUnIphone() {
  const ana = visitante()
  await agregarAlCarrito(ana, iphone.id, 1)
  return ana
}

describe('RF-08 · Regresión — cupones de descuento', () => {
  describe('Cuánto descuenta', () => {
    it('10 % sobre un iPhone: descuenta 10.10 y el IVA se calcula sobre lo que queda', async () => {
      // Arrange
      const diezPorCiento = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }))
      const ana = await clienteConUnIphone()

      // Act
      await aplicarCupon(ana, diezPorCiento.code)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.totales).to.deep.equal([
        { titulo: 'Sub-Total', valor: 101 },
        { titulo: `Coupon (${diezPorCiento.code})`, valor: -10.1 },
        { titulo: 'Eco Tax (-2.00)', valor: 2 },
        { titulo: 'VAT (20%)', valor: 18.18 },
        { titulo: 'Total', valor: 111.08 },
      ])
    })

    it('monto fijo de 10: descuenta exactamente 10', async () => {
      // Arrange
      const diezDolares = await publicarCupon(panel, cupon({ type: 'F', discount: 10 }))
      const ana = await clienteConUnIphone()

      // Act
      await aplicarCupon(ana, diezDolares.code)
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, `Coupon (${diezDolares.code})`)).to.equal(-10)
      expect(totalLlamado(carrito, 'Total')).to.equal(111.2)
    })

    it('un monto fijo mayor que la compra descuenta solo hasta el subtotal', async () => {
      // Arrange
      const quinientos = await publicarCupon(panel, cupon({ type: 'F', discount: 500 }))
      const ana = await clienteConUnIphone()

      // Act
      await aplicarCupon(ana, quinientos.code)
      const carrito = await carritoDe(ana)

      // Assert: queda por pagar solo el impuesto ecológico.
      expect(totalLlamado(carrito, `Coupon (${quinientos.code})`)).to.equal(-101)
      expect(totalLlamado(carrito, 'Total')).to.equal(2)
    })

    it('el porcentaje se aplica sobre todos los productos del carrito', async () => {
      // Arrange
      const diezPorCiento = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }))
      const ana = await clienteConUnIphone()
      await agregarAlCarrito(ana, imac.id, 1)

      // Act
      await aplicarCupon(ana, diezPorCiento.code)
      const carrito = await carritoDe(ana)

      // Assert: 10 % de 201
      expect(totalLlamado(carrito, `Coupon (${diezPorCiento.code})`)).to.equal(-20.1)
    })

    it('el descuento se recalcula si después se agregan más productos', async () => {
      // Arrange
      const diezPorCiento = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }))
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, diezPorCiento.code)

      // Act
      await agregarAlCarrito(ana, iphone.id, 1)
      const carrito = await carritoDe(ana)

      // Assert: 10 % de 202
      expect(totalLlamado(carrito, `Coupon (${diezPorCiento.code})`)).to.equal(-20.2)
    })

    it('un cupón limitado a un producto solo descuenta sobre ese producto', async () => {
      // Arrange
      const soloImac = await publicarCupon(panel, cupon({ type: 'P', discount: 10 }), [imac.id])
      const ana = await clienteConUnIphone()
      await agregarAlCarrito(ana, imac.id, 1)

      // Act
      await aplicarCupon(ana, soloImac.code)
      const carrito = await carritoDe(ana)

      // Assert: 10 % de los 100 del iMac, no de los 201 del carrito.
      expect(totalLlamado(carrito, `Coupon (${soloImac.code})`)).to.equal(-10)
    })

    it('un cupón limitado a un producto se rechaza si ese producto no está en el carrito', async () => {
      // Arrange
      const soloImac = await publicarCupon(panel, cupon(), [imac.id])
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, soloImac.code)

      // Assert
      expect(res.body.error).to.equal(CUPON_RECHAZADO)
    })
  })

  describe('Vigencia', () => {
    it.each([
      ['venció ayer', { date_end: AYER }],
      ['empieza mañana', { date_start: MANANA }],
      ['está deshabilitado', { status: 0 as const }],
      ['es solo para clientes con sesión iniciada', { logged: 1 as const }],
    ])('un cupón que %s se rechaza y el total no cambia', async (_caso, cambios) => {
      // Arrange
      const noSirve = await publicarCupon(panel, cupon(cambios))
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, noSirve.code)
      const carrito = await carritoDe(ana)

      // Assert
      expect(res.body.error).to.equal(CUPON_RECHAZADO)
      expect(totalLlamado(carrito, 'Total')).to.equal(123.2)
    })

    it('un cupón que empezó ayer y termina mañana sí sirve', async () => {
      // Arrange
      const vigente = await publicarCupon(panel, cupon({ date_start: AYER, date_end: MANANA }))
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, vigente.code)

      // Assert
      expect(res.body.success).to.equal(CUPON_APLICADO)
    })

    it('[DEF-08-02] un cupón cuya fecha final es hoy todavía sirve hoy', async () => {
      // Arrange
      const hastaHoy = await publicarCupon(panel, cupon({ date_start: AYER, date_end: HOY }))
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, hastaHoy.code)

      // Assert: hoy la tienda lo rechaza desde las 00:00 de su último día.
      expect(res.body.success).to.equal(CUPON_APLICADO)
    })

    it('si la administradora lo deshabilita después de aplicado, el descuento desaparece', async () => {
      // Arrange
      const temporal = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, temporal.code)

      // Act
      await editarCupon(panel, { ...temporal, status: 0 })
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.totales.map((renglon) => renglon.titulo)).to.not.include(`Coupon (${temporal.code})`)
      expect(totalLlamado(carrito, 'Total')).to.equal(123.2)
    })
  })

  describe('Compra mínima', () => {
    it('si la compra es menor que el mínimo, se rechaza', async () => {
      // Arrange: el iPhone suma 101.
      const desde500 = await publicarCupon(panel, cupon({ total: 500 }))
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, desde500.code)

      // Assert
      expect(res.body.error).to.equal(CUPON_RECHAZADO)
    })

    it.each([
      [100.99, true],
      [101, true],
      [101.01, false],
    ])('con mínimo %f y una compra de 101 → ¿sirve? %s (valor límite)', async (minimo, sirve) => {
      // Arrange
      const conMinimo = await publicarCupon(panel, cupon({ total: minimo }))
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, conMinimo.code)

      // Assert
      expect(res.body.success === CUPON_APLICADO).to.equal(sirve)
    })

    it('al completar el mínimo agregando otro producto, el cupón pasa a servir', async () => {
      // Arrange
      const desde150 = await publicarCupon(panel, cupon({ total: 150 }))
      const ana = await clienteConUnIphone()
      const antes = await aplicarCupon(ana, desde150.code)

      // Act
      await agregarAlCarrito(ana, imac.id, 1)
      const despues = await aplicarCupon(ana, desde150.code)

      // Assert
      expect(antes.body.error).to.equal(CUPON_RECHAZADO)
      expect(despues.body.success).to.equal(CUPON_APLICADO)
    })
  })

  describe('Usar el cupón', () => {
    it('un código que no existe se rechaza', async () => {
      // Arrange
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, 'NO-EXISTE-123')

      // Assert
      expect(res.body.error).to.equal(CUPON_RECHAZADO)
    })

    it('el código no distingue mayúsculas de minúsculas', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()

      // Act
      const res = await aplicarCupon(ana, valido.code.toLowerCase())

      // Assert
      expect(res.body.success).to.equal(CUPON_APLICADO)
    })

    it('solo vale un cupón a la vez: el segundo reemplaza al primero', async () => {
      // Arrange
      const primero = await publicarCupon(panel, cupon({ type: 'F', discount: 5 }))
      const segundo = await publicarCupon(panel, cupon({ type: 'F', discount: 20 }))
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, primero.code)

      // Act
      await aplicarCupon(ana, segundo.code)
      const carrito = await carritoDe(ana)

      // Assert
      const cupones = carrito.totales.filter((renglon) => renglon.titulo.startsWith('Coupon'))
      expect(cupones).to.deep.equal([{ titulo: `Coupon (${segundo.code})`, valor: -20 }])
    })

    it('un intento fallido no borra el cupón que ya estaba aplicado', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon({ type: 'F', discount: 10 }))
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, valido.code)

      // Act
      await aplicarCupon(ana, 'NO-EXISTE-123')
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, `Coupon (${valido.code})`)).to.equal(-10)
    })

    it('quitar el cupón devuelve el total a su valor original', async () => {
      // Arrange
      const valido = await publicarCupon(panel, cupon())
      const ana = await clienteConUnIphone()
      await aplicarCupon(ana, valido.code)

      // Act
      await quitarCupon(ana)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.totales.map((renglon) => renglon.titulo)).to.deep.equal(['Sub-Total', 'Eco Tax (-2.00)', 'VAT (20%)', 'Total'])
      expect(totalLlamado(carrito, 'Total')).to.equal(123.2)
    })
  })
})
