import { expect } from 'chai'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { type Panel, aprobarResenaDe, borrarResenasDe, cambiarEstadoDeResena, iniciarSesionEnElPanel, resenasEnElPanel } from '../helpers/panel'
import {
  PRODUCTOS, PRODUCTO_INEXISTENTE, RESENA_RECIBIDA,
  nombresListados, publicarResena, resena, resenasPublicadas, ruta, visitante,
} from '../helpers/tienda'

/**
 * RF-09 — Reseñas de productos · regression-testing
 * Tienda: product/review.write · product/review.list
 * Panel:  catalog/review.save
 *
 * El recorrido completo de una reseña: el visitante la escribe, queda
 * pendiente, la administradora la habilita y solo entonces la ven los demás.
 * Y las reglas del formulario con sus valores límite.
 */

const { iphone, imac, htc } = PRODUCTOS

let panel: Panel

beforeAll(async () => {
  panel = await iniciarSesionEnElPanel()
})

afterAll(async () => {
  await borrarResenasDe(panel, 'QA')
})

describe('RF-09 · Regresión — reseñas de productos', () => {
  describe('De pendiente a publicada', () => {
    it('una reseña válida se recibe con un mensaje de agradecimiento', async () => {
      // Arrange
      const carlos = visitante()

      // Act
      const res = await publicarResena(carlos, iphone.id, resena())

      // Assert
      expect(res.body.success).to.equal(RESENA_RECIBIDA)
    })

    it('queda pendiente: en el panel aparece sin habilitar y con su calificación', async () => {
      // Arrange
      const nueva = resena({ rating: 4 })

      // Act
      await publicarResena(visitante(), iphone.id, nueva)
      const enElPanel = await resenasEnElPanel(panel, nueva.author!)

      // Assert
      expect(enElPanel).to.have.lengthOf(1)
      expect(enElPanel[0]).to.include({ producto: 'iPhone', autor: nueva.author, calificacion: 4, habilitada: false })
    })

    it('mientras está pendiente, los demás visitantes no la ven', async () => {
      // Arrange
      const nueva = resena()
      await publicarResena(visitante(), imac.id, nueva)

      // Act
      const { resenas } = await resenasPublicadas(visitante(), imac.id)

      // Assert
      expect(resenas.map((r) => r.autor)).to.not.include(nueva.author)
    })

    it('cuando la administradora la habilita, aparece con autor, texto y estrellas', async () => {
      // Arrange
      const nueva = resena({ text: 'La pantalla se ve muy bien y la batería dura todo el día.', rating: 4 })
      await publicarResena(visitante(), iphone.id, nueva)

      // Act
      await aprobarResenaDe(panel, nueva.author!, { product_id: iphone.id, text: nueva.text!, rating: 4 })
      const { resenas } = await resenasPublicadas(visitante(), iphone.id)

      // Assert
      expect(resenas).to.deep.include({ autor: nueva.author, texto: nueva.text, estrellas: 4 })
    })

    it('si la administradora la deshabilita otra vez, deja de verse', async () => {
      // Arrange
      const nueva = resena()
      const datos = { product_id: htc.id, text: nueva.text!, rating: 5 }
      await publicarResena(visitante(), htc.id, nueva)
      const reviewId = await aprobarResenaDe(panel, nueva.author!, datos)

      // Act
      await cambiarEstadoDeResena(panel, reviewId, { author: nueva.author!, ...datos }, false)
      const { resenas } = await resenasPublicadas(visitante(), htc.id)

      // Assert
      expect(resenas.map((r) => r.autor)).to.not.include(nueva.author)
    })

    it('un producto sin reseñas aprobadas invita a escribir la primera', async () => {
      // Act: nadie reseña el MacBook Pro en esta suite.
      const { resenas, html } = await resenasPublicadas(visitante(), PRODUCTOS.macbookPro.id)

      // Assert
      expect(resenas).to.be.empty
      expect(html).to.include('Be the first to write a review for this product.')
    })

    it('una reseña aprobada de 5 estrellas pone al producto primero al ordenar por calificación', async () => {
      // Arrange
      const nueva = resena({ rating: 5 })
      await publicarResena(visitante(), PRODUCTOS.palm.id, nueva)
      await aprobarResenaDe(panel, nueva.author!, { product_id: PRODUCTOS.palm.id, text: nueva.text!, rating: 5 })

      // Act
      const pagina = await visitante().get(ruta('product/search', { search: 'palm nikon', sort: 'rating', order: 'DESC' }))

      // Assert
      expect(nombresListados(pagina.text)[0]).to.equal('Palm Treo Pro')
    })
  })

  describe('Reglas del formulario (valores límite)', () => {
    it.each([
      [2, false],
      [3, true],
      [25, true],
      [26, false],
    ])('nombre de %i caracteres → ¿se acepta? %s', async (largo, seAcepta) => {
      // Arrange
      const nueva = resena({ author: 'QA'.padEnd(largo, 'x').slice(0, largo) })

      // Act
      const res = await publicarResena(visitante(), iphone.id, nueva)

      // Assert
      if (seAcepta) {
        expect(res.body.success).to.equal(RESENA_RECIBIDA)
      } else {
        expect(res.body.error).to.deep.equal({ author: 'Review Name must be between 3 and 25 characters!' })
      }
    })

    it.each([
      [24, false],
      [25, true],
      [1000, true],
      [1001, false],
    ])('texto de %i caracteres → ¿se acepta? %s', async (largo, seAcepta) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, resena({ text: 'x'.repeat(largo) }))

      // Assert
      if (seAcepta) {
        expect(res.body.success).to.equal(RESENA_RECIBIDA)
      } else {
        expect(res.body.error).to.deep.equal({ text: 'Review Text must be between 25 and 1000 characters!' })
      }
    })

    it.each([
      [0, false],
      [1, true],
      [5, true],
      [6, false],
    ])('calificación %i → ¿se acepta? %s', async (calificacion, seAcepta) => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, resena({ rating: calificacion }))

      // Assert
      if (seAcepta) {
        expect(res.body.success).to.equal(RESENA_RECIBIDA)
      } else {
        expect(res.body.error).to.deep.equal({ rating: 'Please select a review rating!' })
      }
    })

    it('con varios campos mal, avisa de todos a la vez', async () => {
      // Act
      const res = await publicarResena(visitante(), iphone.id, { author: 'ab', text: 'muy corto', rating: 0 })

      // Assert
      expect(res.body.error).to.have.all.keys('author', 'text', 'rating')
    })

    it('una reseña rechazada no llega al panel', async () => {
      // Arrange
      const mala = resena({ text: 'muy corto' })

      // Act
      await publicarResena(visitante(), iphone.id, mala)

      // Assert
      expect(await resenasEnElPanel(panel, mala.author!)).to.be.empty
    })

    it('no se puede reseñar un producto que no existe', async () => {
      // Arrange
      const carlos = visitante()
      const token = (await carlos.get(ruta('product/product', { product_id: iphone.id }))).text.match(/review_token=([a-f0-9]+)/)![1]

      // Act
      const res = await carlos
        .post(ruta('product/review.write', { product_id: PRODUCTO_INEXISTENTE, review_token: token }))
        .type('form')
        .send(resena())

      // Assert
      expect(res.body.error).to.deep.equal({ warning: 'Warning: Product could not be found!' })
    })
  })
})
