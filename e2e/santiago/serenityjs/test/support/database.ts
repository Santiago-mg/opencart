import { createPool, Pool, ResultSetHeader } from 'mysql2/promise';

import { environment } from './environment';
import { LanguageFixture, OrderFixture } from './testData';

/**
 * Acceso directo a MySQL para lo que el panel no puede hacer:
 *
 * - OpenCart no tiene una pantalla para crear pedidos, así que RF-01 inserta
 *   pedidos de prueba y los borra al terminar.
 * - Al borrar un idioma, el panel deja filas huérfanas (ver
 *   removeLanguageLeftovers), así que RF-02 las quita al terminar.
 *
 * Las pruebas hablan con la misma base que la tienda del docker-compose
 * (127.0.0.1:3306, root / opencart, base `opencart`). Si la tienda usa otra
 * base, se configuran las variables OPENCART_DB_* (ver README).
 */

const prefix = environment.database.prefix;

if (!/^[A-Za-z0-9_]+$/.test(prefix)) {
  throw new Error(`El prefijo de base de datos "${ prefix }" no es válido`);
}

let pool: Pool | undefined;

const connection = (): Pool => {
  pool ??= createPool({
    host: environment.database.host,
    port: environment.database.port,
    user: environment.database.user,
    password: environment.database.password,
    database: environment.database.name,
    waitForConnections: true,
    connectionLimit: 2,
    dateStrings: true,
  });
  return pool;
};

const idsList = (ids: number[]): string => ids.map(() => '?').join(', ');

export const Database = {
  /** Inserta un pedido de demostración (columnas de `oc_order` en 4.1.0.3) y devuelve su order_id. */
  async addOrder(order: OrderFixture): Promise<number> {
    const [result] = await connection().query<ResultSetHeader>(
      `INSERT INTO \`${ prefix }order\` SET ?`,
      [{
        subscription_id: 0,
        invoice_no: 0,
        invoice_prefix: '',
        store_id: 0,
        store_name: 'Default',
        store_url: environment.storeUrl,
        customer_id: 0,
        customer_group_id: 1,
        firstname: order.firstName,
        lastname: order.lastName,
        email: order.email,
        telephone: '',
        custom_field: '',
        payment_address_id: 0,
        payment_method: '',
        payment_custom_field: '',
        shipping_address_id: 0,
        shipping_method: '',
        shipping_custom_field: '',
        total: order.total,
        order_status_id: order.statusId,
        language_id: 1,
        language_code: 'en-gb',
        currency_id: 0,
        currency_code: 'USD',
        currency_value: '1.00000000',
        date_added: `${ order.date } 12:00:00`,
        date_modified: `${ order.date } 12:00:00`,
      }],
    );

    return result.insertId;
  },

  async removeOrders(orders: OrderFixture[]): Promise<void> {
    const ids = orders.map((order) => order.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    await connection().query(`DELETE FROM \`${ prefix }order\` WHERE \`order_id\` IN (${ idsList(ids) })`, ids);
  },

  /** Borra pedidos que dejó una corrida anterior interrumpida. */
  async removeLeftoverOrders(): Promise<void> {
    await connection().query(`DELETE FROM \`${ prefix }order\` WHERE \`email\` LIKE 'qa-pedido-%'`);
  },

  /**
   * Al crear un idioma, OpenCart 4.1.0.3 copia las descripciones de los planes
   * de suscripción para ese idioma, pero al borrarlo desde el panel no las
   * borra (deleteLanguage no llama a deleteDescriptionsByLanguageId del modelo
   * catalog/subscription_plan). Se quitan aquí para no dejar filas huérfanas.
   */
  async removeLanguageLeftovers(languages: LanguageFixture[]): Promise<void> {
    const ids = languages.map((language) => language.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    await connection().query(
      `DELETE FROM \`${ prefix }subscription_plan_description\` WHERE \`language_id\` IN (${ idsList(ids) })
        AND \`language_id\` NOT IN (SELECT \`language_id\` FROM \`${ prefix }language\`)`,
      ids,
    );
  },

  async close(): Promise<void> {
    await pool?.end();
    pool = undefined;
  },
};
