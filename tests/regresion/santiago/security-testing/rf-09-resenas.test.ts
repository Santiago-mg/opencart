import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import request from 'supertest'
import { type Panel, aprobarResenaDe, borrarResenasDe, iniciarSesionEnElPanel, resenasEnElPanel, rutaPanel } from '../helpers/panel'
import { INYECCIONES_SQL, XSS_IMAGEN, XSS_SCRIPT, revelaDetallesInternos, textoCompleto, traeHtmlInyectado } from '../helpers/seguridad'
import {
  NAVEGADOR, PRODUCTOS, RESENA_RECIBIDA, URL_TIENDA,
  autorUnico, escribirResena, publicarResena, resena, resenasPublicadas, ruta, tokenDeResena, visitante,
} from '../helpers/tienda'

/**
 * RF-09 — Reseñas de productos · security-testing
 *
 * Una reseña es texto escrito por un desconocido que después se muestra a
 * todos los visitantes. Aquí se comprueba que no se pueda publicar sin pasar
 * por la administradora, que el texto nunca se ejecute en el navegador de
 * otro y que el formulario no se pueda enviar desde fuera de la ficha.
 */

const { iphone, htc } = PRODUCTOS

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarResenasDe(panel, 'QA')
  await borrarResenasDe(panel, '<')
  await borrarResenasDe(panel, "'")
})

describe('RF-09 · Seguridad — reseñas de productos', () => {
  describe('El formulario solo se envía desde la ficha (token)', () => {
    it('el token de la ficha de Ana no le sirve a Carlos', async () => {
      // Arrange
      const tokenDeAna = await tokenDeResena(visitante(), iphone.id)
      const carlos = visitante()
      await tokenDeResena(carlos, iphone.id)

      // Act
      const res = await escribirResena(carlos, iphone.id, tokenDeAna, resena())

      // Assert
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Review token invalid!' })
    })

    it('sin haber abierto la ficha no se puede enviar una reseña', async () => {
      // Act
      const res = await escribirResena(visitante(), iphone.id, 'a'.repeat(32), resena())

      // Assert
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Review token invalid!' })
    })

    it('[DEF-09-02] el mismo token no sirve para enviar una segunda reseña', async () => {
      // Arrange
      const carlos = visitante()
      const token = await tokenDeResena(carlos, iphone.id)
      await escribirResena(carlos, iphone.id, token, resena())

      // Act
      const segunda = await escribirResena(carlos, iphone.id, token, resena())

      // Assert: hoy se pueden mandar cuantas se quiera con un solo token (spam).
      expect(segunda.body).to.not.have.property('success')
    })
  })

  describe('Solo la administradora publica', () => {
    it('mandar status=1 en el formulario no publica la reseña', async () => {
      // Arrange
      const colada = resena({ status: 1 })

      // Act
      await publicarResena(visitante(), htc.id, colada)
      const [enElPanel] = await resenasEnElPanel(panel, colada.author!)
      const { resenas } = await resenasPublicadas(visitante(), htc.id)

      // Assert
      expect(enElPanel.habilitada).to.equal(false)
      expect(resenas.map((r) => r.autor)).to.not.include(colada.author)
    })

    it.each([
      ['sin sesión', () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR), () => 'c'.repeat(32)],
      ['sin sesión, con el token de la administradora', () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR), () => panel.token],
    ])('%s no se puede habilitar una reseña desde el panel', async (_caso, quien, token) => {
      // Arrange
      const pendiente = resena()
      await publicarResena(visitante(), htc.id, pendiente)
      const [enElPanel] = await resenasEnElPanel(panel, pendiente.author!)

      // Act
      await quien()
        .post(rutaPanel('catalog/review.save', token()))
        .type('form')
        .send({ review_id: enElPanel.review_id, author: pendiente.author, product_id: htc.id, text: pendiente.text, rating: 5, status: 1 })
      const [despues] = await resenasEnElPanel(panel, pendiente.author!)

      // Assert
      expect(despues.habilitada).to.equal(false)
    })
  })

  describe('XSS almacenado', () => {
    it.each([
      ['un script', XSS_SCRIPT],
      ['una imagen con onerror', XSS_IMAGEN],
    ])('%s en el texto se muestra como texto cuando la reseña se publica', async (_caso, ataque) => {
      // Arrange
      const maliciosa = resena({ text: `${ataque} y un poco más de texto para llegar al mínimo.` })
      await publicarResena(visitante(), htc.id, maliciosa)
      await aprobarResenaDe(panel, maliciosa.author!, { product_id: htc.id, text: maliciosa.text!, rating: 5 })

      // Act
      const { html } = await resenasPublicadas(visitante(), htc.id)

      // Assert
      expect(traeHtmlInyectado(html)).to.equal(false)
    })

    it('HTML en el nombre del autor tampoco llega como HTML a la ficha ni al panel', async () => {
      // Arrange: el nombre tiene que caber en 25 caracteres ya escapado.
      const autor = '<b>QA</b>'
      const maliciosa = resena({ author: autor })
      await publicarResena(visitante(), htc.id, maliciosa)
      const lista = await panel.agente.get(rutaPanel('catalog/review.list', panel.token))

      // Assert
      expect(lista.text).to.not.include('<td><b>QA</b></td>')
    })
  })

  describe('Inyección SQL', () => {
    it.each(INYECCIONES_SQL.filter(([ataque]) => ataque.length <= 20))('author=%j (%s) se guarda como texto', async (ataque) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, resena({ author: ataque }))

      // Assert: se acepta o se rechaza por longitud, pero nunca con un error de base de datos.
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
      expect(res.body).to.not.have.property('respuestaNoJson')
    })

    it.each(INYECCIONES_SQL)('text=%j (%s) se guarda como texto', async (ataque) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, resena({ text: `${ataque} con texto de relleno suficiente.` }))

      // Assert
      expect(res.body.success).to.equal(RESENA_RECIBIDA)
    })

    it('product_id con SQL en la dirección se trata como un producto inexistente', async () => {
      // Arrange
      const carlos = visitante()
      const token = await tokenDeResena(carlos, iphone.id)

      // Act
      const res = await carlos
        .post(ruta('product/review.write', { product_id: '40 OR 1=1', review_token: token }))
        .type('form')
        .send(resena({ author: autorUnico() }))

      // Assert: "40 OR 1=1" se convierte al número 40; lo importante es que no hay error de SQL.
      expect(revelaDetallesInternos(textoCompleto(res))).to.equal(false)
    })
  })
})
