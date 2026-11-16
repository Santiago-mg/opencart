import { resolve } from 'node:path';

/**
 * Dónde está corriendo OpenCart.
 *
 * Por defecto es la dirección del docker-compose del proyecto
 * (`docker compose up -d opencart`): la tienda en http://localhost y el panel
 * en http://localhost/admin, con la administradora que crea la instalación
 * (admin / admin), y MySQL en 127.0.0.1:3306 con root / opencart. Si la tienda
 * corre en otro lado, se cambian con variables de entorno (ver README).
 */
export const environment = {
  storeUrl: (process.env.OPENCART_URL ?? 'http://localhost').replace(/\/$/, ''),
  admin: {
    username: process.env.OPENCART_ADMIN_USER ?? 'admin',
    password: process.env.OPENCART_ADMIN_PASSWORD ?? 'admin',
  },
  // RF-01 inserta y borra pedidos de prueba directamente en la base.
  database: {
    host: process.env.OPENCART_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.OPENCART_DB_PORT ?? 3306),
    user: process.env.OPENCART_DB_USER ?? 'root',
    password: process.env.OPENCART_DB_PASSWORD ?? 'opencart',
    name: process.env.OPENCART_DB_NAME ?? 'opencart',
    prefix: process.env.OPENCART_DB_PREFIX ?? 'oc_',
  },
  // RF-05 escribe en el registro de errores de la tienda (el error.log que
  // muestra System > Maintenance > Error Logs). En el docker-compose la
  // carpeta upload/ del repositorio es /var/www/html del contenedor, así que
  // desde el Mac el archivo está en upload/system/storage/logs/error.log.
  logFile: process.env.OPENCART_LOG_FILE
    ?? resolve(__dirname, '../../../../..', 'upload/system/storage/logs/error.log'),
};

/** URL completa de una página de la tienda: pageAt('product/search', { search: 'mac' }) */
export const pageAt = (route: string, parameters: Record<string, string | number> = {}): string => {
  const query = Object.entries({ language: 'en-gb', ...parameters })
    .map(([key, value]) => `${ key }=${ encodeURIComponent(String(value)) }`)
    .join('&');
  return `${ environment.storeUrl }/index.php?route=${ route }&${ query }`;
};
