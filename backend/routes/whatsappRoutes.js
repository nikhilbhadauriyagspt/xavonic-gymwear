const express = require('express');
const router = express.Router();
const db = require('../config/db');

const DEFAULT_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'ragex_meta_webhook_2026';

// 1. Webhook Verification Handshake (Meta calls this GET when verifying)
router.get('/webhook', async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check against DB settings or fallback to DEFAULT_VERIFY_TOKEN
    let expectedToken = DEFAULT_VERIFY_TOKEN;
    try {
      const [rows] = await db.query(
        "SELECT setting_value FROM store_settings WHERE setting_key = 'whatsapp_webhook_verify_token' LIMIT 1"
      );
      if (rows && rows.length > 0 && rows[0].setting_value) {
        expectedToken = rows[0].setting_value.trim();
      }
    } catch (_) {}

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ [WhatsApp Webhook] Verification successful from Meta!');
      return res.status(200).send(challenge);
    } else {
      console.warn('⚠️ [WhatsApp Webhook] Verification failed. Token mismatch.');
      return res.sendStatus(403);
    }
  } catch (err) {
    console.error('❌ [WhatsApp Webhook] Error during verification:', err);
    return res.sendStatus(500);
  }
});

// 2. Webhook Event Notifications (Meta sends POST on messages & status changes)
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};

          // Status updates: sent, delivered, read, failed
          if (Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              console.log(`📩 [WhatsApp Status Update] Recipient: +${status.recipient_id} | Status: ${status.status?.toUpperCase()}`);
              if (status.errors) {
                console.warn(`⚠️ [WhatsApp Error]`, status.errors);
              }
            }
          }

          // Incoming customer messages
          if (Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const from = msg.from;
              const text = msg.text?.body || msg.type;
              console.log(`💬 [WhatsApp Customer Reply] From: +${from} | Message: "${text}"`);
            }
          }
        }
      }

      // Return a 200 OK to acknowledge receipt of the event
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error('❌ [WhatsApp Webhook] Error processing event:', err);
    return res.status(200).send('EVENT_RECEIVED'); // Still return 200 to prevent Meta retries
  }
});

module.exports = router;
