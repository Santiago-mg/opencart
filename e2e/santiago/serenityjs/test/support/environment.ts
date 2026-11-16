/**
 * Dónde está corriendo OpenCart.
 *
 * Por defecto es la dirección del docker-compose del proyecto
 * (`docker compose up -d opencart`): la tienda en http://localhost y el panel
 * en http://localhost/admin, con la administradora que crea la instalación
 * (admin / admin). Si la tienda corre en otro lado, se cambian con variables
 * de entorno (ver README).
 */
import { resolve } from 'node:path';

export const environment = {
  storeUrl: (process.env.OPENCART_URL ?? 'http://localhost').replace(/\/$/, ''),
  admin: {
    username: process.env.OPENCART_ADMIN_USER ?? 'admin',
    password: process.env.OPENCART_ADMIN_PASSWORD ?? 'admin',
  },
  database: {
    host: process.env.OPENCART_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.OPENCART_DB_PORT ?? 3306),
    user: process.env.OPENCART_DB_USER ?? 'opencart',
    password: process.env.OPENCART_DB_PASSWORD ?? 'opencart',
    name: process.env.OPENCART_DB_NAME ?? 'opencart',
    prefix: process.env.OPENCART_DB_PREFIX ?? 'oc_',
  },
  // RF-16 usa un archivo de registro propio para no mezclar sus entradas con
  // los errores reales de la tienda. El visor del panel lista todos los .log
  // de la carpeta, así que el escenario prueba la misma pantalla.
  logFile: process.env.OPENCART_LOG_FILE
    ?? resolve(__dirname, '../../../../..', 'upload/system/storage/logs/qa-e2e.log'),
};

/** URL completa de una página de la tienda: pageAt('product/search', { search: 'mac' }) */
export const pageAt = (route: string, parameters: Record<string, string | number> = {}): string => {
  const query = Object.entries({ language: 'en-gb', ...parameters })
    .map(([key, value]) => `${ key }=${ encodeURIComponent(String(value)) }`)
    .join('&');
  return `${ environment.storeUrl }/index.php?route=${ route }&${ query }`;
};
