/**
 * Texas Medicals - Centralized Form Handler
 * Sends form submissions to the client's email via FormSubmit.co AJAX API.
 * No backend required. Just update CLIENT_EMAIL below.
 */
(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────────────────
  const CLIENT_EMAIL = 'contact@texasmedicalrevenue.com';
  const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${CLIENT_EMAIL}`;

  // ── Helper: create a success/error banner ───────────────────────────────
  function createBanner(type, message) {
    const banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = `
      margin-top: 1.25rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      text-align: center;
      animation: tmFadeIn 0.4s ease;
      ${
        type === 'success'
          ? 'background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #065f46;'
          : 'background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #7f1d1d;'
      }
    `;
    banner.innerHTML =
      type === 'success'
        ? `<span style="font-size:1.3rem;">&#x2705;</span>&nbsp; ${message}`
        : `<span style="font-size:1.3rem;">&#x274C;</span>&nbsp; ${message}`;
    return banner;
  }

  // ── Inject keyframe animation once ──────────────────────────────────────
  if (!document.getElementById('tm-form-style')) {
    const style = document.createElement('style');
    style.id = 'tm-form-style';
    style.textContent = `
      @keyframes tmFadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Attach handler to a single form ─────────────────────────────────────
  function attachHandler(form) {
    if (form.dataset.tmHandled) return;
    form.dataset.tmHandled = 'true';

    const nameInput =
      form.querySelector('#name') ||
      form.querySelector('[name="name"]') ||
      form.querySelector('input[type="text"]');
    const emailInput =
      form.querySelector('#email') ||
      form.querySelector('[name="email"]') ||
      form.querySelector('input[type="email"]');
    const messageInput =
      form.querySelector('#message') ||
      form.querySelector('[name="message"]') ||
      form.querySelector('textarea');

    if (!nameInput && !emailInput) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (form.classList.contains('needs-validation')) {
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;
      } else {
        if (nameInput && !nameInput.value.trim()) { nameInput.focus(); return; }
        if (emailInput && !emailInput.value.trim()) { emailInput.focus(); return; }
      }

      const existingBanner = form.parentNode && form.parentNode.querySelector('.tm-result-banner');
      if (existingBanner) existingBanner.remove();

      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      const payload = {
        _subject: 'New Contact Request from ' + ((nameInput && nameInput.value.trim()) || 'Website Visitor'),
        name: (nameInput && nameInput.value.trim()) || '',
        email: (emailInput && emailInput.value.trim()) || '',
        message: (messageInput && messageInput.value.trim()) || '',
        _template: 'table',
        _captcha: 'false',
      };

      fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          const ok = data.success === 'true' || data.success === true;
          const banner = createBanner(
            ok ? 'success' : 'error',
            ok
              ? 'Thank you! Your message has been sent. Our team will get in touch with you shortly.'
              : 'Something went wrong. Please try again or email us directly.'
          );
          banner.classList.add('tm-result-banner');
          const submitRow = submitBtn ? (submitBtn.closest('div') || form) : form;
          submitRow.parentNode.insertBefore(banner, submitRow.nextSibling);
          if (ok) {
            form.reset();
            form.classList.remove('was-validated');
          }
        })
        .catch(function () {
          const banner = createBanner('error', 'Network error. Please check your connection and try again.');
          banner.classList.add('tm-result-banner');
          const submitRow = submitBtn ? (submitBtn.closest('div') || form) : form;
          submitRow.parentNode.insertBefore(banner, submitRow.nextSibling);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          setTimeout(function () {
            const b = form.parentNode && form.parentNode.querySelector('.tm-result-banner');
            if (b) {
              b.style.transition = 'opacity 0.5s';
              b.style.opacity = '0';
              setTimeout(function() { b.remove(); }, 500);
            }
          }, 8000);
        });
    });
  }

  // ── Find and attach to all matching forms ────────────────────────────────
  function init() {
    const forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      const hasEmail = form.querySelector('input[type="email"]');
      if (hasEmail) attachHandler(form);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
