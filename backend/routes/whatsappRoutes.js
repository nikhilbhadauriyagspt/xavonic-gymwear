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

// 3. Broadcast New Product Drop to Customers (All or Filtered by Size)
router.post('/broadcast-product', async (req, res) => {
  try {
    const {
      productId,
      productTitle,
      productPrice,
      productImage,
      productSlug,
      targetSize = 'ALL', // 'ALL' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
      couponCode = 'NEW10',
    } = req.body;

    if (!productTitle) {
      return res.status(400).json({ success: false, message: 'Product title is required.' });
    }

    // Fetch customers with phone numbers from users table
    const [users] = await db.query(
      "SELECT id, name, phone, chest_size, lower_size FROM users WHERE phone IS NOT NULL AND phone != ''"
    );

    // Also fetch past order customers in case guest orders exist
    const [orders] = await db.query(
      "SELECT customer_name, customer_phone, items_json FROM orders WHERE customer_phone IS NOT NULL AND customer_phone != ''"
    );

    const recipientsMap = new Map();

    // Process registered users
    (users || []).forEach((u) => {
      const clean10 = String(u.phone || '').replace(/\D/g, '').slice(-10);
      if (clean10.length !== 10) return;

      const userChest = String(u.chest_size || '').toUpperCase();
      const userLower = String(u.lower_size || '').toUpperCase();
      const sizeMatch =
        targetSize === 'ALL' ||
        userChest.startsWith(targetSize.toUpperCase()) ||
        userLower.startsWith(targetSize.toUpperCase());

      if (sizeMatch) {
        recipientsMap.set(clean10, {
          phone: clean10,
          name: u.name || 'Shopper',
        });
      }
    });

    // Process past order customers
    (orders || []).forEach((o) => {
      const clean10 = String(o.customer_phone || '').replace(/\D/g, '').slice(-10);
      if (clean10.length !== 10 || recipientsMap.has(clean10)) return;

      if (targetSize === 'ALL') {
        recipientsMap.set(clean10, {
          phone: clean10,
          name: o.customer_name || 'Shopper',
        });
      } else {
        let items = [];
        try {
          items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json || [];
        } catch (_) {}
        const boughtSize = items.some((it) =>
          String(it.size || '').toUpperCase().startsWith(targetSize.toUpperCase())
        );
        if (boughtSize) {
          recipientsMap.set(clean10, {
            phone: clean10,
            name: o.customer_name || 'Shopper',
          });
        }
      }
    });

    const recipients = Array.from(recipientsMap.values());
    if (recipients.length === 0) {
      return res.status(200).json({
        success: true,
        totalTargeted: 0,
        sentCount: 0,
        message: `No customers found matching size filter: ${targetSize}`,
      });
    }

    const { sendProductDropWhatsApp } = require('../services/whatsappService');
    const productUrl = `https://rage-x.com/product/${productSlug || productId || ''}`;

    let sentCount = 0;
    let firstFallbackUrl = null;

    for (const rec of recipients) {
      const sizeLabel = targetSize !== 'ALL' ? ` (Size ${targetSize})` : '';
      const result = await sendProductDropWhatsApp({
        phone: rec.phone,
        customerName: rec.name,
        productName: `${productTitle}${sizeLabel}`,
        productPrice,
        productImage,
        productUrl,
        couponCode,
      });
      if (result.apiDelivered) {
        sentCount++;
      } else if (!firstFallbackUrl && result.whatsappUrl) {
        firstFallbackUrl = result.whatsappUrl;
      }
    }

    return res.status(200).json({
      success: true,
      totalTargeted: recipients.length,
      sentCount,
      fallbackWhatsappUrl: firstFallbackUrl,
      message:
        sentCount > 0
          ? `Successfully broadcasted "${productTitle}" with image & price to ${sentCount}/${recipients.length} customers via WhatsApp API!`
          : `Prepared WhatsApp broadcast for ${recipients.length} customers.`,
    });
  } catch (err) {
    console.error('Error broadcasting product on WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Failed to broadcast product.' });
  }
});

module.exports = router;
