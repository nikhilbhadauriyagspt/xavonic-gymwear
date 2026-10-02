const db = require('../config/db');
const {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyPaymentSignature,
} = require('../services/razorpayService');
const { sendOrderWhatsAppNotification } = require('../services/whatsappService');
const { sendOrderInvoiceEmail } = require('../services/emailService');
const { createNotification } = require('./adminNotificationController');
const { getBrandSettings } = require('../services/brandService');

/**
 * 1. Get Public Razorpay Configuration for Frontend Checkout
 */
exports.getPaymentConfig = async (req, res) => {
  try {
    const config = await getRazorpayConfig();
    const brand = await getBrandSettings();

    return res.status(200).json({
      success: true,
      config: {
        enabled: config.enabled !== false,
        key_id: config.key_id || '',
        mode: config.mode || 'test',
        account_name: brand.brand_name || config.account_name || 'Guidelya Activewear',
        theme_color: config.theme_color || '#09090b',
      },
    });
  } catch (err) {
    console.error('Error in getPaymentConfig:', err);
    return res.status(500).json({ success: false, message: 'Failed to load payment configuration.' });
  }
};

/**
 * 2. Create Razorpay Server-Side Order
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount for payment order.',
      });
    }

    const orderData = await createRazorpayOrder(Number(amount), receipt, notes || {});

    return res.status(200).json({
      success: true,
      order: orderData,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create payment order. Please check Razorpay keys in Admin Settings.',
    });
  }
};

/**
 * 3. Verify Payment Signature & Place Confirmed Order
 */
exports.verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification parameters missing (order_id, payment_id, signature).',
      });
    }

    // Verify cryptographic HMAC-SHA256 signature
    const isValid = await verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.warn('❌ Invalid Razorpay Signature detected for Order ID:', razorpay_order_id);
      return res.status(400).json({
        success: false,
        message: 'Cryptographic signature verification failed. Payment cannot be verified.',
      });
    }

    console.log(`✅ Razorpay Payment Verified: Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}`);

    // If orderDetails / orderPayload are passed, create the order in DB immediately
    const orderInfo = req.body.orderDetails || req.body.orderPayload || req.body.order || null;

    if (orderInfo) {
      const items = orderInfo.items || [];
      const subtotal = orderInfo.subtotal || 0;
      const discountAmount = orderInfo.discountAmount ?? orderInfo.discount_amount ?? 0;
      const couponCode = orderInfo.couponCode || orderInfo.coupon_code || '';
      const shippingFee = orderInfo.shippingFee ?? orderInfo.shipping_fee ?? 0;
      const totalAmount = orderInfo.totalAmount ?? orderInfo.total_amount ?? 0;
      const shippingAddress = orderInfo.shippingAddress || orderInfo.shipping_address || {};
      const customerName = orderInfo.customerName || orderInfo.customer_name || shippingAddress.name || 'Valued Athlete';
      const customerPhone = orderInfo.customerPhone || orderInfo.customer_phone || shippingAddress.phone || '';
      const customerEmail = orderInfo.customerEmail || orderInfo.customer_email || shippingAddress.email || '';
      const paymentMethod = orderInfo.paymentMethod || orderInfo.payment_method || 'Prepaid Online (Razorpay)';
      const notes = orderInfo.notes || '';

      const orderNumber = `GDL-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `DEL-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const courierPartner = 'Delhivery';

      const itemsJson = typeof items === 'string' ? items : JSON.stringify(items || []);
      const addressJson = typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress || {});

      // Deduct inventory stock
      if (Array.isArray(items)) {
        for (const it of items) {
          const prodId = it.productId || it.id;
          const selectedSize = (it.selectedSize || it.size || '').trim();
          const qty = Number(it.quantity || 1);

          if (prodId) {
            const [prodRows] = await db.query('SELECT sizes_json, stock_count FROM products WHERE id = ?', [prodId]);
            if (prodRows && prodRows.length > 0) {
              let sizes = [];
              try {
                sizes = JSON.parse(prodRows[0].sizes_json || '[]');
              } catch (_) {}

              let updated = false;
              if (Array.isArray(sizes) && sizes.length > 0) {
                sizes = sizes.map((s) => {
                  if (typeof s === 'object' && s.size === selectedSize) {
                    const newStock = Math.max(0, (Number(s.stock) || 0) - qty);
                    updated = true;
                    return { ...s, stock: newStock };
                  }
                  return s;
                });
              }

              const newStockTotal = Math.max(0, (Number(prodRows[0].stock_count) || 0) - qty);

              await db.query(
                'UPDATE products SET stock_count = ?, sizes_json = ? WHERE id = ?',
                [newStockTotal, JSON.stringify(sizes), prodId]
              );
            }
          }
        }
      }

      // Insert Order into DB
      const [result] = await db.query(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_phone, customer_email,
          items_json, subtotal, discount_amount, coupon_code, shipping_fee, total_amount,
          payment_method, payment_status, order_status, shipping_address_json,
          tracking_number, courier_partner, notes, payment_transaction_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Processing', ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          req.user?.id || null,
          customerName || 'Valued Athlete',
          customerPhone || '',
          customerEmail || '',
          itemsJson,
          Number(subtotal || 0),
          Number(discountAmount || 0),
          couponCode || '',
          Number(shippingFee || 0),
          Number(totalAmount || 0),
          paymentMethod,
          addressJson,
          trackingNumber,
          courierPartner,
          notes || '',
          razorpay_payment_id,
        ]
      );

      const createdOrderId = result.insertId;

      // Construct Order Object for Notifications & Client Return
      const createdOrder = {
        id: createdOrderId,
        orderNumber,
        order_number: orderNumber,
        customerName,
        customer_name: customerName,
        customerPhone,
        customer_phone: customerPhone,
        customerEmail,
        customer_email: customerEmail,
        items,
        subtotal: Number(subtotal || 0),
        discountAmount: Number(discountAmount || 0),
        couponCode,
        shippingFee: Number(shippingFee || 0),
        totalAmount: Number(totalAmount || 0),
        total_amount: Number(totalAmount || 0),
        paymentMethod,
        payment_method: paymentMethod,
        paymentStatus: 'Paid',
        payment_status: 'Paid',
        orderStatus: 'Processing',
        order_status: 'Processing',
        shippingAddress: typeof shippingAddress === 'object' ? shippingAddress : {},
        trackingNumber,
        tracking_number: trackingNumber,
        courierPartner,
        courier_partner: courierPartner,
        paymentTransactionId: razorpay_payment_id,
        createdAt: new Date().toISOString(),
      };

      // 1. Dispatch Automated WhatsApp Confirmation
      sendOrderWhatsAppNotification(createdOrder).catch((err) =>
        console.warn('WhatsApp notification error:', err.message)
      );

      // 2. Dispatch Automated Email Tax Invoice
      if (customerEmail) {
        sendOrderInvoiceEmail(createdOrder).catch((err) =>
          console.warn('Email invoice error:', err.message)
        );
      }

      // 3. Trigger Real-time Admin Notification
      createNotification(
        'order',
        `🎉 New Prepaid Order #${orderNumber} received via Razorpay! Total: ₹${Number(totalAmount).toLocaleString('en-IN')}`,
        { orderId: createdOrderId, orderNumber, total: totalAmount }
      ).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order placed successfully!',
        order: createdOrder,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error verifying payment signature.',
    });
  }
};

/**
 * 4. Razorpay Webhook Handler
 */
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const config = await getRazorpayConfig();
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = config.webhook_secret;

    if (webhookSecret && webhookSignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== webhookSignature) {
        console.warn('⚠️ Webhook signature mismatch');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    console.log('⚡ Razorpay Webhook Event Received:', event);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        // Mark order as Paid in DB if matching
        await db.query(
          "UPDATE orders SET payment_status = 'Paid' WHERE payment_transaction_id = ? OR notes LIKE ?",
          [paymentEntity.id, `%${paymentEntity.order_id}%`]
        );
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Error handling Razorpay webhook:', err.message);
    return res.status(500).json({ status: 'error' });
  }
};
