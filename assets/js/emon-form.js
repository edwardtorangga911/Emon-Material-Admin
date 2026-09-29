/**
 * Emon Material Admin - Form Validation Engine (emon-form.js)
 * Attribute-driven inline validation. Zero dependencies.
 *
 * Usage: <input data-validate="required|email|min:6|max:100">
 * Init:  EmonForm.init('#my-form');
 */

(function () {
  'use strict';

  const RULES = {
    required: (v) => v.trim() !== '' || 'Wajib diisi',
    email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Format email tidak valid',
    min: (v, n) => !v || v.length >= +n || `Minimal ${n} karakter`,
    max: (v, n) => !v || v.length <= +n || `Maksimal ${n} karakter`,
    minval: (v, n) => !v || +v >= +n || `Nilai minimal ${n}`,
    maxval: (v, n) => !v || +v <= +n || `Nilai maksimal ${n}`,
    numeric: (v) => !v || /^\d+(\.\d+)?$/.test(v) || 'Harus angka',
    phone: (v) => !v || /^[\d\s\-+()]{8,15}$/.test(v) || 'Nomor telepon tidak valid',
    url: (v) => !v || /^https?:\/\/.+/.test(v) || 'URL harus diawali http:// atau https://',
    alpha: (v) => !v || /^[a-zA-Z\s]+$/.test(v) || 'Hanya huruf yang diizinkan',
    match: (v, fieldId) => {
      const other = document.getElementById(fieldId);
      return !v || !other || v === other.value || 'Konfirmasi tidak cocok';
    }
  };

  function getError(input) {
    const rules = (input.dataset.validate || '').split('|').filter(Boolean);
    const value = input.value;
    for (const rule of rules) {
      const [name, param] = rule.split(':');
      const fn = RULES[name];
      if (!fn) continue;
      const result = fn(value, param);
      if (result !== true) return result;
    }
    return null;
  }

  function showError(input, msg) {
    input.classList.add('ring-2', 'ring-error', '!border-error');
    input.classList.remove('ring-primary');
    let errEl = input.parentElement.querySelector('.emon-field-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'emon-field-error text-[11px] text-error mt-1 font-medium';
      input.parentElement.appendChild(errEl);
    }
    errEl.textContent = msg;
  }

  function clearError(input) {
    input.classList.remove('ring-2', 'ring-error', '!border-error');
    const errEl = input.parentElement.querySelector('.emon-field-error');
    if (errEl) errEl.remove();
  }

  const EmonForm = {
    /**
     * Init validation on a form. Auto-attaches blur + submit handlers.
     * @param {string|HTMLFormElement} formSelector
     * @param {Function} onSuccess - called with FormData on valid submit
     */
    init(formSelector, onSuccess) {
      const form = typeof formSelector === 'string'
        ? document.querySelector(formSelector)
        : formSelector;
      if (!form) return;

      const inputs = form.querySelectorAll('[data-validate]');

      // Live validation on blur
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          const err = getError(input);
          err ? showError(input, err) : clearError(input);
        });
        // Clear on focus
        input.addEventListener('focus', () => clearError(input));
      });

      // Submit validation
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
          const err = getError(input);
          if (err) {
            showError(input, err);
            valid = false;
            if (!firstInvalid) firstInvalid = input;
          } else {
            clearError(input);
          }
        });

        if (!valid) {
          firstInvalid?.focus();
          if (window.EmonToast) EmonToast.warning('Periksa kembali form sebelum mengirim');
          return;
        }

        if (typeof onSuccess === 'function') {
          onSuccess(new FormData(form), form);
        }
      });

      return {
        validate: () => {
          let valid = true;
          inputs.forEach(input => {
            const err = getError(input);
            err ? showError(input, err) : clearError(input);
            if (err) valid = false;
          });
          return valid;
        },
        reset: () => inputs.forEach(clearError)
      };
    },

    /** Validate a single input programmatically */
    check(input) {
      const err = getError(input);
      err ? showError(input, err) : clearError(input);
      return !err;
    },

    /** Add custom rule */
    addRule(name, fn) {
      RULES[name] = fn;
    }
  };

  window.EmonForm = EmonForm;

  // Auto-init forms with data-emon-form attribute
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-emon-form]').forEach(form => {
      EmonForm.init(form);
    });
  });
})();
