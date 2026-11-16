/**
 * Dónde está corriendo OpenCart.
 *
 * Por defecto es la dirección del docker-compose del proyecto
 * (`docker compose up -d opencart`): la tienda en http://localhost y el panel
 * en http://localhost/admin, con la administradora que crea la instalación
 * (admin / admin). Si la tienda corre en otro lado, se cambian con variables
 * de entorno (ver README).
 */
export const environment = {
  storeUrl: (process.env.OPENCART_URL ?? 'http://localhost').replace(/\/$/, ''),
  admin: {
    username: process.env.OPENCART_ADMIN_USER ?? 'admin',
    password: process.env.OPENCART_ADMIN_PASSWORD ?? 'admin',
  },
};

/** URL completa de una página de la tienda: pageAt('product/search', { search: 'mac' }) */
export const pageAt = (route: string, parameters: Record<string, string | number> = {}): string => {
  const query = Object.entries({ language: 'en-gb', ...parameters })
    .map(([key, value]) => `${ key }=${ encodeURIComponent(String(value)) }`)
    .join('&');
  return `${ environment.storeUrl }/index.php?route=${ route }&${ query }`;
};
