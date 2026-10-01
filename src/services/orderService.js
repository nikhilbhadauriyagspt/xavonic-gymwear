import { ORDERS_API_BASE, ADMIN_API_BASE } from '../config/api';

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
