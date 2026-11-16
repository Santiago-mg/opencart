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

const runId = Date.now().toString(36);
let sequence = 0;
const uniqueSuffix = (): string => `${ runId }${ (sequence++).toString(36) }`;

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

export const TestData = {
  /** Se llama antes de cada escenario (features/support/hooks.ts). */
  reset(): void {
    coupon = undefined;
    reviewAuthors.clear();
    writtenReviews.clear();
    returnRequests.clear();
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
};
