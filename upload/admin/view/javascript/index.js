import { loader, config, language, local, storage, template } from '../../../assets/framework/library.js';
import { stylesheet } from '../../../assets/framework/engine.js';

// Base
const base = new URL(document.querySelector('base').href);

// Config
// The admin has no generated config JSON, so seed the defaults here.
config.set('default', new Map(Object.entries({
    config_path: base + 'view/javascript/',
    config_name: 'OpenCart Store',
    config_logo: 'catalog/opencart-logo.png',
    config_url: base.href,
    config_telephone: '01234 567890',
    config_language: 'en-gb',
    config_currency: 'EUR',
    config_country_id: 222,
    config_zone_id: 3563,
    config_customer_group_id: 1,
    config_account_id: 1,
    config_product_count: true,
    config_telephone_status: 1,
    config_captcha: ''
})));

// Locale
if (!local.has('language')) local.set('language', 'en-gb');
if (!local.has('currency')) local.set('currency', 'EUR');

// Language
language.addPath('view/language/' + local.get('language') + '/');

// Storage
storage.addPath('view/data/');

// Template
template.addPath('view/template/');

// Stylesheets used by the web components
stylesheet.addPath('catalog/', '/catalog/view/stylesheet/');
stylesheet.addPath('fontawesome/css/', '/assets/fontawesome/css/');

// Components depend on the paths above, so load them after they are set.
await import('./component.js');

export { loader }
