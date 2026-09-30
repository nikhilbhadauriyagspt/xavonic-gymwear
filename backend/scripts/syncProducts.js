const db = require('../config/db');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const fs = require('fs');
const path = require('path');

const localAssetMap = {
  spotlightFront: 'spotlight_front.jpg',
  spotlightBack: 'spotlight_back.jpg',
  spotlightSide: 'spotlight_side.jpg',
  spotlightFabric: 'spotlight_fabric.jpg',
  heroCompression: 'hero_compression.jpg',
  prodCompressionBack: 'prod_compression_back.jpg',
  heroJoggers: 'hero_joggers.jpg',
  catTrackpants: 'cat_trackpants.jpg',
  catDropcut: 'cat_dropcut.jpg',
  catShorts: 'cat_shorts.jpg',
  catStringers: 'cat_stringers.jpg',
  heroOversized: 'hero_oversized.jpg',
  catHoodies: 'cat_hoodies.jpg',
};

async function syncAllProductsAndCategories() {
  console.log('🔄 Starting Full Sync of Categories and Real Products with Cloudinary Galleries...');
  try {
    // 1. Upload/Verify Cloudinary Assets
    const uploadedUrls = {};
    const assetsDir = path.join(__dirname, '../../src/assets');

    for (const [key, filename] of Object.entries(localAssetMap)) {
      const filePath = path.join(assetsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          const fileBuf = fs.readFileSync(filePath);
          const uploadRes = await uploadToCloudinary(fileBuf, 'guidelya/products');
          uploadedUrls[key] = uploadRes.secure_url;
          console.log(`✅ Cloudinary asset ready: ${filename} -> ${uploadRes.secure_url}`);
        } catch (e) {
          console.warn(`⚠️ Warning for ${filename}:`, e.message);
        }
      }
    }

    const front = uploadedUrls.spotlightFront || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/spotlight_front.jpg';
    const back = uploadedUrls.spotlightBack || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/spotlight_back.jpg';
    const side = uploadedUrls.spotlightSide || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/spotlight_side.jpg';
    const fabric = uploadedUrls.spotlightFabric || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/spotlight_fabric.jpg';
    const heroComp = uploadedUrls.heroCompression || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/hero_compression.jpg';
    const compBack = uploadedUrls.prodCompressionBack || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/prod_compression_back.jpg';
    const joggers = uploadedUrls.heroJoggers || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/hero_joggers.jpg';
    const trackpants = uploadedUrls.catTrackpants || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/cat_trackpants.jpg';
    const dropcut = uploadedUrls.catDropcut || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/cat_dropcut.jpg';
    const shorts = uploadedUrls.catShorts || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/cat_shorts.jpg';
    const stringers = uploadedUrls.catStringers || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/cat_stringers.jpg';
    const oversized = uploadedUrls.heroOversized || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/hero_oversized.jpg';
    const hoodies = uploadedUrls.catHoodies || 'https://res.cloudinary.com/fwlidd7t/image/upload/v1743450000/guidelya/products/cat_hoodies.jpg';

    // 2. Ensure all categories exist
    const categorySeeds = [
      { name: 'Men', slug: 'men', level: 'main', parent_slug: null },
      { name: 'Women', slug: 'women', level: 'main', parent_slug: null },
      { name: 'Gym T-Shirts & Tops', slug: 'men-t-shirts', level: 'sub', parent_slug: 'men' },
      { name: 'Gym Lowers & Bottomwear', slug: 'men-lowers-bottoms', level: 'sub', parent_slug: 'men' },
      { name: 'Compression T-Shirts', slug: 'compression', level: 'item_type', parent_slug: 'men-t-shirts' },
      { name: 'Oversized T-Shirts', slug: 'oversized', level: 'item_type', parent_slug: 'men-t-shirts' },
      { name: 'Drop Cut T-Shirts', slug: 'drop-cut', level: 'item_type', parent_slug: 'men-t-shirts' },
      { name: 'Tanks & Stringers', slug: 'tanks', level: 'item_type', parent_slug: 'men-t-shirts' },
      { name: 'Acid Wash Collection', slug: 'acid-wash', level: 'item_type', parent_slug: 'men-t-shirts' },
      { name: 'Gym Lowers & Joggers', slug: 'lowers', level: 'item_type', parent_slug: 'men-lowers-bottoms' },
      { name: 'Athletic Trackpants', slug: 'trackpants', level: 'item_type', parent_slug: 'men-lowers-bottoms' },
      { name: '5" Training Shorts', slug: 'shorts', level: 'item_type', parent_slug: 'men-lowers-bottoms' },
      { name: 'Cargo Gym Lowers', slug: 'cargo-lowers', level: 'item_type', parent_slug: 'men-lowers-bottoms' }
    ];

    for (const cat of categorySeeds) {
      let parentId = null;
      if (cat.parent_slug) {
        const [parentRows] = await db.query('SELECT id FROM categories WHERE slug = ?', [cat.parent_slug]);
        if (parentRows.length > 0) parentId = parentRows[0].id;
      }
      await db.query(
        `INSERT INTO categories (name, slug, level, parent_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), parent_id=VALUES(parent_id)`,
        [cat.name, cat.slug, cat.level, parentId]
      );
    }
    console.log('✅ Categories verified & synced.');

    // 3. Clear and populate comprehensive products list
    const richProducts = [
      // --- OVERSIZED T-SHIRTS ---
      {
        title: 'Acid Wash Heavyweight Oversized Tee',
        slug: 'acid-wash-heavyweight-oversized-tee',
        sku: 'GDL-OVR-001',
        category_slug: 'oversized',
        category_name: 'Oversized T-Shirts',
        gender_target: 'Men',
        price: 1499,
        original_price: 2299,
        discount_label: '35% Off',
        stock: 150,
        in_stock: 1,
        rating: 4.95,
        reviews_count: 128,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Onyx Black', hex: '#18181b', image: front, gallery: [front, back, side, fabric, oversized, dropcut] },
          { name: 'Vintage Grey', hex: '#52525b', image: side, gallery: [side, front, back, fabric, dropcut] },
          { name: 'Crimson Red', hex: '#dc2626', image: back, gallery: [back, front, side, fabric, oversized] }
        ],
        features: [
          'Pre-shrunk 240 GSM organic French Terry',
          'Drop-shoulder cut to accentuate upper chest & delts',
          'Double-stitched ribbed collar that retains shape',
          'Breathable, moisture-absorbing heavyweight weave',
          'Tagless itch-free neck label'
        ],
        fabric: '240 GSM 100% Combed French Terry Cotton',
        fit: 'Relaxed Drop-Shoulder Oversized Boxy Fit',
        model_stats: "Model is 6'1\" wearing size L",
        description: 'Engineered for dedicated lifters, our Acid Wash Heavyweight Tee combines authentic streetwear aesthetic with unmatched durability. Custom garment-dyed and mineral-washed for a unique vintage patina that gets softer with every gym session.',
        care_instructions: 'Machine wash cold inside out. Do not bleach. Hang dry recommended.'
      },
      {
        title: 'Vintage Distressed Heavyweight Pump Cover',
        slug: 'vintage-distressed-heavyweight-pump-cover',
        sku: 'GDL-OVR-002',
        category_slug: 'oversized',
        category_name: 'Oversized T-Shirts',
        gender_target: 'Men',
        price: 1399,
        original_price: 1999,
        discount_label: '30% Off',
        stock: 90,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 84,
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Charcoal Black', hex: '#27272a', image: oversized, gallery: [oversized, back, front, side, fabric] },
          { name: 'Off White', hex: '#e4e4e7', image: back, gallery: [back, oversized, front, fabric] }
        ],
        features: [
          'Heavy drape vintage distressed wash',
          'Reinforced shoulder tape seams',
          'Thermal regulation cotton weave',
          'Fade-resistant reactive dye process'
        ],
        fabric: '220 GSM Ultra-Soft Cotton Terry',
        fit: 'Loose Gym Silhouette',
        model_stats: "Model is 5'11\" wearing size XL for oversized look",
        description: 'The ultimate warm-up pump cover. Generous chest and sleeve cut designed to fit effortlessly over tanks and stringers during early set progression.',
        care_instructions: 'Machine wash cold. Do not iron on prints.'
      },
      {
        title: 'Minimalist Boxy Fit Drop Shoulder Tee',
        slug: 'minimalist-boxy-fit-drop-shoulder-tee',
        sku: 'GDL-OVR-003',
        category_slug: 'oversized',
        category_name: 'Oversized T-Shirts',
        gender_target: 'Men',
        price: 1299,
        original_price: 1899,
        discount_label: '32% Off',
        stock: 110,
        in_stock: 1,
        rating: 4.85,
        reviews_count: 62,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Carbon Black', hex: '#18181b', image: back, gallery: [back, side, front, fabric, oversized] },
          { name: 'Slate Grey', hex: '#71717a', image: side, gallery: [side, back, front, fabric] },
          { name: 'Military Olive', hex: '#3f4f34', image: front, gallery: [front, side, back, fabric] }
        ],
        features: [
          'Zero shrinkage pre-washed fabric',
          'Straight cut hem with side vents',
          'High-density collar ribbing'
        ],
        fabric: '230 GSM Heavy Single Jersey Cotton',
        fit: 'Clean Boxy Drop Shoulder',
        model_stats: "Model is 6'0\" wearing size L",
        description: 'Clean architectural cut without loud logos. Pure gym-to-street minimalism with premium matte texture.',
        care_instructions: 'Machine wash cold. Hang dry.'
      },

      // --- MUSCLE COMPRESSION ---
      {
        title: 'Pro Muscle-Lock Compression Shirt',
        slug: 'pro-muscle-lock-compression-shirt',
        sku: 'GDL-CMP-001',
        category_slug: 'compression',
        category_name: 'Muscle Compression',
        gender_target: 'Men',
        price: 1299,
        original_price: 1899,
        discount_label: '30% Off',
        stock: 200,
        in_stock: 1,
        rating: 4.95,
        reviews_count: 156,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Stealth Black', hex: '#000000', image: heroComp, gallery: [heroComp, compBack, back, fabric, side, oversized] },
          { name: 'Pure White', hex: '#f4f4f5', image: compBack, gallery: [compBack, heroComp, side, fabric, oversized] },
          { name: 'Blood Red', hex: '#dc2626', image: side, gallery: [side, heroComp, compBack, fabric] }
        ],
        features: [
          'Reinforced Flatlock 4-needle stitching',
          'Targeted lat and pec compression zones',
          'Quick-dry sweat-wicking capillary technology',
          'Anti-microbial and silver-ion odor barrier',
          'UPF 50+ sun protection for outdoor training'
        ],
        fabric: '85% Nylon, 15% Spandex Muscle-Lock Matrix',
        fit: 'Second-Skin Compression Lock',
        model_stats: "Model is 5'11\" (82kg) wearing size M",
        description: 'Engineered for maximum blood flow, vascularity display, and joint warmth. Seamless 4-way stretch holds muscle bellies tight while eliminating chafing during intense lifts.',
        care_instructions: 'Machine wash cold with similar colors. Do not bleach or use fabric softeners. Tumble dry low or hang dry.'
      },
      {
        title: 'Second-Skin Compression Long Sleeve Thermal',
        slug: 'second-skin-compression-long-sleeve-thermal',
        sku: 'GDL-CMP-002',
        category_slug: 'compression',
        category_name: 'Muscle Compression',
        gender_target: 'Men',
        price: 1399,
        original_price: 1999,
        discount_label: '30% Off',
        stock: 85,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 91,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black Panther', hex: '#18181b', image: compBack, gallery: [compBack, heroComp, side, fabric, back] },
          { name: 'Deep Navy', hex: '#1e293b', image: heroComp, gallery: [heroComp, compBack, fabric, side] }
        ],
        features: [
          'Thumbhole cuffs for secure sleeve positioning',
          'Graduated forearm-to-shoulder compression',
          'Thermal micro-fleece internal lining'
        ],
        fabric: '88% Polyamide, 12% Elastane Heat-Lock',
        fit: 'Tight Athletic Compression Fit',
        model_stats: "Model is 6'0\" wearing size L",
        description: 'Full-length arm and forearm compression designed for pump retention, tendon stability, and high performance.',
        care_instructions: 'Machine wash cold. Line dry in shade.'
      },
      {
        title: 'Vascularity Accent Flatlock Compression Tee',
        slug: 'vascularity-accent-flatlock-compression-tee',
        sku: 'GDL-CMP-003',
        category_slug: 'compression',
        category_name: 'Muscle Compression',
        gender_target: 'Men',
        price: 1249,
        original_price: 1799,
        discount_label: '31% Off',
        stock: 95,
        in_stock: 1,
        rating: 4.88,
        reviews_count: 73,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Matte Black', hex: '#27272a', image: heroComp, gallery: [heroComp, back, compBack, side, fabric] },
          { name: 'Gunmetal Grey', hex: '#52525b', image: back, gallery: [back, heroComp, side, fabric] }
        ],
        features: [
          'Ergonomic contour paneling',
          'Zero friction flat seams',
          'Moisture-repelling hydrophobic fibers'
        ],
        fabric: 'High-Density Hydrophobic Lycra',
        fit: 'Contoured Muscle-Fit',
        model_stats: "Model is 5'10\" wearing size M",
        description: 'Sculpted anatomical seamlines map across the clavicle, deltoids, and ribs to highlight athletic muscularity.',
        care_instructions: 'Machine wash cold. Do not tumble dry.'
      },

      // --- 5" TRAINING SHORTS ---
      {
        title: '5" Tactical Inseam Gym Shorts',
        slug: '5-inch-tactical-inseam-gym-shorts',
        sku: 'GDL-SHT-001',
        category_slug: 'shorts',
        category_name: '5" Training Shorts',
        gender_target: 'Men',
        price: 1099,
        original_price: 1599,
        discount_label: '31% Off',
        stock: 180,
        in_stock: 1,
        rating: 4.85,
        reviews_count: 112,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Matte Black', hex: '#18181b', image: shorts, gallery: [shorts, joggers, trackpants, fabric, hoodies, side] },
          { name: 'Army Olive', hex: '#365314', image: joggers, gallery: [joggers, shorts, trackpants, fabric] },
          { name: 'Charcoal Grey', hex: '#3f3f46', image: trackpants, gallery: [trackpants, shorts, joggers, fabric] }
        ],
        features: [
          '5-inch athletic quad cut',
          'Deep dual YKK zippered side pockets',
          'Internal towel / shirt loop on waistband',
          'Split-hem design for maximum squat depth',
          'High-elastic drawcord with metal aglets'
        ],
        fabric: '90% Nylon, 10% Spandex 4-Way Stretch',
        fit: '5-Inch Quad-Accent Inseam',
        model_stats: "Model is 6'0\" wearing size M (32\" waist)",
        description: 'Custom tailored above the quad for unrestricted squats, lunges, and deadlifts. Equipped with waterproof concealed zipper pockets so your phone never drops on the gym floor.',
        care_instructions: 'Machine wash cold. Do not iron zippers.'
      },
      {
        title: '2-in-1 Quad-Flex Compression Liner Shorts',
        slug: '2-in-1-quad-flex-compression-liner-shorts',
        sku: 'GDL-SHT-002',
        category_slug: 'shorts',
        category_name: '5" Training Shorts',
        gender_target: 'Men',
        price: 1399,
        original_price: 1999,
        discount_label: '30% Off',
        stock: 120,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 96,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black/Red Liner', hex: '#000000', image: joggers, gallery: [joggers, shorts, side, fabric, trackpants] },
          { name: 'Grey/Black Liner', hex: '#71717a', image: shorts, gallery: [shorts, joggers, side, fabric] }
        ],
        features: [
          'Integrated phone pocket on compression liner',
          'Sweat-proof back zipper key pocket',
          'Anti-chafing flatlock inner seams'
        ],
        fabric: 'Double Layer: Aero Shell + Compression Inner',
        fit: '5" Outer + 7" Compression Inner',
        model_stats: "Model is 6'1\" wearing size L",
        description: 'Built-in muscle compression liner protects against inner thigh chafing and supports hamstring power.',
        care_instructions: 'Machine wash cold. Do not tumble dry.'
      },

      // --- GYM LOWERS & JOGGERS ---
      {
        title: 'Tapered Heavyweight Cargo Joggers',
        slug: 'tapered-heavyweight-cargo-joggers',
        sku: 'GDL-LOW-001',
        category_slug: 'lowers',
        category_name: 'Gym Lowers & Joggers',
        gender_target: 'Men',
        price: 1699,
        original_price: 2499,
        discount_label: '32% Off',
        stock: 140,
        in_stock: 1,
        rating: 4.88,
        reviews_count: 88,
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Charcoal Grey', hex: '#3f3f46', image: trackpants, gallery: [trackpants, joggers, compBack, shorts, fabric] },
          { name: 'Jet Black', hex: '#18181b', image: joggers, gallery: [joggers, trackpants, compBack, fabric] },
          { name: 'Desert Sand', hex: '#a8a29e', image: compBack, gallery: [compBack, trackpants, joggers, fabric] }
        ],
        features: [
          '6 Multi-functional tactical pockets',
          'Heavyweight 320 GSM fleece interior',
          'Tapered ankle ribbing that hugs sneakers',
          'Thick elastic waistband with chunky drawcord'
        ],
        fabric: '320 GSM Heavyweight Terry Fleece',
        fit: 'Tapered Ankle Rib Fit',
        model_stats: "Model is 6'1\" wearing size L (33\" waist)",
        description: 'Engineered heavy fleece joggers with ergonomic knee darts for true squat mobility without sagging.',
        care_instructions: 'Machine wash cold inside out. Hang dry.'
      },
      {
        title: 'French Terry Relaxed Aesthetic Gym Joggers',
        slug: 'french-terry-relaxed-aesthetic-gym-joggers',
        sku: 'GDL-LOW-002',
        category_slug: 'lowers',
        category_name: 'Gym Lowers & Joggers',
        gender_target: 'Men',
        price: 1599,
        original_price: 2299,
        discount_label: '30% Off',
        stock: 95,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 65,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Onyx Black', hex: '#09090b', image: joggers, gallery: [joggers, trackpants, front, fabric, shorts] },
          { name: 'Light Grey Marl', hex: '#d4d4d8', image: trackpants, gallery: [trackpants, joggers, front, fabric] }
        ],
        features: [
          'Gusseted crotch for full mobility',
          'Deep welt zippered pockets',
          'Custom metal drawcord aglets'
        ],
        fabric: '280 GSM Pure Organic Cotton French Terry',
        fit: 'Streamlined Jogger Fit',
        model_stats: "Model is 5'11\" wearing size M",
        description: 'Plush hand-feel with athletic drape. The perfect blend of rest-day relaxation and intense leg-day readiness.',
        care_instructions: 'Machine wash cold. Hang dry.'
      },

      // --- TANKS & STRINGERS ---
      {
        title: 'Deep Cut Athletic Stringer Tank',
        slug: 'deep-cut-athletic-stringer-tank',
        sku: 'GDL-TNK-001',
        category_slug: 'tanks',
        category_name: 'Tanks & Stringers',
        gender_target: 'Men',
        price: 999,
        original_price: 1499,
        discount_label: '33% Off',
        stock: 160,
        in_stock: 1,
        rating: 4.75,
        reviews_count: 80,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Raw Black', hex: '#18181b', image: stringers, gallery: [stringers, back, front, side, fabric, oversized] },
          { name: 'Crimson Red', hex: '#dc2626', image: back, gallery: [back, stringers, front, side, fabric] },
          { name: 'Pure White', hex: '#ffffff', image: front, gallery: [front, stringers, back, fabric] }
        ],
        features: [
          'Racerback slim shoulder straps',
          'Drop hem for coverage during overhead presses',
          'Anti-roll hemline stitching'
        ],
        fabric: '190 GSM Cotton-Modal Stretch',
        fit: 'Deep Cut Racerback Fit',
        model_stats: "Model is 6'0\" wearing size L",
        description: 'Cut deep at the lats and chest to accentuate back width and upper chest shelf without sliding off shoulders.',
        care_instructions: 'Machine wash warm. Tumble dry normal.'
      },

      // --- DROP CUT T-SHIRTS ---
      {
        title: 'Curved Drop Cut Athletic Performance Tee',
        slug: 'curved-drop-cut-athletic-performance-tee',
        sku: 'GDL-DRP-001',
        category_slug: 'drop-cut',
        category_name: 'Drop Cut T-Shirts',
        gender_target: 'Men',
        price: 1199,
        original_price: 1699,
        discount_label: '29% Off',
        stock: 130,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 104,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Charcoal Black', hex: '#27272a', image: dropcut, gallery: [dropcut, side, back, fabric, front, oversized] },
          { name: 'Mineral Washed', hex: '#52525b', image: side, gallery: [side, dropcut, back, fabric] },
          { name: 'Ruby Red', hex: '#b91c1c', image: back, gallery: [back, dropcut, side, fabric] }
        ],
        features: [
          'Curved scallop drop hem',
          'Fitted bicep sleeves',
          'Breathable performance blend'
        ],
        fabric: '95% Premium Cotton, 5% Elastane',
        fit: 'V-Taper Curved Hem Drop Cut',
        model_stats: "Model is 6'1\" wearing size L",
        description: 'Tailored through the arms and chest with an elongated curved scallop hem that emphasizes the coveted V-taper illusion.',
        care_instructions: 'Machine wash cold. Do not iron directly on graphics.'
      },

      // --- ACID WASH ---
      {
        title: 'Acid Wash Charcoal Drop-Shoulder Tee',
        slug: 'acid-wash-charcoal-drop-shoulder-tee',
        sku: 'GDL-ACD-001',
        category_slug: 'acid-wash',
        category_name: 'Acid Wash Collection',
        gender_target: 'Men',
        price: 1499,
        original_price: 2199,
        discount_label: '31% Off',
        stock: 110,
        in_stock: 1,
        rating: 4.92,
        reviews_count: 57,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Acid Charcoal', hex: '#3f3f46', image: side, gallery: [side, front, back, fabric, oversized, dropcut] },
          { name: 'Acid Black', hex: '#18181b', image: front, gallery: [front, side, back, fabric] },
          { name: 'Acid Red', hex: '#991b1b', image: back, gallery: [back, front, side, fabric] }
        ],
        features: [
          'Unique hand-dyed distressed patterns',
          'Heavy 240 GSM drape',
          'Thick rib crewneck'
        ],
        fabric: '240 GSM Heavy Mineral Dye Terry',
        fit: 'Boxy Heavyweight Drop-Shoulder',
        model_stats: "Model is 6'0\" wearing size XL",
        description: 'Each tee undergoes individual mineral acid-washing, creating unique artisanal patina and authentic vintage textures.',
        care_instructions: 'Machine wash cold separately for first 2 washes. Hang dry.'
      },

      // --- TRACKPANTS ---
      {
        title: 'Athletic Lightweight Trackpants',
        slug: 'athletic-lightweight-trackpants',
        sku: 'GDL-TRK-001',
        category_slug: 'trackpants',
        category_name: 'Athletic Trackpants',
        gender_target: 'Men',
        price: 1599,
        original_price: 2299,
        discount_label: '30% Off',
        stock: 90,
        in_stock: 1,
        rating: 4.82,
        reviews_count: 43,
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Deep Grey', hex: '#3f3f46', image: trackpants, gallery: [trackpants, joggers, shorts, fabric, hoodies, side] },
          { name: 'Solid Black', hex: '#09090b', image: joggers, gallery: [joggers, trackpants, shorts, fabric] }
        ],
        features: [
          'Concealed ankle zippers for easy shoe removal',
          'Quick-dry hydro-repellent surface',
          'Reflective stealth brand accents'
        ],
        fabric: 'Lightweight Weather-Resistant Poly-Span',
        fit: 'Athletic Taper with Ankle Zips',
        model_stats: "Model is 6'1\" wearing size L",
        description: 'Featherlight trackpants built for warmup cardio, track sprints, and lifestyle recovery.',
        care_instructions: 'Machine wash cold. Do not tumble dry.'
      },

      // --- CARGO LOWERS ---
      {
        title: 'Tactical Multi-Pocket Gym Cargo Lowers',
        slug: 'tactical-multi-pocket-gym-cargo-lowers',
        sku: 'GDL-CRG-001',
        category_slug: 'cargo-lowers',
        category_name: 'Cargo Gym Lowers',
        gender_target: 'Men',
        price: 1799,
        original_price: 2599,
        discount_label: '31% Off',
        stock: 80,
        in_stock: 1,
        rating: 4.90,
        reviews_count: 51,
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Combat Black', hex: '#000000', image: trackpants, gallery: [trackpants, joggers, compBack, fabric] },
          { name: 'Military Green', hex: '#3f4f34', image: joggers, gallery: [joggers, trackpants, compBack, fabric] }
        ],
        features: [
          'Heavy-duty tactical cargo side pockets',
          'Reinforced knee articulators for squat depth',
          'Adjustable bungee hem toggles at ankle'
        ],
        fabric: '300 GSM Heavyweight Stretch Twill Fleece',
        fit: 'Relaxed Tapered Tactical Fit',
        model_stats: "Model is 6'2\" wearing size XL",
        description: 'Engineered for functional lifters who need rugged endurance with aesthetic tapered leg profile.',
        care_instructions: 'Machine wash cold. Do not bleach.'
      }
    ];

    for (const p of richProducts) {
      // Find category_id if available
      let categoryId = null;
      const [catRows] = await db.query('SELECT id FROM categories WHERE slug = ?', [p.category_slug]);
      if (catRows.length > 0) {
        categoryId = catRows[0].id;
      }

      await db.query(
        `INSERT INTO products (
          title, slug, sku, category_id, category_slug, category_name, gender_target,
          price, original_price, discount_label, stock, in_stock, rating, reviews_count,
          sizes_json, colors_json, features_json, fabric, fit, model_stats, description, care_instructions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE 
          title=VALUES(title),
          category_id=VALUES(category_id),
          category_slug=VALUES(category_slug),
          category_name=VALUES(category_name),
          gender_target=VALUES(gender_target),
          price=VALUES(price),
          original_price=VALUES(original_price),
          discount_label=VALUES(discount_label),
          stock=VALUES(stock),
          in_stock=VALUES(in_stock),
          rating=VALUES(rating),
          reviews_count=VALUES(reviews_count),
          sizes_json=VALUES(sizes_json),
          colors_json=VALUES(colors_json),
          features_json=VALUES(features_json),
          fabric=VALUES(fabric),
          fit=VALUES(fit),
          model_stats=VALUES(model_stats),
          description=VALUES(description),
          care_instructions=VALUES(care_instructions),
          status='active'`,
        [
          p.title,
          p.slug,
          p.sku,
          categoryId,
          p.category_slug,
          p.category_name,
          p.gender_target,
          p.price,
          p.original_price,
          p.discount_label,
          p.stock,
          p.in_stock,
          p.rating,
          p.reviews_count,
          JSON.stringify(p.sizes),
          JSON.stringify(p.colors),
          JSON.stringify(p.features),
          p.fabric,
          p.fit,
          p.model_stats,
          p.description,
          p.care_instructions
        ]
      );
    }

    const [finalTotal] = await db.query('SELECT COUNT(*) as total FROM products');
    console.log(`🎉 Successfully synced ${finalTotal[0].total} rich activewear products with full Cloudinary galleries into MySQL!`);
  } catch (err) {
    console.error('❌ Error syncing products to MySQL:', err);
  }
}

syncAllProductsAndCategories().then(() => {
  console.log('✅ Sync execution finished.');
  process.exit(0);
});
