import { REVIEWS_API_BASE, ADMIN_API_BASE } from '../config/api';

/**
 * Fetch live customer reviews and aggregated ratings for a product
 */
export async function fetchProductReviews(productId, filter = 'all', sort = 'recent') {
  try {
    const res = await fetch(`${REVIEWS_API_BASE}/product/${productId}?filter=${filter}&sort=${sort}`);
    const data = await res.json();
    if (data.success) {
      return data;
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch reviews for product ${productId}:`, error);
    return null;
  }
}

/**
 * Submit a new customer review to the database
 */
export async function submitCustomerReview(productId, reviewData) {
  try {
    const res = await fetch(`${REVIEWS_API_BASE}/product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return await res.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, message: 'Failed to submit review due to a network error.' };
  }
}

/**
 * Mark a review as helpful (upvote)
 */
export async function markReviewHelpful(reviewId) {
  try {
    const res = await fetch(`${REVIEWS_API_BASE}/${reviewId}/helpful`, {
      method: 'POST',
    });
    return await res.json();
  } catch (error) {
    console.warn(`Error marking review ${reviewId} helpful:`, error);
    return { success: false };
  }
}

/**
 * Admin: Fetch all reviews with pagination, filter, search
 */
export async function fetchAdminReviews({ status = 'all', search = '', page = 1, limit = 50 }) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const params = new URLSearchParams({ status, search, page, limit });
    const res = await fetch(`${ADMIN_API_BASE}/reviews?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return { success: false, reviews: [], total: 0 };
  }
}

/**
 * Admin: Update review status (approve, reject, verified badge)
 */
export async function updateAdminReviewStatus(reviewId, { status, isVerifiedBuyer }) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, isVerifiedBuyer }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error updating review status:', error);
    return { success: false, message: 'Network error updating review.' };
  }
}

/**
 * Admin: Delete a review permanently
 */
export async function deleteAdminReview(reviewId) {
  try {
    const token = localStorage.getItem('xavonic_admin_token');
    const res = await fetch(`${ADMIN_API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, message: 'Network error deleting review.' };
  }
}
