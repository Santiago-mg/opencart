import { loader, local } from '../../library.js';
import { InputSelect } from './select.js';
/**
 * inputCountry
 *
 * @example <input-country name="" value="" target="" input-id=""></input-country>
 *
 * @tag     input-country
 *
 * @attr   string   name   name of the form element
 *
 * optional required disabled
*/

// Storage
const countries = await loader.storage('localisation/country');

class InputCountry extends InputSelect {
	#options = [];
    target = '';

	constructor() { 
		super();
        
		this.#options = Array.from(this.querySelectorAll('option')).map(option => {
			return {
				text: option.textContent,
				value: option.value
			};
		});

        for (let country of countries) {
			this.#options.push({
				text: country.description[local.get('language')] ? country.description[local.get('language')].name : country.name,
				value: country.country_id
			});
		}
	}

    render() {
        return `
            <select name="${this.name}" id="input"${this.disabled ? ' disabled' : ''}${this.required ? ' required' : ''} @ref="input" @change="onChange" class="form-control">
                ${this.#options.map(item => `<option value="${item.value}"${item.value === this.value ? ' selected' : ''}>${item.text}</option>`).join('')}
            </select>
            <div @ref="error" class="invalid-feedback"></div>
        `;
    }

    async handleConnect() {
        super.handleConnect();

        this.target = this.hasAttribute('target') ? document.getElementById(this.getAttribute('target')) : '';
        this.postcode = this.hasAttribute('postcode') ? document.getElementById(this.getAttribute('postcode')) : '';
    }

    onChange(e) {
        super.onChange(e);

        this.value = e.target.value;

        if (this.target) this.target.setAttribute('country_id', this.value);

        if (this.postcode) {
            let country = countries.find(country => country.country_id == this.value);

            if (country && country.postcode_required == 1) {
                this.postcode.setAttribute('required', '');
            } else {
                this.postcode.removeAttribute('required');
            }
        }
    }

    handleChange(e) {
        this.onChange(e);
    }
}

customElements.define('input-country', InputCountry);
