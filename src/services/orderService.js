import { ORDERS_API_BASE, ADMIN_API_BASE, API_BASE } from '../config/api';

/**
 * Place a new customer order
 */
export async function placeCustomerOrder(orderPayload) {
  try {
    const res = await fetch(`${ORDERS_API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false, message: 'Failed to place order due to a network issue.' };
  }
}

/**
 * Get Order details by order number for tracking / confirmation
 */
export async function fetchOrderDetails(orderNumber) {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/track/${orderNumber}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching order details:', error);
    return { success: false, message: 'Could not fetch order.' };
  }
}

/**
 * Admin: Get all orders with search, status filter, pagination
 */
export async function fetchAdminOrders({ status = 'all', search = '', page = 1, limit = 50 }) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const params = new URLSearchParams({ status, search, page, limit });
    const res = await fetch(`${ADMIN_API_BASE}/orders?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return { success: false, orders: [], total: 0 };
  }
}

/**
 * Admin: Update order status & payment status
 */
export async function updateAdminOrderStatus(orderId, updateData) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Network error updating order.' };
  }
}

/**
 * Cancel an order (Customer or Admin)
 */
export async function cancelOrder(orderId, cancellationReason = '') {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancellation_reason: cancellationReason }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, message: 'Network error cancelling order.' };
  }
}

/**
 * Submit Return Request for a delivered order
 */
export async function submitReturnRequest(orderId, returnReason, returnComment = '') {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/${orderId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ return_reason: returnReason, return_comment: returnComment }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error requesting return:', error);
    return { success: false, message: 'Network error requesting return.' };
  }
}

/**
 * Admin: Update Return & Refund workflow
 */
export async function updateAdminReturnRefund(orderId, payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/orders/${orderId}/return-refund`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating return & refund:', error);
    return { success: false, message: 'Network error updating return/refund.' };
  }
}

/**
 * Admin: Delete order
 */
export async function deleteAdminOrder(orderId) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'Network error deleting order.' };
  }
}

/**
 * Admin: Fetch Live Dynamic Dashboard Stats & Telemetry
 */
export async function fetchAdminDashboardStats(range = '7days') {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/dashboard/stats?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, message: 'Could not fetch live dashboard stats.' };
  }
}

/**
 * Admin: Fetch Logistics & Courier Settings
 */
export async function fetchAdminLogisticsConfig() {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/logistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching logistics config:', error);
    return { success: false, message: 'Network error fetching logistics config.' };
  }
}

/**
 * Admin: Save Logistics & Courier Settings
 */
export async function saveAdminLogisticsConfig(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/logistics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving logistics config:', error);
    return { success: false, message: 'Network error saving logistics config.' };
  }
}

/**
 * Admin: Test Shiprocket Connection
 */
export async function testShiprocketGateway(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/logistics/test-shiprocket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error testing Shiprocket:', error);
    return { success: false, message: 'Network error connecting to Shiprocket.' };
  }
}

/**
 * Admin: Test NimbusPost Connection
 */
export async function testNimbusPostGateway(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/logistics/test-nimbuspost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error testing NimbusPost:', error);
    return { success: false, message: 'Network error connecting to NimbusPost.' };
  }
}

/**
 * Admin: 1-Click Ship Order (Shiprocket / NimbusPost / Manual)
 */
export async function shipAdminOrder(orderId, payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error dispatching order:', error);
    return { success: false, message: 'Network error dispatching order.' };
  }
}

/**
 * Admin: Fetch Razorpay Gateway Settings
 */
export async function fetchAdminRazorpayConfig() {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/razorpay`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching Razorpay config:', error);
    return { success: false, message: 'Network error fetching Razorpay config.' };
  }
}

/**
 * Admin: Save Razorpay Gateway Settings
 */
export async function saveAdminRazorpayConfig(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error saving Razorpay config:', error);
    return { success: false, message: 'Network error saving Razorpay config.' };
  }
}

/**
 * Admin: Test Razorpay Connection
 */
export async function testAdminRazorpayGateway(payload) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/settings/razorpay/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error testing Razorpay:', error);
    return { success: false, message: 'Network error connecting to Razorpay.' };
  }
}

/**
 * Client: Fetch Public Payment / Razorpay Config
 */
export async function fetchPublicPaymentConfig() {
  try {
    const res = await fetch(`${API_BASE}/payment/config`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching public payment config:', error);
    return { success: false, message: 'Network error fetching payment config.' };
  }
}

/**
 * Client: Create Razorpay Order
 */
export async function createClientPaymentOrder(amount, receipt, notes = {}) {
  try {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, receipt, notes }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error creating payment order:', error);
    return { success: false, message: 'Network error creating payment order.' };
  }
}

/**
 * Client: Verify Payment Signature & Place Order
 */
export async function verifyClientPaymentAndPlaceOrder(payload) {
  try {
    const token = localStorage.getItem('xavonic_user_token');
    const res = await fetch(`${API_BASE}/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, message: 'Network error verifying payment.' };
  }
}

/**
 * 🌟 Public: Fetch Recent Sales Activity (For Live FOMO Toast)
 */
export async function fetchRecentSalesActivity() {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/recent-activity`);
    return await res.json();
  } catch (error) {
    console.warn('Notice fetching recent sales activity:', error);
    return {
      success: true,
      activities: [
        { customerName: 'Rohit from Gurugram', productTitle: 'Pro Muscle-Lock Compression Shirt', timeAgo: '2 minutes ago', verified: true },
        { customerName: 'Aman from Mumbai', productTitle: '5" Tactical Inseam Gym Shorts', timeAgo: '4 minutes ago', verified: true },
        { customerName: 'Vikram from Bengaluru', productTitle: 'Acid Wash Heavyweight Oversized Tee', timeAgo: '7 minutes ago', verified: true },
        { customerName: 'Sneha from New Delhi', productTitle: 'Drop Cut Curved Hem Athletic Tee', timeAgo: '11 minutes ago', verified: true },
      ],
    };
  }
}

/**
 * 🌟 Public: Capture In-Progress Checkout for Abandoned Cart Recovery
 */
export async function captureAbandonedCheckout(payload) {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/abandoned/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Could not capture checkout.' };
  }
}

/**
 * 🌟 Public: Submit Out-Of-Stock Restock Notification Request
 */
export async function submitStockRestockAlert(payload) {
  try {
    const res = await fetch(`${ORDERS_API_BASE}/stock-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Error submitting restock notification:', error);
    return { success: false, message: 'Failed to submit restock request.' };
  }
}

/**
 * 🌟 Admin: Fetch All Abandoned Checkouts
 */
export async function fetchAdminAbandonedCheckouts() {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/abandoned-checkouts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching admin abandoned checkouts:', error);
    return { success: false, checkouts: [] };
  }
}

/**
 * 🌟 Admin: Send 1-Click WhatsApp Abandoned Cart Recovery
 */
export async function sendAdminAbandonedWhatsApp(checkoutId, customCoupon = 'EXTRA5') {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/abandoned-checkouts/${checkoutId}/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ customCoupon }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error sending abandoned WhatsApp:', error);
    return { success: false, message: 'Failed to dispatch WhatsApp recovery.' };
  }
}
