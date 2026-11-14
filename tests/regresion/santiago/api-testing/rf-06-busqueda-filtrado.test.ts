import { expect } from 'chai'
import { describe, it } from 'vitest'
import { type Parametros, contenidoDe, nombresListados, ruta, visitante } from '../helpers/tienda'

/**
 * RF-06 — Búsqueda y filtrado de productos · API testing
 * GET index.php?route=product/search&search&description&category_id&sub_category&sort&order&limit&page
 *
 * La búsqueda no devuelve JSON sino una página. Su contrato es lo que esa
 * página debe traer siempre: estado 200, el término que se buscó, cada
 * producto con su enlace y su precio, las opciones de orden y la paginación.
 */

const pedir = (parametros: Parametros) => visitante().get(ruta('product/search', parametros))

const PAGINACION = /Showing (\d+) to (\d+) of (\d+) \((\d+) Pages\)/

describe('RF-06 · API — búsqueda y filtrado de productos', () => {
  it('200 y HTML en UTF-8', async () => {
    // Act
    const res = await pedir({ search: 'mac' })

    // Assert
    expect(res.status).to.equal(200)
    expect(res.headers['content-type']).to.match(/^text\/html; charset=utf-8/i)
  })

  it('el título y el buscador conservan lo que se buscó', async () => {
    // Act
    const res = await pedir({ search: 'mac' })

    // Assert
    expect(res.text).to.include('<title>Search - mac</title>')
    expect(res.text).to.match(/name="search" value="mac"[^>]*id="input-search"/)
  })

  it('cada producto trae su enlace a la ficha y su precio con impuestos', async () => {
    // Act
    const res = await pedir({ search: 'iphone' })

    // Assert
    expect(nombresListados(res.text)).to.deep.equal(['iPhone'])
    expect(res.text).to.match(/<h4><a href="[^"]*route=product\/product[^"]*product_id=40[^"]*">iPhone<\/a><\/h4>/)
    expect(res.text).to.include('<span class="price-new">$123.20</span>')
    expect(res.text).to.include('<span class="price-tax">Ex Tax: $101.00</span>')
  })

  it('ofrece las nueve formas de ordenar y marca la que está en uso', async () => {
    // Act
    const res = await pedir({ search: 'mac', sort: 'p.price', order: 'DESC' })

    // Assert
    const selector = res.text.slice(res.text.indexOf('id="input-sort"'), res.text.indexOf('id="input-limit"'))
    const opciones = [...selector.matchAll(/<option value="[^"]*sort=([a-z._]+)&amp;order=(ASC|DESC)[^"]*"( selected)?>/g)]
    expect(opciones.map((o) => `${o[1]} ${o[2]}`)).to.deep.equal([
      'p.sort_order ASC', 'pd.name ASC', 'pd.name DESC', 'p.price ASC', 'p.price DESC',
      'rating DESC', 'rating ASC', 'p.model ASC', 'p.model DESC',
    ])
    expect(opciones.filter((o) => o[3]).map((o) => `${o[1]} ${o[2]}`)).to.deep.equal(['p.price DESC'])
  })

  it('ofrece mostrar 10, 25, 50, 75 o 100 productos por página', async () => {
    // Act
    const res = await pedir({ search: 'mac' })

    // Assert
    const limites = [...res.text.matchAll(/<option value="[^"]*limit=(\d+)"[^>]*>\d+<\/option>/g)].map((m) => Number(m[1]))
    expect(limites).to.deep.equal([10, 25, 50, 75, 100])
  })

  it.each([
    [{ search: 'a' }, [1, 10, 12, 2]],
    [{ search: 'a', limit: 25 }, [1, 12, 12, 1]],
    [{ search: 'a', limit: 5, page: 2 }, [6, 10, 12, 3]],
    [{ search: 'mac' }, [1, 4, 4, 1]],
  ])('%j → "Showing %j"', async (parametros, esperado) => {
    // Act
    const res = await pedir(parametros)

    // Assert
    const [, desde, hasta, total, paginas] = contenidoDe(res.text).match(PAGINACION) ?? []
    expect([desde, hasta, total, paginas].map(Number)).to.deep.equal(esperado)
  })

  it('una página más allá de la última responde 200 y sin productos', async () => {
    // Act
    const res = await pedir({ search: 'mac', page: 99 })

    // Assert
    expect(res.status).to.equal(200)
    expect(nombresListados(res.text)).to.be.empty
  })

  it('sin coincidencias no trae lista, ni orden, ni paginación', async () => {
    // Act
    const res = await pedir({ search: 'zzzzqqq' })

    // Assert
    expect(res.status).to.equal(200)
    expect(res.text).to.not.include('id="product-list"')
    expect(res.text).to.not.include('id="input-sort"')
    expect(contenidoDe(res.text)).to.not.match(PAGINACION)
  })

  it('[DEF-06-01] un límite negativo no produce una paginación sin sentido', async () => {
    // Act
    const res = await pedir({ search: 'mac', limit: -1 })

    // Assert: hoy responde "Showing 1 to -1 of 4 (-4 Pages)"
    expect(contenidoDe(res.text)).to.match(PAGINACION)
  })

  it('[DEF-06-02] una página negativa se trata como la primera', async () => {
    // Act
    const res = await pedir({ search: 'mac', page: -2 })

    // Assert: hoy responde "Showing -29 to -20 of 4 (1 Pages)"
    expect(contenidoDe(res.text)).to.include('Showing 1 to 4 of 4 (1 Pages)')
  })
})
