import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';

import spotlightFront from '../assets/spotlight_front.jpg';
import spotlightBack from '../assets/spotlight_back.jpg';
import spotlightFabric from '../assets/spotlight_fabric.jpg';
import heroOversized from '../assets/hero_oversized.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import spotlightSide from '../assets/spotlight_side.jpg';

export default function NewInStore() {
  const galleryImages = [
    { src: spotlightFront, label: 'Front Fit' },
    { src: spotlightBack, label: 'Back Angle' },
    { src: spotlightFabric, label: 'Fabric Texture' },
    { src: heroOversized, label: 'Gym Action' },
    { src: catDropcut, label: 'Full Silhouette' },
    { src: spotlightSide, label: 'Side Profile' },
  ];

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Washed Onyx', hex: '#262626' },
    { name: 'Vintage Charcoal', hex: '#3f3f46' },
    { name: 'Crimson Red', hex: '#dc2626' },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Washed Onyx');
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [showZoomCursor, setShowZoomCursor] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({
    x: 0,
    y: 0,
  });

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousLightboxImage = () => {
    setLightboxIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    toast.success('Added to bag', {
      description: `Acid Wash Oversized Tee · ${selectedColor} · Size ${selectedSize} · Qty ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    toast.success('Proceeding to checkout', {
      description: `Acid Wash Oversized Tee · ${selectedColor} · Size ${selectedSize} · Qty ${quantity}`,
    });
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }

      if (event.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === galleryImages.length - 1 ? 0 : prev + 1
        );
      }

      if (event.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === 0 ? galleryImages.length - 1 : prev - 1
        );
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, galleryImages.length]);

  return (
    <>
      <section className="w-full bg-white text-[#101828] py-10 md:py-14 lg:py-16 select-none font-sans border-b border-zinc-200">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start w-full">
            
            {/* =========================================================
                LEFT COMBINED GALLERY: (THUMBNAILS + MAIN BIG IMAGE)
                Generous Height with Vertical Scroll for Thumbnails
            ========================================================= */}
            <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-3.5 sm:gap-4 w-full h-auto lg:h-[640px] xl:h-[680px] items-stretch">
              
              {/* Vertical Thumbnails (Scrollable within exact big image height) */}
              <div className="w-full lg:w-[82px] xl:w-[90px] shrink-0 flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden h-auto lg:h-full pr-0 lg:pr-1 custom-gallery-scrollbar">
                {galleryImages.map((item, index) => {
                  const active = activeImageIndex === index;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`
                        relative
                        h-[86px]
                        w-[66px]
                        lg:h-[102px]
                        lg:w-full
                        shrink-0
                        overflow-hidden
                        bg-[#f3f3f3]
                        border
                        transition-colors
                        duration-200
                        cursor-pointer
                        rounded-none
                        ${active
                          ? 'border-red-600 ring-1 ring-red-600'
                          : 'border-transparent hover:border-zinc-400'
                        }
                      `}
                      aria-label={`View ${item.label}`}
                    >
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Main Big Product Display (Vertical Sliding Track) */}
              <div className="flex-1 min-w-0 h-[480px] sm:h-[560px] lg:h-full relative overflow-hidden bg-[#f1f1f1] border border-zinc-300 rounded-none shadow-sm cursor-none">
                <div
                  onClick={() => openLightbox(activeImageIndex)}
                  onMouseEnter={() => setShowZoomCursor(true)}
                  onMouseLeave={() => setShowZoomCursor(false)}
                  onMouseMove={handleMouseMove}
                  className="w-full h-full relative"
                  aria-label="Open full screen gallery"
                >
                  {/* Continuous Vertical Slide Track */}
                  <div
                    className="w-full h-full flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{
                      transform: `translateY(-${activeImageIndex * 100}%)`,
                    }}
                  >
                    {galleryImages.map((item, index) => (
                      <div key={index} className="w-full h-full shrink-0 relative">
                        <img
                          src={item.src}
                          alt={item.label}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Custom + Zoom Cursor */}
                  {showZoomCursor && (
                    <span
                      className="
                        pointer-events-none
                        absolute
                        z-20
                        flex
                        h-12
                        w-12
                        -translate-x-1/2
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-zinc-950
                        shadow-[0_4px_22px_rgba(0,0,0,0.18)]
                      "
                      style={{
                        left: cursorPosition.x,
                        top: cursorPosition.y,
                      }}
                    >
                      <Plus strokeWidth={1.8} size={22} className="text-red-600" />
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* =========================================================
                RIGHT COLUMN: PRODUCT DETAILS (TIGHTER, CLEANER SPACING)
            ========================================================= */}
            <div className="lg:col-span-5 space-y-3.5 w-full">
              
              {/* Eyebrow with Red Dot */}
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.38em]
                  text-zinc-500
                  flex
                  items-center
                  gap-2
                "
              >
                <span className="w-1.5 h-1.5 bg-red-600 inline-block"></span>
                <span>New in store</span>
              </p>

              {/* Title */}
              <h2
                className="
                  text-[24px]
                  sm:text-[28px]
                  font-medium
                  leading-[1.2]
                  tracking-[-0.025em]
                  text-zinc-950
                "
              >
                Acid Wash Heavyweight Oversized Tee
              </h2>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span
                  className="
                    text-[24px]
                    sm:text-[26px]
                    font-semibold
                    tracking-[-0.03em]
                    text-zinc-950
                  "
                >
                  ₹1,499
                </span>
                <span className="text-sm text-zinc-400 line-through">
                  ₹2,299
                </span>
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5">
                  35% Off
                </span>
              </div>

              {/* Colors Available Swatches */}
              <div className="pt-1">
                <p className="mb-1.5 text-[12px] font-semibold text-zinc-900">
                  Color: <span className="font-normal text-zinc-600">{selectedColor}</span>
                </p>

                <div className="flex items-center gap-2.5">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`
                        w-7
                        h-7
                        border
                        transition-all
                        cursor-pointer
                        flex
                        items-center
                        justify-center
                        rounded-none
                        ${selectedColor === color.name
                          ? 'border-zinc-950 ring-2 ring-zinc-950/20 scale-105'
                          : 'border-zinc-300 hover:border-zinc-500'
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={color.name}
                    >
                      {selectedColor === color.name && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="pt-1">
                <p className="mb-1.5 text-[12px] font-semibold text-zinc-900">
                  Size
                </p>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const active = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`
                          flex
                          h-[38px]
                          min-w-[40px]
                          items-center
                          justify-center
                          border
                          px-3
                          text-[12px]
                          transition-colors
                          duration-200
                          cursor-pointer
                          rounded-none
                          ${active
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-transparent bg-[#f5f5f5] text-zinc-700 hover:border-zinc-300'
                          }
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="pt-1 flex items-center justify-between border-b border-zinc-200 pb-3.5">
                <span className="text-[12px] font-semibold text-zinc-900">
                  Quantity
                </span>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-7 w-7 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-950 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} strokeWidth={1.7} />
                  </button>

                  <span className="min-w-[14px] text-center text-[12px] font-semibold text-zinc-950">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-7 w-7 items-center justify-center text-zinc-950 transition-opacity hover:opacity-60 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="
                    flex
                    h-[46px]
                    w-full
                    items-center
                    justify-center
                    border
                    border-zinc-900
                    bg-white
                    text-[13px]
                    font-medium
                    text-zinc-900
                    transition-colors
                    duration-200
                    hover:bg-zinc-50
                    cursor-pointer
                    rounded-none
                  "
                >
                  Add to cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="
                    flex
                    h-[46px]
                    w-full
                    items-center
                    justify-center
                    bg-red-600
                    text-[13px]
                    font-medium
                    text-white
                    transition-colors
                    duration-200
                    hover:bg-red-700
                    cursor-pointer
                    rounded-none
                  "
                >
                  Buy it now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          FULL SCREEN IMAGE VIEWER
      ================================================== */}
      {lightboxOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            h-screen
            w-screen
            flex-col
            bg-white
          "
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar with Close (X) Button */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white z-30">
            <div className="text-[12px] font-mono font-medium tracking-wider text-zinc-500">
              {String(lightboxIndex + 1).padStart(2, '0')}
              <span className="mx-2 text-zinc-300">/</span>
              {String(galleryImages.length).padStart(2, '0')}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="
                p-2
                rounded-full
                hover:bg-zinc-100
                text-zinc-800
                hover:text-black
                transition-colors
                cursor-pointer
              "
              aria-label="Close full screen gallery"
            >
              <X size={24} strokeWidth={1.8} />
            </button>
          </div>

          {/* Main fullscreen image area */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 py-5 sm:px-12">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousLightboxImage();
              }}
              className="
                absolute
                left-3
                top-1/2
                z-20
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/95
                text-zinc-900
                shadow-[0_2px_18px_rgba(0,0,0,0.12)]
                transition-transform
                hover:scale-105
                hover:text-red-600
                cursor-pointer
                sm:left-7
              "
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={1.6} />
            </button>

            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
              "
              onClick={(event) => event.stopPropagation()}
            >
              <img
                key={lightboxIndex}
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].label}
                className="
                  max-h-full
                  max-w-full
                  object-contain
                  animate-[galleryFade_.25s_ease-out]
                "
              />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextLightboxImage();
              }}
              className="
                absolute
                right-3
                top-1/2
                z-20
                flex
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/95
                text-zinc-900
                shadow-[0_2px_18px_rgba(0,0,0,0.12)]
                transition-transform
                hover:scale-105
                hover:text-red-600
                cursor-pointer
                sm:right-7
              "
              aria-label="Next image"
            >
              <ChevronRight size={24} strokeWidth={1.6} />
            </button>
          </div>

          {/* Fullscreen thumbnail slider */}
          <div
            className="
              border-t
              border-zinc-200
              bg-white
              px-4
              py-4
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="
                mx-auto
                flex
                max-w-[760px]
                items-center
                justify-start
                gap-2.5
                overflow-x-auto
                sm:justify-center
              "
            >
              {galleryImages.map((item, index) => {
                const active = lightboxIndex === index;

                return (
                  <button
                    key={`lightbox-${item.label}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className={`
                      h-[72px]
                      w-[56px]
                      shrink-0
                      overflow-hidden
                      border
                      bg-[#f3f3f3]
                      transition
                      cursor-pointer
                      rounded-none
                      sm:h-[82px]
                      sm:w-[64px]
                      ${active
                        ? 'border-red-600 opacity-100 ring-1 ring-red-600'
                        : 'border-transparent opacity-55 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes galleryFade {
          from {
            opacity: 0.35;
            transform: scale(0.99);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .custom-gallery-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-gallery-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-gallery-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
        }
        .custom-gallery-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </>
  );
}