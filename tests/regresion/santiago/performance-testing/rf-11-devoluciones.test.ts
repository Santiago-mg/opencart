import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { PRESUPUESTO_MS, mediana, medir, repetir } from '../helpers/medicion'
import { ESTADO_DEVOLUCION, type Panel, borrarDevolucionesDe, cambiarEstadoDeDevolucion, devolucionesEnElPanel, iniciarSesionEnElPanel } from '../helpers/panel'
import { type Devolucion, clienteDe, devolucion, solicitarDevolucion, visitante } from '../helpers/tienda'

/**
 * RF-11 — Devoluciones · performance-testing
 *
 * Línea base, presupuesto y comparación: cuánto tarda enviar la solicitud
 * (abrir el formulario y enviarlo), cuánto tarda la administradora en
 * encontrarla y cuánto en cambiarle el estado.
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

describe('RF-11 · Performance — devoluciones', () => {
  it('línea base: la solicitud que se mide queda registrada', async () => {
    // Arrange
    const datos = nuevaDevolucion()

    // Act
    await solicitarDevolucion(visitante(), datos)

    // Assert
    expect(await devolucionesEnElPanel(panel, clienteDe(datos))).to.have.lengthOf(1)
  })

  it('solicitar una devolución (abrir el formulario y enviarlo) cumple el presupuesto', async () => {
    // Arrange
    await solicitarDevolucion(visitante(), nuevaDevolucion()) // calentamiento

    // Act
    const { resultado: res, ms } = await medir(() => solicitarDevolucion(visitante(), nuevaDevolucion()))

    // Assert
    expect(res.body.redirect).to.include('route=account/returns.success')
    expect(ms, `Tardó ${ms.toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('un comentario de 5.000 caracteres no tarda el doble que uno corto', async () => {
    // Arrange
    const corta = () => solicitarDevolucion(visitante(), nuevaDevolucion({ comment: 'Llegó rota' }))
    const larga = () => solicitarDevolucion(visitante(), nuevaDevolucion({ comment: 'x'.repeat(5000) }))
    await corta()
    await larga()

    // Act
    const conPoco = mediana(await repetir(corta, 5))
    const conMucho = mediana(await repetir(larga, 5))

    // Assert
    expect(conMucho, `corto ${conPoco.toFixed(1)} ms · 5.000 caracteres ${conMucho.toFixed(1)} ms`).to.be.below(conPoco * 2 + 100)
  })

  it('rechazar un formulario incompleto es tan rápido como aceptar uno bueno', async () => {
    // Arrange
    const incompleto = () => solicitarDevolucion(visitante(), {})
    await incompleto()

    // Act
    const tiempos = await repetir(incompleto, 5)

    // Assert
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('con las devoluciones de esta suite ya registradas, buscar una por cliente cumple el presupuesto', async () => {
    // Arrange
    const datos = nuevaDevolucion()
    await solicitarDevolucion(visitante(), datos)
    await devolucionesEnElPanel(panel, clienteDe(datos)) // calentamiento

    // Act
    const tiempos = await repetir(() => devolucionesEnElPanel(panel, clienteDe(datos)), 5)

    // Assert
    expect(mediana(tiempos), `Mediana: ${mediana(tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })

  it('cambiar el estado diez veces seguidas se mantiene dentro del presupuesto', async () => {
    // Arrange
    const datos = nuevaDevolucion()
    await solicitarDevolucion(visitante(), datos)
    const [registrada] = await devolucionesEnElPanel(panel, clienteDe(datos))
    let vuelta = 0
    const alternar = () =>
      cambiarEstadoDeDevolucion(panel, registrada.return_id, vuelta++ % 2 === 0 ? ESTADO_DEVOLUCION.completa : ESTADO_DEVOLUCION.pendiente, `Cambio ${vuelta}`)

    // Act
    const tiempos = await repetir(alternar, 10)

    // Assert
    expect(Math.max(...tiempos), `El más lento tardó ${Math.max(...tiempos).toFixed(1)} ms`).to.be.below(PRESUPUESTO_MS)
  })
})
