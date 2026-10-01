import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  ThumbsUp,
  Trash2,
  Truck,
  Upload,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { allProducts, allCategories } from '../data/productsData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { fetchLiveProductBySlugOrId, fetchLiveProducts } from '../services/productService';
import { fetchProductReviews, submitCustomerReview, markReviewHelpful } from '../services/reviewService';
import { AUTH_API_BASE } from '../config/api';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { isWishlisted: checkIsWishlisted, toggleWishlist: globalToggleWishlist } = useWishlist();
  const { user, openAuth } = useAuth();

  const [liveProduct, setLiveProduct] = useState(null);
  const [allLiveProducts, setAllLiveProducts] = useState(allProducts);


  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        const [fetched, all] = await Promise.all([
          fetchLiveProductBySlugOrId(productId),
          fetchLiveProducts(),
        ]);
        if (isMounted) {
          if (fetched) setLiveProduct(fetched);
          if (all && all.length > 0) setAllLiveProducts(all);
        }
      } catch (err) {
        console.warn('Error loading dynamic product detail:', err);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [productId]);

  const product = useMemo(() => {
    if (liveProduct) return liveProduct;
    return allProducts.find((p) => String(p.id) === String(productId) || p.slug === productId) || allProducts[0];
  }, [liveProduct, productId]);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[1] || product?.sizes?.[0] || 'M'
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState('description');
  const [bundleQty, setBundleQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Zoom States
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(2);
  const [lightboxPos, setLightboxPos] = useState({ x: 50, y: 50 });

  // Reviews System
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({
    totalReviews: 0,
    avgRating: 4.9,
    starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    photosCount: 0,
    fitSummary: {},
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'photos', '5star'
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReviewForm, setNewReviewForm] = useState({
    author: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
    size: 'M',
    fit: 'True to Size',
    images: [],
  });

  // Out of Stock Notification States
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '');
  const [notifyPhone, setNotifyPhone] = useState(user?.phone || '');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

  useEffect(() => {
    if (user?.email && !notifyEmail) setNotifyEmail(user.email);
    if (user?.phone && !notifyPhone) setNotifyPhone(user.phone);
  }, [user]);

  // Fetch Live Database Reviews
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      if (!product?.id && !productId) return;
      setIsLoadingReviews(true);
      try {
        const data = await fetchProductReviews(product?.id || productId, reviewFilter);
        if (isMounted && data?.success) {
          setReviewsList(data.reviews || []);
          if (data.stats) {
            setReviewsStats(data.stats);
          }
        }
      } catch (err) {
        console.warn('Error loading product reviews:', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    loadReviews();
    return () => { isMounted = false; };
  }, [product?.id, productId, reviewFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedColorIndex(0);
    setSelectedSize(product?.sizes?.[1] || product?.sizes?.[0] || 'M');
    setSelectedImageIndex(0);
    setSlideDirection(1);
    setQuantity(1);
    setBundleQty(1);
    setPincodeStatus(null);
  }, [product?.id]);

  const currentImages = useMemo(() => {
    const colorImg = product?.colors?.[selectedColorIndex]?.image;
    const gallery = product?.gallery || [];
    if (!colorImg) return gallery.slice(0, 6);
    const combined = [colorImg, ...gallery.filter((img) => img !== colorImg)];
    return combined.slice(0, 6);
  }, [product, selectedColorIndex]);

  const activeColor =
    product?.colors?.[selectedColorIndex] || { name: 'Default', hex: '#111111' };

  const categoryInfo = useMemo(() => {
    return (
      allCategories.find((c) => c.slug === product?.category) || {
        slug: 'compression',
        title: 'Muscle Compression',
      }
    );
  }, [product?.category]);

  const relatedProducts = useMemo(() => {
    return allLiveProducts.filter((p) => String(p.id) !== String(product?.id) && p.slug !== product?.slug).slice(0, 4);
  }, [allLiveProducts, product?.id, product?.slug]);

  const unitPrice = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || unitPrice);

  // Get inventory for a given size and selected color
  const getSizeStock = (size, colorName = activeColor.name) => {
    if (!product) return 50;
    const stockMap = product.size_stock || {};
    // Check variant key first e.g. Black_M
    const variantKey = `${colorName}_${size}`;
    if (stockMap[variantKey] !== undefined) {
      return Number(stockMap[variantKey]);
    }
    // Check size key e.g. M
    if (stockMap[size] !== undefined) {
      return Number(stockMap[size]);
    }
    // If stockMap has items but this size is omitted, treat as 0
    if (Object.keys(stockMap).length > 0) {
      return 0;
    }
    // Fallback to product total stock
    return Number(product.stock ?? 50);
  };

  const selectedSizeStock = useMemo(() => {
    return getSizeStock(selectedSize, activeColor.name);
  }, [product, selectedSize, activeColor.name]);

  const isSelectedSizeOutOfStock = selectedSizeStock <= 0;
  const isSelectedSizeLowStock = selectedSizeStock > 0 && selectedSizeStock <= 3;

  const handleAddToCart = (shouldOpenDrawer = true) => {
    if (isSelectedSizeOutOfStock) {
      toast.error(`Size ${selectedSize} is currently out of stock!`);
      return;
    }
    const finalQty = bundleQty > 1 ? bundleQty : quantity;
    if (finalQty > selectedSizeStock) {
      toast.error(`Only ${selectedSizeStock} item(s) available in size ${selectedSize}`);
      return;
    }

    addToCart(
      {
        ...product,
        imageFront: currentImages[0],
      },
      selectedSize,
      finalQty,
      activeColor.name
    );

    if (shouldOpenDrawer) openCart();
  };

  const handleBuyNow = () => {
    if (isSelectedSizeOutOfStock) {
      toast.error(`Size ${selectedSize} is currently out of stock!`);
      return;
    }
    handleAddToCart(false);
    navigate('/checkout');
  };

  const isWishlisted = checkIsWishlisted(product?.id || product?.slug || productId);

  const toggleWishlist = () => {
    if (product) {
      globalToggleWishlist(product);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: `Check out ${product.title}`,
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    setPincodeStatus('Delivery within 2–4 business days.');
    toast.success(`Delivery available for PIN ${pincode}`);
  };

  const goPrevImage = () => {
    setSlideDirection(-1);
    setSelectedImageIndex((prev) =>
      prev === 0 ? Math.max(currentImages.length - 1, 0) : prev - 1
    );
  };

  const goNextImage = () => {
    setSlideDirection(1);
    setSelectedImageIndex((prev) =>
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const selectImage = (idx) => {
    setSlideDirection(idx > selectedImageIndex ? 1 : -1);
    setSelectedImageIndex(idx);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleLightboxMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLightboxPos({ x, y });
  };

  // Review Photo Upload Handler
  const handleReviewPhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (newReviewForm.images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReviewForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (indexToRemove) => {
    setNewReviewForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      const payload = {
        user_id: user?.dbId || (typeof user?.id === 'number' ? user.id : null),
        customer_id: user?.customerId || (typeof user?.id === 'string' ? user.id : `GDL-${user?.dbId || '9842'}`),
        author_name: user?.name || user?.displayName || 'Verified Athlete',
        author_email: user?.email || '',
        author_phone: user?.phone || '',
        rating: newReviewForm.rating,
        title: newReviewForm.title.trim() || 'Verified Customer Review',
        comment: newReviewForm.comment.trim(),
        size_purchased: newReviewForm.size || selectedSize,
        fit_feedback: newReviewForm.fit || 'True to Size',
        images: newReviewForm.images,
      };

      const res = await submitCustomerReview(product?.id || productId, payload);
      if (res.success && res.review) {
        setReviewsList((prev) => [res.review, ...prev]);
        setReviewsStats((prev) => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          photosCount: prev.photosCount + (payload.images?.length > 0 ? 1 : 0),
        }));
        setIsWriteReviewOpen(false);
        setNewReviewForm({
          rating: 5,
          title: '',
          comment: '',
          size: selectedSize || 'M',
          fit: 'True to Size',
          images: [],
        });
        toast.success('Thank you! Your verified review has been published live.');
      } else {
        toast.error(res.message || 'Failed to publish review');
      }
    } catch (err) {
      toast.error('Could not submit review. Please try again.');
    }
  };

  const toggleHelpful = async (reviewId) => {
    setReviewsList((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpful: r.userLiked ? Math.max(0, r.helpful - 1) : r.helpful + 1,
            userLiked: !r.userLiked,
          };
        }
        return r;
      })
    );
    await markReviewHelpful(reviewId);
  };

  const handleNotifyMeSubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail && !notifyPhone) {
      toast.error('Please enter an email or WhatsApp phone number');
      return;
    }
    setIsSubmittingNotify(true);
    try {
      const res = await fetch(`${AUTH_API_BASE}/stock-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id || productId,
          productTitle: product?.title || 'Product',
          variantSize: selectedSize || 'All',
          variantColor: activeColor?.name || '',
          email: notifyEmail.trim(),
          phone: notifyPhone.trim(),
          name: user?.name || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `You're on the waitlist! We'll notify you as soon as Size ${selectedSize} is restocked.`);
        setIsNotifyModalOpen(false);
      } else {
        toast.error(data.message || 'Could not subscribe to alerts.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'photos') {
      return reviewsList.filter((r) => r.images && r.images.length > 0);
    }
    if (reviewFilter === '5star') {
      return reviewsList.filter((r) => r.rating === 5);
    }
    return reviewsList;
  }, [reviewsList, reviewFilter]);

  return (
    <div className="min-h-screen bg-white text-neutral-950 font-sans selection:bg-neutral-900 selection:text-white pb-16 lg:pb-0">
      {/* Breadcrumb Bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-neutral-500">
            <Link to="/" className="shrink-0 hover:text-neutral-900 transition-colors">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link to={`/collections/${categoryInfo.slug}`} className="shrink-0 hover:text-neutral-900 transition-colors truncate">
              {categoryInfo.title}
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="truncate font-medium text-neutral-900">{product.title}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hidden items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
      </div>

      {/* Main product showcase */}
      <main className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_440px] xl:grid-cols-[minmax(0,1.2fr)_460px] lg:gap-12 xl:gap-16">
          
          {/* LEFT: IMAGE GALLERY (STICKY FIXED ON DESKTOP, SWIPEABLE ON MOBILE) */}
          <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 lg:gap-5">
              
              {/* Vertical 6-Thumbnails Column (Desktop) */}
              <div className="hidden w-[76px] xl:w-[84px] shrink-0 flex-col gap-2.5 md:flex">
                {currentImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => selectImage(idx)}
                    className={`group relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 transition-all ${
                      selectedImageIndex === idx
                        ? 'ring-1.5 ring-neutral-900 shadow-sm'
                        : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-neutral-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" 
                    />
                  </button>
                ))}
              </div>

              {/* Main Image Slider Container (Fills box cleanly + Mouse Follow Zoom) */}
              <div 
                className="group relative flex-1 min-w-0 overflow-hidden bg-neutral-100 aspect-[3/4] sm:aspect-[4/5] max-h-[720px] cursor-crosshair rounded-none"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* Animated Slide Main Image with Cursor Zoom */}
                <div className="relative h-full w-full overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.img
                      key={currentImages[selectedImageIndex] || selectedImageIndex}
                      src={currentImages[selectedImageIndex] || currentImages[0]}
                      alt={product.title}
                      initial={{ opacity: 0, x: slideDirection * 24 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: isZooming ? 2.4 : 1,
                      }}
                      exit={{ opacity: 0, x: -slideDirection * 24 }}
                      transition={{ 
                        opacity: { duration: 0.22, ease: 'easeOut' },
                        x: { duration: 0.22, ease: 'easeOut' },
                        scale: { duration: 0.12, ease: 'easeOut' }
                      }}
                      style={{
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                      className="h-full w-full object-cover object-center select-none"
                    />
                  </AnimatePresence>
                </div>

                {/* Glassy Circular Navigation Arrows */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrevImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-center text-neutral-800 hover:bg-white hover:scale-105 active:scale-95 transition-all z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-md flex items-center justify-center text-neutral-800 hover:bg-white hover:scale-105 active:scale-95 transition-all z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Glassy Quick Action Buttons (Wishlist & Share) */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist();
                    }}
                    className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 text-neutral-700 shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isWishlisted ? 'fill-red-600 text-red-600' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 text-neutral-700 shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Bottom Badges (Image Counter + Hover/Click to Zoom) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                  <div className="rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white tracking-widest uppercase">
                    {selectedImageIndex + 1} / {currentImages.length}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-md border border-white/60 px-2.5 py-1 text-[10px] font-medium text-neutral-800 shadow-xs">
                    <ZoomIn className="h-3 w-3 text-neutral-600" />
                    <span>{isZooming ? '2.4x Zoom Active' : 'Hover / Click to Zoom'}</span>
                  </div>
                </div>

                {/* Expand icon on top left */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-3 left-3 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 text-neutral-700 shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all z-10"
                  aria-label="Full screen zoom"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Horizontal 6-Thumbnail Strip */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden scrollbar-none">
              {currentImages.map((img, idx) => (
                <button
                  key={`${img}-mobile-${idx}`}
                  onClick={() => selectImage(idx)}
                  className={`aspect-[3/4] w-14 sm:w-16 shrink-0 overflow-hidden bg-neutral-100 transition ${
                    selectedImageIndex === idx ? 'ring-2 ring-neutral-900' : 'opacity-60 ring-1 ring-neutral-200'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT: BUY BOX & PRODUCT SPECS (Natural Scroll) */}
          <aside className="min-w-0">
            <div className="space-y-4">
              
              {/* Category & Title */}
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {categoryInfo.title}
                </p>
                <h1 className="text-[18px] sm:text-[21px] font-medium uppercase leading-snug tracking-tight text-neutral-900">
                  {product.title}
                </h1>

                {/* Price & Rating */}
                <div className="mt-2.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[17px] sm:text-[18px] font-semibold text-neutral-900">
                      ₹{unitPrice.toLocaleString('en-IN')}.00
                    </span>
                    {originalPrice > unitPrice && (
                      <span className="text-xs text-neutral-400 line-through font-normal">
                        ₹{originalPrice.toLocaleString('en-IN')}.00
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-sm">
                        {product.discount}
                      </span>
                    )}
                  </div>
                  <a href="#reviews-section" className="flex items-center gap-1.5 text-xs font-normal text-neutral-500 hover:text-neutral-900 transition-colors">
                    <div className="flex items-center text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                    <span className="font-medium text-neutral-800">{reviewsStats.avgRating || product.rating || 4.9}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="underline underline-offset-2">{(reviewsStats.totalReviews || reviewsList.length)} reviews</span>
                  </a>
                </div>
              </div>

              {/* Prepaid Auto-Apply Offer */}
              <div className="flex items-center justify-between border-y border-neutral-200 py-2.5 text-[11px]">
                <div className="flex items-center gap-2 font-normal text-emerald-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Extra 10% OFF on prepaid orders</span>
                </div>
                <span className="text-[10px] font-medium tracking-wider text-neutral-800 uppercase">
                  AUTO APPLY
                </span>
              </div>

              {/* Size Guide Trigger */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors underline underline-offset-3"
                >
                  <Ruler className="h-3.5 w-3.5" /> Size Guide
                </button>
              </div>

              {/* Volume Bundle Box */}
              <div className="border border-neutral-200 bg-[#f9f9f8] p-3 rounded-none">
                <div className="mb-2 text-center text-xs font-medium tracking-wider text-neutral-700 uppercase">
                  No Soft Fits Allowed.
                </div>

                <div className="space-y-1.5">
                  {[1, 2, 3].map((qty) => {
                    const discount = qty === 2 ? '5% OFF' : qty === 3 ? '10% OFF' : null;
                    const price = Math.round(unitPrice * qty * (qty === 2 ? 0.95 : qty === 3 ? 0.9 : 1));
                    return (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setBundleQty(qty)}
                        className={`flex w-full items-center justify-between border px-3 py-2 text-left transition-all ${
                          bundleQty === qty
                            ? 'border-neutral-900 bg-white shadow-xs'
                            : 'border-neutral-200/90 bg-white/70 hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
                              bundleQty === qty
                                ? 'border-neutral-900 bg-neutral-900'
                                : 'border-neutral-300 bg-white'
                            }`}
                          >
                            {bundleQty === qty && <Check className="h-2.5 w-2.5 text-white" />}
                          </span>
                          <span className="text-[11px] font-medium uppercase text-neutral-800">
                            Buy any {qty}
                          </span>
                          {discount && (
                            <span className="bg-emerald-600 px-1.5 py-0.5 text-[9px] font-medium text-white rounded-xs">
                              {discount}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-neutral-900">
                          ₹{price.toLocaleString('en-IN')}.00
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              {!!product?.colors?.length && (
                <div>
                  <div className="mb-2 text-xs font-normal text-neutral-600 uppercase tracking-wider">
                    Color: <span className="font-medium text-neutral-900">{activeColor.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color, idx) => (
                      <button
                        key={`${color.name}-${idx}`}
                        onClick={() => {
                          setSelectedColorIndex(idx);
                          setSelectedImageIndex(0);
                        }}
                        className={`relative h-[52px] w-[42px] overflow-hidden bg-neutral-100 transition-all ${
                          selectedColorIndex === idx
                            ? 'ring-1.5 ring-neutral-900 shadow-xs'
                            : 'opacity-70 hover:opacity-100 ring-1 ring-neutral-200'
                        }`}
                        title={color.name}
                      >
                        {color.image ? (
                          <img src={color.image} alt={color.name} className="h-full w-full object-cover object-center" />
                        ) : (
                          <span className="block h-full w-full" style={{ backgroundColor: color.hex }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-normal text-neutral-600 uppercase tracking-wider">
                    Size: <span className="font-medium text-neutral-900">{selectedSize}</span>
                  </span>
                  {selectedSizeStock > 0 ? (
                    <span className={`text-[11px] font-medium ${isSelectedSizeLowStock ? 'text-amber-700' : 'text-neutral-500'}`}>
                      {isSelectedSizeLowStock ? `Only ${selectedSizeStock} left!` : 'In Stock'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-red-600">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => {
                    const st = getSizeStock(size, activeColor.name);
                    const isOut = st <= 0;
                    const isLow = st > 0 && st <= 3;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`relative grid h-9 min-w-9 place-items-center rounded-full border px-3 text-xs font-medium transition-all ${
                          isSelected
                            ? isOut
                              ? 'border-red-600 bg-red-600 text-white shadow-xs'
                              : 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : isOut
                            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 line-through opacity-70 hover:border-neutral-300'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
                        }`}
                        title={isOut ? `${size} (Out of Stock)` : isLow ? `${size} (${st} left)` : `${size} (In Stock)`}
                      >
                        <span>{size}</span>
                        {isLow && !isSelected && (
                          <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Inventory Warning Pill */}
              {isSelectedSizeOutOfStock ? (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <div>
                    <span className="font-semibold">Size {selectedSize} is currently Out of Stock</span>
                    <span className="text-[11px] text-neutral-500 block">Please select a different size or color variant.</span>
                  </div>
                </div>
              ) : isSelectedSizeLowStock ? (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="font-medium">
                    ⚡ Hurry! Only <strong>{selectedSizeStock}</strong> left in size {selectedSize}.
                  </span>
                </div>
              ) : null}

              {/* Quantity + Add to Cart + Buy Now / Out of Stock Notify Me */}
              {isSelectedSizeOutOfStock ? (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="flex h-12 w-full items-center justify-center gap-2.5 bg-neutral-950 px-4 text-xs font-medium uppercase tracking-widest text-white hover:bg-black active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                  >
                    <Bell className="h-4 w-4 text-amber-400" />
                    Notify Me When Available
                  </button>
                  <p className="text-[11px] text-center text-neutral-500 font-normal">
                    Get an instant WhatsApp / Email alert as soon as Size {selectedSize} is back in stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <div className="flex h-11 items-center border border-neutral-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="grid h-full w-9 place-items-center text-neutral-600 hover:text-black transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-neutral-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(Math.min(10, selectedSizeStock), q + 1))}
                        className="grid h-full w-9 place-items-center text-neutral-600 hover:text-black transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(true)}
                      className="flex h-11 flex-1 items-center justify-center gap-2 px-4 text-xs font-medium uppercase tracking-widest text-white transition-all bg-neutral-900 hover:bg-black active:scale-[0.99] cursor-pointer"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add to cart
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex h-11 w-full items-center justify-center gap-2 border border-neutral-900 bg-white text-xs font-medium uppercase tracking-widest text-neutral-900 hover:bg-neutral-50 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Buy now
                  </button>
                </div>
              )}

              {/* Trust Features Bar */}
              <div className="grid grid-cols-3 border-y border-neutral-200 py-3 text-center">
                <div className="px-2">
                  <Truck className="mx-auto mb-1 h-4 w-4 text-neutral-700" />
                  <div className="text-[10px] font-medium text-neutral-700 uppercase tracking-wider">Free Shipping</div>
                </div>
                <div className="border-x border-neutral-200 px-2">
                  <RotateCcw className="mx-auto mb-1 h-4 w-4 text-neutral-700" />
                  <div className="text-[10px] font-medium text-neutral-700 uppercase tracking-wider">7-Day Exchange</div>
                </div>
                <div className="px-2">
                  <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-neutral-700" />
                  <div className="text-[10px] font-medium text-neutral-700 uppercase tracking-wider">100% Genuine</div>
                </div>
              </div>

              {/* Live Deals Card */}
              <div>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-700">Live Deals</div>
                <div className="flex items-center justify-between border border-neutral-200 bg-neutral-950 p-3 text-white">
                  <div>
                    <div className="text-[10px] text-neutral-400 font-normal">Special Deal</div>
                    <div className="text-xs font-medium">Extra prepaid savings</div>
                    <div className="mt-0.5 text-[10px] text-neutral-400 font-normal">Applied automatically at checkout</div>
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-neutral-900">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Delivery Checker */}
              <form onSubmit={handleCheckPincode} className="border-t border-neutral-200 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-800">
                  <MapPin className="h-3.5 w-3.5 text-neutral-700" /> Check Delivery
                </div>
                <div className="flex">
                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    className="h-9 flex-1 border border-neutral-300 px-3 text-xs font-normal outline-none focus:border-neutral-900"
                  />
                  <button type="submit" className="h-9 bg-neutral-900 px-4 text-[11px] font-medium uppercase tracking-wider text-white hover:bg-black transition-colors">
                    Check
                  </button>
                </div>
                {pincodeStatus && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-normal text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {pincodeStatus}
                  </div>
                )}
              </form>

              {/* SKU & Category Details */}
              <div className="border-t border-neutral-200 pt-3 text-[11px] leading-5 text-neutral-500 font-normal">
                <div><span className="font-medium text-neutral-800">SKU:</span> {product.id}</div>
                <div><span className="font-medium text-neutral-800">Category:</span> {categoryInfo.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-medium text-neutral-800">Share:</span>
                  <button onClick={handleShare} className="inline-flex items-center gap-1 text-neutral-600 hover:text-black transition-colors">
                    <Share2 className="h-3 w-3" /> Product Link
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* DETAILS TABS (Description / Specs) */}
        <section className="mt-14 border-t border-neutral-200 pt-8 sm:mt-18">
          <div className="mx-auto max-w-[880px]">
            <div className="mb-7 flex justify-center gap-8 border-b border-neutral-200 text-xs font-medium tracking-wider uppercase">
              <button
                onClick={() => setActiveInfoTab('description')}
                className={`relative pb-3 transition-colors ${
                  activeInfoTab === 'description' ? 'text-neutral-950 font-medium' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Description
                {activeInfoTab === 'description' && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-neutral-950" />
                )}
              </button>
              <button
                onClick={() => setActiveInfoTab('additional')}
                className={`relative pb-3 transition-colors ${
                  activeInfoTab === 'additional' ? 'text-neutral-950 font-medium' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Additional Information
                {activeInfoTab === 'additional' && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-neutral-950" />
                )}
              </button>
            </div>

            {activeInfoTab === 'description' ? (
              <article className="space-y-6 text-xs leading-6 text-neutral-700 font-normal">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-neutral-900 uppercase tracking-wide">
                    Engineered Fit & Construction
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>

                {!!product.features?.length && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-neutral-900 uppercase tracking-wide">Why You’ll Like It</h4>
                    <ul className="space-y-1.5">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-neutral-600">
                          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-neutral-800" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="mb-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">Built For</h4>
                  <p className="font-normal text-neutral-600">
                    Strength Training • Gym Workouts • Functional Training • High-Intensity Sessions • Athletic Layering
                  </p>
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">Fit & Feel</h4>
                  <p><strong className="font-medium text-neutral-800">Fit:</strong> {product.fit || 'Performance Fit'}</p>
                  <p><strong className="font-medium text-neutral-800">Feel:</strong> Snug, breathable and unrestricted</p>
                  <p><strong className="font-medium text-neutral-800">Model:</strong> {product.modelStats || "Model wears size M."}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">Fabric & Construction</h4>
                  <p><strong className="font-medium text-neutral-800">Composition:</strong> {product.fabric || 'Premium Performance Blend'}</p>
                  <p><strong className="font-medium text-neutral-800">Construction:</strong> Reinforced flatlock 4-way stretch</p>
                  <p><strong className="font-medium text-neutral-800">Country of Production:</strong> India</p>
                </div>

                <div>
                  <h4 className="mb-1 text-xs font-medium text-neutral-900 uppercase tracking-wide">Care Instructions</h4>
                  <ul className="space-y-1 text-neutral-600">
                    <li>• Machine wash cold with similar colours</li>
                    <li>• Do not bleach or use fabric softeners</li>
                    <li>• Tumble dry low or hang to dry</li>
                    <li>• Cool iron if needed, avoid direct heat on logos</li>
                  </ul>
                </div>
              </article>
            ) : (
              <div className="grid gap-3 text-xs leading-6 text-neutral-700 sm:grid-cols-2">
                <div className="border-b border-neutral-200 py-2.5">
                  <span className="font-medium text-neutral-900">Color</span>
                  <span className="float-right text-neutral-600">{activeColor.name}</span>
                </div>
                <div className="border-b border-neutral-200 py-2.5">
                  <span className="font-medium text-neutral-900">Fit</span>
                  <span className="float-right text-neutral-600">{product.fit || 'Performance Fit'}</span>
                </div>
                <div className="border-b border-neutral-200 py-2.5">
                  <span className="font-medium text-neutral-900">Fabric</span>
                  <span className="float-right text-neutral-600">{product.fabric || 'Poly-Spandex'}</span>
                </div>
                <div className="border-b border-neutral-200 py-2.5">
                  <span className="font-medium text-neutral-900">Available Sizes</span>
                  <span className="float-right text-neutral-600">{product.sizes?.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <section className="mt-14 border-t border-neutral-200 pt-8 sm:mt-18">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-medium uppercase tracking-wide text-neutral-900">Related Products</h2>
              <p className="mt-0.5 text-xs text-neutral-500 font-normal">You may also like these matching aesthetic styles.</p>
            </div>
            <Link to="/collections" className="text-xs font-medium uppercase tracking-wider text-neutral-800 underline underline-offset-4 hover:text-black">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="group min-w-0">
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img
                    src={p.gallery?.[0] || p.colors?.[0]?.image}
                    alt={p.title}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="pt-2.5">
                  <h3 className="truncate text-xs font-normal text-neutral-800 group-hover:text-black transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-neutral-900">₹{Number(p.price || 0).toLocaleString('en-IN')}.00</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* COMPLETE CUSTOMER REVIEWS BLOCK */}
        <section id="reviews-section" className="mx-auto mt-14 max-w-[920px] border border-neutral-200 bg-white p-5 sm:p-8 sm:mt-18">
          {/* Header & Rating Summary (Mobile Friendly, No Overlap) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5 sm:pb-6">
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-medium uppercase tracking-wide text-neutral-900">
                Customer Reviews
              </h2>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                <div className="flex items-center text-amber-400 shrink-0">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n < Math.round(reviewsStats.avgRating || 4.9) ? 'fill-current' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                  {reviewsStats.avgRating || 4.9} out of 5
                </span>
                <span className="text-neutral-300 hidden sm:inline">•</span>
                <span className="text-xs text-neutral-500 font-normal">
                  Based on {reviewsStats.totalReviews || reviewsList.length} verified reviews
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  toast.info('Please sign in with your WhatsApp number to write a verified review.');
                  openAuth();
                } else {
                  setIsWriteReviewOpen(true);
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-medium uppercase tracking-widest text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="h-4 w-4 shrink-0" />
              Write a review
            </button>
          </div>

          {/* Filters Bar (Responsive Scrollable Filter Pills) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-neutral-200 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full">
              <span className="text-neutral-500 font-normal shrink-0">Filter by:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full border shrink-0 transition-all ${
                    reviewFilter === 'all'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  All ({reviewsStats.totalReviews || reviewsList.length})
                </button>
                <button
                  onClick={() => setReviewFilter('photos')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border shrink-0 transition-all ${
                    reviewFilter === 'photos'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  With Photos ({reviewsStats.photosCount || reviewsList.filter((r) => r.images?.length > 0).length})
                </button>
                <button
                  onClick={() => setReviewFilter('5star')}
                  className={`px-3 py-1 text-xs rounded-full border shrink-0 transition-all ${
                    reviewFilter === '5star'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  5 Stars ({reviewsStats.starCounts?.[5] || reviewsList.filter((r) => r.rating === 5).length})
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="divide-y divide-neutral-200">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Star className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                    No Customer Reviews Yet
                  </h4>
                  <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                    Be the first athlete to share your fit, workout pump, and fabric feedback.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.info('Please sign in with your WhatsApp number to write a verified review.');
                      openAuth();
                    } else {
                      setIsWriteReviewOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xs text-xs font-medium hover:bg-black transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Write the First Review
                </button>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className="py-6 space-y-3">
                  {/* Reviewer Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-900">{rev.author}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-xs">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-normal">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating ? 'fill-current' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{rev.date}</span>
                        {rev.size && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-600">Size: {rev.size}</span>
                          </>
                        )}
                        {rev.fit && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-600">{rev.fit}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Comment */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-900 mb-1">{rev.title}</h4>
                    <p className="text-xs text-neutral-600 font-normal leading-relaxed">{rev.comment}</p>
                  </div>

                  {/* Uploaded Photos Gallery */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 pt-1 flex-wrap">
                      {rev.images.map((imgSrc, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => {
                            setSelectedImageIndex(0);
                            setIsLightboxOpen(true);
                          }}
                          className="group relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden border border-neutral-200 bg-neutral-100 transition-all hover:ring-1 hover:ring-neutral-900"
                        >
                          <img
                            src={imgSrc}
                            alt={`Customer upload ${imgIdx + 1}`}
                            className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-500 font-normal">
                    <span>Was this review helpful?</span>
                    <button
                      type="button"
                      onClick={() => toggleHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-all ${
                        rev.userLiked
                          ? 'border-neutral-900 bg-neutral-900 text-white font-medium'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{rev.helpful}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* MOBILE STICKY BOTTOM BAR (Clean & Safe Touch Layout) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md p-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="hidden min-[360px]:block shrink-0">
            <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Price</span>
            <span className="text-sm font-semibold text-neutral-900">
              ₹{(bundleQty > 1 ? Math.round(unitPrice * bundleQty * (bundleQty === 2 ? 0.95 : 0.9)) : unitPrice).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-1 gap-2">
            <button
              onClick={() => handleAddToCart(true)}
              className="h-11 flex-1 bg-neutral-900 text-xs font-medium uppercase tracking-wider text-white hover:bg-black active:scale-[0.98] transition-all"
            >
              Add to cart
            </button>
            <button
              onClick={handleBuyNow}
              className="h-11 flex-1 border border-neutral-900 bg-white text-xs font-medium uppercase tracking-wider text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] transition-all"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-neutral-800" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-900">Compression & Fit Chart</h3>
              </div>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-2xl leading-none text-neutral-500 hover:text-black">×</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-normal">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700">
                    <th className="border border-neutral-200 p-2.5 font-medium">Size</th>
                    <th className="border border-neutral-200 p-2.5 font-medium">Chest (in)</th>
                    <th className="border border-neutral-200 p-2.5 font-medium">Length (in)</th>
                    <th className="border border-neutral-200 p-2.5 font-medium">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '36 - 38', '27.5', '28 - 30'],
                    ['M', '38 - 40', '28.5', '31 - 32'],
                    ['L', '40 - 42', '29.5', '33 - 34'],
                    ['XL', '42 - 44', '30.5', '35 - 36'],
                    ['XXL', '44 - 46', '31.5', '37 - 38'],
                  ].map((row) => (
                    <tr key={row[0]} className={selectedSize === row[0] ? 'bg-neutral-100 font-medium' : ''}>
                      {row.map((cell, idx) => (
                        <td key={idx} className="border border-neutral-200 p-2.5">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-5 h-10 w-full bg-neutral-900 text-xs font-medium uppercase tracking-wider text-white hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL WITH IMAGE UPLOAD */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white p-5 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3.5 mb-5">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-900">
                  Write a Customer Review
                </h3>
                <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                  Share your experience with {product.title}
                </p>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewReviewForm((prev) => ({ ...prev, rating: star }))}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || newReviewForm.rating)
                            ? 'fill-current'
                            : 'text-neutral-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-medium text-neutral-700">
                    {(hoverRating || newReviewForm.rating)} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Logged in Athlete Banner (Auto Detected) */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-semibold text-[11px] flex items-center justify-center shrink-0 uppercase tracking-wider">
                  {user?.name ? user.name.slice(0, 2) : 'AT'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {user?.name || user?.displayName || `Athlete (+${user?.phone?.slice(-4) || '9842'})`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Verified Athlete
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {user?.phone ? `+${user.phone}` : 'Verified Mobile'} {user?.email ? `• ${user.email}` : ''}
                  </div>
                </div>
              </div>

              {/* Size & Fit Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                    Purchased Size
                  </label>
                  <select
                    value={newReviewForm.size}
                    onChange={(e) => setNewReviewForm((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full h-10 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 bg-white"
                  >
                    {product.sizes?.map((sz) => (
                      <option key={sz} value={sz}>Size {sz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                    How does it fit?
                  </label>
                  <select
                    value={newReviewForm.fit}
                    onChange={(e) => setNewReviewForm((prev) => ({ ...prev, fit: e.target.value }))}
                    className="w-full h-10 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Runs Small">Runs Small / Snug</option>
                    <option value="True to Size">True to Size (Recommended)</option>
                    <option value="Runs Large">Runs Large / Loose</option>
                  </select>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incredible fit and muscle-lock hold!"
                  value={newReviewForm.title}
                  onChange={(e) => setNewReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full h-10 border border-neutral-300 px-3 text-xs outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1">
                  Review Comments *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked about the fabric, stitching, workout pump, and feel..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full border border-neutral-300 p-3 text-xs outline-none focus:border-neutral-900 transition-colors resize-none"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1.5">
                  Upload Photos (Up to 5)
                </label>
                <div className="border-2 border-dashed border-neutral-300 p-4 text-center hover:border-neutral-900 transition-colors">
                  <input
                    type="file"
                    id="review-photo-input"
                    multiple
                    accept="image/*"
                    onChange={handleReviewPhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="review-photo-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="h-5 w-5 text-neutral-600" />
                    <span className="text-xs font-medium text-neutral-900">
                      Click to upload images
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      PNG, JPG, WEBP up to 5MB each
                    </span>
                  </label>
                </div>

                {/* Uploaded Images Preview Strip */}
                {newReviewForm.images.length > 0 && (
                  <div className="flex gap-2.5 mt-3 flex-wrap">
                    {newReviewForm.images.map((imgSrc, idx) => (
                      <div key={idx} className="relative h-16 w-16 overflow-hidden border border-neutral-200 bg-neutral-100 group">
                        <img src={imgSrc} alt="Upload preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="h-11 flex-1 border border-neutral-300 text-xs font-medium uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 bg-neutral-900 text-xs font-medium uppercase tracking-widest text-white hover:bg-black transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN INTERACTIVE HD ZOOM MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-300 truncate max-w-[200px] sm:max-w-md">
                {product.title}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-neutral-400">
                {selectedImageIndex + 1} / {currentImages.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom((z) => Math.max(1, z - 0.5))}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-neutral-400 min-w-8 text-center">
                {lightboxZoom.toFixed(1)}x
              </span>
              <button
                onClick={() => setLightboxZoom((z) => Math.min(3.5, z + 0.5))}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(2);
                }}
                className="ml-2 sm:ml-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white text-neutral-300 hover:text-black transition-all"
                title="Close Viewer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoom Viewport */}
          <div 
            className="relative flex-1 overflow-hidden cursor-crosshair flex items-center justify-center p-4"
            onMouseMove={handleLightboxMouseMove}
          >
            <div className="relative h-full max-h-[85vh] aspect-[3/4] overflow-hidden rounded-xs bg-neutral-900 shadow-2xl">
              <img
                src={currentImages[selectedImageIndex] || currentImages[0]}
                alt=""
                style={{
                  transformOrigin: `${lightboxPos.x}% ${lightboxPos.y}%`,
                  transform: `scale(${lightboxZoom})`,
                  transition: 'transform 0.1s ease-out',
                }}
                className="h-full w-full object-contain object-center select-none"
              />
            </div>

            {/* Lightbox Nav Arrows */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={goPrevImage}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNextImage}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Bottom Floating Thumbnail Bar */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
              <div className="flex gap-2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {currentImages.map((img, idx) => (
                  <button
                    key={`lb-${img}-${idx}`}
                    onClick={() => selectImage(idx)}
                    className={`h-12 w-9 overflow-hidden rounded-xs transition-all ${
                      selectedImageIndex === idx ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OUT OF STOCK "NOTIFY ME WHEN AVAILABLE" MODAL */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md border border-neutral-200 bg-white p-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-amber-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold uppercase tracking-wide text-neutral-900">
                  Notify Me When In Stock
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Size: <strong className="text-neutral-800">{selectedSize}</strong> • Color: <strong className="text-neutral-800">{activeColor.name}</strong>
                </p>
              </div>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 p-3 mb-5">
              <img
                src={currentImages[0]}
                alt={product.title}
                className="h-14 w-11 object-cover bg-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-900 truncate uppercase">{product.title}</p>
                <p className="text-xs text-neutral-600 font-semibold mt-0.5">₹{unitPrice.toLocaleString('en-IN')}.00</p>
                <span className="inline-block text-[10px] text-red-600 font-medium uppercase mt-0.5">Currently Sold Out</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleNotifyMeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1.5">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-neutral-300 px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-neutral-300 px-3 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNotifyModalOpen(false)}
                  className="flex-1 border border-neutral-300 py-2.5 text-xs font-medium uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotify}
                  className="flex-1 bg-neutral-950 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmittingNotify ? (
                    <span>Subscribing...</span>
                  ) : (
                    <>
                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                      <span>Alert Me</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-neutral-400 font-normal">
                We'll only notify you once when this item is restocked. No spam.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
