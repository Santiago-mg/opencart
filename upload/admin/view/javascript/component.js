// Framework
export { WebComponent } from '../../../assets/framework/engine.js';
import '../../../assets/framework/component.js';

// The admin templates still use the old custom element names. Register them as
// subclasses of the current components so both names keep working.
const aliases = {
    'x-switch': 'input-switch',
    'x-pagination': 'nav-pagination',
    'x-country': 'input-country',
    'x-zone': 'input-zone',
    'checkbox-all': 'input-checkbox'
};

for (const [name, component] of Object.entries(aliases)) {
    if (!customElements.get(name)) {
        customElements.define(name, class extends customElements.get(component) {});
    }
}
