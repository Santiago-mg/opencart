import { createPool, Pool, ResultSetHeader } from 'mysql2/promise';

import { environment } from './environment';
import { GeoZoneFixture, OrderFixture, TaxClassFixture, TaxRateFixture } from './testData';

/**
 * Acceso directo a MySQL para los datos que el panel no puede preparar:
 *
 * - OpenCart no tiene una pantalla para crear pedidos, así que RF-12 inserta
 *   pedidos de prueba y los borra al terminar.
 * - En esta versión de OpenCart el panel falla al borrar una zona geográfica y
 *   al crear una tasa de impuesto (ver README), por eso la limpieza de RF-15
 *   usa SQL.
 *
 * Las pruebas hablan con la misma base que la tienda del docker-compose. Si la
 * tienda está en otro host, se configuran OPENCART_DB_* (ver README).
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
  /** Inserta un pedido de demostración y devuelve su order_id. */
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

  /** Inserta una tasa de impuesto con su grupo de clientes (para preparar RF-15). */
  async addTaxRate(taxRate: TaxRateFixture): Promise<number> {
    const [result] = await connection().query<ResultSetHeader>(
      `INSERT INTO \`${ prefix }tax_rate\` SET ?`,
      [{
        name: taxRate.name,
        rate: taxRate.rate,
        type: taxRate.type,
        geo_zone_id: taxRate.geoZoneId,
      }],
    );

    await connection().query(
      `INSERT INTO \`${ prefix }tax_rate_to_customer_group\` SET ?`,
      [{ tax_rate_id: result.insertId, customer_group_id: taxRate.customerGroupId }],
    );

    return result.insertId;
  },

  async removeTaxRates(taxRates: TaxRateFixture[]): Promise<void> {
    const ids = taxRates.map((taxRate) => taxRate.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    await connection().query(`DELETE FROM \`${ prefix }tax_rate_to_customer_group\` WHERE \`tax_rate_id\` IN (${ idsList(ids) })`, ids);
    await connection().query(`DELETE FROM \`${ prefix }tax_rate\` WHERE \`tax_rate_id\` IN (${ idsList(ids) })`, ids);
  },

  async removeGeoZones(geoZones: GeoZoneFixture[]): Promise<void> {
    const ids = geoZones.map((geoZone) => geoZone.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    await connection().query(`DELETE FROM \`${ prefix }zone_to_geo_zone\` WHERE \`geo_zone_id\` IN (${ idsList(ids) })`, ids);
    await connection().query(`DELETE FROM \`${ prefix }geo_zone\` WHERE \`geo_zone_id\` IN (${ idsList(ids) })`, ids);
  },

  async removeTaxClasses(taxClasses: TaxClassFixture[]): Promise<void> {
    const ids = taxClasses.map((taxClass) => taxClass.id).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    await connection().query(`DELETE FROM \`${ prefix }tax_rule\` WHERE \`tax_class_id\` IN (${ idsList(ids) })`, ids);
    await connection().query(`DELETE FROM \`${ prefix }tax_class\` WHERE \`tax_class_id\` IN (${ idsList(ids) })`, ids);
  },

  async close(): Promise<void> {
    await pool?.end();
    pool = undefined;
  },
};
