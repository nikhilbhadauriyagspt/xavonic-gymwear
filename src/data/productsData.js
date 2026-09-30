import spotlightFront from '../assets/spotlight_front.jpg';
import spotlightBack from '../assets/spotlight_back.jpg';
import spotlightSide from '../assets/spotlight_side.jpg';
import spotlightFabric from '../assets/spotlight_fabric.jpg';
import heroCompression from '../assets/hero_compression.jpg';
import prodCompressionBack from '../assets/prod_compression_back.jpg';
import heroJoggers from '../assets/hero_joggers.jpg';
import catTrackpants from '../assets/cat_trackpants.jpg';
import catDropcut from '../assets/cat_dropcut.jpg';
import catShorts from '../assets/cat_shorts.jpg';
import catStringers from '../assets/cat_stringers.jpg';
import heroOversized from '../assets/hero_oversized.jpg';
import catHoodies from '../assets/cat_hoodies.jpg';

export const allCategories = [
  {
    slug: 'oversized',
    title: 'Oversized T-Shirts',
    subtitle: '240 GSM Heavyweight French Terry',
    itemCount: '12 Fits',
    image: heroOversized,
    desc: 'Heavyweight pump cover essentials engineered with relaxed drop shoulders and vintage wash.'
  },
  {
    slug: 'compression',
    title: 'Muscle Compression',
    subtitle: 'Second-Skin 4-Way Stretch',
    itemCount: '8 Fits',
    image: heroCompression,
    desc: 'Reinforced flatlock stitched muscle-lock compression wear for zero friction and max pump.'
  },
  {
    slug: 'shorts',
    title: '5" Training Shorts',
    subtitle: 'Squat-Proof & Quad Cut',
    itemCount: '10 Fits',
    image: catShorts,
    desc: 'Lightweight performance shorts with zippered pockets and quad-accentuating 5-inch inseams.'
  },
  {
    slug: 'lowers',
    title: 'Gym Lowers & Joggers',
    subtitle: 'Tapered Heavyweight Fleece',
    itemCount: '9 Fits',
    image: heroJoggers,
    desc: 'Engineered aesthetic joggers with ankle ribbing and moisture-wicking athletic fabric.'
  },
  {
    slug: 'tanks',
    title: 'Tanks & Stringers',
    subtitle: 'Deep Cut Bodybuilding Fit',
    itemCount: '7 Fits',
    image: catStringers,
    desc: 'Racerback and deep cut armholes designed to showcase back and shoulder definition.'
  },
  {
    slug: 'drop-cut',
    title: 'Drop Cut T-Shirts',
    subtitle: 'Curved Hem Athletic Fit',
    itemCount: '8 Fits',
    image: catDropcut,
    desc: 'V-taper enhancing curved hem tees crafted for an athletic aesthetic taper.'
  },
  {
    slug: 'acid-wash',
    title: 'Acid Wash Collection',
    subtitle: 'Distressed Streetwear Aesthetics',
    itemCount: '6 Fits',
    image: spotlightFront,
    desc: 'Individual mineral-dyed distressed pump covers with custom heavy drape.'
  },
  {
    slug: 'trackpants',
    title: 'Athletic Trackpants',
    subtitle: 'Zip Ankle Performance Wear',
    itemCount: '7 Fits',
    image: catTrackpants,
    desc: 'Streamlined athletic trackpants for training, cardio, and lifestyle recovery.'
  }
];

export const allProducts = [
  // --- OVERSIZED T-SHIRTS ---
  {
    id: 'prod-1',
    title: 'Acid Wash Heavyweight Oversized Tee',
    category: 'oversized',
    price: 1499,
    originalPrice: 2299,
    discount: '35% Off',
    fabric: '240 GSM 100% Combed French Terry Cotton',
    fit: 'Relaxed Drop-Shoulder Oversized Boxy Fit',
    modelStats: 'Model is 6\'1" wearing size L',
    description: 'Engineered for dedicated lifters, our Acid Wash Heavyweight Tee combines authentic streetwear aesthetic with unmatched durability. Custom garment-dyed and mineral-washed for a unique vintage patina that gets softer with every gym session.',
    features: [
      'Pre-shrunk 240 GSM organic French Terry',
      'Drop-shoulder cut to accentuate upper chest & delts',
      'Double-stitched ribbed collar that retains shape',
      'Breathable, moisture-absorbing heavyweight weave',
      'Tagless itch-free neck label'
    ],
    gallery: [spotlightFront, spotlightBack, spotlightSide, spotlightFabric, heroOversized, catDropcut],
    colors: [
      { name: 'Onyx Black', hex: '#18181b', image: spotlightFront },
      { name: 'Vintage Grey', hex: '#52525b', image: spotlightSide },
      { name: 'Crimson Red', hex: '#dc2626', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviewsCount: 128,
    inStock: true
  },
  {
    id: 'prod-7',
    title: 'Vintage Distressed Heavyweight Pump Cover',
    category: 'oversized',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    fabric: '220 GSM Ultra-Soft Cotton Terry',
    fit: 'Loose Gym Silhouette',
    modelStats: 'Model is 5\'11" wearing size XL for oversized look',
    description: 'The ultimate warm-up pump cover. Generous chest and sleeve cut designed to fit effortlessly over tanks and stringers during early set progression.',
    features: [
      'Heavy drape vintage distressed wash',
      'Reinforced shoulder tape seams',
      'Thermal regulation cotton weave',
      'Fade-resistant reactive dye process'
    ],
    gallery: [heroOversized, spotlightBack, spotlightFront, spotlightSide, spotlightFabric, catDropcut],
    colors: [
      { name: 'Charcoal Black', hex: '#27272a', image: heroOversized },
      { name: 'Off White', hex: '#e4e4e7', image: spotlightBack }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviewsCount: 84,
    inStock: true
  },
  {
    id: 'prod-13',
    title: 'Minimalist Boxy Fit Drop Shoulder Tee',
    category: 'oversized',
    price: 1299,
    originalPrice: 1899,
    discount: '32% Off',
    fabric: '230 GSM Heavy Single Jersey Cotton',
    fit: 'Clean Boxy Drop Shoulder',
    modelStats: 'Model is 6\'0" wearing size L',
    description: 'Clean architectural cut without loud logos. Pure gym-to-street minimalism with premium matte texture.',
    features: [
      'Zero shrinkage pre-washed fabric',
      'Straight cut hem with side vents',
      'High-density collar ribbing'
    ],
    gallery: [spotlightBack, spotlightSide, spotlightFront, spotlightFabric, heroOversized, catDropcut],
    colors: [
      { name: 'Carbon Black', hex: '#18181b', image: spotlightBack },
      { name: 'Slate Grey', hex: '#71717a', image: spotlightSide },
      { name: 'Military Olive', hex: '#3f4f34', image: spotlightFront }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    reviewsCount: 62,
    inStock: true
  },
  {
    id: 'prod-14',
    title: 'Stealth Raw Edge Heavyweight Gym Tee',
    category: 'oversized',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    fabric: '240 GSM Brushed French Terry',
    fit: 'Oversized Raw Cut Finish',
    modelStats: 'Model is 6\'2" wearing size XL',
    description: 'Raw edge detailing along sleeves and hem gives this heavy tee an unmistakable raw gym culture vibe.',
    features: [
      'Raw cut non-fray edge treatment',
      'Reinforced neckband',
      'Natural anti-odor breathable cotton'
    ],
    gallery: [spotlightSide, heroOversized, spotlightBack, spotlightFront, spotlightFabric, catDropcut],
    colors: [
      { name: 'Jet Black', hex: '#09090b', image: spotlightSide },
      { name: 'Heather Grey', hex: '#a1a1aa', image: heroOversized }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviewsCount: 47,
    inStock: true
  },

  // --- MUSCLE COMPRESSION ---
  {
    id: 'prod-2',
    title: 'Pro Muscle-Lock Compression Shirt',
    category: 'compression',
    price: 1299,
    originalPrice: 1899,
    discount: '30% Off',
    fabric: '85% Nylon, 15% Spandex Muscle-Lock Matrix',
    fit: 'Second-Skin Compression Lock',
    modelStats: 'Model is 5\'11" (82kg) wearing size M',
    description: 'Engineered for maximum blood flow, vascularity display, and joint warmth. Seamless 4-way stretch holds muscle bellies tight while eliminating chafing during intense lifts.',
    features: [
      'Reinforced Flatlock 4-needle stitching',
      'Targeted lat and pec compression zones',
      'Quick-dry sweat-wicking capillary technology',
      'Anti-microbial and silver-ion odor barrier',
      'UPF 50+ sun protection for outdoor training'
    ],
    gallery: [heroCompression, prodCompressionBack, spotlightBack, spotlightFabric, spotlightSide, heroOversized],
    colors: [
      { name: 'Stealth Black', hex: '#000000', image: heroCompression },
      { name: 'Pure White', hex: '#f4f4f5', image: prodCompressionBack },
      { name: 'Blood Red', hex: '#dc2626', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 156,
    inStock: true
  },
  {
    id: 'prod-11',
    title: 'Second-Skin Compression Long Sleeve Thermal',
    category: 'compression',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    fabric: '88% Polyamide, 12% Elastane Heat-Lock',
    fit: 'Tight Athletic Compression Fit',
    modelStats: 'Model is 6\'0" wearing size L',
    description: 'Full-length arm and forearm compression designed for pump retention, tendon stability, and high performance.',
    features: [
      'Thumbhole cuffs for secure sleeve positioning',
      'Graduated forearm-to-shoulder compression',
      'Thermal micro-fleece internal lining'
    ],
    gallery: [prodCompressionBack, heroCompression, spotlightSide, spotlightFabric, spotlightBack, heroOversized],
    colors: [
      { name: 'Black Panther', hex: '#18181b', image: prodCompressionBack },
      { name: 'Deep Navy', hex: '#1e293b', image: heroCompression }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 91,
    inStock: true
  },
  {
    id: 'prod-15',
    title: 'Vascularity Accent Flatlock Compression Tee',
    category: 'compression',
    price: 1249,
    originalPrice: 1799,
    discount: '31% Off',
    fabric: 'High-Density Hydrophobic Lycra',
    fit: 'Contoured Muscle-Fit',
    modelStats: 'Model is 5\'10" wearing size M',
    description: 'Sculpted anatomical seamlines map across the clavicle, deltoids, and ribs to highlight athletic muscularity.',
    features: [
      'Ergonomic contour paneling',
      'Zero friction flat seams',
      'Moisture-repelling hydrophobic fibers'
    ],
    gallery: [heroCompression, spotlightBack, prodCompressionBack, spotlightSide, spotlightFabric, heroOversized],
    colors: [
      { name: 'Matte Black', hex: '#27272a', image: heroCompression },
      { name: 'Gunmetal Grey', hex: '#52525b', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 73,
    inStock: true
  },

  // --- 5" TRAINING SHORTS ---
  {
    id: 'prod-3',
    title: '5" Tactical Inseam Gym Shorts',
    category: 'shorts',
    price: 1099,
    originalPrice: 1599,
    discount: '31% Off',
    fabric: '90% Nylon, 10% Spandex 4-Way Stretch',
    fit: '5-Inch Quad-Accent Inseam',
    modelStats: 'Model is 6\'0" wearing size M (32" waist)',
    description: 'Custom tailored above the quad for unrestricted squats, lunges, and deadlifts. Equipped with waterproof concealed zipper pockets so your phone never drops on the gym floor.',
    features: [
      '5-inch athletic quad cut',
      'Deep dual YKK zippered side pockets',
      'Internal towel / shirt loop on waistband',
      'Split-hem design for maximum squat depth',
      'High-elastic drawcord with metal aglets'
    ],
    gallery: [catShorts, heroJoggers, catTrackpants, spotlightFabric, catHoodies, spotlightSide],
    colors: [
      { name: 'Matte Black', hex: '#18181b', image: catShorts },
      { name: 'Army Olive', hex: '#365314', image: heroJoggers },
      { name: 'Charcoal Grey', hex: '#3f3f46', image: catTrackpants }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    reviewsCount: 112,
    inStock: true
  },
  {
    id: 'prod-8',
    title: '2-in-1 Quad-Flex Compression Liner Shorts',
    category: 'shorts',
    price: 1399,
    originalPrice: 1999,
    discount: '30% Off',
    fabric: 'Double Layer: Aero Shell + Compression Inner',
    fit: '5" Outer + 7" Compression Inner',
    modelStats: 'Model is 6\'1" wearing size L',
    description: 'Built-in muscle compression liner protects against inner thigh chafing and supports hamstring power.',
    features: [
      'Integrated phone pocket on compression liner',
      'Sweat-proof back zipper key pocket',
      'Anti-chafing flatlock inner seams'
    ],
    gallery: [heroJoggers, catShorts, spotlightSide, spotlightFabric, catTrackpants, catHoodies],
    colors: [
      { name: 'Black/Red Liner', hex: '#000000', image: heroJoggers },
      { name: 'Grey/Black Liner', hex: '#71717a', image: catShorts }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 96,
    inStock: true
  },

  // --- GYM LOWERS & JOGGERS ---
  {
    id: 'prod-4',
    title: 'Tapered Heavyweight Cargo Joggers',
    category: 'lowers',
    price: 1699,
    originalPrice: 2499,
    discount: '32% Off',
    fabric: '320 GSM Heavyweight Terry Fleece',
    fit: 'Tapered Ankle Rib Fit',
    modelStats: 'Model is 6\'1" wearing size L (33" waist)',
    description: 'Engineered heavy fleece joggers with ergonomic knee darts for true squat mobility without sagging.',
    features: [
      '6 Multi-functional tactical pockets',
      'Heavyweight 320 GSM fleece interior',
      'Tapered ankle ribbing that hugs sneakers',
      'Thick elastic waistband with chunky drawcord'
    ],
    gallery: [catTrackpants, heroJoggers, prodCompressionBack, catShorts, spotlightFabric, catHoodies],
    colors: [
      { name: 'Charcoal Grey', hex: '#3f3f46', image: catTrackpants },
      { name: 'Jet Black', hex: '#18181b', image: heroJoggers },
      { name: 'Desert Sand', hex: '#a8a29e', image: prodCompressionBack }
    ],
    sizes: ['M', 'L', 'XL'],
    rating: 4.8,
    reviewsCount: 88,
    inStock: true
  },
  {
    id: 'prod-19',
    title: 'French Terry Relaxed Aesthetic Gym Joggers',
    category: 'lowers',
    price: 1599,
    originalPrice: 2299,
    discount: '30% Off',
    fabric: '280 GSM Pure Organic Cotton French Terry',
    fit: 'Streamlined Jogger Fit',
    modelStats: 'Model is 5\'11" wearing size M',
    description: 'Plush hand-feel with athletic drape. The perfect blend of rest-day relaxation and intense leg-day readiness.',
    features: [
      'Gusseted crotch for full mobility',
      'Deep welt zippered pockets',
      'Custom metal drawcord aglets'
    ],
    gallery: [heroJoggers, catTrackpants, spotlightFront, spotlightFabric, catShorts, catHoodies],
    colors: [
      { name: 'Onyx Black', hex: '#09090b', image: heroJoggers },
      { name: 'Light Grey Marl', hex: '#d4d4d8', image: catTrackpants }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 65,
    inStock: true
  },

  // --- TANKS & STRINGERS ---
  {
    id: 'prod-5',
    title: 'Deep Cut Athletic Stringer Tank',
    category: 'tanks',
    price: 999,
    originalPrice: 1499,
    discount: '33% Off',
    fabric: '190 GSM Cotton-Modal Stretch',
    fit: 'Deep Cut Racerback Fit',
    modelStats: 'Model is 6\'0" wearing size L',
    description: 'Cut deep at the lats and chest to accentuate back width and upper chest shelf without sliding off shoulders.',
    features: [
      'Racerback slim shoulder straps',
      'Drop hem for coverage during overhead presses',
      'Anti-roll hemline stitching'
    ],
    gallery: [catStringers, spotlightBack, spotlightFront, spotlightSide, spotlightFabric, heroOversized],
    colors: [
      { name: 'Raw Black', hex: '#18181b', image: catStringers },
      { name: 'Crimson Red', hex: '#dc2626', image: spotlightBack },
      { name: 'Pure White', hex: '#ffffff', image: spotlightFront }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.7,
    reviewsCount: 80,
    inStock: true
  },

  // --- DROP CUT T-SHIRTS ---
  {
    id: 'prod-6',
    title: 'Curved Drop Cut Athletic Performance Tee',
    category: 'drop-cut',
    price: 1199,
    originalPrice: 1699,
    discount: '29% Off',
    fabric: '95% Premium Cotton, 5% Elastane',
    fit: 'V-Taper Curved Hem Drop Cut',
    modelStats: 'Model is 6\'1" wearing size L',
    description: 'Tailored through the arms and chest with an elongated curved scallop hem that emphasizes the coveted V-taper illusion.',
    features: [
      'Curved scallop drop hem',
      'Fitted bicep sleeves',
      'Breathable performance blend'
    ],
    gallery: [catDropcut, spotlightSide, spotlightBack, spotlightFabric, spotlightFront, heroOversized],
    colors: [
      { name: 'Charcoal Black', hex: '#27272a', image: catDropcut },
      { name: 'Mineral Washed', hex: '#52525b', image: spotlightSide },
      { name: 'Ruby Red', hex: '#b91c1c', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviewsCount: 104,
    inStock: true
  },

  // --- ACID WASH ---
  {
    id: 'prod-9',
    title: 'Acid Wash Charcoal Drop-Shoulder Tee',
    category: 'acid-wash',
    price: 1499,
    originalPrice: 2199,
    discount: '31% Off',
    fabric: '240 GSM Heavy Mineral Dye Terry',
    fit: 'Boxy Heavyweight Drop-Shoulder',
    modelStats: 'Model is 6\'0" wearing size XL',
    description: 'Each tee undergoes individual mineral acid-washing, creating unique artisanal patina and authentic vintage textures.',
    features: [
      'Unique hand-dyed distressed patterns',
      'Heavy 240 GSM drape',
      'Thick rib crewneck'
    ],
    gallery: [spotlightSide, spotlightFront, spotlightBack, spotlightFabric, heroOversized, catDropcut],
    colors: [
      { name: 'Acid Charcoal', hex: '#3f3f46', image: spotlightSide },
      { name: 'Acid Black', hex: '#18181b', image: spotlightFront },
      { name: 'Acid Red', hex: '#991b1b', image: spotlightBack }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.9,
    reviewsCount: 57,
    inStock: true
  },

  // --- TRACKPANTS ---
  {
    id: 'prod-10',
    title: 'Athletic Lightweight Trackpants',
    category: 'trackpants',
    price: 1599,
    originalPrice: 2299,
    discount: '30% Off',
    fabric: 'Lightweight Weather-Resistant Poly-Span',
    fit: 'Athletic Taper with Ankle Zips',
    modelStats: 'Model is 6\'1" wearing size L',
    description: 'Featherlight trackpants built for warmup cardio, track sprints, and lifestyle recovery.',
    features: [
      'Concealed ankle zippers for easy shoe removal',
      'Quick-dry hydro-repellent surface',
      'Reflective stealth brand accents'
    ],
    gallery: [catTrackpants, heroJoggers, catShorts, spotlightFabric, catHoodies, spotlightSide],
    colors: [
      { name: 'Deep Grey', hex: '#3f3f46', image: catTrackpants },
      { name: 'Solid Black', hex: '#09090b', image: heroJoggers }
    ],
    sizes: ['M', 'L', 'XL'],
    rating: 4.8,
    reviewsCount: 43,
    inStock: true
  }
];
