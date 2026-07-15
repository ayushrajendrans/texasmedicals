/**
 * Texas Medicals - Centralized Form Handler
 * Configures forms to use standard HTML POST submission to FormSubmit.co.
 * This bypasses CORS and AdBlocker issues common with AJAX form submissions.
 */
(function () {
  'use strict';

  // ── Configuration ───────────────────────────────────────────────────────
  // TODO: Replace this with your actual Web3Forms Access Key
  const WEB3FORMS_ACCESS_KEY = '2219e60f-f058-4c72-9126-8d9dce22096b'; 
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  // ── Attach handler to a single form ─────────────────────────────────────
  function attachHandler(form) {
    if (form.dataset.tmHandled) return;
    form.dataset.tmHandled = 'true';

    // Set standard HTML form attributes
    form.action = WEB3FORMS_URL;
    form.method = 'POST';

    // Find inputs
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

    // Ensure inputs have 'name' attributes required for standard submission
    if (nameInput && !nameInput.name) nameInput.name = 'name';
    if (emailInput && !emailInput.name) emailInput.name = 'email';
    if (messageInput && !messageInput.name) messageInput.name = 'message';

    // Helper to add hidden config fields
    function addHiddenInput(name, value) {
      if (!form.querySelector(`input[name="${name}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
    }

    // Web3Forms required access key
    addHiddenInput('access_key', WEB3FORMS_ACCESS_KEY);
    
    // Optional Web3Forms configuration
    addHiddenInput('subject', 'New Contact Request from Texas Medicals Website');
    addHiddenInput('from_name', 'Texas Medicals Website');
    addHiddenInput('redirect', new URL('thank-you.html', window.location.href).href);
    
    form.addEventListener('submit', function (e) {
      if (form.classList.contains('needs-validation')) {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add('was-validated');
      }
      
      if (!form.checkValidity()) {
        return; // Stop if invalid
      }
      
      // Provide visual feedback that submission is happening
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        // Store original text
        if (!submitBtn.dataset.originalText) {
          submitBtn.dataset.originalText = submitBtn.innerHTML;
        }
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
        submitBtn.disabled = true;
        
        // Reset after a timeout just in case it fails to navigate
        setTimeout(() => {
          submitBtn.innerHTML = submitBtn.dataset.originalText;
          submitBtn.disabled = false;
        }, 5000);
      }
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
