import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { type Panel, borrarResenasDe, enviarAlPanel, iniciarSesionEnElPanel, resenasEnElPanel } from '../helpers/panel'
import { revelaDetallesInternos } from '../helpers/seguridad'
import { PRODUCTOS, RESENA_RECIBIDA, escribirResena, publicarResena, resena, ruta, tokenDeResena, visitante } from '../helpers/tienda'

/**
 * RF-09 — Reseñas de productos · API testing
 * Tienda: POST product/review.write&product_id&review_token { author, text, rating }
 *         GET  product/review.list&product_id
 * Panel:  POST catalog/review.save { review_id, author, product_id, text, rating, status }
 *
 * El contrato JSON al escribir una reseña: la respuesta de éxito, la forma de
 * los errores y qué pasa cuando al formulario le falta un campo.
 */

const { iphone } = PRODUCTOS

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarResenasDe(panel, 'QA')
})

describe('RF-09 · API — reseñas de productos', () => {
  describe('POST product/review.write', () => {
    it('200 y JSON con una sola clave: success', async () => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, resena())

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^application\/json/)
      expect(res.body).to.deep.equal({ success: RESENA_RECIBIDA })
    })

    it.each([
      ['sin token', ''],
      ['con un token inventado', 'f'.repeat(32)],
    ])('%s: error.warning y no se guarda', async (_caso, token) => {
      // Arrange
      const carlos = visitante()
      await tokenDeResena(carlos, iphone.id)
      const nueva = resena()

      // Act
      const res = await escribirResena(carlos, iphone.id, token, nueva)

      // Assert
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ error: { warning: 'Warning: Review token invalid!' } })
      expect(await resenasEnElPanel(panel, nueva.author!)).to.be.empty
    })

    it('los errores de validación vienen por campo: error.author, error.text, error.rating', async () => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, { author: 'ab', text: 'corto', rating: 9 })

      // Assert
      expect(res.body).to.deep.equal({
        error: {
          author: 'Review Name must be between 3 and 25 characters!',
          text: 'Review Text must be between 25 and 1000 characters!',
          rating: 'Please select a review rating!',
        },
      })
    })

    it.each([
      ['la calificación', { author: 'QA sin nota', text: 'Un texto suficientemente largo para la reseña.' }],
      ['el texto', { author: 'QA sin texto', rating: 5 }],
      ['el nombre', { text: 'Un texto suficientemente largo para la reseña.', rating: 5 }],
      ['todo', {}],
    ])('[DEF-09-01] si falta %s, la respuesta sigue siendo JSON con el error del campo', async (_caso, campos) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, campos)

      // Assert: hoy llega un aviso de PHP ("Undefined array key") pegado antes del JSON.
      expect(res.body, 'la respuesta no es JSON').to.not.have.property('respuestaNoJson')
      expect(res.body).to.have.property('error')
    })

    it.each([
      ['la calificación', { author: 'QA sin nota', text: 'Un texto suficientemente largo para la reseña.' }],
      ['todo', {}],
    ])('[DEF-09-01] si falta %s, la respuesta no muestra rutas ni avisos del servidor', async (_caso, campos) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, campos)

      // Assert
      expect(revelaDetallesInternos(JSON.stringify(res.body))).to.equal(false)
    })
  })

  describe('GET product/review.list', () => {
    it('200 y HTML, también para un producto sin reseñas', async () => {
      // Act
      const res = await visitante().get(ruta('product/review.list', { product_id: PRODUCTOS.macbookPro.id }))

      // Assert
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/^text\/html/)
    })

    it('la ficha entrega el formulario con un token de 32 caracteres', async () => {
      // Act
      const token = await tokenDeResena(visitante(), iphone.id)

      // Assert
      expect(token).to.match(/^[a-f0-9]{32}$/)
    })

    it('cada visita a la ficha recibe un token distinto', async () => {
      // Arrange
      const carlos = visitante()

      // Act
      const primero = await tokenDeResena(carlos, iphone.id)
      const segundo = await tokenDeResena(carlos, iphone.id)

      // Assert
      expect(primero).to.not.equal(segundo)
    })
  })

  describe('POST catalog/review.save (panel)', () => {
    it('reseña creada desde el panel: { review_id, success }', async () => {
      // Act
      const res = await enviarAlPanel(panel, 'catalog/review.save', {
        review_id: 0, author: 'QA desde el panel', product_id: iphone.id, text: 'Reseña creada por la administradora.', rating: 5, status: 0,
        date_added: '2026-11-01',
      })

      // Assert
      expect(res.body).to.have.all.keys('review_id', 'success')
      expect(res.body.success).to.equal('Success: You have modified reviews!')
    })

    it('sin producto y con nombre corto: error por campo más un aviso general', async () => {
      // Act
      const res = await enviarAlPanel(panel, 'catalog/review.save', { review_id: 0, author: 'ab', product_id: 0, text: 'x', rating: 3, status: 0 })

      // Assert
      expect(res.body.error).to.have.all.keys('author', 'product', 'warning')
    })
  })
})
