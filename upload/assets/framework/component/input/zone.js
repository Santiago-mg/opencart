import { loader, local } from '../../library.js';
import { InputSelect } from './select.js';

/**
 * input-zone
 *
 * @example <input-zone name="" value="" target="" input-id=""></input-zone>
 *
 * @tag     input-zone
 *
 * @attr   string    name   name of the form element
 *
 * optional required disabled
 */
customElements.define('input-zone', class extends InputSelect {
    static observedAttributes = [
        'country_id',
        'value',
        'required',
        'disabled',
        'readonly'
    ];

    async getZones() {
        let country_id = this.getAttribute('country_id');

        if (!country_id) return [];

        let country = await loader.storage('localisation/country-' + country_id);

        if (!(country instanceof Map)) return [];

        return country.get('zone') || [];
    }

    async render() {
        let html = '<select name="' + this.name + '" id="input" @ref="input" @change="onChange" class="form-control"';

        if (this.required) html += ' required';
        if (this.disabled) html += ' disabled';
        if (this.readonly) html += ' readonly';

        html += '>';

        let zones = await this.getZones();

        if (!zones.length) {
            html += '<option value="0">-- Please Select --</option>';
        }

        for (let zone of zones) {
            let description = zone.description[local.get('language')] || {};
            let name = description.name || zone.name || '';

            html += '<option value="' + zone.zone_id + '"';

            if (zone.zone_id == this.value) html += ' selected';

            html += '>' + name + '</option>';
        }

        html += '</select><div @ref="error" class="invalid-feedback"></div>';

        return html;
    }

    async handleConnect() {
        super.handleConnect();
    }

    async handleAttribute(name, value, value_old) {
        if (name === 'country_id') {
            await this.update();

            return;
        }

        super.handleAttribute(name, value, value_old);
    }
});
