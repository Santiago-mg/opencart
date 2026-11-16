/**
 * Ajax forms
 * ----------
 * Handles the `data-oc-toggle="ajax"` forms in the admin templates. The server
 * replies with JSON; `json.redirect` takes the user to another page,
 * `json.success` is shown in `#alert` and `json.error` marks the matching
 * `#error-*` blocks.
 *
 * A form can also set `data-oc-redirect` to return to another page after a
 * successful save (the language form uses this to go back to the list).
 */
function alert(type, message) {
    const container = document.getElementById('alert');

    if (!container) return;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    container.insertAdjacentHTML('afterbegin', '<div class="alert alert-' + type + ' alert-dismissible"><i class="fa-solid ' + icon + '"></i> ' + message + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
}

function clearErrors(form) {
    for (const element of form.querySelectorAll('.is-invalid')) element.classList.remove('is-invalid');
    for (const element of form.querySelectorAll('.invalid-feedback')) element.textContent = '';
}

document.addEventListener('submit', async (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement) || !form.matches('form[data-oc-toggle="ajax"]')) return;

    event.preventDefault();

    const submitter = event.submitter;
    const action = submitter?.getAttribute('formaction') || form.getAttribute('action');
    const method = submitter?.getAttribute('formmethod') || form.getAttribute('method') || 'POST';

    clearErrors(form);

    try {
        const response = await fetch(action, {
            method: method.toUpperCase(),
            body: new FormData(form)
        });

        if (!response.ok) throw new Error(response.status + ' ' + response.statusText);

        const json = await response.json();

        if (json.error) {
            if (typeof json.error === 'string') {
                alert('danger', json.error);
            } else {
                if (json.error.warning) alert('danger', json.error.warning);

                for (const [name, message] of Object.entries(json.error)) {
                    const input = form.querySelector('[name="' + name + '"]');
                    const feedback = document.getElementById('error-' + name.replaceAll('_', '-'));

                    if (input) input.classList.add('is-invalid');
                    if (feedback) {
                        feedback.textContent = message;
                        feedback.classList.add('d-block');
                    }
                }
            }
        }

        if (json.success) {
            alert('success', json.success);
        }

        const redirect = json.redirect || (json.success ? form.getAttribute('data-oc-redirect') : '');

        if (redirect) {
            window.location = redirect;

            return;
        }

        const load = form.getAttribute('data-oc-load');
        const target = form.getAttribute('data-oc-target');

        if (json.success && load && target) {
            const response = await fetch(load);

            document.querySelector(target).innerHTML = await response.text();
        }
    } catch (error) {
        console.error(error);

        alert('danger', error.message);
    }
});
