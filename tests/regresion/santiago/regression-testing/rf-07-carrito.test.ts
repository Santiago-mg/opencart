import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRODUCTOS, agregarAlCarrito, cambiarCantidad, carritoDe, quitarDelCarrito, ruta, totalLlamado, visitante } from '../helpers/tienda'

/**
 * RF-07 — Carrito de compras · regression-testing
 * checkout/cart.add · checkout/cart.edit · checkout/cart.remove · checkout/cart.list
 *
 * Las reglas del carrito: cómo se acumulan las cantidades, cómo se calculan
 * los totales (subtotal, impuesto ecológico de $2 por unidad e IVA del 20 %)
 * y qué pasa con el stock antes de dejar pagar.
 */

const { iphone, imac, galaxyTab } = PRODUCTOS

const SIN_EXISTENCIAS = 'Products marked with *** are not available in the desired quantity or not in stock!'

describe('RF-07 · Regresión — carrito de compras', () => {
  it('un visitante nuevo empieza con el carrito vacío', async () => {
    // Act
    const carrito = await carritoDe(visitante())

    // Assert
    expect(carrito.lineas).to.be.empty
  })

  it('agregar un producto crea una línea con su precio ya con impuestos', async () => {
    // Arrange
    const ana = visitante()

    // Act
    await agregarAlCarrito(ana, iphone.id, 1)
    const carrito = await carritoDe(ana)

    // Assert
    expect(carrito.lineas).to.have.lengthOf(1)
    expect(carrito.lineas[0]).to.include({ productoId: iphone.id, nombre: 'iPhone', cantidad: 1, precio: 123.2, total: 123.2 })
  })

  it('agregar dos veces el mismo producto suma la cantidad en una sola línea', async () => {
    // Arrange
    const ana = visitante()
    await agregarAlCarrito(ana, iphone.id, 1)

    // Act
    await agregarAlCarrito(ana, iphone.id, 2)
    const carrito = await carritoDe(ana)

    // Assert
    expect(carrito.lineas).to.have.lengthOf(1)
    expect(carrito.lineas[0].cantidad).to.equal(3)
  })

  it('dos productos distintos quedan en dos líneas', async () => {
    // Arrange
    const ana = visitante()

    // Act
    await agregarAlCarrito(ana, iphone.id, 1)
    await agregarAlCarrito(ana, imac.id, 1)
    const carrito = await carritoDe(ana)

    // Assert
    expect(carrito.lineas.map((linea) => linea.nombre)).to.have.members(['iPhone', 'iMac'])
  })

  describe('Totales', () => {
    it('un iPhone: subtotal 101, impuesto ecológico 2, IVA 20.20 y total 123.20', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, 1)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.totales).to.deep.equal([
        { titulo: 'Sub-Total', valor: 101 },
        { titulo: 'Eco Tax (-2.00)', valor: 2 },
        { titulo: 'VAT (20%)', valor: 20.2 },
        { titulo: 'Total', valor: 123.2 },
      ])
    })

    it.each([
      [1, 123.2],
      [2, 246.4],
      [3, 369.6],
      [10, 1232],
    ])('%i iPhone cuestan %f en total', async (cantidad, total) => {
      // Arrange
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, cantidad)
      const carrito = await carritoDe(ana)

      // Assert
      expect(totalLlamado(carrito, 'Total')).to.equal(total)
    })

    it('el total es la suma de los renglones anteriores', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)
      await agregarAlCarrito(ana, imac.id, 1)

      // Act
      const carrito = await carritoDe(ana)

      // Assert
      const renglones = carrito.totales.filter((renglon) => renglon.titulo !== 'Total')
      const suma = renglones.reduce((acumulado, renglon) => acumulado + renglon.valor, 0)
      expect(totalLlamado(carrito, 'Total')).to.be.closeTo(suma, 0.001)
    })
  })

  describe('Cambiar la cantidad', () => {
    it('recalcula la línea y el total', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      const { lineas } = await carritoDe(ana)

      // Act
      const res = await cambiarCantidad(ana, lineas[0].clave, 3)
      const carrito = await carritoDe(ana)

      // Assert
      expect(res.body.success).to.equal('Success: You have modified your shopping cart!')
      expect(carrito.lineas[0].cantidad).to.equal(3)
      expect(totalLlamado(carrito, 'Total')).to.equal(369.6)
    })

    it('[DEF-07-03] el total de la línea es el precio por la cantidad', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, 3)
      const carrito = await carritoDe(ana)

      // Assert: 3 × 123.20 = 369.60, que es lo que cobra el renglón "Total".
      // Hoy la línea muestra 365.60: suma el impuesto ecológico una sola vez.
      expect(carrito.lineas[0].total).to.equal(369.6)
      expect(carrito.lineas[0].total).to.equal(totalLlamado(carrito, 'Total'))
    })

    it('poner la cantidad en 0 quita el producto', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 2)
      await agregarAlCarrito(ana, imac.id, 1)
      const { lineas } = await carritoDe(ana)
      const delIphone = lineas.find((linea) => linea.productoId === iphone.id)!

      // Act
      await cambiarCantidad(ana, delIphone.clave, 0)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.lineas.map((linea) => linea.nombre)).to.deep.equal(['iMac'])
    })
  })

  describe('Quitar', () => {
    it('quitar un producto deja los demás', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      await agregarAlCarrito(ana, imac.id, 1)
      const { lineas } = await carritoDe(ana)
      const delIphone = lineas.find((linea) => linea.productoId === iphone.id)!

      // Act
      const res = await quitarDelCarrito(ana, delIphone.clave)
      const carrito = await carritoDe(ana)

      // Assert
      expect(res.body.success).to.equal('Success: You have removed an item from your shopping cart!')
      expect(carrito.lineas.map((linea) => linea.nombre)).to.deep.equal(['iMac'])
    })

    it('quitar el único producto deja el carrito vacío', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)
      const { lineas } = await carritoDe(ana)

      // Act
      await quitarDelCarrito(ana, lineas[0].clave)
      const pagina = await ana.get(ruta('checkout/cart'))

      // Assert
      expect((await carritoDe(ana)).lineas).to.be.empty
      expect(pagina.text).to.include('Your shopping cart is empty!')
    })
  })

  describe('Existencias', () => {
    it('un producto agotado se puede agregar, pero el carrito lo marca y avisa', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, galaxyTab.id, 1)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.lineas[0].sinStock).to.equal(true)
      expect(carrito.avisos).to.include(SIN_EXISTENCIAS)
    })

    it('pedir más unidades de las que hay también marca la línea', async () => {
      // Arrange: de iPhone hay 970 unidades.
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, 971)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.lineas[0].sinStock).to.equal(true)
    })

    it('pedir justo las que hay no marca nada (valor límite)', async () => {
      // Arrange
      const ana = visitante()

      // Act
      await agregarAlCarrito(ana, iphone.id, 970)
      const carrito = await carritoDe(ana)

      // Assert
      expect(carrito.lineas[0].sinStock).to.equal(false)
      expect(carrito.avisos).to.be.empty
    })

    it('con un producto agotado no se puede pasar a pagar: vuelve al carrito', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, galaxyTab.id, 1)

      // Act
      const res = await ana.get(ruta('checkout/checkout')).redirects(0).ok(() => true)

      // Assert
      expect(res.status).to.equal(302)
      expect(res.headers.location).to.include('route=checkout/cart')
    })

    it('con el carrito vacío tampoco se puede pasar a pagar', async () => {
      // Act
      const res = await visitante().get(ruta('checkout/checkout')).redirects(0).ok(() => true)

      // Assert
      expect(res.status).to.equal(302)
      expect(res.headers.location).to.include('route=checkout/cart')
    })

    it('con productos disponibles sí deja pasar a pagar', async () => {
      // Arrange
      const ana = visitante()
      await agregarAlCarrito(ana, iphone.id, 1)

      // Act
      const res = await ana.get(ruta('checkout/checkout')).redirects(0).ok(() => true)

      // Assert
      expect(res.status).to.equal(200)
    })
  })

  it('el botón del encabezado resume cuántos productos hay y cuánto suman', async () => {
    // Arrange
    const ana = visitante()
    await agregarAlCarrito(ana, iphone.id, 2)

    // Act
    const res = await ana.get(ruta('common/cart.info'))

    // Assert
    expect(res.text).to.include('2 item(s) - $246.40')
  })
})
