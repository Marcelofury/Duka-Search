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
