/**
 * Datos de prueba.
 *
 * Cada corrida usa códigos de cupón, autores de reseña y apellidos que no
 * existen todavía (llevan un sufijo único), así los escenarios no dependen de
 * lo que dejaron corridas anteriores. Dentro de un mismo escenario, "el cupón"
 * o "la reseña de Carlos" son siempre los mismos: por eso se guardan en un
 * registro que se vacía antes de cada escenario.
 */

/** Productos de la instalación de demostración de OpenCart. */
export const PRODUCTS: Record<string, number> = {
  'iPhone': 40,
  'iMac': 41,
  'MacBook': 43,
  'MacBook Air': 44,
  'MacBook Pro': 45,
  'HTC Touch HD': 28,
  'Palm Treo Pro': 29,
  'Samsung Galaxy Tab 10.1': 49,
};

export const productId = (name: string): number => {
  const id = PRODUCTS[name];
  if (!id) throw new Error(`El producto "${ name }" no está en la lista de productos de prueba`);
  return id;
};

/** Categorías de demostración: "Mac" es hija de "Desktops". */
export const CATEGORIES: Record<string, string> = {
  'Desktops': '20',
  'Laptops & Notebooks': '18',
  'Cameras': '33',
};

export interface Coupon {
  code: string;
  type: 'P' | 'F';
  discount: number;
  total: number;
  dateStart: string;
  dateEnd: string;
  /** Lo asigna el panel al publicar el cupón. */
  id?: number;
}

export interface WrittenReview {
  author: string;
  product: string;
  text: string;
  rating: number;
}

export interface ReturnRequest {
  firstName: string;
  lastName: string;
  email: string;
  orderId: string;
  product: string;
  model: string;
}

/** Los estados de pedido que crea la instalación de demostración. */
export const ORDER_STATUSES: Record<string, number> = {
  Pending: 1,
  Processing: 2,
  Shipped: 3,
  Complete: 5,
  Canceled: 7,
  Denied: 8,
  Failed: 10,
  Refunded: 11,
  Reversed: 12,
  'Canceled Reversal': 9,
};

export interface OrderFixture {
  /** El nombre que se lee en el escenario, sin el sufijo único. */
  base: string;
  customer: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  statusId: number;
  total: string;
  /** Día del pedido, en formato YYYY-MM-DD. */
  date: string;
  id?: number;
}

export interface LanguageFixture {
  base: string;
  name: string;
  code: string;
  locale: string;
  sortOrder: number;
  status: boolean;
  id?: number;
}

export interface CurrencyFixture {
  base: string;
  title: string;
  code: string;
  symbolLeft: string;
  symbolRight: string;
  decimalPlace: number;
  value: string;
  status: boolean;
  id?: number;
}

export interface GeoZoneFixture {
  base: string;
  name: string;
  description: string;
  countryId: number;
  zoneId: number;
  id?: number;
}

export interface TaxRateFixture {
  base: string;
  name: string;
  rate: string;
  type: 'P' | 'F';
  geoZoneId: number;
  customerGroupId: number;
  id?: number;
}

export interface TaxRuleFixture {
  taxRateId: number;
  based: 'shipping' | 'payment' | 'store';
  priority: number;
}

export interface TaxClassFixture {
  base: string;
  title: string;
  description: string;
  rules: TaxRuleFixture[];
  id?: number;
}

const runId = Date.now().toString(36);
let sequence = 0;
const uniqueSuffix = (): string => `${ runId }${ (sequence++).toString(36) }`;

/** Un código corto y estable para idiomas (2-5) y monedas (3). */
const codeFrom = (seed: string, length: number): string => {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return (`Q${ hash.toString(36) }`).toUpperCase().padEnd(length, 'X').slice(0, length);
};

const day = (daysFromToday: number): string =>
  new Date(Date.now() + daysFromToday * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const YESTERDAY = day(-1);
const A_MONTH_AGO = day(-30);
const IN_A_MONTH = day(30);

const MODELS: Record<string, string> = { 'iPhone': 'product 11', 'iMac': 'Product 14', 'MacBook': 'Product 16' };

let coupon: Coupon | undefined;
const couponsToRemove: Coupon[] = [];
const reviewAuthors = new Map<string, string>();
const writtenReviews = new Map<string, WrittenReview>();
const returnRequests = new Map<string, ReturnRequest>();
const customersToRemove: string[] = [];

const orderCustomers = new Map<string, string>();
const orderFixtures = new Map<string, OrderFixture[]>();
const ordersToRemove: OrderFixture[] = [];

const languageFixtures = new Map<string, LanguageFixture>();
const languagesToRemove: LanguageFixture[] = [];
const currencyFixtures = new Map<string, CurrencyFixture>();
const currenciesToRemove: CurrencyFixture[] = [];
const geoZoneFixtures = new Map<string, GeoZoneFixture>();
const geoZonesToRemove: GeoZoneFixture[] = [];
const taxRateFixtures = new Map<string, TaxRateFixture>();
const taxRatesToRemove: TaxRateFixture[] = [];
const taxClassFixtures = new Map<string, TaxClassFixture>();
const taxClassesToRemove: TaxClassFixture[] = [];
let existingTaxRate: { id: number; name: string } | undefined;

export const TestData = {
  /** Se llama antes de cada escenario (features/support/hooks.ts). */
  reset(): void {
    coupon = undefined;
    reviewAuthors.clear();
    writtenReviews.clear();
    returnRequests.clear();
    orderCustomers.clear();
    orderFixtures.clear();
    languageFixtures.clear();
    currencyFixtures.clear();
    geoZoneFixtures.clear();
    taxRateFixtures.clear();
    taxClassFixtures.clear();
    existingTaxRate = undefined;
  },

  /** "El cupón" de este escenario: vigente y sin compra mínima, salvo que se diga otra cosa. */
  coupon(changes: Partial<Coupon> = {}): Coupon {
    if (!coupon) {
      coupon = {
        code: `QA${ uniqueSuffix() }`.toUpperCase().slice(0, 20),
        type: 'P',
        discount: 10,
        total: 0,
        dateStart: A_MONTH_AGO,
        dateEnd: IN_A_MONTH,
        ...changes,
      };
      couponsToRemove.push(coupon);
    }
    return coupon;
  },

  currentCoupon(): Coupon {
    if (!coupon) throw new Error('Este escenario todavía no tiene cupón');
    return coupon;
  },

  couponsToRemove(): Coupon[] {
    return couponsToRemove.splice(0);
  },

  /** Con qué nombre firma sus reseñas este actor (siempre empieza por "QA"). */
  reviewAuthor(actorName: string): string {
    let author = reviewAuthors.get(actorName);
    if (!author) {
      author = `QA ${ actorName } ${ uniqueSuffix() }`.slice(0, 25);
      reviewAuthors.set(actorName, author);
    }
    return author;
  },

  /** Anota la reseña que escribió el actor, para que la administradora la encuentre después. */
  rememberReview(actorName: string, review: WrittenReview): void {
    writtenReviews.set(actorName, review);
  },

  reviewWrittenBy(actorName: string): WrittenReview {
    const review = writtenReviews.get(actorName);
    if (!review) throw new Error(`${ actorName } todavía no ha escrito ninguna reseña en este escenario`);
    return review;
  },

  /** La solicitud de devolución de este actor; el apellido único permite encontrarla en el panel. */
  returnRequest(actorName: string, product = 'iPhone', orderId = '1234'): ReturnRequest {
    let request = returnRequests.get(actorName);
    if (!request) {
      request = {
        firstName: actorName,
        lastName: `QA ${ uniqueSuffix() }`,
        email: `${ actorName.toLowerCase() }.qa@example.com`,
        orderId,
        product,
        model: MODELS[product] ?? 'Product 1',
      };
      returnRequests.set(actorName, request);
      customersToRemove.push(`${ request.firstName } ${ request.lastName }`);
    }
    return request;
  },

  customersToRemove(): string[] {
    return customersToRemove.splice(0);
  },

  // ── RF-12: pedidos ──

  /** El nombre completo que tendrá el cliente en la base, único para esta corrida. */
  orderCustomer(base: string): string {
    let customer = orderCustomers.get(base);
    if (!customer) {
      customer = `${ base } ${ uniqueSuffix() }`.slice(0, 64);
      orderCustomers.set(base, customer);
    }
    return customer;
  },

  order(input: { customer: string; status: string; total: string; date: string }): OrderFixture {
    const customer = this.orderCustomer(input.customer);
    const [firstName, ...rest] = customer.split(' ');
    const suffix = uniqueSuffix();
    const statusId = ORDER_STATUSES[input.status];
    if (!statusId) throw new Error(`El estado de pedido "${ input.status }" no está en la lista de estados de prueba`);

    const fixture: OrderFixture = {
      base: input.customer,
      customer,
      firstName,
      lastName: rest.join(' ') || suffix,
      email: `qa-pedido-${ suffix }@example.com`,
      status: input.status,
      statusId,
      total: Number(input.total).toFixed(4),
      date: input.date,
    };

    const fixtures = orderFixtures.get(input.customer) ?? [];
    fixtures.push(fixture);
    orderFixtures.set(input.customer, fixtures);
    ordersToRemove.push(fixture);

    return fixture;
  },

  orderOfCustomer(base: string): OrderFixture {
    const [first] = orderFixtures.get(base) ?? [];
    if (!first) throw new Error(`Este escenario no creó ningún pedido de "${ base }"`);
    return first;
  },

  ordersOfCustomer(base: string): OrderFixture[] {
    return orderFixtures.get(base) ?? [];
  },

  ordersToRemove(): OrderFixture[] {
    return ordersToRemove.splice(0);
  },

  // ── RF-13: idiomas ──

  language(base: string, changes: Partial<LanguageFixture> = {}): LanguageFixture {
    let fixture = languageFixtures.get(base);
    if (!fixture) {
      const suffix = uniqueSuffix();
      fixture = {
        base,
        name: `${ base } ${ suffix }`.slice(0, 32),
        code: codeFrom(`${ base }${ suffix }`, 5),
        locale: 'es_ES',
        sortOrder: 0,
        status: true,
        ...changes,
      };
      languageFixtures.set(base, fixture);
      languagesToRemove.push(fixture);
    } else {
      Object.assign(fixture, changes);
    }
    return fixture;
  },

  languageNamed(base: string): LanguageFixture {
    const language = languageFixtures.get(base);
    if (!language) throw new Error(`Este escenario no creó el idioma "${ base }"`);
    return language;
  },

  /** Cambia el nombre visible conservando el código y el sufijo único. */
  renameLanguage(base: string, newBase: string): LanguageFixture {
    const language = this.languageNamed(base);
    const suffix = language.name.slice(language.base.length).trim();

    language.base = newBase;
    language.name = `${ newBase } ${ suffix }`.slice(0, 32);
    languageFixtures.set(newBase, language);

    return language;
  },

  languagesToRemove(): LanguageFixture[] {
    return languagesToRemove.splice(0);
  },

  // ── RF-14: monedas ──

  currency(base: string, changes: Partial<CurrencyFixture> = {}): CurrencyFixture {
    let fixture = currencyFixtures.get(base);
    if (!fixture) {
      const suffix = uniqueSuffix();
      fixture = {
        base,
        title: `${ base } ${ suffix }`.slice(0, 32),
        code: codeFrom(`${ base }${ suffix }`, 3),
        symbolLeft: 'Q$',
        symbolRight: '',
        decimalPlace: 2,
        value: '1.25000000',
        status: true,
        ...changes,
      };
      currencyFixtures.set(base, fixture);
      currenciesToRemove.push(fixture);
    } else {
      Object.assign(fixture, changes);
    }
    return fixture;
  },

  currencyNamed(base: string): CurrencyFixture {
    const currency = currencyFixtures.get(base);
    if (!currency) throw new Error(`Este escenario no creó la moneda "${ base }"`);
    return currency;
  },

  currenciesToRemove(): CurrencyFixture[] {
    return currenciesToRemove.splice(0);
  },

  // ── RF-15: zonas geográficas e impuestos ──

  geoZone(base: string, changes: Partial<GeoZoneFixture> = {}): GeoZoneFixture {
    let fixture = geoZoneFixtures.get(base);
    if (!fixture) {
      const suffix = uniqueSuffix();
      fixture = {
        base,
        name: `${ base } ${ suffix }`.slice(0, 64),
        description: `Zona de prueba ${ suffix }`.slice(0, 255),
        // Estados Unidos y Alabama, que existen en la instalación de demostración.
        countryId: 223,
        zoneId: 3613,
        ...changes,
      };
      geoZoneFixtures.set(base, fixture);
      geoZonesToRemove.push(fixture);
    } else {
      Object.assign(fixture, changes);
    }
    return fixture;
  },

  geoZoneNamed(base: string): GeoZoneFixture {
    const geoZone = geoZoneFixtures.get(base);
    if (!geoZone) throw new Error(`Este escenario no creó la zona geográfica "${ base }"`);
    return geoZone;
  },

  geoZonesToRemove(): GeoZoneFixture[] {
    return geoZonesToRemove.splice(0);
  },

  taxRate(base: string, changes: Partial<TaxRateFixture> & { geoZoneId: number }): TaxRateFixture {
    let fixture: TaxRateFixture | undefined = taxRateFixtures.get(base);
    if (!fixture) {
      const suffix = uniqueSuffix();
      fixture = {
        base,
        name: `${ base } ${ suffix }`.slice(0, 32),
        rate: '10.0000',
        type: 'P',
        customerGroupId: 1,
        ...changes,
      };
      taxRateFixtures.set(base, fixture);
      taxRatesToRemove.push(fixture);
    } else {
      Object.assign(fixture, changes);
    }
    return fixture;
  },

  taxRateNamed(base: string): TaxRateFixture {
    const taxRate = taxRateFixtures.get(base);
    if (!taxRate) throw new Error(`Este escenario no creó la tasa de impuesto "${ base }"`);
    return taxRate;
  },

  taxRatesToRemove(): TaxRateFixture[] {
    return taxRatesToRemove.splice(0);
  },

  taxClass(base: string, changes: Partial<TaxClassFixture> = {}): TaxClassFixture {
    let fixture = taxClassFixtures.get(base);
    if (!fixture) {
      const suffix = uniqueSuffix();
      fixture = {
        base,
        title: `${ base } ${ suffix }`.slice(0, 32),
        description: `Clase de impuesto de prueba ${ suffix }`.slice(0, 255),
        rules: [],
        ...changes,
      };
      taxClassFixtures.set(base, fixture);
      taxClassesToRemove.push(fixture);
    } else {
      Object.assign(fixture, changes);
    }
    return fixture;
  },

  taxClassNamed(base: string): TaxClassFixture {
    const taxClass = taxClassFixtures.get(base);
    if (!taxClass) throw new Error(`Este escenario no creó la clase de impuesto "${ base }"`);
    return taxClass;
  },

  taxClassesToRemove(): TaxClassFixture[] {
    return taxClassesToRemove.splice(0);
  },

  /** Una tasa que ya existía en la tienda; no se borra al terminar el escenario. */
  rememberExistingTaxRate(id: number, name: string): void {
    existingTaxRate = { id, name };
  },

  existingTaxRate(): { id: number; name: string } {
    if (!existingTaxRate) throw new Error('Este escenario todavía no eligió una tasa de impuesto existente');
    return existingTaxRate;
  },
};
