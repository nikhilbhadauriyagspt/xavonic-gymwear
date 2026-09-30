const db = require('../config/db');

async function seedWomen() {
  try {
    const womenSub = [
      { 
        name: 'Activewear Tops', 
        slug: 'women-tops', 
        parent_id: 2, 
        level: 'sub', 
        gender_target: 'Women', 
        image_url: 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805017/guidelya/products/jar1kslgtpww9gjudcro.jpg' 
      },
      { 
        name: 'Bottoms & Leggings', 
        slug: 'women-bottoms', 
        parent_id: 2, 
        level: 'sub', 
        gender_target: 'Women', 
        image_url: 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805021/guidelya/products/xcrkibtuhgweokp0tkot.jpg' 
      },
      { 
        name: 'Co-ords & Outerwear', 
        slug: 'women-outerwear', 
        parent_id: 2, 
        level: 'sub', 
        gender_target: 'Women', 
        image_url: 'https://res.cloudinary.com/fwlidd7t/image/upload/v1790805028/guidelya/products/fytbuv7tb2t6q5lkfukh.jpg' 
      }
    ];

    for (const s of womenSub) {
      const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [s.slug]);
      let subId;
      if (existing.length === 0) {
        const [res] = await db.query(
          'INSERT INTO categories (name, slug, parent_id, level, gender_target, image_url, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)', 
          [s.name, s.slug, s.parent_id, s.level, s.gender_target, s.image_url, 'active']
        );
        subId = res.insertId;
        console.log('Created subcategory:', s.name, subId);
      } else {
        subId = existing[0].id;
      }

      let items = [];
      if (s.slug === 'women-tops') {
        items = [
          { name: 'High Impact Sports Bras', slug: 'sports-bras' },
          { name: 'Seamless Ribbed Tanks', slug: 'ribbed-tanks' },
          { name: 'Oversized Pump Covers', slug: 'women-oversized' }
        ];
      } else if (s.slug === 'women-bottoms') {
        items = [
          { name: 'Seamless Squat Leggings', slug: 'squat-leggings' },
          { name: 'Contour Sculpt Shorts', slug: 'contour-shorts' },
          { name: 'Aesthetic Flared Pants', slug: 'flared-pants' }
        ];
      } else {
        items = [
          { name: 'Matching Gym Co-ord Sets', slug: 'coord-sets' },
          { name: 'Zip-up Gym Jackets', slug: 'gym-jackets' },
          { name: 'Cropped Fleece Hoodies', slug: 'cropped-hoodies' }
        ];
      }

      for (const item of items) {
        const [exItem] = await db.query('SELECT id FROM categories WHERE slug = ?', [item.slug]);
        if (exItem.length === 0) {
          await db.query(
            'INSERT INTO categories (name, slug, parent_id, level, gender_target, image_url, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)', 
            [item.name, item.slug, subId, 'item_type', 'Women', s.image_url, 'active']
          );
          console.log('Created item type:', item.name);
        }
      }
    }

    console.log('✅ Women categories seeded successfully!');
  } catch (err) {
    console.error('Error seeding women categories:', err);
  } finally {
    process.exit(0);
  }
}

seedWomen();
