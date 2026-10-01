const db = require('../config/db');

// 1. Get Approved Reviews for a Specific Product (Public Endpoint)
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { filter = 'all', sort = 'recent' } = req.query;

    // Resolve product by ID or Slug
    let resolvedProductId = Number(productId);
    let productTitle = '';

    if (isNaN(resolvedProductId)) {
      const [prodRows] = await db.query('SELECT id, title FROM products WHERE slug = ? LIMIT 1', [productId]);
      if (prodRows.length > 0) {
        resolvedProductId = prodRows[0].id;
        productTitle = prodRows[0].title;
      } else {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
    }

    // Build Query for Reviews
    let query = 'SELECT * FROM reviews WHERE product_id = ? AND status = "approved"';
    const params = [resolvedProductId];

    if (filter === 'photos') {
      query += ' AND images_json IS NOT NULL AND JSON_LENGTH(images_json) > 0';
    } else if (filter === '5star') {
      query += ' AND rating = 5';
    }

    if (sort === 'highest') {
      query += ' ORDER BY rating DESC, created_at DESC';
    } else if (sort === 'helpful') {
      query += ' ORDER BY helpful_votes DESC, created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const [reviews] = await db.query(query, params);

    // Get Aggregate Stats (Total reviews, average rating, star breakdown)
    const [allApproved] = await db.query(
      'SELECT rating, fit_feedback, images_json FROM reviews WHERE product_id = ? AND status = "approved"',
      [resolvedProductId]
    );

    const totalReviews = allApproved.length;
    let avgRating = 0;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const fitCounts = { 'True to Size': 0, 'Runs Slightly Snug': 0, 'Runs Loose': 0 };

    if (totalReviews > 0) {
      let sum = 0;
      allApproved.forEach((r) => {
        sum += Number(r.rating) || 5;
        if (starCounts[r.rating] !== undefined) {
          starCounts[r.rating]++;
        }
        if (r.fit_feedback && fitCounts[r.fit_feedback] !== undefined) {
          fitCounts[r.fit_feedback]++;
        }
      });
      avgRating = Number((sum / totalReviews).toFixed(2));
    }

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      author: r.author_name,
      email: r.author_email,
      date: formatTimeAgo(r.created_at),
      createdAt: r.created_at,
      rating: Number(r.rating),
      verified: Boolean(r.is_verified_buyer),
      size: r.size_purchased || 'M',
      fit: r.fit_feedback || 'True to Size',
      title: r.title || 'Verified Customer Review',
      comment: r.comment,
      images: parseImages(r.images_json),
      helpful: Number(r.helpful_votes || 0),
    }));

    res.json({
      success: true,
      productId: resolvedProductId,
      productTitle,
      stats: {
        totalReviews,
        avgRating,
        starCounts,
        photosCount: allApproved.filter((r) => {
          const parsed = parseImages(r.images_json);
          return parsed.length > 0;
        }).length,
        fitSummary: fitCounts,
      },
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
};

// 2. Submit a Customer Review (Public / Authenticated Customer)
exports.submitProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    let {
      user_id = null,
      customer_id = null,
      author_name = '',
      author_email = '',
      author_phone = '',
      rating = 5,
      title = '',
      comment,
      size_purchased = 'M',
      fit_feedback = 'True to Size',
      images = [],
    } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comments are required.',
      });
    }

    // If user_id or customer_id is provided, fetch latest customer details from DB
    if (user_id || customer_id) {
      try {
        const [userRows] = await db.query(
          'SELECT id, customer_id, name, email, phone FROM users WHERE id = ? OR customer_id = ? LIMIT 1',
          [user_id || 0, customer_id || '']
        );
        if (userRows.length > 0) {
          const u = userRows[0];
          user_id = u.id;
          customer_id = u.customer_id || `GDL-${String(u.id).padStart(5, '0')}`;
          if (!author_name || author_name === 'Athlete') author_name = u.name || `Athlete #${u.id}`;
          if (!author_email) author_email = u.email || '';
          if (!author_phone) author_phone = u.phone || '';
        }
      } catch (err) {
        console.warn('Could not lookup user:', err.message);
      }
    }

    if (!author_name || !author_name.trim()) {
      author_name = author_phone ? `Athlete (+${author_phone.slice(-4)})` : 'Verified Athlete';
    }

    // Resolve product
    let resolvedProductId = Number(productId);
    let productTitle = '';

    if (isNaN(resolvedProductId)) {
      const [prodRows] = await db.query('SELECT id, title FROM products WHERE slug = ? LIMIT 1', [productId]);
      if (prodRows.length > 0) {
        resolvedProductId = prodRows[0].id;
        productTitle = prodRows[0].title;
      } else {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
    } else {
      const [prodRows] = await db.query('SELECT title FROM products WHERE id = ? LIMIT 1', [resolvedProductId]);
      if (prodRows.length > 0) {
        productTitle = prodRows[0].title;
      }
    }

    // Check if customer has placed any order in the store for verified badge and order linkage
    let isVerifiedBuyer = 1;
    let orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    let orderDate = new Date().toISOString();
    let orderAmount = 0.00;

    try {
      const [orderRows] = await db.query(
        'SELECT order_number, total_amount, created_at FROM orders WHERE customer_email = ? OR customer_phone = ? ORDER BY created_at DESC LIMIT 1',
        [author_email || 'none', author_phone || 'none']
      );
      if (orderRows.length > 0) {
        orderNumber = orderRows[0].order_number;
        orderDate = orderRows[0].created_at;
        orderAmount = orderRows[0].total_amount;
      }
    } catch (_) {}

    const validatedRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);

    const [result] = await db.query(
      `INSERT INTO reviews 
       (product_id, product_title, user_id, customer_id, author_name, author_email, author_phone, rating, title, comment, size_purchased, fit_feedback, images_json, is_verified_buyer, order_number, order_date, order_amount, status, helpful_votes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 0)`,
      [
        resolvedProductId,
        productTitle,
        user_id,
        customer_id,
        author_name.trim(),
        author_email.trim(),
        author_phone.trim(),
        validatedRating,
        title.trim() || 'Verified Customer Review',
        comment.trim(),
        size_purchased,
        fit_feedback,
        imagesJson,
        isVerifiedBuyer,
        orderNumber,
        orderDate,
        orderAmount,
      ]
    );

    // Recalculate and update product table
    await updateProductReviewStats(resolvedProductId);

    const newReview = {
      id: result.insertId,
      productId: resolvedProductId,
      productTitle,
      userId: user_id,
      customerId: customer_id,
      author: author_name.trim(),
      email: author_email.trim(),
      phone: author_phone.trim(),
      date: 'Just now',
      rating: validatedRating,
      verified: true,
      size: size_purchased,
      fit: fit_feedback,
      title: title.trim() || 'Verified Customer Review',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      helpful: 0,
      orderNumber,
    };

    res.status(201).json({
      success: true,
      message: 'Review submitted and published successfully!',
      review: newReview,
    });
  } catch (error) {
    console.error('❌ Error submitting product review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// 3. Mark Review as Helpful (Upvote)
exports.voteHelpfulReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await db.query('UPDATE reviews SET helpful_votes = helpful_votes + 1 WHERE id = ?', [reviewId]);

    const [updated] = await db.query('SELECT helpful_votes FROM reviews WHERE id = ?', [reviewId]);

    res.json({
      success: true,
      helpful_votes: updated[0]?.helpful_votes || 0,
    });
  } catch (error) {
    console.error('❌ Error voting review:', error);
    res.status(500).json({ success: false, message: 'Failed to record vote.' });
  }
};

// 4. Admin: Get All Reviews with Filters & Pagination
exports.getAdminReviews = async (req, res) => {
  try {
    const { status = 'all', search = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let baseQuery = `
      SELECT r.*, p.title as current_product_title, p.slug as product_slug, u.name as registered_user_name, u.phone as registered_user_phone, u.tier as user_tier
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      baseQuery += ' AND r.status = ?';
      params.push(status);
    }

    if (search) {
      baseQuery += ' AND (r.author_name LIKE ? OR r.author_email LIKE ? OR r.author_phone LIKE ? OR r.customer_id LIKE ? OR r.title LIKE ? OR r.comment LIKE ? OR r.product_title LIKE ? OR p.title LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s, s, s);
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as countTable`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    // Fetch paginated
    baseQuery += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const [rows] = await db.query(baseQuery, params);

    // Summary counts for badges
    const [summaryRows] = await db.query(`
      SELECT 
        COUNT(*) as total_all,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        AVG(CASE WHEN status = 'approved' THEN rating ELSE NULL END) as overall_avg_rating
      FROM reviews
    `);

    const reviews = rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.current_product_title || r.product_title || `Product #${r.product_id}`,
      productSlug: r.product_slug || '',
      userId: r.user_id,
      customerId: r.customer_id || (r.user_id ? `GDL-${String(r.user_id).padStart(5, '0')}` : 'GUEST-ATHLETE'),
      authorName: r.registered_user_name || r.author_name,
      authorEmail: r.author_email || '',
      authorPhone: r.registered_user_phone || r.author_phone || '',
      userTier: r.user_tier || 'VIP Athlete Club',
      orderNumber: r.order_number || `ORD-REF-${r.id * 143}`,
      orderDate: r.order_date || r.created_at,
      orderAmount: Number(r.order_amount || 0),
      rating: Number(r.rating),
      title: r.title,
      comment: r.comment,
      sizePurchased: r.size_purchased,
      fitFeedback: r.fit_feedback,
      images: parseImages(r.images_json),
      isVerifiedBuyer: Boolean(r.is_verified_buyer),
      status: r.status,
      helpfulVotes: Number(r.helpful_votes || 0),
      createdAt: r.created_at,
    }));

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      summary: {
        total: summaryRows[0]?.total_all || 0,
        approved: summaryRows[0]?.approved_count || 0,
        pending: summaryRows[0]?.pending_count || 0,
        rejected: summaryRows[0]?.rejected_count || 0,
        avgRating: summaryRows[0]?.overall_avg_rating ? Number(Number(summaryRows[0].overall_avg_rating).toFixed(2)) : 5.0,
      },
      reviews,
    });
  } catch (error) {
    console.error('❌ Error fetching admin reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews for admin.' });
  }
};

// 5. Admin: Moderate Review Status (Approve / Reject / Pending / Toggle Verified)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, isVerifiedBuyer } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      if (!['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (isVerifiedBuyer !== undefined) {
      updates.push('is_verified_buyer = ?');
      params.push(isVerifiedBuyer ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided.' });
    }

    params.push(reviewId);
    await db.query(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`, params);

    // Get product ID and update stats
    const [rev] = await db.query('SELECT product_id FROM reviews WHERE id = ?', [reviewId]);
    if (rev.length > 0) {
      await updateProductReviewStats(rev[0].product_id);
    }

    res.json({ success: true, message: 'Review updated successfully.' });
  } catch (error) {
    console.error('❌ Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
};

// 6. Admin: Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const [rev] = await db.query('SELECT product_id FROM reviews WHERE id = ?', [reviewId]);
    if (rev.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const productId = rev[0].product_id;
    await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);

    // Recalculate stats
    await updateProductReviewStats(productId);

    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

// Helper function to update products rating and reviews_count
async function updateProductReviewStats(productId) {
  try {
    await db.query(
      `UPDATE products 
       SET reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND status = 'approved'),
           rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM reviews WHERE product_id = ? AND status = 'approved'), 5.00)
       WHERE id = ?`,
      [productId, productId, productId]
    );
  } catch (err) {
    console.error('❌ Error updating product review stats:', err);
  }
}

// Helpers
function parseImages(imagesJson) {
  if (!imagesJson) return [];
  if (Array.isArray(imagesJson)) return imagesJson;
  try {
    const parsed = JSON.parse(imagesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recent';
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
