import { WebComponent } from '../../engine.js';

const isChecked = (element) => {
    if (!element.hasAttribute('checked')) return false;

    const value = element.getAttribute('checked');

    return value === '1' || value === 'true' || value === 'checked';
};

customElements.define('input-switch', class extends WebComponent {
    static formAssociated = true;
    static observedAttributes = [
        'name',
        'value',
        'required',
        'disabled',
        'readonly'
    ];

    states() {
		return {
			value: this.getAttribute('value'),
            error: '',
            checked: isChecked(this),
            required: this.hasAttribute('required'),
            disabled: this.hasAttribute('disabled'),
            readonly: this.hasAttribute('readonly')
        };
    }
    
	get label() {
        return this.hasAttribute('label') ? this.getAttribute('label') : '';
    }

    get name() {
        return this.getAttribute('name');
    }

    get value() {
        return this.state.get('value');
    }
	
    get checked() {
        return isChecked(this);
    }

    set checked(value) {
        this.toggleAttribute('checked', value);
	}
	
    get required() {
        return this.state.get('required');
    }

    get disabled() {
        return this.state.get('disabled');
    }

    get readonly() {
        return this.state.get('readonly');
	}

    render() {
        let html = '<div class="form-switch form-switch-lg">';

        html += '<input type="hidden" name="' + this.getAttribute('name') + '" value="" @change="handleChange"/>';
        html += '<input type="checkbox" name="' + this.getAttribute('name') + '" value="' + this.getAttribute('value') + '" @change="handleChange" class="form-check-input"';

        if (this.checked) {
            html += ' checked';
        }

        if (this.hasAttribute('disabled')) {
            html += ' disabled';
        }

        if (this.hasAttribute('readonly')) {
            html += ' readonly';
        }

        html += '/>';
        html += '</div>';
        html += '<div @ref="error" class="invalid-feedback"></div>';

        return html;
    }

    handleConnect() {
        this.internal.setFormValue(this.checked ? this.getAttribute('value') : '');
    }

    handleChange(e) {
        this.checked = e.target.checked;

        this.internal.setFormValue(this.checked ? this.getAttribute('value') : '');
    }

    // Updates the field in place, so nothing the user typed (or focus) is lost.
    stateChecked(value) {
        value = value ?? false;

        this.toggleAttribute('checked', value);

        this.internal.setFormValue(value ? this.getAttribute('value') : '');

        if (this.input) this.input.toggleAttribute('checked', value);
    }

    stateError(error) {
        if (!this.input) return;

        this.input.classList.toggle('is-invalid', !!error);

        console.log('is-invalid', error);

        this.error.textContent = error ?? '';

        try {
            if (error) {
                this.internal.states.add('invalid');
            } else {
                this.internal.states.delete('invalid');
            }
        } catch (e) {
            // CustomStateSet not supported; .is-invalid still shows the error.
        }
    }
});