import { expect } from 'chai'
import { describe, it } from 'vitest'
import { INYECCIONES_SQL, XSS_IMAGEN, XSS_SCRIPT, revelaDetallesInternos, traeHtmlInyectado } from '../helpers/seguridad'
import { type Parametros, nombresListados, ruta, visitante } from '../helpers/tienda'

/**
 * RF-06 — Búsqueda y filtrado de productos · security-testing
 *
 * El buscador es la entrada más expuesta de la tienda: cualquiera escribe en
 * él sin iniciar sesión, y lo que escribe va a una consulta SQL y vuelve
 * pintado en la página. Aquí se comprueba que el texto se trate siempre como
 * dato: ni cambia la consulta ni se ejecuta en el navegador.
 */

const buscar = (parametros: Parametros) => visitante().get(ruta('product/search', parametros))

describe('RF-06 · Seguridad — búsqueda y filtrado de productos', () => {
  describe('Inyección SQL', () => {
    it.each(INYECCIONES_SQL)('search=%j (%s) se busca como texto literal', async (ataque) => {
      // Act
      const res = await buscar({ search: ataque })

      // Assert
      expect(res.status).to.equal(200)
      expect(revelaDetallesInternos(res.text)).to.equal(false)
      expect(nombresListados(res.text)).to.be.empty
    })

    it.each(['sort', 'order', 'category_id', 'limit', 'page'])('el parámetro %s no acepta SQL', async (parametro) => {
      // Arrange
      const ataque = "1; DROP TABLE oc_product; -- '"

      // Act
      const res = await buscar({ search: 'mac', [parametro]: ataque })
      const despues = await buscar({ search: 'mac' })

      // Assert: no hay error de base de datos y el catálogo sigue ahí.
      expect(res.status).to.equal(200)
      expect(revelaDetallesInternos(res.text)).to.equal(false)
      expect(nombresListados(despues.text)).to.have.lengthOf(4)
    })
  })

  describe('XSS reflejado', () => {
    it.each([
      ['search', XSS_SCRIPT],
      ['search', XSS_IMAGEN],
      ['tag', XSS_SCRIPT],
      ['description', XSS_SCRIPT],
      ['category_id', XSS_SCRIPT],
      ['sort', `"><script>alert('x')</script>`],
      ['order', `"><script>alert('x')</script>`],
      ['limit', `"><script>alert('x')</script>`],
    ])('lo que llega en %s vuelve escapado, no como HTML', async (parametro, ataque) => {
      // Act
      const res = await buscar({ search: 'mac', [parametro]: ataque })

      // Assert
      expect(res.status).to.equal(200)
      expect(traeHtmlInyectado(res.text)).to.equal(false)
      expect(res.text).to.not.include("<script>alert('x')</script>")
    })

    it('el término aparece en el título como texto: &lt;script&gt;', async () => {
      // Act
      const res = await buscar({ search: XSS_SCRIPT })

      // Assert
      expect(res.text).to.include('&lt;script&gt;')
    })
  })

  describe('Comodines de la búsqueda', () => {
    it('[DEF-06-03] buscar "%" no devuelve el catálogo entero', async () => {
      // Act
      const res = await buscar({ search: '%', limit: 100 })

      // Assert: ningún producto tiene "%" en el nombre; hoy devuelve los 19.
      expect(nombresListados(res.text)).to.be.empty
    })

    it('[DEF-06-03] buscar "_" no devuelve el catálogo entero', async () => {
      // Act
      const res = await buscar({ search: '_', limit: 100 })

      // Assert: "_" es el comodín de "un carácter cualquiera" en LIKE.
      expect(nombresListados(res.text)).to.be.empty
    })
  })

  describe('Cabeceras de la respuesta', () => {
    it('[DEF-SEG-02] la página declara que no se puede incrustar en otro sitio (anti-clickjacking)', async () => {
      // Act
      const res = await buscar({ search: 'mac' })

      // Assert
      const protegida =
        res.headers['x-frame-options'] !== undefined || /frame-ancestors/.test(String(res.headers['content-security-policy'] ?? ''))
      expect(protegida, 'Falta X-Frame-Options o Content-Security-Policy: frame-ancestors').to.equal(true)
    })

    it('[DEF-SEG-03] no se permite a cualquier sitio leer la tienda con las credenciales del visitante', async () => {
      // Act
      const res = await buscar({ search: 'mac' })

      // Assert: hoy responde "Access-Control-Allow-Origin: *" junto con "Allow-Credentials: true".
      const abiertaATodos = res.headers['access-control-allow-origin'] === '*' && res.headers['access-control-allow-credentials'] === 'true'
      expect(abiertaATodos).to.equal(false)
    })
  })
})
