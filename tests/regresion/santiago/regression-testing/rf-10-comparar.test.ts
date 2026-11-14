import { expect } from 'chai'
import { describe, it } from 'vitest'
import { COMPARACION_VACIA, PRODUCTOS, compararProducto, contenidoDe, filaDeComparacion, listaDeComparacion, ruta, visitante } from '../helpers/tienda'

/**
 * RF-10 — Comparar productos · regression-testing
 * product/compare.add · product/compare · product/compare&remove
 *
 * Las reglas de la lista de comparación: máximo cuatro productos, sale el más
 * antiguo cuando entra el quinto, no hay repetidos, y la tabla muestra los
 * datos de cada producto en su columna.
 */

const { iphone, imac, macbook, macbookAir, macbookPro, galaxyTab } = PRODUCTOS

const nombres = async (quien: ReturnType<typeof visitante>) => (await listaDeComparacion(quien)).productos.map((p) => p.nombre)

describe('RF-10 · Regresión — comparar productos', () => {
  it('un visitante nuevo no tiene nada para comparar', async () => {
    // Act
    const { productos, html } = await listaDeComparacion(visitante())

    // Assert
    expect(productos).to.be.empty
    expect(contenidoDe(html)).to.include(COMPARACION_VACIA)
  })

  it('al agregar un producto, aparece en la página de comparación', async () => {
    // Arrange
    const ana = visitante()

    // Act
    await compararProducto(ana, iphone.id)

    // Assert
    expect(await nombres(ana)).to.deep.equal(['iPhone'])
  })

  it('los productos salen en el orden en que se agregaron', async () => {
    // Arrange
    const ana = visitante()

    // Act
    await compararProducto(ana, macbook.id)
    await compararProducto(ana, iphone.id)
    await compararProducto(ana, imac.id)

    // Assert
    expect(await nombres(ana)).to.deep.equal(['MacBook', 'iPhone', 'iMac'])
  })

  it('el contador sube con cada producto: (1), (2), (3), (4)', async () => {
    // Arrange
    const ana = visitante()
    const contadores: string[] = []

    // Act
    for (const producto of [iphone, imac, macbook, macbookAir]) {
      contadores.push((await compararProducto(ana, producto.id)).body.total)
    }

    // Assert
    expect(contadores).to.deep.equal(['Product Compare (1)', 'Product Compare (2)', 'Product Compare (3)', 'Product Compare (4)'])
  })

  describe('Máximo cuatro productos', () => {
    it('con cuatro en la lista, el quinto entra y sale el más antiguo', async () => {
      // Arrange
      const ana = visitante()
      for (const producto of [iphone, imac, macbook, macbookAir]) await compararProducto(ana, producto.id)

      // Act
      const res = await compararProducto(ana, macbookPro.id)

      // Assert
      expect(res.body.total).to.equal('Product Compare (4)')
      expect(await nombres(ana)).to.deep.equal(['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro'])
    })

    it('con tres en la lista, el cuarto entra sin sacar a nadie (valor límite)', async () => {
      // Arrange
      const ana = visitante()
      for (const producto of [iphone, imac, macbook]) await compararProducto(ana, producto.id)

      // Act
      await compararProducto(ana, macbookAir.id)

      // Assert
      expect(await nombres(ana)).to.deep.equal(['iPhone', 'iMac', 'MacBook', 'MacBook Air'])
    })
  })

  describe('Sin repetidos', () => {
    it('agregar otra vez un producto no lo duplica: pasa al final de la lista', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)
      await compararProducto(ana, imac.id)

      // Act
      const res = await compararProducto(ana, iphone.id)

      // Assert
      expect(res.body.total).to.equal('Product Compare (2)')
      expect(await nombres(ana)).to.deep.equal(['iMac', 'iPhone'])
    })

    it('con la lista llena, repetir uno no saca a ningún otro', async () => {
      // Arrange
      const ana = visitante()
      for (const producto of [iphone, imac, macbook, macbookAir]) await compararProducto(ana, producto.id)

      // Act
      await compararProducto(ana, iphone.id)

      // Assert
      expect(await nombres(ana)).to.have.members(['iPhone', 'iMac', 'MacBook', 'MacBook Air'])
    })
  })

  describe('La tabla', () => {
    it('cada producto trae su precio con impuestos y su modelo, en su columna', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)
      await compararProducto(ana, macbookPro.id)

      // Act
      const { html } = await listaDeComparacion(ana)

      // Assert
      expect(filaDeComparacion(html, 'Price')).to.deep.equal(['$123.20', '$2,000.00'])
      expect(filaDeComparacion(html, 'Model')).to.deep.equal(['product 11', 'Product 18'])
      expect(filaDeComparacion(html, 'Brand')).to.deep.equal(['Apple', 'Apple'])
    })

    it('un producto agotado muestra su estado, no un número', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, galaxyTab.id)

      // Act
      const { html } = await listaDeComparacion(ana)

      // Assert
      expect(filaDeComparacion(html, 'Availability')).to.deep.equal(['Pre-Order'])
    })

    it('[DEF-10-01] un producto disponible dice "In Stock", igual que en su ficha', async () => {
      // Arrange: la tienda está configurada para no mostrar cuántas unidades hay.
      const ana = visitante()
      await compararProducto(ana, iphone.id)
      const ficha = await ana.get(ruta('product/product', { product_id: iphone.id }))

      // Act
      const { html } = await listaDeComparacion(ana)

      // Assert: la ficha dice "In Stock"; la comparación muestra las 970 unidades.
      expect(ficha.text).to.include('Availability: In Stock')
      expect(filaDeComparacion(html, 'Availability')).to.deep.equal(['In Stock'])
    })
  })

  describe('Quitar de la comparación', () => {
    it('quita solo ese producto y avisa del cambio', async () => {
      // Arrange
      const ana = visitante()
      for (const producto of [iphone, imac, macbook]) await compararProducto(ana, producto.id)

      // Act
      await ana.get(ruta('product/compare', { remove: imac.id })).redirects(0).ok(() => true)
      const { productos, html } = await listaDeComparacion(ana)

      // Assert
      expect(productos.map((p) => p.nombre)).to.deep.equal(['iPhone', 'MacBook'])
      expect(html).to.include('Success: You have modified your product comparison!')
    })

    it('quitar el último deja la lista vacía', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)

      // Act
      await ana.get(ruta('product/compare', { remove: iphone.id })).redirects(0).ok(() => true)
      const { productos, html } = await listaDeComparacion(ana)

      // Assert
      expect(productos).to.be.empty
      expect(contenidoDe(html)).to.include(COMPARACION_VACIA)
    })

    it('quitar un producto que no está en la lista no cambia nada ni avisa', async () => {
      // Arrange
      const ana = visitante()
      await compararProducto(ana, iphone.id)

      // Act
      await ana.get(ruta('product/compare', { remove: imac.id })).redirects(0).ok(() => true)
      const { productos, html } = await listaDeComparacion(ana)

      // Assert
      expect(productos.map((p) => p.nombre)).to.deep.equal(['iPhone'])
      expect(html).to.not.include('Success: You have modified your product comparison!')
    })
  })

  it('el enlace "Product Compare" de la búsqueda lleva la cuenta de la lista', async () => {
    // Arrange
    const ana = visitante()
    await compararProducto(ana, iphone.id)
    await compararProducto(ana, imac.id)

    // Act
    const busqueda = await ana.get(ruta('product/search', { search: 'mac' }))

    // Assert
    expect(busqueda.text).to.include('Product Compare (2)')
  })
})
