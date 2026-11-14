import { expect } from 'chai'
import { describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { type Parametros, nombresListados, ruta, visitante } from '../helpers/tienda'

/**
 * RF-06 — Búsqueda y filtrado de productos · performance-testing
 *
 * Igual que en el ejemplo del curso: primero la línea base (que el resultado
 * sea correcto), después un presupuesto de tiempo y por último la comparación
 * de dos formas de buscar con la mediana de cinco mediciones.
 */

const buscar = (parametros: Parametros) => visitante().get(ruta('product/search', parametros))

describe('RF-06 · Performance — búsqueda y filtrado de productos', () => {
  it('línea base: la búsqueda que se mide devuelve el resultado correcto', async () => {
    // Act
    const res = await buscar({ search: 'mac', sort: 'pd.name', order: 'ASC' })

    // Assert
    expect(nombresListados(res.text)).to.deep.equal(['iMac', 'MacBook', 'MacBook Air', 'MacBook Pro'])
  })

  it('una búsqueda por nombre cumple el presupuesto educativo', async () => {
    // Arrange
    const operacion = () => buscar({ search: 'mac' })
    await operacion() // calentamiento

    // Act
    const { resultado: res, ms } = await medir(operacion)

    // Assert
    expect(res.status).to.equal(200)
    expect(ms, `La búsqueda tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('la búsqueda más pesada (descripción, subcategorías y 100 por página) cumple el presupuesto', async () => {
    // Arrange
    const operacion = () => buscar({ search: 'a', description: 1, category_id: 20, sub_category: 1, sort: 'p.price', order: 'DESC', limit: 100 })
    await operacion() // calentamiento

    // Act
    const tiempos = await repetir(operacion, 5)

    // Assert
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('buscar también en la descripción no multiplica el tiempo de la búsqueda por nombre', async () => {
    // Arrange
    const porNombre = () => buscar({ search: 'intel' })
    const conDescripcion = () => buscar({ search: 'intel', description: 1 })
    await porNombre()
    await conDescripcion()

    // Act
    const base = mediana(await repetir(porNombre, 5))
    const ampliada = mediana(await repetir(conDescripcion, 5))

    // Assert: se deja un margen amplio (5 veces) porque la tienda es pequeña y
    // las mediciones de pocos milisegundos varían mucho entre corridas.
    expect(ampliada, `por nombre ${base.toFixed(1)} ms · con descripción ${ampliada.toFixed(1)} ms`).to.be.below(base * 5 + 100)
  })

  it('pedir una página de 5 productos no tarda más que pedir los 100', async () => {
    // Arrange
    const paginaCorta = () => buscar({ search: 'a', limit: 5 })
    const paginaLarga = () => buscar({ search: 'a', limit: 100 })
    await paginaCorta()
    await paginaLarga()

    // Act
    const corta = mediana(await repetir(paginaCorta, 5))
    const larga = mediana(await repetir(paginaLarga, 5))

    // Assert
    expect(corta, `5 por página ${corta.toFixed(1)} ms · 100 por página ${larga.toFixed(1)} ms`).to.be.below(larga + 100)
  })

  it('diez visitantes buscando a la vez reciben todos su respuesta dentro del presupuesto', async () => {
    // Arrange
    const visitantes = Array.from({ length: 10 }, () => () => buscar({ search: 'mac' }))

    // Act
    const { resultado: respuestas, ms } = await medir(() => Promise.all(visitantes.map((buscarAlgo) => buscarAlgo())))

    // Assert
    expect(respuestas.every((res) => res.status === 200)).to.equal(true)
    expect(ms, `Las diez búsquedas tardaron ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS * 3)
  })
})
