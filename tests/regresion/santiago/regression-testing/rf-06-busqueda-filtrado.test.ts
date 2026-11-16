import { expect } from 'chai'
import { describe, it } from 'vitest'
import { CATEGORIAS, type Parametros, contenidoDe, nombresListados, preciosListados, ruta, visitante } from '../helpers/tienda'

/**
 * RF-06 — Búsqueda y filtrado de productos · regression-testing
 * GET index.php?route=product/search
 *
 * Lo que la tienda promete al buscar: por dónde busca (nombre, descripción,
 * modelo), cómo filtra por categoría, en qué orden devuelve y cómo pagina.
 * Los datos son los productos de demostración de OpenCart.
 */

const buscar = async (parametros: Parametros) => (await visitante().get(ruta('product/search', parametros))).text

const SIN_RESULTADOS = 'There is no product that matches the search criteria.'
const LOS_MAC = ['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro']

describe('RF-06 · Regresión — búsqueda y filtrado de productos', () => {
  it('buscar "mac" trae los cuatro productos que lo llevan en el nombre', async () => {
    // Arrange
    const criterio = { search: 'mac', sort: 'pd.name', order: 'ASC' }

    // Act
    const pagina = await buscar(criterio)

    // Assert
    expect(nombresListados(pagina)).to.deep.equal(LOS_MAC)
  })

  it('no distingue mayúsculas de minúsculas', async () => {
    // Act
    const enMayusculas = await buscar({ search: 'MAC', sort: 'pd.name', order: 'ASC' })

    // Assert
    expect(nombresListados(enMayusculas)).to.deep.equal(LOS_MAC)
  })

  it('con varias palabras basta que el nombre tenga una de ellas', async () => {
    // Act
    const pagina = await buscar({ search: 'nikon palm' })

    // Assert
    expect(nombresListados(pagina)).to.have.members(['Nikon D300', 'Palm Treo Pro'])
  })

  it('encuentra un producto por su modelo exacto', async () => {
    // Act
    const pagina = await buscar({ search: 'SAM1' })

    // Assert
    expect(nombresListados(pagina)).to.deep.equal(['Samsung Galaxy Tab 10.1'])
  })

  describe('Buscar en la descripción', () => {
    it('sin marcar la casilla, "intel" no encuentra nada (ningún nombre lo trae)', async () => {
      // Act
      const pagina = await buscar({ search: 'intel' })

      // Assert
      expect(nombresListados(pagina)).to.be.empty
      expect(contenidoDe(pagina)).to.include(SIN_RESULTADOS)
    })

    it('con la casilla marcada, "intel" encuentra los cuatro que lo mencionan', async () => {
      // Act
      const pagina = await buscar({ search: 'intel', description: 1 })

      // Assert
      expect(nombresListados(pagina)).to.have.members(['iMac', 'MacBook', 'MacBook Pro', 'Sony VAIO'])
    })
  })

  describe('Filtrar por categoría', () => {
    it('solo quedan los productos que están directamente en la categoría', async () => {
      // Arrange: el iMac está en "Mac", que es hija de "Desktops".
      const criterio = { search: 'mac', category_id: CATEGORIAS.desktops, sort: 'pd.name', order: 'ASC' }

      // Act
      const pagina = await buscar(criterio)

      // Assert
      expect(nombresListados(pagina)).to.deep.equal(['MacBook', 'MacBook Air'])
    })

    it('al incluir subcategorías aparece también el iMac', async () => {
      // Arrange
      const criterio = { search: 'mac', category_id: CATEGORIAS.desktops, sub_category: 1, sort: 'pd.name', order: 'ASC' }

      // Act
      const pagina = await buscar(criterio)

      // Assert
      expect(nombresListados(pagina)).to.deep.equal(['iMac', 'MacBook', 'MacBook Air'])
    })

    it('una categoría sin coincidencias deja la lista vacía', async () => {
      // Act
      const pagina = await buscar({ search: 'mac', category_id: 33 })

      // Assert
      expect(nombresListados(pagina)).to.be.empty
      expect(contenidoDe(pagina)).to.include(SIN_RESULTADOS)
    })
  })

  describe('Ordenar', () => {
    it.each([
      ['pd.name', 'ASC', ['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro']],
      ['pd.name', 'DESC', ['MacBook Pro', 'MacBook Air', 'MacBook', 'iMac']],
      ['p.price', 'ASC', ['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro']],
      ['p.price', 'DESC', ['MacBook Pro', 'MacBook Air', 'MacBook', 'iMac']],
      ['p.model', 'DESC', ['MacBook Pro', 'MacBook Air', 'MacBook', 'iMac']],
    ])('sort=%s order=%s', async (sort, order, esperado) => {
      // Act
      const pagina = await buscar({ search: 'mac', sort, order })

      // Assert
      expect(nombresListados(pagina)).to.deep.equal(esperado)
    })

    it('de menor a mayor precio, cada producto cuesta igual o más que el anterior', async () => {
      // Act
      const precios = preciosListados(await buscar({ search: 'a', sort: 'p.price', order: 'ASC', limit: 100 }))

      // Assert
      expect(precios).to.have.length.above(5)
      expect(precios).to.deep.equal([...precios].sort((a, b) => a - b))
    })

    it('un orden que no existe se ignora y la búsqueda sigue funcionando', async () => {
      // Act
      const pagina = await buscar({ search: 'mac', sort: 'no_existe', order: 'ZZZ' })

      // Assert
      expect(nombresListados(pagina)).to.have.members(LOS_MAC)
    })
  })

  describe('Paginar', () => {
    it('con límite 5 la primera página trae 5 productos y dice cuántas páginas hay', async () => {
      // Act
      const pagina = await buscar({ search: 'a', sort: 'pd.name', order: 'ASC', limit: 5 })

      // Assert
      expect(nombresListados(pagina)).to.have.lengthOf(5)
      expect(contenidoDe(pagina)).to.include('Showing 1 to 5 of 12 (3 Pages)')
    })

    it('la segunda página trae los siguientes, sin repetir ninguno', async () => {
      // Arrange
      const criterio = { search: 'a', sort: 'pd.name', order: 'ASC', limit: 5 }
      const primera = nombresListados(await buscar(criterio))

      // Act
      const segunda = nombresListados(await buscar({ ...criterio, page: 2 }))

      // Assert
      expect(segunda).to.have.lengthOf(5)
      expect(segunda.filter((nombre) => primera.includes(nombre))).to.be.empty
    })

    it('la última página trae solo los que faltan', async () => {
      // Act
      const pagina = await buscar({ search: 'a', sort: 'pd.name', order: 'ASC', limit: 5, page: 3 })

      // Assert
      expect(nombresListados(pagina)).to.have.lengthOf(2)
      expect(contenidoDe(pagina)).to.include('Showing 11 to 12 of 12 (3 Pages)')
    })
  })

  it('sin escribir nada no se lista ningún producto', async () => {
    // Act
    const pagina = await buscar({})

    // Assert
    expect(nombresListados(pagina)).to.be.empty
    expect(contenidoDe(pagina)).to.include(SIN_RESULTADOS)
  })
})
