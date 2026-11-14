import request from 'supertest'
import { NAVEGADOR, URL_TIENDA, leerRespuesta } from './tienda'

/**
 * El panel de administración, usado por HTTP.
 *
 * Varias pruebas necesitan algo que solo puede hacer la administradora:
 * publicar un cupón, aprobar una reseña o cambiar el estado de una
 * devolución. En vez de hacerlo a mano antes de correr la suite, cada prueba
 * lo prepara aquí (Arrange) y al terminar borra lo que creó.
 */
export const ADMIN = {
  usuario: process.env.OPENCART_ADMIN_USER ?? 'admin',
  clave: process.env.OPENCART_ADMIN_PASSWORD ?? 'admin',
}

const PANEL = '/admin/index.php'

export interface Panel {
  agente: ReturnType<typeof request.agent>
  token: string
}

/** Dirección de una página o acción del panel. */
export function rutaPanel(route: string, token: string, parametros: Record<string, string | number> = {}): string {
  const consulta = Object.entries({ user_token: token, ...parametros })
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(String(valor))}`)
    .join('&')
  return `${PANEL}?route=${route}&${consulta}`
}

/** Inicia sesión en el panel y devuelve la sesión con su token. */
export async function iniciarSesionEnElPanel(usuario = ADMIN.usuario, clave = ADMIN.clave): Promise<Panel> {
  const agente = request.agent(URL_TIENDA).set('User-Agent', NAVEGADOR)
  const formulario = await agente.get(`${PANEL}?route=common/login`)
  const loginToken = formulario.text.match(/login_token=([a-f0-9]+)/)?.[1] ?? ''
  const res = await agente
    .post(`${PANEL}?route=common/login.login&login_token=${loginToken}`)
    .type('form')
    .send({ username: usuario, password: clave })
  const token = String(res.body.redirect ?? '').match(/user_token=([a-f0-9]+)/)?.[1]
  if (!token) throw new Error(`No se pudo iniciar sesión en el panel como "${usuario}"`)
  return { agente, token }
}

/** Envía un formulario del panel. */
export function enviarAlPanel(panel: Panel, route: string, campos: object, parametros: Record<string, string | number> = {}) {
  return panel.agente.post(rutaPanel(route, panel.token, parametros)).type('form').buffer(true).parse(leerRespuesta).send(campos)
}

// ── Cupones (Marketing > Coupons) ─────────────────────────────────────────

export interface Cupon {
  name: string
  code: string
  /** 'P' = porcentaje, 'F' = monto fijo */
  type: 'P' | 'F'
  discount: number
  /** Compra mínima para poder usarlo. */
  total: number
  logged: 0 | 1
  shipping: 0 | 1
  date_start: string
  date_end: string
  uses_total: number
  uses_customer: number
  status: 0 | 1
  coupon_id?: number
}

const corrida = Date.now().toString(36).toUpperCase()
let consecutivo = 0

/** Un código que no existe todavía, para que las pruebas se puedan repetir. */
export const codigoUnico = (prefijo = 'QA'): string => `${prefijo}${corrida}${(consecutivo++).toString(36).toUpperCase()}`.slice(0, 20)

const fecha = (diasDesdeHoy: number): string => {
  const dia = new Date(Date.now() + diasDesdeHoy * 24 * 60 * 60 * 1000)
  return dia.toISOString().slice(0, 10)
}

export const AYER = fecha(-1)
export const HACE_UN_MES = fecha(-30)
export const EN_UN_MES = fecha(30)
export const MANANA = fecha(1)

/** Un cupón vigente del 10 %; cada prueba cambia solo lo que le interesa. */
export function cupon(cambios: Partial<Cupon> = {}): Cupon {
  const code = cambios.code ?? codigoUnico()
  return {
    name: `Cupón de prueba ${code}`,
    code,
    type: 'P',
    discount: 10,
    total: 0,
    logged: 0,
    shipping: 0,
    date_start: HACE_UN_MES,
    date_end: EN_UN_MES,
    uses_total: 0,
    uses_customer: 0,
    status: 1,
    ...cambios,
  }
}

const cuponesCreados: number[] = []

/** Publica el cupón desde el panel y lo anota para borrarlo al final. */
export async function publicarCupon(panel: Panel, datos: Cupon): Promise<Cupon> {
  const res = await enviarAlPanel(panel, 'marketing/coupon.save', { coupon_id: 0, ...datos })
  if (!res.body.coupon_id) throw new Error(`El panel no creó el cupón: ${JSON.stringify(res.body)}`)
  cuponesCreados.push(res.body.coupon_id)
  return { ...datos, coupon_id: res.body.coupon_id }
}

/** Borra los cupones que publicó este archivo de pruebas. */
export async function borrarCuponesDePrueba(panel: Panel): Promise<void> {
  if (cuponesCreados.length === 0) return
  await enviarAlPanel(panel, 'marketing/coupon.delete', { 'selected[]': cuponesCreados.splice(0) })
}

// ── Reseñas (Catalog > Reviews) ───────────────────────────────────────────

export interface ResenaEnElPanel {
  review_id: number
  producto: string
  autor: string
  calificacion: number
  /** En la lista del panel, las reseñas sin aprobar salen atenuadas. */
  habilitada: boolean
}

/** Las celdas de cada fila de una tabla del panel, ya sin etiquetas. */
function filasDe(html: string): Array<{ fila: string; celdas: string[] }> {
  const cuerpo = html.slice(html.indexOf('<tbody>'))
  return cuerpo
    .split(/<tr[\s>]/)
    .slice(1)
    .map((fila) => ({
      fila,
      celdas: [...fila.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(),
      ),
    }))
}

/** Las reseñas de ese autor que aparecen en el panel. */
export async function resenasEnElPanel(panel: Panel, autor: string): Promise<ResenaEnElPanel[]> {
  const res = await panel.agente.get(rutaPanel('catalog/review.list', panel.token, { filter_author: autor }))
  const resenas: ResenaEnElPanel[] = []
  for (const { fila, celdas } of filasDe(res.text)) {
    const id = fila.match(/name="selected\[\]" value="(\d+)"/)
    if (!id) continue
    resenas.push({
      review_id: Number(id[1]),
      producto: celdas[1],
      autor: celdas[2],
      calificacion: Number(celdas[3]),
      habilitada: !fila.startsWith('class="table-active'),
    })
  }
  return resenas
}

export interface DatosDeResena {
  author: string
  product_id: number
  text: string
  rating: number
}

/** Habilita (o deshabilita) una reseña, como hace la administradora al editarla. */
export function cambiarEstadoDeResena(panel: Panel, reviewId: number, datos: DatosDeResena, habilitada: boolean) {
  return enviarAlPanel(panel, 'catalog/review.save', {
    review_id: reviewId,
    ...datos,
    date_added: new Date().toISOString().slice(0, 10),
    status: habilitada ? 1 : 0,
  })
}

/** Borra todas las reseñas de ese autor. */
export async function borrarResenasDe(panel: Panel, autor: string): Promise<void> {
  const ids = (await resenasEnElPanel(panel, autor)).map((r) => r.review_id)
  if (ids.length > 0) await enviarAlPanel(panel, 'catalog/review.delete', { 'selected[]': ids })
}

// ── Devoluciones (Sales > Returns) ────────────────────────────────────────

export interface DevolucionEnElPanel {
  return_id: number
  pedido: string
  cliente: string
  producto: string
  modelo: string
  estado: string
}

/** Las devoluciones de ese cliente que aparecen en el panel. */
export async function devolucionesEnElPanel(panel: Panel, cliente: string): Promise<DevolucionEnElPanel[]> {
  const res = await panel.agente.get(rutaPanel('sale/returns.list', panel.token, { filter_customer: cliente }))
  const devoluciones: DevolucionEnElPanel[] = []
  for (const { fila, celdas } of filasDe(res.text)) {
    const id = fila.match(/name="selected\[\]" value="(\d+)"/)
    if (!id) continue
    devoluciones.push({
      return_id: Number(id[1]),
      pedido: celdas[2],
      cliente: celdas[3],
      producto: celdas[4],
      modelo: celdas[5],
      estado: celdas[6],
    })
  }
  return devoluciones
}

/** Estados de devolución de la instalación de demostración. */
export const ESTADO_DEVOLUCION = { pendiente: 1, esperandoProductos: 2, completa: 3 } as const

/** Cambia el estado de una devolución y deja un comentario en su historial. */
export function cambiarEstadoDeDevolucion(panel: Panel, returnId: number | string, estado: number, comentario = '') {
  return enviarAlPanel(panel, 'sale/returns.addHistory', { return_status_id: estado, comment: comentario, notify: 0 }, { return_id: returnId })
}

/** Borra todas las devoluciones de ese cliente. */
export async function borrarDevolucionesDe(panel: Panel, cliente: string): Promise<void> {
  const ids = (await devolucionesEnElPanel(panel, cliente)).map((d) => d.return_id)
  if (ids.length > 0) await enviarAlPanel(panel, 'sale/returns.delete', { 'selected[]': ids })
}
