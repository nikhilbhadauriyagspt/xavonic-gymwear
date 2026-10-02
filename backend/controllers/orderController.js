const db = require('../config/db');
const { sendOrderInvoiceEmail } = require('../services/emailService');
const { sendOrderWhatsAppNotification } = require('../services/whatsappService');
const { createNotification } = require('./adminNotificationController');

// 1. Create a New Order (Customer Checkout)
exports.createOrder = async (req, res) => {
  try {
    const {
      user_id = null,
      customer_id = null,
      customer_name,
      customer_email = '',
      customer_phone,
      items = [],
      subtotal = 0,
      discount_amount = 0,
      coupon_code = '',
      shipping_fee = 0,
      total_amount,
      payment_method = 'COD',
      shipping_address,
      delivery_notes = '',
      save_address = true,
    } = req.body;

    if (!customer_name || !customer_phone || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and delivery address are required.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items cannot be empty.',
      });
    }

    // Generate Order Number & Courier Tracking
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}${randomDigits}`;
    const trackingNumber = `XAV-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const courierPartner = 'Bluedart Express';

    const cleanItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug || '',
      price: Number(item.price || 0),
      originalPrice: Number(item.originalPrice || item.price || 0),
      size: item.selectedSize || item.size || 'M',
      color: item.selectedColor || item.color || 'Standard',
      quantity: Number(item.quantity || 1),
      image: item.image || item.imageFront || item.gallery?.[0] || '',
      lineTotal: Number(item.price || 0) * Number(item.quantity || 1),
    }));

    const itemsCount = cleanItems.reduce((acc, item) => acc + item.quantity, 0);
    const calculatedTotal = Number(total_amount) || cleanItems.reduce((acc, item) => acc + item.lineTotal, 0);

    const paymentStatus = payment_method.toLowerCase().includes('cod') ? 'Pending' : 'Paid';
    const orderStatus = 'Processing';

    // Insert Order into Database
    const [orderResult] = await db.query(
      `INSERT INTO orders 
       (order_number, user_id, customer_id, customer_name, customer_email, customer_phone, items_json, items_count, subtotal, discount_amount, coupon_code, shipping_fee, total_amount, payment_method, payment_status, order_status, shipping_address, tracking_number, courier_partner, delivery_notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        user_id,
        customer_id || (user_id ? `GDL-${String(user_id).padStart(5, '0')}` : null),
        customer_name.trim(),
        customer_email.trim(),
        customer_phone.trim(),
        JSON.stringify(cleanItems),
        itemsCount,
        Number(subtotal),
        Number(discount_amount),
        coupon_code || null,
        Number(shipping_fee),
        calculatedTotal,
        payment_method,
        paymentStatus,
        orderStatus,
        JSON.stringify(typeof shipping_address === 'string' ? { addressLine: shipping_address } : shipping_address),
        trackingNumber,
        courierPartner,
        delivery_notes || null,
      ]
    );

    // Save Address into User's saved addresses in users table if user is logged in
    if (user_id && save_address && typeof shipping_address === 'object') {
      try {
        const [userRows] = await db.query('SELECT addresses_json FROM users WHERE id = ?', [user_id]);
        if (userRows.length > 0) {
          let addresses = [];
          try {
            addresses = userRows[0].addresses_json ? (typeof userRows[0].addresses_json === 'string' ? JSON.parse(userRows[0].addresses_json) : userRows[0].addresses_json) : [];
          } catch (_) {
            addresses = [];
          }

          const newAddrObj = {
            id: `addr-${Date.now()}`,
            name: customer_name,
            phone: customer_phone,
            addressLine: shipping_address.addressLine || '',
            apartment: shipping_address.apartment || '',
            city: shipping_address.city || '',
            state: shipping_address.state || '',
            pincode: shipping_address.pincode || '',
            type: shipping_address.type || 'Home',
            isDefault: addresses.length === 0,
          };

          // Check if address already exists by pincode and addressLine
          const exists = addresses.some(
            (a) => a.addressLine === newAddrObj.addressLine && a.pincode === newAddrObj.pincode
          );

          if (!exists) {
            addresses.push(newAddrObj);
            await db.query('UPDATE users SET addresses_json = ? WHERE id = ?', [JSON.stringify(addresses), user_id]);
          }
        }
      } catch (addrErr) {
        console.warn('Could not save user address to profile:', addrErr.message);
      }
    }

    // Deduct stock for ordered products (Overall stock + Size/Color-wise stock)
    for (const item of cleanItems) {
      if (item.id) {
        try {
          const [prodRows] = await db.query('SELECT stock, size_stock_json FROM products WHERE id = ?', [item.id]);
          if (prodRows.length > 0) {
            const currentStock = prodRows[0].stock || 0;
            const newStock = Math.max(0, currentStock - (item.quantity || 1));
            
            let sizeStock = {};
            try {
              sizeStock = typeof prodRows[0].size_stock_json === 'string' 
                ? JSON.parse(prodRows[0].size_stock_json) 
                : (prodRows[0].size_stock_json || {});
            } catch (_) { sizeStock = {}; }

            const orderSize = item.selectedSize || item.size || 'M';
            const orderColor = item.selectedColor || item.color || '';
            const variantKey = orderColor ? `${orderColor}_${orderSize}` : orderSize;

            // Reduce variant combo or size key
            if (sizeStock[variantKey] !== undefined) {
              sizeStock[variantKey] = Math.max(0, Number(sizeStock[variantKey]) - (item.quantity || 1));
            } else if (sizeStock[orderSize] !== undefined) {
              sizeStock[orderSize] = Math.max(0, Number(sizeStock[orderSize]) - (item.quantity || 1));
            }

            const inStockStatus = newStock > 0 ? 1 : 0;

            await db.query(
              'UPDATE products SET stock = ?, size_stock_json = ?, in_stock = ? WHERE id = ?',
              [newStock, JSON.stringify(sizeStock), inStockStatus, item.id]
            );

            // Trigger Out-of-Stock or Low Stock Notification to Admin
            if (newStock === 0) {
              createNotification({
                type: 'stock_alert',
                title: `🚨 Out of Stock: ${item.title}`,
                description: `Product "${item.title}" (Size ${orderSize}) is completely sold out following order ${orderNumber}.`,
                reference_id: String(item.id),
                link_url: '/admin',
              });
            } else if (newStock <= 3) {
              createNotification({
                type: 'inventory',
                title: `⚠️ Low Stock Alert: ${item.title}`,
                description: `Only ${newStock} units remaining for "${item.title}". Restock recommended.`,
                reference_id: String(item.id),
                link_url: '/admin',
              });
            }
          }
        } catch (stockErr) {
          console.warn('Could not reduce variant stock for product:', item.id, stockErr.message);
        }
      }
    }

    // Trigger New Order System Notification to Admin
    createNotification({
      type: 'order',
      title: `🛍️ New Order #${orderNumber}`,
      description: `${customer_name} placed an order for ₹${calculatedTotal.toLocaleString('en-IN')} (${itemsCount} items via ${payment_method}).`,
      reference_id: orderNumber,
      link_url: '/admin',
    });

    const createdOrderData = {
      id: orderNumber,
      orderId: orderResult.insertId,
      order_number: orderNumber,
      orderNumber,
      customer_name,
      customerName: customer_name,
      customer_phone,
      customerPhone: customer_phone,
      customer_email,
      customerEmail: customer_email,
      items: cleanItems,
      subtotal: Number(subtotal),
      discount_amount: Number(discount_amount),
      coupon_code,
      shipping_fee: Number(shipping_fee),
      total_amount: calculatedTotal,
      totalAmount: calculatedTotal,
      payment_method,
      paymentMethod: payment_method,
      paymentStatus,
      orderStatus,
      tracking_number: trackingNumber,
      trackingNumber,
      courier_partner: courierPartner,
      courierPartner,
      estimatedDelivery: 'Within 2–4 Business Days',
      shipping_address,
      shippingAddress: shipping_address,
      createdAt: new Date().toISOString(),
    };

    // Asynchronously trigger Order Tax Invoice Email & WhatsApp Notification (Non-blocking)
    sendOrderInvoiceEmail(createdOrderData).catch((err) => console.warn('Order invoice email warning:', err.message));
    sendOrderWhatsAppNotification(createdOrderData).catch((err) => console.warn('Order whatsapp notification warning:', err.message));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: createdOrderData,
    });
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to process order. Please try again.' });
  }
};

// 2. Get Order Details by Order Number (Tracking & Confirmation)
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const [rows] = await db.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [orderNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = formatOrderRow(rows[0]);
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Could not fetch order.' });
  }
};

// 3. Get Orders for Logged-In Customer
exports.getCustomerOrders = async (req, res) => {
  try {
    const { userIdOrPhone } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? OR customer_phone LIKE ? OR customer_email = ? ORDER BY created_at DESC',
      [userIdOrPhone, `%${userIdOrPhone.slice(-10)}%`, userIdOrPhone]
    );

    const orders = rows.map(formatOrderRow);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: 'Could not load customer orders.' });
  }
};

// 4. Admin: Get All Orders with Filters & Search
exports.getAdminOrders = async (req, res) => {
  try {
    const { status = 'all', search = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let baseQuery = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status !== 'all') {
      baseQuery += ' AND order_status = ?';
      params.push(status);
    }

    if (search) {
      baseQuery += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ? OR tracking_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    // Count Total
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    // Fetch Paginated
    baseQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const [rows] = await db.query(baseQuery, params);

    // Summary Metrics
    const [summaryRows] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        SUM(CASE WHEN order_status IN ('Processing', 'Confirmed') THEN 1 ELSE 0 END) as processing_count,
        SUM(CASE WHEN order_status IN ('In Transit', 'Out for Delivery') THEN 1 ELSE 0 END) as in_transit_count,
        SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as delivered_count,
        SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN return_status IN ('Requested', 'Approved', 'Item Picked Up', 'Item Received') THEN 1 ELSE 0 END) as return_requests_count,
        SUM(CASE WHEN refund_status IN ('Initiated', 'Processing') THEN 1 ELSE 0 END) as refund_processing_count
      FROM orders
    `);

    const orders = rows.map(formatOrderRow);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      summary: {
        totalOrders: summaryRows[0]?.total_orders || 0,
        totalRevenue: Number(summaryRows[0]?.total_revenue || 0),
        processing: summaryRows[0]?.processing_count || 0,
        inTransit: summaryRows[0]?.in_transit_count || 0,
        delivered: summaryRows[0]?.delivered_count || 0,
        cancelled: summaryRows[0]?.cancelled_count || 0,
        returns: summaryRows[0]?.return_requests_count || 0,
        refunds: summaryRows[0]?.refund_processing_count || 0,
      },
      orders,
    });
  } catch (error) {
    console.error('❌ Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Could not fetch admin orders.' });
  }
};

// 5. Admin: Update Order Status & Delivery Notes
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, payment_status, tracking_number, courier_partner, delivery_notes } = req.body;

    const updates = [];
    const params = [];

    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }

    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }

    if (tracking_number) {
      updates.push('tracking_number = ?');
      params.push(tracking_number);
    }

    if (courier_partner) {
      updates.push('courier_partner = ?');
      params.push(courier_partner);
    }

    if (delivery_notes !== undefined) {
      updates.push('delivery_notes = ?');
      params.push(delivery_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(orderId, orderId);
    await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ? OR order_number = ?`, params);

    res.json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

// 6. Cancel Order (Customer or Admin)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellation_reason = 'Cancelled by Customer' } = req.body;

    const [rows] = await db.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];
    if (order.order_status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled.' });
    }
    if (order.order_status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled. Please use Return Request.' });
    }

    // Restore Product Stock (both total and size/color specific)
    let items = [];
    try {
      items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
    } catch (_) {}

    for (const item of items) {
      if (item.id) {
        try {
          const [prodRows] = await db.query('SELECT stock, size_stock_json FROM products WHERE id = ?', [item.id]);
          if (prodRows.length > 0) {
            const currentStock = Number(prodRows[0].stock || 0);
            const restoredStock = currentStock + Number(item.quantity || 1);
            let sizeStock = {};
            try {
              sizeStock = typeof prodRows[0].size_stock_json === 'string' ? JSON.parse(prodRows[0].size_stock_json) : (prodRows[0].size_stock_json || {});
            } catch (_) {}

            const orderSize = item.size || item.selectedSize || 'M';
            const orderColor = item.color || item.selectedColor || '';
            const variantKey = orderColor ? `${orderColor}_${orderSize}` : orderSize;

            if (sizeStock[variantKey] !== undefined) {
              sizeStock[variantKey] = Number(sizeStock[variantKey]) + Number(item.quantity || 1);
            } else if (sizeStock[orderSize] !== undefined) {
              sizeStock[orderSize] = Number(sizeStock[orderSize]) + Number(item.quantity || 1);
            }

            await db.query(
              'UPDATE products SET stock = ?, size_stock_json = ?, in_stock = 1 WHERE id = ?',
              [restoredStock, JSON.stringify(sizeStock), item.id]
            );
          }
        } catch (restoreErr) {
          console.warn('Could not restore stock on cancellation:', restoreErr.message);
        }
      }
    }

    // If paid, automatically initiate refund
    let refundStatus = order.refund_status || 'None';
    let refundAmount = order.refund_amount || 0;
    if (order.payment_status === 'Paid') {
      refundStatus = 'Initiated';
      refundAmount = order.total_amount;
    }

    await db.query(
      `UPDATE orders 
       SET order_status = 'Cancelled', 
           cancellation_reason = ?, 
           cancelled_at = NOW(),
           refund_status = ?,
           refund_amount = ?
       WHERE id = ? OR order_number = ?`,
      [cancellation_reason, refundStatus, refundAmount, order.id, order.order_number]
    );

    res.json({
      success: true,
      message: 'Order has been cancelled successfully and product inventory has been restored.',
      refund_status: refundStatus,
    });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

// 7. Request Return (Customer)
exports.requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { return_reason, return_comment = '' } = req.body;

    if (!return_reason) {
      return res.status(400).json({ success: false, message: 'Please select a reason for the return.' });
    }

    const [rows] = await db.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = rows[0];
    if (order.order_status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Return requests can only be placed on Delivered orders.' });
    }
    if (order.return_status && order.return_status !== 'None') {
      return res.status(400).json({ success: false, message: `Return request already exists with status: ${order.return_status}` });
    }

    await db.query(
      `UPDATE orders 
       SET return_status = 'Requested', 
           return_reason = ?, 
           return_comment = ?, 
           return_requested_at = NOW(),
           refund_status = 'Initiated',
           refund_amount = ?
       WHERE id = ? OR order_number = ?`,
      [return_reason, return_comment, order.total_amount, order.id, order.order_number]
    );

    res.json({
      success: true,
      message: 'Return request submitted successfully. Our team will review and arrange the pickup.',
    });
  } catch (error) {
    console.error('❌ Error requesting return:', error);
    res.status(500).json({ success: false, message: 'Failed to submit return request.' });
  }
};

// 8. Admin: Update Return & Refund Details
exports.updateReturnAndRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      return_status,
      refund_status,
      refund_amount,
      refund_method,
      refund_transaction_id,
      refund_notes,
    } = req.body;

    const [rows] = await db.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = rows[0];

    const updates = [];
    const params = [];

    if (return_status) {
      updates.push('return_status = ?');
      params.push(return_status);

      // If return completed, restore inventory
      if (return_status === 'Completed' && order.return_status !== 'Completed') {
        let items = [];
        try {
          items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
        } catch (_) {}
        for (const item of items) {
          if (item.id) {
            try {
              const [prodRows] = await db.query('SELECT stock, size_stock_json FROM products WHERE id = ?', [item.id]);
              if (prodRows.length > 0) {
                const currentStock = Number(prodRows[0].stock || 0);
                const restoredStock = currentStock + Number(item.quantity || 1);
                let sizeStock = {};
                try {
                  sizeStock = typeof prodRows[0].size_stock_json === 'string' ? JSON.parse(prodRows[0].size_stock_json) : (prodRows[0].size_stock_json || {});
                } catch (_) {}

                const orderSize = item.size || item.selectedSize || 'M';
                const orderColor = item.color || item.selectedColor || '';
                const variantKey = orderColor ? `${orderColor}_${orderSize}` : orderSize;

                if (sizeStock[variantKey] !== undefined) {
                  sizeStock[variantKey] = Number(sizeStock[variantKey]) + Number(item.quantity || 1);
                } else if (sizeStock[orderSize] !== undefined) {
                  sizeStock[orderSize] = Number(sizeStock[orderSize]) + Number(item.quantity || 1);
                }

                await db.query(
                  'UPDATE products SET stock = ?, size_stock_json = ?, in_stock = 1 WHERE id = ?',
                  [restoredStock, JSON.stringify(sizeStock), item.id]
                );
              }
            } catch (_) {}
          }
        }
      }
    }

    if (refund_status) {
      updates.push('refund_status = ?');
      params.push(refund_status);
      if (refund_status === 'Refunded') {
        updates.push('refunded_at = NOW()', 'payment_status = "Refunded"');
      }
    }

    if (refund_amount !== undefined) {
      updates.push('refund_amount = ?');
      params.push(Number(refund_amount));
    }

    if (refund_method) {
      updates.push('refund_method = ?');
      params.push(refund_method);
    }

    if (refund_transaction_id) {
      updates.push('refund_transaction_id = ?');
      params.push(refund_transaction_id);
    }

    if (refund_notes !== undefined) {
      updates.push('refund_notes = ?');
      params.push(refund_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(order.id, order.order_number);
    await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ? OR order_number = ?`, params);

    res.json({ success: true, message: 'Return & refund status updated successfully.' });
  } catch (error) {
    console.error('❌ Error updating return and refund:', error);
    res.status(500).json({ success: false, message: 'Failed to update return/refund.' });
  }
};

// 9. Admin: Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await db.query('DELETE FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
};

// 10. Get Order Tax Invoice (JSON + HTML Print View)
exports.getOrderInvoice = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { format } = req.query;

    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_number = ? OR id = ? LIMIT 1',
      [orderNumber, orderNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found for invoice generation.' });
    }

    const order = formatOrderRow(rows[0]);
    const invoiceNumber = `INV-${order.orderNumber}`;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const taxableAmount = Math.round((order.subtotal - order.discountAmount) / 1.05);
    const gstAmount = (order.subtotal - order.discountAmount) - taxableAmount;
    const cgst = Math.round(gstAmount / 2);
    const sgst = gstAmount - cgst;

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      orderNumber: order.orderNumber,
      orderDate: invoiceDate,
      seller: {
        companyName: 'XAVONIC ATHLETICS (GUIDELYA SPORTS PVT LTD)',
        gstin: '06AAECX9821L1Z4',
        pan: 'AAECX9821L',
        state: 'Haryana',
        stateCode: '06',
        address: 'Plot 42, DLF Phase 4, Gurugram, Haryana - 122002',
        email: 'billing@guidelya.com',
        phone: '+91 98765 43210',
        cin: 'U17120HR2023PTC109842',
      },
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || 'N/A',
        customerId: order.customerId,
        shippingAddress: order.shippingAddress,
      },
      items: order.items.map((item, index) => {
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
        const itemTaxable = Math.round(lineTotal / 1.05);
        const itemTax = lineTotal - itemTaxable;
        return {
          srNo: index + 1,
          title: item.title,
          size: item.size || item.selectedSize || 'M',
          color: item.color || item.selectedColor || 'Standard',
          hsnCode: '61091000',
          quantity: item.quantity || 1,
          unitPrice: Number(item.price || 0),
          taxableValue: itemTaxable,
          gstRate: '5%',
          gstAmount: itemTax,
          lineTotal,
        };
      }),
      financials: {
        subtotal: order.subtotal,
        discount: order.discountAmount,
        couponCode: order.couponCode,
        taxableAmount,
        cgst,
        sgst,
        totalGst: gstAmount,
        shippingFee: order.shippingFee,
        grandTotal: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
      shipping: {
        trackingNumber: order.trackingNumber,
        courierPartner: order.courierPartner,
      },
    };

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(generateInvoiceHtml(invoiceData));
    }

    return res.json({
      success: true,
      invoice: invoiceData,
      order,
    });
  } catch (error) {
    console.error('❌ Error generating order invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to generate tax invoice.' });
  }
};

// HTML Template Helper for Standalone Server-Side Invoice
function generateInvoiceHtml(inv) {
  const { seller, customer, items, financials, shipping } = inv;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${inv.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 24px; background: #fff; font-size: 12px; line-height: 1.4; }
    .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e5e5e5; padding: 24px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    .badge { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #666; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .card { background: #f9f9f9; padding: 12px; border: 1px solid #eee; border-radius: 4px; }
    .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #777; margin-bottom: 6px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #111; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
    .totals-row.grand { font-size: 14px; font-weight: 800; border-top: 2px solid #111; padding-top: 8px; margin-top: 6px; }
    .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 12px; font-size: 10px; color: #777; text-align: center; }
    @media print {
      body { padding: 0; }
      .invoice-box { border: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="no-print" style="margin-bottom: 16px; text-align: right;">
      <button onclick="window.print()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-weight: 600; cursor: pointer; border-radius: 4px;">🖨️ Print / Save as PDF</button>
    </div>
    <div class="header">
      <div>
        <div class="brand">XAVONIC GYMWEAR</div>
        <div class="badge">Original Tax Invoice / Bill of Supply</div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">GSTIN: ${seller.gstin} | PAN: ${seller.pan}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 14px; font-weight: 700; font-family: monospace;">${inv.invoiceNumber}</div>
        <div style="color: #666; font-size: 11px;">Date: ${inv.invoiceDate}</div>
        <div style="color: #666; font-size: 11px;">Order: #${inv.orderNumber}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Sold By (Seller)</div>
        <strong>${seller.companyName}</strong><br>
        ${seller.address}<br>
        State: ${seller.state} (Code: ${seller.stateCode})<br>
        Email: ${seller.email} | Phone: ${seller.phone}
      </div>
      <div class="card">
        <div class="card-title">Billed & Shipped To (Customer)</div>
        <strong>${customer.name}</strong> (Cust ID: ${customer.customerId})<br>
        Phone: +${customer.phone}<br>
        ${customer.email !== 'N/A' ? `Email: ${customer.email}<br>` : ''}
        Address: ${typeof customer.shippingAddress === 'object' ? [customer.shippingAddress.apartment, customer.shippingAddress.addressLine, customer.shippingAddress.city, customer.shippingAddress.state, customer.shippingAddress.pincode].filter(Boolean).join(', ') : customer.shippingAddress}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Item Description</th>
          <th>HSN</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Taxable</th>
          <th class="text-right">GST</th>
          <th class="text-right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it) => `
          <tr>
            <td>${it.srNo}</td>
            <td>
              <strong>${it.title}</strong><br>
              <span style="font-size: 10px; color: #666;">Size: ${it.size} | Color: ${it.color}</span>
            </td>
            <td>${it.hsnCode}</td>
            <td class="text-right">₹${it.unitPrice.toLocaleString('en-IN')}</td>
            <td class="text-right">${it.quantity}</td>
            <td class="text-right">₹${it.taxableValue.toLocaleString('en-IN')}</td>
            <td class="text-right">5%</td>
            <td class="text-right"><strong>₹${it.lineTotal.toLocaleString('en-IN')}.00</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Items Subtotal:</span>
        <span>₹${financials.subtotal.toLocaleString('en-IN')}.00</span>
      </div>
      ${financials.discount > 0 ? `
      <div class="totals-row" style="color: #047857;">
        <span>Discount (${financials.couponCode || 'PROMO'}):</span>
        <span>-₹${financials.discount.toLocaleString('en-IN')}.00</span>
      </div>` : ''}
      <div class="totals-row">
        <span>CGST (2.5%):</span>
        <span>₹${financials.cgst.toLocaleString('en-IN')}.00</span>
      </div>
      <div class="totals-row">
        <span>SGST (2.5%):</span>
        <span>₹${financials.sgst.toLocaleString('en-IN')}.00</span>
      </div>
      <div class="totals-row">
        <span>Shipping / Delivery:</span>
        <span>${financials.shippingFee === 0 ? 'FREE' : `₹${financials.shippingFee}.00`}</span>
      </div>
      <div class="totals-row grand">
        <span>Grand Total:</span>
        <span>₹${financials.grandTotal.toLocaleString('en-IN')}.00</span>
      </div>
      <div style="font-size: 10px; color: #666; margin-top: 4px; text-align: right;">
        Payment: <strong>${financials.paymentMethod} (${financials.paymentStatus})</strong>
      </div>
    </div>

    <div class="footer">
      <div>Tax invoice issued under Section 31 of CGST Act 2017. All athletic wear certified 4-way performance blend.</div>
      <div style="margin-top: 4px;">Thank you for training with Xavonic Athletics • www.guidelya.com</div>
      <div style="margin-top: 2px; font-style: italic;">This is a computer-generated tax invoice and requires no physical signature.</div>
    </div>
  </div>
</body>
</html>`;
}

// Helper: Format Order DB Row
function formatOrderRow(row) {
  let items = [];
  try {
    items = typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json || [];
  } catch (_) {
    items = [];
  }

  let shippingAddress = {};
  try {
    shippingAddress = typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address || {};
  } catch (_) {
    shippingAddress = { addressLine: row.shipping_address };
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customerId: row.customer_id || (row.user_id ? `GDL-${String(row.user_id).padStart(5, '0')}` : 'GUEST'),
    customerName: row.customer_name,
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone,
    items,
    itemsCount: row.items_count || items.length,
    subtotal: Number(row.subtotal || 0),
    discountAmount: Number(row.discount_amount || 0),
    couponCode: row.coupon_code || '',
    shippingFee: Number(row.shipping_fee || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentMethod: row.payment_method || 'COD',
    paymentStatus: row.payment_status || 'Pending',
    orderStatus: row.order_status || 'Processing',
    shippingAddress,
    trackingNumber: row.tracking_number || `XAV-${row.id * 8932}`,
    courierPartner: row.courier_partner || 'Bluedart Express',
    deliveryNotes: row.delivery_notes || '',
    
    // Cancellation fields
    cancellationReason: row.cancellation_reason || null,
    cancelledAt: row.cancelled_at || null,

    // Return fields
    returnStatus: row.return_status || 'None',
    returnReason: row.return_reason || null,
    returnComment: row.return_comment || null,
    returnRequestedAt: row.return_requested_at || null,

    // Refund fields
    refundStatus: row.refund_status || 'None',
    refundAmount: Number(row.refund_amount || 0),
    refundMethod: row.refund_method || null,
    refundTransactionId: row.refund_transaction_id || null,
    refundNotes: row.refund_notes || null,
    refundedAt: row.refunded_at || null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =========================================================================
// 🌟 NEW D2C ECOMMERCE FEATURE CONTROLLERS
// =========================================================================

/**
 * 1. Public Recent Sales Activity (For Live Social Proof / FOMO Toast)
 */
exports.getRecentPublicActivity = async (req, res) => {
  try {
    // 1. First fetch real recent orders from MySQL DB
    const [orders] = await db.query(
      `SELECT customer_name, shipping_address, items_json, created_at 
       FROM orders 
       WHERE order_status NOT IN ('Cancelled') 
       ORDER BY id DESC LIMIT 15`
    );

    let activities = [];

    if (orders && orders.length > 0) {
      activities = orders.map((o) => {
        let items = [];
        try {
          items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json || [];
        } catch (_) {}

        let city = 'Delhi';
        try {
          const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address || {};
          city = addr.city || addr.state || 'Mumbai';
        } catch (_) {}

        const firstItem = items[0] || {
          title: 'Acid Wash Heavyweight Oversized Tee',
          image: '',
        };

        const firstName = (o.customer_name || 'Athlete').split(' ')[0];

        return {
          customerName: `${firstName} from ${city}`,
          productTitle: firstItem.title || 'Gymwear Apparel',
          productImage: firstItem.image || '',
          timeAgo: 'Just now',
          verified: true,
        };
      });
    }

    // If few orders exist, augment with top-tier dynamic authentic gymwear activities
    if (activities.length < 5) {
      const fallbackFeed = [
        { customerName: 'Rohit from Gurugram', productTitle: 'Pro Muscle-Lock Compression Shirt', timeAgo: '2 minutes ago', verified: true },
        { customerName: 'Aman from Mumbai', productTitle: '5" Tactical Inseam Gym Shorts', timeAgo: '4 minutes ago', verified: true },
        { customerName: 'Vikram from Bengaluru', productTitle: 'Acid Wash Heavyweight Oversized Tee', timeAgo: '7 minutes ago', verified: true },
        { customerName: 'Sneha from New Delhi', productTitle: 'Drop Cut Curved Hem Athletic Tee', timeAgo: '11 minutes ago', verified: true },
        { customerName: 'Kabir from Pune', productTitle: 'Tapered Tactical Gym Joggers', timeAgo: '15 minutes ago', verified: true },
        { customerName: 'Aditya from Hyderabad', productTitle: 'Deep Cut Athletic Stringer Tank', timeAgo: '19 minutes ago', verified: true },
      ];
      activities = [...activities, ...fallbackFeed];
    }

    return res.status(200).json({ success: true, activities: activities.slice(0, 10) });
  } catch (err) {
    console.error('Error in getRecentPublicActivity:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sales activity.' });
  }
};

/**
 * 2. Capture Abandoned / In-Progress Checkout
 */
exports.captureAbandonedCheckout = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email = '',
      items = [],
      cart_total = 0,
    } = req.body;

    if (!customer_phone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Phone and cart items are required.' });
    }

    const cleanPhone = customer_phone.replace(/\D/g, '').slice(-10);
    const recoveryToken = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Upsert into abandoned_checkouts by phone
    await db.query(
      `INSERT INTO abandoned_checkouts (customer_name, customer_phone, customer_email, items_json, items_count, cart_total, recovery_token, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'abandoned')
       ON DUPLICATE KEY UPDATE 
         customer_name = VALUES(customer_name),
         customer_email = VALUES(customer_email),
         items_json = VALUES(items_json),
         items_count = VALUES(items_count),
         cart_total = VALUES(cart_total),
         status = 'abandoned',
         updated_at = NOW()`,
      [
        customer_name || 'Guest Athlete',
        cleanPhone,
        customer_email,
        JSON.stringify(items),
        items.length,
        Number(cart_total || 0),
        recoveryToken,
      ]
    );

    return res.status(200).json({ success: true, recoveryToken });
  } catch (err) {
    console.error('Error capturing abandoned checkout:', err);
    return res.status(500).json({ success: false, message: 'Error capturing checkout.' });
  }
};

/**
 * 3. Admin: Get All Abandoned Checkouts
 */
exports.getAbandonedCheckouts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM abandoned_checkouts ORDER BY updated_at DESC LIMIT 100`
    );

    const formatted = rows.map((r) => {
      let items = [];
      try {
        items = typeof r.items_json === 'string' ? JSON.parse(r.items_json) : r.items_json || [];
      } catch (_) {}

      return {
        id: r.id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        items,
        itemsCount: r.items_count,
        cartTotal: Number(r.cart_total || 0),
        recoveryToken: r.recovery_token,
        whatsappSent: Boolean(r.whatsapp_sent),
        whatsappSentAt: r.whatsapp_sent_at,
        status: r.status,
        recoveredOrderNumber: r.recovered_order_number,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return res.status(200).json({ success: true, checkouts: formatted });
  } catch (err) {
    console.error('Error fetching abandoned checkouts:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch abandoned checkouts.' });
  }
};

/**
 * 4. Admin: Send WhatsApp Abandoned Cart Recovery Message
 */
exports.sendAbandonedCartWhatsAppRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const { customCoupon = 'EXTRA5' } = req.body;

    const [rows] = await db.query('SELECT * FROM abandoned_checkouts WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Abandoned checkout not found.' });
    }

    const checkout = rows[0];
    let items = [];
    try {
      items = typeof checkout.items_json === 'string' ? JSON.parse(checkout.items_json) : checkout.items_json || [];
    } catch (_) {}

    const firstProduct = items[0]?.title || 'Athlete Gear';
    const cleanPhone = `91${checkout.customer_phone.replace(/\D/g, '').slice(-10)}`;

    const messageText = `Hey ${checkout.customer_name || 'Athlete'}! 💪\n\nYour *${firstProduct}* is still reserved in your bag at Guidelya.\n\nUse VIP code *${customCoupon}* for an extra 5% OFF on checkout today!\n\n👉 Complete Order: https://guidelya.com/checkout?recover=${checkout.recovery_token}&coupon=${customCoupon}`;

    // Update status in DB
    await db.query(
      `UPDATE abandoned_checkouts SET whatsapp_sent = 1, whatsapp_sent_at = NOW() WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Recovery message queued for ${checkout.customer_name} (+${cleanPhone})!`,
      whatsappUrl: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`,
    });
  } catch (err) {
    console.error('Error sending recovery WhatsApp:', err);
    return res.status(500).json({ success: false, message: 'Failed to send recovery message.' });
  }
};

/**
 * 5. Customer: Submit Out-Of-Stock Restock Notification Request
 */
exports.submitStockNotification = async (req, res) => {
  try {
    const {
      product_id,
      product_title,
      variant_size = 'All',
      variant_color = 'Default',
      customer_phone,
      customer_email = '',
      customer_name = 'Athlete',
    } = req.body;

    if (!product_id || (!customer_phone && !customer_email)) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and WhatsApp Phone/Email are required.',
      });
    }

    await db.query(
      `INSERT INTO stock_notifications (product_id, product_title, variant_size, variant_color, customer_phone, customer_email, customer_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        product_id,
        product_title || 'Athletic Product',
        variant_size,
        variant_color,
        customer_phone || '',
        customer_email || '',
        customer_name,
      ]
    );

    // Create Admin Alert
    createNotification(
      'stock_alert',
      `🔔 Customer ${customer_name} (+${customer_phone}) requested restock alert for "${product_title}" (Size ${variant_size})`,
      { productId: product_id, size: variant_size }
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Restock alert registered! We'll notify you on WhatsApp as soon as Size ${variant_size} is back in stock.`,
    });
  } catch (err) {
    console.error('Error registering stock notification:', err);
    return res.status(500).json({ success: false, message: 'Failed to register restock request.' });
  }
};

