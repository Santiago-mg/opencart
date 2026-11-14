import request from 'supertest'

/**
 * La tienda que se prueba.
 *
 * Estas pruebas no usan dobles: hablan por HTTP con un OpenCart 4.1.0.3
 * encendido y recién instalado (con los productos de demostración). Por
 * defecto es la dirección del docker-compose del proyecto; si corre en otro
 * lado se cambia con la variable OPENCART_URL.
 */
export const URL_TIENDA = process.env.OPENCART_URL ?? 'http://localhost'
export const IDIOMA = 'en-gb'

/** Cómo se presentan las pruebas ante la tienda (un navegador siempre manda este encabezado). */
export const NAVEGADOR = 'Mozilla/5.0 (pruebas de regresion de OpenCart)'

export type Parametros = Record<string, string | number>

/** Dirección de una página o acción: ruta('product/search', { search: 'mac' }) */
export function ruta(route: string, parametros: Parametros = {}): string {
  const consulta = Object.entries({ language: IDIOMA, ...parametros })
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(String(valor))}`)
    .join('&')
  return `/index.php?route=${route}&${consulta}`
}

/**
 * Un visitante nuevo de la tienda. Cada visitante guarda su propia cookie de
 * sesión, así que tiene su propio carrito, su cupón y su lista de comparación:
 * lo que hace una prueba no lo ve la siguiente (principio FIRST: independientes).
 */
export const visitante = () => request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR)
export type Visitante = ReturnType<typeof visitante>

/**
 * Lee la respuesta de una acción. OpenCart responde JSON; si llega otra cosa
 * (por ejemplo un aviso de PHP), no se lanza un error: se deja el texto en
 * `respuestaNoJson` para que la prueba pueda decir qué llegó.
 */
export function leerRespuesta(res: request.Response, terminar: (error: Error | null, cuerpo: unknown) => void): void {
  // Mientras llega, la respuesta es un flujo de datos de Node.
  const flujo = res as unknown as NodeJS.ReadableStream
  let texto = ''
  flujo.setEncoding('utf8')
  flujo.on('data', (parte: string) => (texto += parte))
  flujo.on('end', () => {
    try {
      terminar(null, JSON.parse(texto))
    } catch {
      terminar(null, { respuestaNoJson: texto })
    }
  })
}

/** Envía un formulario (así llegan los datos a OpenCart: como campos, no como JSON). */
export function enviar(quien: Visitante, route: string, campos: object, parametros: Parametros = {}) {
  return quien.post(ruta(route, parametros)).type('form').buffer(true).parse(leerRespuesta).send(campos)
}

/** Productos de la instalación de demostración que usan las pruebas. */
export const PRODUCTOS = {
  iphone: { id: 40, nombre: 'iPhone', modelo: 'product 11', precio: 101 },
  imac: { id: 41, nombre: 'iMac', modelo: 'Product 14', precio: 100 },
  macbook: { id: 43, nombre: 'MacBook', modelo: 'Product 16', precio: 500 },
  macbookAir: { id: 44, nombre: 'MacBook Air', modelo: 'Product 17', precio: 1000 },
  macbookPro: { id: 45, nombre: 'MacBook Pro', modelo: 'Product 18', precio: 2000 },
  htc: { id: 28, nombre: 'HTC Touch HD', modelo: 'Product 1', precio: 100 },
  palm: { id: 29, nombre: 'Palm Treo Pro', modelo: 'Product 2', precio: 279.99 },
  // Tiene 9 opciones obligatorias y cantidad mínima de 2.
  cinema: { id: 42, nombre: 'Apple Cinema 30"', modelo: 'Product 15', precio: 100 },
  // Está publicado pero con 0 unidades.
  galaxyTab: { id: 49, nombre: 'Samsung Galaxy Tab 10.1', modelo: 'SAM1', precio: 199.99 },
} as const

export const PRODUCTO_INEXISTENTE = 999999

/** Categorías de demostración: "Mac" (27) es hija de "Desktops" (20). */
export const CATEGORIAS = { desktops: 20, mac: 27, laptops: 18 } as const

// ── Lectura de las páginas ────────────────────────────────────────────────
// La búsqueda y la comparación responden HTML. Estas funciones sacan de la
// página lo mismo que vería una persona, sin depender del resto del diseño.

const sinEtiquetas = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Nombres de los productos de un listado (búsqueda o categoría), en el orden de la página. */
export function nombresListados(html: string): string[] {
  return [...html.matchAll(/<div class="description">\s*<h4><a href="[^"]*">([\s\S]*?)<\/a><\/h4>/g)].map((m) =>
    sinEtiquetas(m[1]),
  )
}

/** Precios (ya con impuestos) de los productos de un listado, como números. */
export function preciosListados(html: string): number[] {
  return [...html.matchAll(/<span class="price-new">([^<]*)<\/span>/g)].map((m) => aNumero(m[1]))
}

/** "$1,202.00" → 1202 · "$-10.10" → -10.1 */
export const aNumero = (dinero: string): number => Number(dinero.replace(/[^0-9.-]/g, ''))

/** El texto de la página, sin etiquetas. */
export const textoDe = (html: string): string => sinEtiquetas(html)

/** El texto del contenido principal (lo que va dentro de #content), sin menús ni pie. */
export function contenidoDe(html: string): string {
  const inicio = html.indexOf('id="content"')
  const fin = html.indexOf('<footer')
  return sinEtiquetas(html.slice(inicio === -1 ? 0 : inicio, fin === -1 ? undefined : fin).replace(/^[^>]*>/, ''))
}

// ── Carrito ───────────────────────────────────────────────────────────────

export interface LineaDelCarrito {
  /** Identificador de la línea (lo que piden cart.edit y cart.remove). */
  clave: string
  productoId: number
  nombre: string
  cantidad: number
  /** La tienda marca con *** los productos sin existencias suficientes. */
  sinStock: boolean
  /** Aviso de cantidad mínima, o '' si la línea cumple el mínimo. */
  avisoDeMinimo: string
  precio: number
  total: number
}

export interface RenglonDeTotales {
  titulo: string
  valor: number
}

export interface Carrito {
  lineas: LineaDelCarrito[]
  totales: RenglonDeTotales[]
  /** Los avisos en rojo que muestra la página del carrito. */
  avisos: string[]
  html: string
}

/** Agrega un producto al carrito del visitante. */
export const agregarAlCarrito = (quien: Visitante, productoId: number | string, cantidad: number | string = 1) =>
  enviar(quien, 'checkout/cart.add', { product_id: productoId, quantity: cantidad })

/** Cambia la cantidad de una línea del carrito. */
export const cambiarCantidad = (quien: Visitante, clave: string | number, cantidad: number | string) =>
  enviar(quien, 'checkout/cart.edit', { key: clave, quantity: cantidad })

/** Quita una línea del carrito (el botón rojo de la página manda la clave en la dirección). */
export const quitarDelCarrito = (quien: Visitante, clave: string | number) =>
  quien.get(ruta('checkout/cart.remove', { key: clave })).buffer(true).parse(leerRespuesta)

/**
 * Lo que hay en el carrito del visitante, tal como lo muestra la página
 * "Shopping Cart": cada línea de la tabla y cada renglón de totales.
 */
export async function carritoDe(quien: Visitante): Promise<Carrito> {
  const html = (await quien.get(ruta('checkout/cart.list'))).text
  const lineas: LineaDelCarrito[] = []
  for (const fila of html.split('<tr>').slice(1)) {
    const clave = fila.match(/name="key" value="(\d+)"/)
    const producto = fila.match(/product_id=(\d+)[^"]*">([^<]*)<\/a>/)
    const cantidad = fila.match(/name="quantity" value="(-?\d+)"/)
    if (!clave || !producto || !cantidad) continue
    const dinero = [...fila.matchAll(/<td class="text-end">([^<]*)<\/td>/g)].map((m) => aNumero(m[1]))
    const minimo = fila.match(/<small class="invalid-feedback d-block">([^<]*)<\/small>/)
    lineas.push({
      clave: clave[1],
      productoId: Number(producto[1]),
      nombre: sinEtiquetas(producto[2]),
      cantidad: Number(cantidad[1]),
      sinStock: fila.includes('<span class="text-danger">***</span>'),
      avisoDeMinimo: minimo ? sinEtiquetas(minimo[1]) : '',
      precio: dinero[0],
      total: dinero[1],
    })
  }
  const totales = [
    ...html.matchAll(/<td colspan="4" class="text-end"><strong>([^<]*)<\/strong><\/td>\s*<td class="text-end">([^<]*)<\/td>/g),
  ].map((m) => ({ titulo: sinEtiquetas(m[1]), valor: aNumero(m[2]) }))
  // Los avisos van antes del título; más abajo la página trae plantillas de JavaScript.
  const encabezado = html.slice(0, html.indexOf('<h1>') === -1 ? 0 : html.indexOf('<h1>'))
  const avisos = [...encabezado.matchAll(/<div class="alert alert-danger[^>]*>([\s\S]*?)<button/g)].map((m) => sinEtiquetas(m[1]))
  return { lineas, totales, avisos, html }
}

/** El valor de un renglón de totales ("Sub-Total", "Total", "Coupon (ABC)"...). */
export function totalLlamado(carrito: Carrito, titulo: string): number {
  const renglon = carrito.totales.find((t) => t.titulo === titulo)
  if (!renglon) {
    throw new Error(`El carrito no muestra el renglón "${titulo}". Muestra: ${carrito.totales.map((t) => t.titulo).join(', ')}`)
  }
  return renglon.valor
}

// ── Cupones ───────────────────────────────────────────────────────────────

export const aplicarCupon = (quien: Visitante, codigo: string) =>
  enviar(quien, 'extension/opencart/checkout/coupon.save', { coupon: codigo })

export const quitarCupon = (quien: Visitante) => enviar(quien, 'extension/opencart/checkout/coupon.remove', {})

/** El mensaje con el que la tienda rechaza cualquier cupón que no se puede usar. */
export const CUPON_RECHAZADO = 'Warning: Coupon is either invalid, expired or reached its usage limit!'
export const CUPON_APLICADO = 'Success: Your coupon discount has been applied!'

// ── Reseñas ───────────────────────────────────────────────────────────────

export interface Resena {
  author?: string
  text?: string
  rating?: number | string
  [otroCampo: string]: unknown
}

/** Una reseña que cumple todas las reglas; cada prueba cambia solo lo que le interesa. */
export const resena = (cambios: Resena = {}): Resena => ({
  author: 'Santiago QA',
  text: 'El producto llegó a tiempo y funciona muy bien.',
  rating: 5,
  ...cambios,
})

/** Abre la ficha del producto y devuelve el token que la tienda le da al formulario de reseñas. */
export async function tokenDeResena(quien: Visitante, productoId: number): Promise<string> {
  const ficha = await quien.get(ruta('product/product', { product_id: productoId }))
  return ficha.text.match(/review_token=([a-f0-9]+)/)?.[1] ?? ''
}

export const escribirResena = (quien: Visitante, productoId: number, token: string, campos: Resena) =>
  enviar(quien, 'product/review.write', campos, { product_id: productoId, review_token: token })

/** Abre la ficha y envía la reseña en la misma visita, como haría una persona. */
export async function publicarResena(quien: Visitante, productoId: number, campos: Resena) {
  const token = await tokenDeResena(quien, productoId)
  return escribirResena(quien, productoId, token, campos)
}

export interface ResenaPublicada {
  autor: string
  texto: string
  estrellas: number
}

/** Las reseñas que cualquier visitante ve en la ficha del producto (solo las aprobadas). */
export async function resenasPublicadas(quien: Visitante, productoId: number): Promise<{ resenas: ResenaPublicada[]; html: string }> {
  const html = (await quien.get(ruta('product/review.list', { product_id: productoId }))).text
  const resenas = [...html.matchAll(/<strong>([\s\S]*?)<\/strong><\/td>[\s\S]*?<td colspan="2"><p>([\s\S]*?)<\/p>([\s\S]*?)<\/td>/g)].map((m) => ({
    autor: sinEtiquetas(m[1]),
    texto: sinEtiquetas(m[2]),
    estrellas: (m[3].match(/fa-solid fa-star/g) ?? []).length,
  }))
  return { resenas, html }
}

export const RESENA_RECIBIDA = 'Thank you for your review. It has been submitted to the webmaster for approval.'

// ── Comparación ───────────────────────────────────────────────────────────

export const compararProducto = (quien: Visitante, productoId: number | string) =>
  enviar(quien, 'product/compare.add', { product_id: productoId })

/** Los productos de la página "Product Comparison", en el orden de las columnas. */
export async function listaDeComparacion(quien: Visitante): Promise<{ productos: Array<{ id: number; nombre: string }>; html: string }> {
  const html = (await quien.get(ruta('product/compare'))).text
  const productos = [...html.matchAll(/<td><a href="[^"]*product_id=(\d+)"><strong>([^<]*)<\/strong><\/a><\/td>/g)].map((m) => ({
    id: Number(m[1]),
    nombre: sinEtiquetas(m[2]),
  }))
  return { productos, html }
}

/** Los valores de una fila de la tabla de comparación ("Price", "Model", "Availability"...). */
export function filaDeComparacion(html: string, titulo: string): string[] {
  const fila = html.split('<tr>').find((f) => new RegExp(`^\\s*<td>${titulo}</td>`).test(f))
  if (!fila) return []
  return [...fila.matchAll(/<td>([\s\S]*?)<\/td>/g)].slice(1).map((m) => sinEtiquetas(m[1]))
}

export const COMPARACION_VACIA = 'You have not chosen any products to compare.'

// ── Devoluciones ──────────────────────────────────────────────────────────

export interface Devolucion {
  [campo: string]: string | number
}

let devolucionesPedidas = 0

/**
 * Una solicitud de devolución completa. El apellido lleva un sufijo distinto
 * cada vez para poder encontrarla después en el panel y borrarla.
 */
export function devolucion(cambios: Devolucion = {}): Devolucion {
  return {
    order_id: 1234,
    date_ordered: '2026-11-01',
    firstname: 'Santiago',
    lastname: `QA ${Date.now().toString(36)}${devolucionesPedidas++}`,
    email: 'santiago.qa@example.com',
    telephone: '3001234567',
    product: 'iPhone',
    product_id: PRODUCTOS.iphone.id,
    model: 'product 11',
    quantity: 1,
    return_reason_id: 1,
    opened: 0,
    comment: 'Llegó con la pantalla rota',
    ...cambios,
  }
}

/** Abre el formulario de devoluciones y devuelve su token (sirve para un solo envío). */
export async function tokenDeDevolucion(quien: Visitante): Promise<string> {
  const formulario = await quien.get(ruta('account/returns.add'))
  return formulario.text.match(/return_token=([a-f0-9]+)/)?.[1] ?? ''
}

export const enviarDevolucion = (quien: Visitante, token: string, campos: object) =>
  enviar(quien, 'account/returns.save', campos, { return_token: token })

/** Abre el formulario y lo envía en la misma visita. */
export async function solicitarDevolucion(quien: Visitante, campos: object) {
  const token = await tokenDeDevolucion(quien)
  return enviarDevolucion(quien, token, campos)
}

/** Nombre completo con el que la devolución aparece en el panel. */
export const clienteDe = (d: Devolucion): string => `${d.firstname} ${d.lastname}`
