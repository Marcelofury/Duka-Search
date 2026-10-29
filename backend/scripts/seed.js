import { db } from '../src/config/firebase.js';
import { typesenseClient, initTypesenseSchema } from '../src/config/typesense.js';

export const SAMPLE_DUKA_ITEMS = [
  {
    id: 'duka_item_001',
    name: 'Fresh Matooke Cluster (Heavy Green Grade)',
    category: 'Fresh Produce',
    vendor_name: 'Mama Nalubega Stalls',
    market_location: 'Nakasero Market',
    price_ugx: 35000,
    in_stock: true,
    location: [0.3136, 32.5786], // Nakasero lat/long
    description: 'Farm-fresh organic Matooke harvested directly from Masaka, prime cooking quality.',
  },
  {
    id: 'duka_item_002',
    name: 'Toyota Corolla Brake Pads (OEM Ceramic)',
    category: 'Auto Parts',
    vendor_name: 'Mugisha Auto Garage',
    market_location: 'Ndeeba Spares Hub',
    price_ugx: 140000,
    in_stock: true,
    location: [0.2917, 32.5592], // Ndeeba lat/long
    description: 'Genuine Toyota Corolla front ceramic brake pads for Fielder, Premio, and Axio.',
  },
  {
    id: 'duka_item_003',
    name: 'Second-Hand Denim Jackets (Grade A Bale)',
    category: 'Second-Hand Apparel',
    vendor_name: 'Owino Vintage Outfits',
    market_location: 'Owino Market (St. Balikuddembe)',
    price_ugx: 28000,
    in_stock: true,
    location: [0.3106, 32.5744], // Owino lat/long
    description: 'Selected heavy denim vintage jackets imported from Europe, spotless condition.',
  },
  {
    id: 'duka_item_004',
    name: 'Kazinga Natural Raw Honey (1L Jar)',
    category: 'Groceries & Wholesale',
    vendor_name: 'Kikuubo Wholesale Center',
    market_location: 'Kikuubo Lane',
    price_ugx: 22000,
    in_stock: true,
    location: [0.3129, 32.5768],
    description: 'Pure unfiltered organic honey from Queen Elizabeth National Park basin.',
  },
  {
    id: 'duka_item_005',
    name: 'Pure Sine Wave Solar Inverter 1.5kVA',
    category: 'Hardware & Solar',
    vendor_name: 'Katwe Engineering Works',
    market_location: 'Katwe Metal Hub',
    price_ugx: 450000,
    in_stock: true,
    location: [0.3012, 32.5732],
    description: 'High-frequency solar inverter with built-in PWM controller, handles lighting and TVs.',
  },
  {
    id: 'duka_item_006',
    name: 'Organic Bogoya Sweet Bananas (Full Bunch)',
    category: 'Fresh Produce',
    vendor_name: 'Hajji Ssemwogerere',
    market_location: 'Nakasero Market',
    price_ugx: 18000,
    in_stock: true,
    location: [0.3136, 32.5786],
    description: 'Naturally ripened sweet bananas, highly rich in potassium and energy.',
  },
  {
    id: 'duka_item_007',
    name: 'Heavy Duty Maintenance-Free Battery 70Ah',
    category: 'Auto Parts',
    vendor_name: 'City Power Auto Hub',
    market_location: 'Ndeeba Spares Hub',
    price_ugx: 280000,
    in_stock: true,
    location: [0.2917, 32.5592],
    description: 'Sealed lead-acid car battery with 18-month warranty, suitable for SUVs and saloons.',
  },
  {
    id: 'duka_item_008',
    name: 'Kitenge Fabric 6-Yard Wax Print (Ankara)',
    category: 'Textiles & Fashion',
    vendor_name: 'Amina Afro Silks',
    market_location: 'Owino Market (St. Balikuddembe)',
    price_ugx: 65000,
    in_stock: true,
    location: [0.3106, 32.5744],
    description: 'Vibrant geometric color fast 100% cotton wax print fabric for traditional wear.',
  },
  {
    id: 'duka_item_009',
    name: 'Fresh Sukuma Wiki & Dodo Crisp Bundle',
    category: 'Fresh Produce',
    vendor_name: 'Mama Sarah Green Basket',
    market_location: 'Nakasero Market',
    price_ugx: 4500,
    in_stock: true,
    location: [0.3136, 32.5786],
    description: 'Crisp green farm-fresh collards picked this morning, zero chemicals.',
  },
  {
    id: 'duka_item_010',
    name: 'Portable IGBT Inverter Arc Welder 250A',
    category: 'Hardware & Solar',
    vendor_name: 'Katwe Fabricators Depot',
    market_location: 'Katwe Metal Hub',
    price_ugx: 320000,
    in_stock: true,
    location: [0.3012, 32.5732],
    description: 'Compact 220V welding plant with cables, mask, and thermal overload protection.',
  },
  {
    id: 'duka_item_011',
    name: 'Super Basmati Long Grain Rice (25kg Sack)',
    category: 'Groceries & Wholesale',
    vendor_name: 'Mukwano Allied Traders',
    market_location: 'Kikuubo Lane',
    price_ugx: 165000,
    in_stock: true,
    location: [0.3129, 32.5768],
    description: 'Aromatic long-grain premium basmati, double polished for pilau and celebrations.',
  },
  {
    id: 'duka_item_012',
    name: 'Treated Pine Construction Purlins 2x3 (10 Pcs)',
    category: 'Building Materials',
    vendor_name: 'Bwaise Timber Yard',
    market_location: 'Bwaise Timber Hub',
    price_ugx: 65000,
    in_stock: true,
    location: [0.3456, 32.5612],
    description: 'Kiln-dried, anti-termite chemical treated pine timber suitable for roof trusses.',
  },
  {
    id: 'duka_item_013',
    name: 'Steel-Toe Leather Safety Work Boots',
    category: 'Second-Hand Apparel',
    vendor_name: 'Dan Workwear Corner',
    market_location: 'Owino Market (St. Balikuddembe)',
    price_ugx: 75000,
    in_stock: true,
    location: [0.3106, 32.5744],
    description: 'Heavy duty impact-proof construction safety boots, oil-resistant grip soles.',
  },
  {
    id: 'duka_item_014',
    name: 'DOT Certified Full Face Boda Helmet',
    category: 'Auto Parts',
    vendor_name: 'Boda Safety Supplies',
    market_location: 'Wandegeya Market',
    price_ugx: 95000,
    in_stock: true,
    location: [0.3341, 32.5694],
    description: 'High impact ABS shell helmet with anti-fog visor and quick release chin buckle.',
  },
  {
    id: 'duka_item_015',
    name: 'Fresh Lake Victoria Tilapia (Jumbo Size, Cleaned)',
    category: 'Fresh Produce',
    vendor_name: 'Ggaba Fisheries Cooperative',
    market_location: 'Ggaba Landing Site Market',
    price_ugx: 25000,
    in_stock: true,
    location: [0.2605, 32.6288],
    description: 'Daily fresh catch, descaled and gutted, sweet wild tilapia ready for deep frying or stew.',
  },
  { id: 'duka_item_016', name: 'Yellow Maize Flour (Posho) 5kg', category: 'Groceries & Wholesale', vendor_name: 'Kikuubo Wholesale Center', market_location: 'Kikuubo Lane', price_ugx: 15000, in_stock: true, location: [0.3129, 32.5768], description: 'Finely milled yellow maize flour for stiff porridge and ugali.' },
  { id: 'duka_item_017', name: 'Red Kidney Beans (Nambale) 5kg', category: 'Groceries & Wholesale', vendor_name: 'Kikuubo Wholesale Center', market_location: 'Kikuubo Lane', price_ugx: 18000, in_stock: true, location: [0.3129, 32.5768], description: 'Clean sorted red kidney beans, high protein and quick cooking.' },
  { id: 'duka_item_018', name: 'Fresh Passion Fruit (1kg Basket)', category: 'Fresh Produce', vendor_name: 'Mama Nalubega Stalls', market_location: 'Nakasero Market', price_ugx: 8000, in_stock: true, location: [0.3136, 32.5786], description: 'Juicy purple passion fruits, tart and aromatic.' },
  { id: 'duka_item_019', name: 'Fresh Avocado (Hass, 4 Pcs)', category: 'Fresh Produce', vendor_name: 'Hajji Ssemwogerere', market_location: 'Nakasero Market', price_ugx: 6000, in_stock: true, location: [0.3136, 32.5786], description: 'Creamy ripe Hass avocados, ready to eat.' },
  { id: 'duka_item_020', name: 'Motorcycle Chain & Sprocket Kit', category: 'Auto Parts', vendor_name: 'Mugisha Auto Garage', market_location: 'Ndeeba Spares Hub', price_ugx: 75000, in_stock: true, location: [0.2917, 32.5592], description: 'Bajaj/Boxer compatible chain and sprocket set, durable.' },
  { id: 'duka_item_021', name: 'Engine Oil 20W-50 (4L)', category: 'Auto Parts', vendor_name: 'City Power Auto Hub', market_location: 'Ndeeba Spares Hub', price_ugx: 45000, in_stock: true, location: [0.2917, 32.5592], description: 'Mineral engine oil for high-mileage vehicles.' },
  { id: 'duka_item_022', name: 'Men\'s Leather Belt (Genuine)', category: 'Textiles & Fashion', vendor_name: 'Owino Vintage Outfits', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 25000, in_stock: true, location: [0.3106, 32.5744], description: 'Genuine leather belt with brass buckle, assorted sizes.' },
  { id: 'duka_item_023', name: 'Ankara Head Wrap (Gele)', category: 'Textiles & Fashion', vendor_name: 'Amina Afro Silks', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 15000, in_stock: true, location: [0.3106, 32.5744], description: 'Pre-stitched gele head wrap in vibrant print.' },
  { id: 'duka_item_024', name: 'Solar Panel 200W Mono', category: 'Hardware & Solar', vendor_name: 'Katwe Engineering Works', market_location: 'Katwe Metal Hub', price_ugx: 380000, in_stock: true, location: [0.3012, 32.5732], description: 'High-efficiency monocrystalline solar panel, 25-year lifespan.' },
  { id: 'duka_item_025', name: 'LED Bulb 12W (Pack of 5)', category: 'Hardware & Solar', vendor_name: 'Katwe Fabricators Depot', market_location: 'Katwe Metal Hub', price_ugx: 20000, in_stock: true, location: [0.3012, 32.5732], description: 'Energy-saving LED bulbs, warm white.' },
  { id: 'duka_item_026', name: 'Cement (Portland) 50kg Bag', category: 'Building Materials', vendor_name: 'Bwaise Timber Yard', market_location: 'Bwaise Timber Hub', price_ugx: 32000, in_stock: true, location: [0.3456, 32.5612], description: 'High-strength Portland cement for construction.' },
  { id: 'duka_item_027', name: 'Iron Sheets (Gauge 30, 3m)', category: 'Building Materials', vendor_name: 'Bwaise Timber Yard', market_location: 'Bwaise Timber Hub', price_ugx: 45000, in_stock: true, location: [0.3456, 32.5612], description: 'Galvanized corrugated iron roofing sheets.' },
  { id: 'duka_item_028', name: 'Safety Helmet (Construction)', category: 'Second-Hand Apparel', vendor_name: 'Dan Workwear Corner', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 30000, in_stock: true, location: [0.3106, 32.5744], description: 'Hard hat with chin strap, ANSI certified.' },
  { id: 'duka_item_029', name: 'Reflective Vest (High-Vis)', category: 'Second-Hand Apparel', vendor_name: 'Dan Workwear Corner', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 12000, in_stock: true, location: [0.3106, 32.5744], description: 'Fluorescent safety vest for road workers.' },
  { id: 'duka_item_030', name: 'Boda Helmet Visor Replacement', category: 'Auto Parts', vendor_name: 'Boda Safety Supplies', market_location: 'Wandegeya Market', price_ugx: 18000, in_stock: true, location: [0.3341, 32.5694], description: 'Clear anti-scratch visor for full-face helmets.' },
  { id: 'duka_item_031', name: 'Dried Silver Fish (Mukene) 1kg', category: 'Groceries & Wholesale', vendor_name: 'Mukwano Allied Traders', market_location: 'Kikuubo Lane', price_ugx: 12000, in_stock: true, location: [0.3129, 32.5768], description: 'Sun-dried silver fish, protein rich.' },
  { id: 'duka_item_032', name: 'Fresh Pineapple (1 Pc)', category: 'Fresh Produce', vendor_name: 'Mama Sarah Green Basket', market_location: 'Nakasero Market', price_ugx: 5000, in_stock: true, location: [0.3136, 32.5786], description: 'Sweet ripe pineapple, freshly harvested.' },
  { id: 'duka_item_033', name: 'Irish Potatoes 10kg', category: 'Fresh Produce', vendor_name: 'Mama Sarah Green Basket', market_location: 'Nakasero Market', price_ugx: 25000, in_stock: true, location: [0.3136, 32.5786], description: 'Fresh Irish potatoes, firm and clean.' },
  { id: 'duka_item_034', name: 'Charcoal Stove (Sigiri) Medium', category: 'Hardware & Solar', vendor_name: 'Katwe Engineering Works', market_location: 'Katwe Metal Hub', price_ugx: 35000, in_stock: true, location: [0.3012, 32.5732], description: 'Efficient clay charcoal stove.' },
  { id: 'duka_item_035', name: 'Plastic Water Jerry Can 20L', category: 'Hardware & Solar', vendor_name: 'Katwe Fabricators Depot', market_location: 'Katwe Metal Hub', price_ugx: 15000, in_stock: true, location: [0.3012, 32.5732], description: 'Durable 20-litre water container.' },
  { id: 'duka_item_036', name: 'Second-Hand Winter Jacket', category: 'Second-Hand Apparel', vendor_name: 'Owino Vintage Outfits', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 40000, in_stock: true, location: [0.3106, 32.5744], description: 'Warm padded winter jacket, grade A.' },
  { id: 'duka_item_037', name: 'Kids School Shoes (Size 32)', category: 'Textiles & Fashion', vendor_name: 'Amina Afro Silks', market_location: 'Owino Market (St. Balikuddembe)', price_ugx: 30000, in_stock: true, location: [0.3106, 32.5744], description: 'Black leather school shoes for children.' },
  { id: 'duka_item_038', name: 'Car Battery Terminals (Pair)', category: 'Auto Parts', vendor_name: 'Mugisha Auto Garage', market_location: 'Ndeeba Spares Hub', price_ugx: 8000, in_stock: true, location: [0.2917, 32.5592], description: 'Lead battery terminals with bolts.' },
  { id: 'duka_item_039', name: 'Windshield Wiper Blades (Pair)', category: 'Auto Parts', vendor_name: 'City Power Auto Hub', market_location: 'Ndeeba Spares Hub', price_ugx: 22000, in_stock: true, location: [0.2917, 32.5592], description: 'Universal wiper blades 14-22 inch.' },
  { id: 'duka_item_040', name: 'Fresh Eggs Tray (30 Pcs)', category: 'Fresh Produce', vendor_name: 'Ggaba Fisheries Cooperative', market_location: 'Ggaba Landing Site Market', price_ugx: 12000, in_stock: true, location: [0.2605, 32.6288], description: 'Farm fresh eggs, large size.' },
  { id: 'duka_item_041', name: 'Fresh Milk 1L (Pasteurized)', category: 'Groceries & Wholesale', vendor_name: 'Mukwano Allied Traders', market_location: 'Kikuubo Lane', price_ugx: 3500, in_stock: true, location: [0.3129, 32.5768], description: 'Fresh pasteurized whole milk.' },
  { id: 'duka_item_042', name: 'Cooking Oil 5L (Sunflower)', category: 'Groceries & Wholesale', vendor_name: 'Kikuubo Wholesale Center', market_location: 'Kikuubo Lane', price_ugx: 42000, in_stock: true, location: [0.3129, 32.5768], description: 'Refined sunflower cooking oil.' },
  { id: 'duka_item_043', name: 'Sugar 2kg (White)', category: 'Groceries & Wholesale', vendor_name: 'Kikuubo Wholesale Center', market_location: 'Kikuubo Lane', price_ugx: 9000, in_stock: true, location: [0.3129, 32.5768], description: 'White granulated sugar.' },
  { id: 'duka_item_044', name: 'Tomato Paste Sachet (70g)', category: 'Groceries & Wholesale', vendor_name: 'Mukwano Allied Traders', market_location: 'Kikuubo Lane', price_ugx: 1500, in_stock: true, location: [0.3129, 32.5768], description: 'Concentrated tomato paste.' },
  { id: 'duka_item_045', name: 'Fresh Tomatoes 2kg', category: 'Fresh Produce', vendor_name: 'Mama Nalubega Stalls', market_location: 'Nakasero Market', price_ugx: 6000, in_stock: true, location: [0.3136, 32.5786], description: 'Ripe red tomatoes.' },
  { id: 'duka_item_046', name: 'Onions 3kg (Red)', category: 'Fresh Produce', vendor_name: 'Hajji Ssemwogerere', market_location: 'Nakasero Market', price_ugx: 9000, in_stock: true, location: [0.3136, 32.5786], description: 'Red onions, strong flavor.' },
  { id: 'duka_item_047', name: 'Charcoal (1 Sack)', category: 'Hardware & Solar', vendor_name: 'Katwe Engineering Works', market_location: 'Katwe Metal Hub', price_ugx: 40000, in_stock: true, location: [0.3012, 32.5732], description: 'Hardwood charcoal sack.' },
  { id: 'duka_item_048', name: 'Nails 2 inch (1kg)', category: 'Building Materials', vendor_name: 'Bwaise Timber Yard', market_location: 'Bwaise Timber Hub', price_ugx: 7000, in_stock: true, location: [0.3456, 32.5612], description: 'Common wire nails.' },
  { id: 'duka_item_049', name: 'Paint 4L (White Emulsion)', category: 'Building Materials', vendor_name: 'Bwaise Timber Yard', market_location: 'Bwaise Timber Hub', price_ugx: 55000, in_stock: true, location: [0.3456, 32.5612], description: 'Interior/exterior emulsion paint.' },
  { id: 'duka_item_050', name: 'Boda Boda Spare Tyre (Rear)', category: 'Auto Parts', vendor_name: 'Boda Safety Supplies', market_location: 'Wandegeya Market', price_ugx: 55000, in_stock: true, location: [0.3341, 32.5694], description: 'Rear tyre for Bajaj Boxer.' },
];

async function seed() {
  console.log('🌱 Starting DukaSearch Seeder for Kampala Markets...');

  try {
    await initTypesenseSchema();
  } catch (err) {
    console.log('Typesense init schema warning:', err.message);
  }

  let firestoreSuccess = 0;
  let typesenseSuccess = 0;

  for (const item of SAMPLE_DUKA_ITEMS) {
    try {
      // 1. Write to Firestore
      const itemRef = db.collection('duka_items').doc(item.id);
      await itemRef.set({
        ...item,
        created_at: Date.now(),
      });
      firestoreSuccess++;
    } catch (fsErr) {
      console.warn(`Firestore seed warning for ${item.id}:`, fsErr.message);
    }

    try {
      // 2. Index in Typesense
      await typesenseClient.collections('duka_items').documents().upsert({
        ...item,
        created_at: Date.now(),
      });
      typesenseSuccess++;
    } catch (tsErr) {
      console.warn(`Typesense seed warning for ${item.id}:`, tsErr.message);
    }
  }

  console.log(`\n🎉 Seed Completed:`);
  console.log(`- Firestore items seeded: ${firestoreSuccess}/${SAMPLE_DUKA_ITEMS.length}`);
  console.log(`- Typesense documents indexed: ${typesenseSuccess}/${SAMPLE_DUKA_ITEMS.length}`);
}

if (process.argv[1].endsWith('seed.js')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
