import { AnswersQuestions, Interaction, Question, Task, TakeNotes, UsesAbilities } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';

import { environment } from '../../support/environment';
import { Coupon, CurrencyFixture, GeoZoneFixture, LanguageFixture, TaxClassFixture, WrittenReview, productId } from '../../support/testData';

/**
 * El panel de administración, usado por HTTP para PREPARAR datos y revisar el
 * resultado (blended testing, igual que en CelularPro con la API).
 *
 * OpenCart no tiene una API REST para el panel: sus pantallas envían
 * formularios. Por eso aquí se envían esos mismos formularios con la
 * habilidad CallAnApi, guardando en las notas del actor la cookie de la
 * sesión y el user_token que el panel exige en cada dirección.
 */

/** Lo que la administradora anota en su libreta al iniciar sesión en el panel. */
export interface AdminNotes {
  adminCookie: string;
  userToken: string;
}

type Actor = UsesAbilities & AnswersQuestions;
type Fields = Record<string, string | number | Array<string | number>>;

const BROWSER = 'Mozilla/5.0 (pruebas E2E de OpenCart)';

/** Los campos como los manda un formulario HTML: a=1&b=2&selected[]=3&selected[]=4 */
const asForm = (fields: Fields): string =>
  Object.entries(fields)
    .flatMap(([key, value]) => (Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]))
    .map(([key, value]) => `${ encodeURIComponent(String(key)) }=${ encodeURIComponent(String(value)) }`)
    .join('&');

const panelUrl = (route: string, token: string, parameters: Record<string, string | number> = {}): string =>
  `admin/index.php?route=${ route }&user_token=${ token }${
    Object.entries(parameters).map(([key, value]) => `&${ key }=${ encodeURIComponent(String(value)) }`).join('') }`;

/** Envía una petición al panel con la sesión que el actor anotó. */
async function callThePanel(actor: Actor, route: string, options: { parameters?: Record<string, string | number>; fields?: Fields } = {}) {
  const notepad = TakeNotes.as(actor).notepad;
  const cookie = notepad.get('adminCookie') as string;
  const token = notepad.get('userToken') as string;
  return CallAnApi.as(actor).request({
    method: options.fields ? 'POST' : 'GET',
    url: panelUrl(route, token, options.parameters),
    headers: { 'Cookie': cookie, 'User-Agent': BROWSER, 'Content-Type': 'application/x-www-form-urlencoded' },
    data: options.fields ? asForm(options.fields) : undefined,
  });
}

/** Los identificadores (casillas selected[]) de las filas de una lista del panel. */
const idsInTheList = (html: string): number[] =>
  [...html.matchAll(/name="selected\[\]" value="(\d+)"/g)].map((match) => Number(match[1]));

/** Una fila de una lista del panel, con sus celdas ya sin etiquetas HTML. */
export interface PanelListRow {
  id: number;
  cells: string[];
  htmlCells: string[];
  /** Las clases de la fila (<tr class="…">). */
  classes: string[];
}

const plainText = (html: string): string =>
  html.replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();

/** Las filas de una lista del panel (las que tienen una casilla selected[]). */
export const rowsInTheList = (html: string): PanelListRow[] => {
  const body = html.slice(html.indexOf('<tbody>'));

  return [...body.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)]
    .map(([, attributes, row]) => {
      const id = Number(row.match(/name="selected\[\]" value="(\d+)"/)?.[1]);
      if (!id) return undefined;

      const htmlCells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
      const classes = (attributes.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean);

      return { id, cells: htmlCells.map(plainText), htmlCells, classes };
    })
    .filter((row): row is PanelListRow => row !== undefined);
};

/**
 * Si una fila de idiomas o monedas está habilitada. En OpenCart 4.1.0.3 esas
 * listas no tienen columna de estado: la fila deshabilitada se ve atenuada
 * (<tr class="table-active opacity-50">).
 */
export const statusShownIn = (row: PanelListRow): 'Enabled' | 'Disabled' =>
  (row.classes.includes('opacity-50') ? 'Disabled' : 'Enabled');

/** El contenido de los <textarea> de una página del panel (por ejemplo, el visor de logs). */
export const textareasInThePage = (html: string): string[] =>
  [...html.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea>/g)].map((match) => match[1]);

/**
 * Pide una lista del panel página por página. Las listas de idiomas, monedas y
 * zonas no filtran por nombre, así que la única forma de encontrar un registro
 * recién creado es recorrerlas.
 */
export async function callThePanelList(actor: Actor, route: string, parameters: Record<string, string | number> = {}): Promise<PanelListRow[]> {
  const rows: PanelListRow[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= 20; page++) {
    const answer = await callThePanel(actor, route, { parameters: { ...parameters, page } });
    const pageRows = rowsInTheList(String(answer.data)).filter((row) => !seen.has(row.id));

    if (pageRows.length === 0) break;

    pageRows.forEach((row) => seen.add(row.id));
    rows.push(...pageRows);
  }

  return rows;
}

/** Inicia sesión en el panel y anota la cookie y el token. */
export const StartAdminSession = {
  asAdministrator: () => Interaction.where('#actor inicia sesión en el panel de administración', async (actor) => {
    const api = CallAnApi.as(actor);
    const loginPage = await api.request({ method: 'GET', url: 'admin/index.php?route=common/login', headers: { 'User-Agent': BROWSER } });
    const cookie = ((loginPage.headers['set-cookie'] ?? []) as string[]).map((value) => value.split(';')[0]).join('; ');
    const loginToken = String(loginPage.data).match(/login_token=([a-f0-9]+)/)?.[1] ?? '';

    const answer = await api.request({
      method: 'POST',
      url: `admin/index.php?route=common/login.login&login_token=${ loginToken }`,
      headers: { 'Cookie': cookie, 'User-Agent': BROWSER, 'Content-Type': 'application/x-www-form-urlencoded' },
      data: asForm({ username: environment.admin.username, password: environment.admin.password }),
    });
    const userToken = String(answer.data?.redirect ?? '').match(/user_token=([a-f0-9]+)/)?.[1];
    if (!userToken) throw new Error('No se pudo iniciar sesión en el panel de administración');

    TakeNotes.as(actor).notepad.set('adminCookie', cookie).set('userToken', userToken);
  }),
};

/** Acceso de bajo nivel al panel, compartido por las tareas de RF-01 a RF-05. */
export const AdminPanel = {
  call: callThePanel,
  list: callThePanelList,
  rows: rowsInTheList,
  status: statusShownIn,
  textareas: textareasInThePage,
  ids: idsInTheList,
  form: asForm,
  url: panelUrl,
};

/** RF-08: Marketing > Coupons > Add New. */
export const PublishCoupon = {
  called: (coupon: Coupon) => Task.where(`#actor publica el cupón ${ coupon.code }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor guarda el cupón ${ coupon.code }`, async (actor) => {
      const answer = await callThePanel(actor, 'marketing/coupon.save', {
        fields: {
          coupon_id: 0, name: `Cupón de prueba ${ coupon.code }`, code: coupon.code, type: coupon.type,
          discount: coupon.discount, total: coupon.total, logged: 0, shipping: 0,
          date_start: coupon.dateStart, date_end: coupon.dateEnd, uses_total: 0, uses_customer: 0, status: 1,
        },
      });
      if (!answer.data?.coupon_id) throw new Error(`El panel no creó el cupón: ${ JSON.stringify(answer.data) }`);
      coupon.id = answer.data.coupon_id;
    }),
  ),
};

/** RF-09: Catalog > Reviews > editar la reseña y marcarla como habilitada. */
export const ApproveReview = {
  of: (review: WrittenReview) => Task.where(`#actor habilita la reseña de ${ review.author }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor habilita la reseña de ${ review.author }`, async (actor) => {
      const list = await callThePanel(actor, 'catalog/review.list', { parameters: { filter_author: review.author } });
      const [reviewId] = idsInTheList(String(list.data));
      if (!reviewId) throw new Error(`En el panel no hay ninguna reseña de "${ review.author }"`);
      await callThePanel(actor, 'catalog/review.save', {
        fields: {
          review_id: reviewId, author: review.author, product_id: productId(review.product), text: review.text,
          rating: review.rating, date_added: new Date().toISOString().slice(0, 10), status: 1,
        },
      });
    }),
  ),
};

/** Limpieza al final de cada escenario: borra lo que el escenario creó. */
export const CleanUp = {
  coupons: (coupons: Coupon[]) => Interaction.where('#actor borra los cupones de prueba', async (actor) => {
    const ids = coupons.map((coupon) => coupon.id).filter((id): id is number => id !== undefined);
    if (ids.length > 0) await callThePanel(actor, 'marketing/coupon.delete', { fields: { 'selected[]': ids } });
  }),
  reviewsSignedWith: (prefix: string) => Interaction.where(`#actor borra las reseñas de "${ prefix }…"`, async (actor) => {
    // El panel muestra las reseñas de a 10: se borra página por página hasta que no quede ninguna.
    for (let page = 0; page < 20; page++) {
      const ids = idsInTheList(String((await callThePanel(actor, 'catalog/review.list', { parameters: { filter_author: prefix } })).data));
      if (ids.length === 0) return;
      await callThePanel(actor, 'catalog/review.delete', { fields: { 'selected[]': ids } });
    }
  }),
  returnsOf: (customers: string[]) => Interaction.where('#actor borra las devoluciones de prueba', async (actor) => {
    for (const customer of customers) {
      const ids = idsInTheList(String((await callThePanel(actor, 'sale/returns.list', { parameters: { filter_customer: customer } })).data));
      if (ids.length > 0) await callThePanel(actor, 'sale/returns.delete', { fields: { 'selected[]': ids } });
    }
  }),
  languages: (languages: LanguageFixture[]) => removeFromTheList('#actor borra los idiomas de prueba', 'localisation/language', languages),
  currencies: (currencies: CurrencyFixture[]) => removeFromTheList('#actor borra las monedas de prueba', 'localisation/currency', currencies),
  // Primero las clases (sus reglas usan tasas) y después las zonas geográficas.
  taxClasses: (taxClasses: TaxClassFixture[]) => removeFromTheList('#actor borra las clases de impuesto de prueba', 'localisation/tax_class', taxClasses),
  geoZones: (geoZones: GeoZoneFixture[]) => removeFromTheList('#actor borra las zonas geográficas de prueba', 'localisation/geo_zone', geoZones),
};

/** Borra desde el panel los registros de prueba que todavía aparecen en su lista. */
function removeFromTheList(description: string, section: string, records: Array<{ id?: number }>) {
  return Interaction.where(description, async (actor) => {
    const ids = records.map((record) => record.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    const existing = new Set((await callThePanelList(actor, `${ section }.list`)).map((row) => row.id));
    const present = ids.filter((id) => existing.has(id));
    if (present.length > 0) await callThePanel(actor, `${ section }.delete`, { fields: { 'selected[]': present } });
  });
}

/** Lo que la administradora ve en Sales > Returns. */
export const ReturnsInThePanel = {
  statusesOf: (customer: string) => Question.about(`estados de las devoluciones de ${ customer } en el panel`, async (actor) => {
    const html = String((await callThePanel(actor, 'sale/returns.list', { parameters: { filter_customer: customer } })).data);
    const body = html.slice(html.indexOf('<tbody>'));
    // Columnas: casilla | id | pedido | cliente | producto | modelo | estado | fecha | editar
    return body.split(/<tr[\s>]/).slice(1)
      .filter((row) => row.includes('name="selected[]"'))
      .map((row) => [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1].replace(/<[^>]+>/g, '').trim())[6]);
  }),
};
