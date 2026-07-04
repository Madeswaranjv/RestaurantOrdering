import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Category from './models/Category.js';
import Menu from './models/Menu.js';
import Review from './models/Review.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Notification from './models/Notification.js';
import MealPlan from './models/MealPlan.js';
import DriverProfile from './models/DriverProfile.js';
import Contact from './models/Contact.js';

dotenv.config();

// ─── Helper: random element from array ────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// ─── Helper: past date within the last N days ────────────────────────
const daysAgo = (d) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
  return date;
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('\n══════════════════════════════════════════════');
    console.log('  FlavorDash Database Seeder');
    console.log('══════════════════════════════════════════════\n');

    // ─── 1. Wipe all collections ──────────────────────────────────────
    console.log('🗑  Wiping all collections...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Category.deleteMany({});
    await Menu.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});
    await MealPlan.deleteMany({});
    await DriverProfile.deleteMany({});
    await Contact.deleteMany({});
    console.log('   ✓ All collections cleared\n');

    // ─── 2. Seed Admin ────────────────────────────────────────────────
    console.log('👑 Seeding Admin user...');
    const admin = await User.create({
      name: 'Genevieve Sterling',
      email: 'admin@flavordash.com',
      password: 'password123',
      role: 'admin',
      phone: '+44 20 7946 0900',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      addresses: [
        { label: 'Townhouse', address: '42 Sterling Sq, Chelsea, London SW3 2HJ', isDefault: true }
      ]
    });
    console.log(`   ✓ Admin: ${admin.email}\n`);

    // ─── 3. Seed Customers ────────────────────────────────────────────
    console.log('👥 Seeding 8 Customer users...');
    const customerData = [
      {
        name: 'Alexander Vanderbilt',
        email: 'alexander@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+44 20 7946 1001',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Home', address: '15 Kensington Palace Gardens, London W8 4QN', isDefault: true },
          { label: 'Office', address: '1 Canada Square, Canary Wharf, London E14 5AB', isDefault: false }
        ]
      },
      {
        name: 'Isabelle Montague',
        email: 'isabelle@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+44 20 7946 1002',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Flat', address: '88 Sloane Avenue, London SW3 3DZ', isDefault: true }
        ]
      },
      {
        name: 'Maximilian Sterling',
        email: 'maximilian@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+44 20 7946 1003',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Penthouse', address: '22 Park Lane, Mayfair, London W1K 1BE', isDefault: true }
        ]
      },
      {
        name: 'Sofia Rosetti',
        email: 'sofia@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+44 20 7946 1004',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Home', address: '7 Eaton Square, Belgravia, London SW1W 9DD', isDefault: true }
        ]
      },
      {
        name: 'Yuki Tanaka',
        email: 'yuki@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+81 3 5210 1005',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Studio', address: '45 Marylebone High Street, London W1U 5HG', isDefault: true }
        ]
      },
      {
        name: 'Priya Kapoor',
        email: 'priya@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Residence', address: '31 Notting Hill Gate, London W11 3JQ', isDefault: true }
        ]
      },
      {
        name: 'Robert Kensington',
        email: 'robert@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+44 20 7946 1007',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Mansion', address: '5 The Boltons, South Kensington, London SW10 9TB', isDefault: true }
        ]
      },
      {
        name: 'Helene Beaumont',
        email: 'helene@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+33 1 42 96 1008',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150',
        addresses: [
          { label: 'Pied-à-terre', address: '12 Cadogan Place, London SW1X 9PU', isDefault: true }
        ]
      }
    ];
    const customers = await User.create(customerData);
    console.log(`   ✓ ${customers.length} customers created\n`);

    // ─── 4. Seed Delivery Partners ────────────────────────────────────
    console.log('🛵 Seeding 5 Delivery Partners...');
    const deliveryPartners = await User.create([
      {
        name: 'Dimitri Vance',
        email: 'dimitri@flavordash.com',
        password: 'password123',
        role: 'deliveryPartner',
        phone: '+44 20 7946 0951',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Marcus Reed',
        email: 'marcus@flavordash.com',
        password: 'password123',
        role: 'deliveryPartner',
        phone: '+44 20 7946 0952',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@flavordash.com',
        password: 'password123',
        role: 'deliveryPartner',
        phone: '+44 20 7946 0953',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Alex Mercer',
        email: 'alex@flavordash.com',
        password: 'password123',
        role: 'deliveryPartner',
        phone: '+44 20 7946 0954',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      },
      {
        name: 'Elena Fisher',
        email: 'elena@flavordash.com',
        password: 'password123',
        role: 'deliveryPartner',
        phone: '+44 20 7946 0955',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
      }
    ]);
    console.log(`   ✓ ${deliveryPartners.length} delivery partners created\n`);

    // ─── 5. Seed Driver Profiles ──────────────────────────────────────
    console.log('🪪 Seeding Driver Profiles...');
    const vehicleTypes = ['Motorcycle', 'Electric Scooter', 'Bicycle', 'Car', 'E-Bike'];
    const driverProfiles = [];
    for (let i = 0; i < deliveryPartners.length; i++) {
      const dp = deliveryPartners[i];
      const completedCount = Math.floor(Math.random() * 120) + 30;
      const profile = await DriverProfile.create({
        user: dp._id,
        vehicleType: vehicleTypes[i],
        vehicleNumber: `FD-${String(i + 1).padStart(3, '0')}-LDN`,
        licenseNumber: `DL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        isOnline: i < 3, // first 3 drivers are online
        averageRating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
        completedDeliveries: completedCount,
        totalEarnings: Number((completedCount * 8.50 + Math.random() * 200).toFixed(2))
      });
      driverProfiles.push(profile);
    }
    console.log(`   ✓ ${driverProfiles.length} driver profiles created\n`);

    // ─── 6. Seed Restaurant ───────────────────────────────────────────
    console.log('🏛  Seeding Luxury Restaurant...');
    const restaurant = await Restaurant.create({
      name: "L'Ambroisie",
      description: "Three-Michelin-starred classical French culinary art in an elegant setting, offering the finest gourmet plates crafted by master chefs. Every dish is a symphony of flavour, texture, and presentation.",
      cuisines: ["French", "Fine Dining", "Gastronomy", "Seafood", "Steakhouse", "Japanese Fusion", "Indian Royal"],
      gallery: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=600"
      ],
      coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
      address: "Place des Vosges, Paris / Chelsea, London",
      openingHours: "12:00 PM - 11:00 PM",
      contactInfo: {
        email: "reservations@lambroisie.com",
        phone: "+44 20 7946 0958"
      },
      rating: 4.9
    });
    console.log(`   ✓ Restaurant: ${restaurant.name}\n`);

    // ─── 7. Seed Categories ───────────────────────────────────────────
    console.log('📁 Seeding 8 Categories...');
    const categories = await Category.create([
      { name: 'Starters', description: 'Fine appetizers to stimulate the senses', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300' },
      { name: 'Mains', description: 'Signature Michelin plates', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300' },
      { name: 'Desserts', description: 'Masterfully crafted pastries and sweet delights', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=300' },
      { name: 'Beverages', description: 'Fine wines, teas, and mocktails', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300' },
      { name: 'Caviar', description: 'Premium imported sturgeon roe', image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=300' },
      { name: 'Sushi Selection', description: 'Edo-style nigiri cuts', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300' },
      { name: 'Charcoal Steaks', description: 'Dry-aged heritage beef cuts', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300' },
      { name: 'Royal Indian', description: 'Elevated traditional tandoori dishes', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300' }
    ]);

    const catMap = {};
    categories.forEach(cat => { catMap[cat.name] = cat._id; });
    console.log(`   ✓ ${categories.length} categories created\n`);

    // ─── 8. Seed Menu Items (50) ──────────────────────────────────────
    console.log('🍽  Seeding 50 Menu Items...');
    const rawItems = [
      // ── Starters (6) ──
      { name: 'Ravioli Stuffed with Pesto Sauce', price: 35.00, cat: 'Starters', desc: 'Fusion gyoza-ravioli stuffed with rich basil pesto, edamame, and ricotta, served in a light miso-butter broth.', ing: ['Wonton Wrapper', 'Sweet Basil Pesto', 'Edamame Paste', 'Miso Paste', 'Unsalted Butter'], nut: { calories: 410, protein: 12, carbs: 42, fats: 22 }, img: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&q=80&w=800' },
      { name: 'Truffle Burrata & Heirloom Tomatoes', price: 28.00, cat: 'Starters', desc: 'Creamy burrata pugliese, organic heirloom tomatoes, wild rocket, aged modena balsamic glaze, and shaved summer truffles.', ing: ['Burrata', 'Heirloom Tomatoes', 'Rocket', 'Balsamic Glaze', 'Summer Truffle'], nut: { calories: 380, protein: 15, carbs: 10, fats: 32 }, img: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800' },
      { name: 'Seared Foie Gras', price: 48.00, cat: 'Starters', desc: 'Hudson Valley foie gras, spiced brioche, caramelized mission figs, and vintage port reduction.', ing: ['Foie Gras', 'Brioche', 'Figs', 'Port Wine', 'Allspice'], nut: { calories: 520, protein: 10, carbs: 24, fats: 48 }, img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800' },
      { name: 'Lobster Bisque Royale', price: 38.00, cat: 'Starters', desc: 'Velvety Maine lobster broth, cognac cream, tarragon, poached lobster knuckle chunk.', ing: ['Maine Lobster', 'Cognac', 'Heavy Cream', 'Tarragon', 'Shallots'], nut: { calories: 290, protein: 18, carbs: 8, fats: 20 }, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800' },
      { name: 'Escargots en Croûte', price: 32.00, cat: 'Starters', desc: 'Burgundy helix snails in garlic, parsley, and French butter, baked in flaky puff pastry dome.', ing: ['Snails', 'Normandy Butter', 'Garlic', 'Parsley', 'Puff Pastry'], nut: { calories: 340, protein: 14, carbs: 12, fats: 28 }, img: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&q=80&w=800' },
      { name: 'Premium Oysters Mignonette', price: 42.00, cat: 'Starters', desc: 'Half-dozen freshly shucked Belon oysters, classic red wine shallot mignonette, and fresh lemon wedges.', ing: ['Belon Oysters', 'Red Wine Vinegar', 'Shallots', 'Lemon', 'Ice'], nut: { calories: 120, protein: 12, carbs: 6, fats: 4 }, img: 'https://images.unsplash.com/photo-1606859191214-25db977e7be0?auto=format&fit=crop&q=80&w=800' },

      // ── Mains (7) ──
      { name: 'Pappardelle with Black Truffle', price: 35.00, cat: 'Mains', desc: 'Silky hand-cut pasta tossed in aged Parmigiano-Reggiano emulsion, topped generously with shaved black winter truffles.', ing: ['Fresh Pappardelle', 'Black Winter Truffle', 'Parmigiano-Reggiano', 'Normandy Butter', 'Fleur de Sel'], nut: { calories: 650, protein: 18, carbs: 75, fats: 28 }, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800' },
      { name: 'Slow-Cooked Wild Boar Ragu', price: 32.00, cat: 'Mains', desc: 'Ribbons of fresh tagliatelle tossed in a rich 12-hour braised wild boar ragu, red wine reduction, and pecorino romano.', ing: ['Wild Boar', 'Chianti Red Wine', 'San Marzano Tomatoes', 'Fresh Tagliatelle', 'Pecorino Romano'], nut: { calories: 720, protein: 38, carbs: 68, fats: 30 }, img: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800' },
      { name: 'Chilean Sea Bass Glacier', price: 58.00, cat: 'Mains', desc: 'Pan-roasted Patagonian toothfish, wilted baby spinach, saffron-champagne reduction, and fresh chervil.', ing: ['Sea Bass', 'Spinach', 'Champagne', 'Saffron', 'Butter'], nut: { calories: 480, protein: 40, carbs: 5, fats: 34 }, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800' },
      { name: 'Pan-Seared Duck Breast', price: 46.00, cat: 'Mains', desc: 'Crispy-skinned Moulard duck breast, honey-lavender glaze, roasted sweet potato mash, and orange-cassis jus.', ing: ['Duck Breast', 'Lavender', 'Honey', 'Sweet Potato', 'Cassis'], nut: { calories: 610, protein: 35, carbs: 28, fats: 40 }, img: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800' },
      { name: 'Truffle Wild Mushroom Risotto', price: 36.00, cat: 'Mains', desc: 'Acquerello arborio rice, wild porcini and chanterelle mushrooms, white truffle oil, and 24-month Parmigiano.', ing: ['Arborio Rice', 'Porcini', 'Chanterelles', 'White Truffle Oil', 'Parmigiano'], nut: { calories: 510, protein: 11, carbs: 64, fats: 22 }, img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800' },
      { name: 'Herb-Crusted Rack of Lamb', price: 54.00, cat: 'Mains', desc: 'New Zealand lamb rack, dijon-herb crust, rosemary reduction, and roasted fingerling potatoes.', ing: ['Rack of Lamb', 'Rosemary', 'Dijon Mustard', 'Fingerling Potatoes', 'Breadcrumbs'], nut: { calories: 780, protein: 52, carbs: 14, fats: 58 }, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
      { name: 'Grand Lobster Thermidor', price: 75.00, cat: 'Mains', desc: 'Whole lobster stuffed with crab meat, mushrooms, and rich gruyere cognac cream sauce, glazed under broiler.', ing: ['Lobster', 'Blue Crab', 'Gruyere', 'Cognac', 'Mushrooms'], nut: { calories: 840, protein: 60, carbs: 12, fats: 62 }, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800' },

      // ── Desserts (6) ──
      { name: 'Grand Chocolate Soufflé', price: 24.00, cat: 'Desserts', desc: 'Warm, rising dark chocolate soufflé made with 72% Valrhona chocolate, paired with Madagascan vanilla bean gelato.', ing: ['Valrhona Dark Chocolate', 'Egg Whites', 'Sugar', 'Madagascar Vanilla Bean', 'Fresh Cream'], nut: { calories: 480, protein: 8, carbs: 54, fats: 24 }, img: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&q=80&w=800' },
      { name: 'Assorted Macaron Prestige Box', price: 18.00, cat: 'Desserts', desc: 'A luxury box of 6 handcrafted macarons: Pistachio, Salted Caramel, Dark Chocolate, Rose Petal, Lemon, and Passionfruit.', ing: ['Almond Flour', 'Egg Whites', 'Pistachio Ganache', 'Salted Butter Caramel', 'Dark Chocolate'], nut: { calories: 420, protein: 8, carbs: 58, fats: 18 }, img: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=800' },
      { name: 'Tahitian Vanilla Crème Brûlée', price: 16.00, cat: 'Desserts', desc: 'Silky custard infused with Tahitian vanilla bean, finished with a glass-like caramelized sugar crust and organic berries.', ing: ['Egg Yolks', 'Tahitian Vanilla', 'Heavy Cream', 'Sugar', 'Raspberries'], nut: { calories: 390, protein: 5, carbs: 32, fats: 27 }, img: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&q=80&w=800' },
      { name: 'Golden Hazelnut Mille-Feuille', price: 22.00, cat: 'Desserts', desc: 'Layers of caramelized puff pastry, Piedmont hazelnut praline, and gold-leaf vanilla pastry cream.', ing: ['Puff Pastry', 'Piedmont Hazelnut', 'Vanilla Pastry Cream', '24k Gold Leaf'], nut: { calories: 440, protein: 6, carbs: 48, fats: 26 }, img: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&q=80&w=800' },
      { name: 'Yuzu Raspberry Entremet', price: 19.00, cat: 'Desserts', desc: 'Light yuzu mousse, raspberry gelee center, almond sponge base, and crimson mirror glaze.', ing: ['Yuzu Juice', 'Raspberry Gelee', 'Almond Sponge', 'Gelatin', 'Sugar'], nut: { calories: 310, protein: 4, carbs: 42, fats: 14 }, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800' },
      { name: 'Artisanal Cheese Board Selection', price: 28.00, cat: 'Desserts', desc: 'A curated board of 3 cheeses: Roquefort, Comte 24-month, and Brillat-Savarin, served with honeycomb and walnuts.', ing: ['Roquefort', 'Comte', 'Brillat-Savarin', 'Honeycomb', 'English Walnuts'], nut: { calories: 490, protein: 24, carbs: 12, fats: 40 }, img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800' },

      // ── Beverages (6) ──
      { name: 'Veuve Clicquot Brut Champagne', price: 120.00, cat: 'Beverages', desc: 'Crisp, premium Yellow Label Veuve Clicquot champagne, serving notes of white fruits, raisins, and vanilla.', ing: ['Grapes', 'Sulphites'], nut: { calories: 150, protein: 0, carbs: 4, fats: 0 }, img: 'https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?auto=format&fit=crop&q=80&w=800' },
      { name: 'Chateau Margaux 2015 (Glass)', price: 95.00, cat: 'Beverages', desc: 'Exceptional Bordeaux red wine with elegant floral and dark fruit aromas, finished with refined oak notes.', ing: ['Bordeaux Grapes', 'Sulphites'], nut: { calories: 160, protein: 0, carbs: 5, fats: 0 }, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800' },
      { name: 'Imperial Gold Leaf Matcha', price: 16.00, cat: 'Beverages', desc: 'Ceremonial grade Uji Matcha whisked with hot water, decorated with gold leaf flakes.', ing: ['Uji Matcha', '24k Gold Flakes', 'Hot Water'], nut: { calories: 5, protein: 1, carbs: 0, fats: 0 }, img: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=800' },
      { name: 'White Peach Jasmine Iced Tea', price: 12.00, cat: 'Beverages', desc: 'Cold brewed silver needle jasmine tea infused with fresh white peach pulp and wild honey.', ing: ['Silver Needle Jasmine Tea', 'White Peach Pulp', 'Wild Honey'], nut: { calories: 80, protein: 0, carbs: 20, fats: 0 }, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800' },
      { name: 'Smoked Rosemary Old Fashioned Mocktail', price: 14.00, cat: 'Beverages', desc: 'Non-alcoholic spirit blend, smoked rosemary tincture, orange peel, and maple syrup.', ing: ['Non-alcoholic Spirits', 'Smoked Rosemary', 'Orange Peel', 'Maple Syrup'], nut: { calories: 60, protein: 0, carbs: 15, fats: 0 }, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800' },
      { name: 'Sparkling Acqua Panna (750ml)', price: 9.00, cat: 'Beverages', desc: 'Imported Tuscan still mineral water, naturally filtered and bottled at source.', ing: ['Natural Mineral Water'], nut: { calories: 0, protein: 0, carbs: 0, fats: 0 }, img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800' },

      // ── Caviar (6) ──
      { name: "Caviar Oscietre D'Or", price: 95.00, cat: 'Caviar', desc: 'Premium Golden Oscietra caviar served on dry ice, accompanied by warm buckwheat blinis and creme fraiche.', ing: ['Golden Oscietra Caviar', 'Buckwheat Blinis', 'Creme Fraiche', 'Chives', 'Chopped Egg Whites'], nut: { calories: 320, protein: 22, carbs: 12, fats: 20 }, img: 'https://images.unsplash.com/photo-1606851094291-6efae152bb87?auto=format&fit=crop&q=80&w=800' },
      { name: 'Beluga Imperial Caviar (50g)', price: 290.00, cat: 'Caviar', desc: 'Huso huso sturgeon roe, large glossy slate-grey beads, buttery taste, served with mother of pearl spoon.', ing: ['Beluga Caviar', 'Buckwheat Blinis', 'Creme Fraiche'], nut: { calories: 380, protein: 28, carbs: 10, fats: 26 }, img: 'https://images.unsplash.com/photo-1590564117379-bcce04e72391?auto=format&fit=crop&q=80&w=800' },
      { name: 'Siberian Sturgeon Caviar (30g)', price: 75.00, cat: 'Caviar', desc: 'Acipenser baerii caviar, dark pearls, clean, walnut flavor finish, served with traditional garnishes.', ing: ['Siberian Caviar', 'Blinis', 'Egg whites', 'Capers'], nut: { calories: 280, protein: 18, carbs: 14, fats: 18 }, img: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&q=80&w=800' },
      { name: 'Caviar Topped Scallop Carpaccio', price: 48.00, cat: 'Caviar', desc: 'Thinly sliced Hokkaido sea scallops topped with imperial sevruga caviar and lime zest oil.', ing: ['Hokkaido Scallops', 'Sevruga Caviar', 'Lime Oil', 'Sea Salt'], nut: { calories: 210, protein: 16, carbs: 4, fats: 14 }, img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800' },
      { name: 'Gold-leaf Caviar Deviled Eggs', price: 34.00, cat: 'Caviar', desc: 'Free-range organic eggs stuffed with black truffle mousse and crowned with black oscietra caviar and gold leaf.', ing: ['Eggs', 'Truffle Mousse', 'Oscietra Caviar', 'Gold Leaf'], nut: { calories: 340, protein: 16, carbs: 2, fats: 30 }, img: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800' },
      { name: 'Lobster & Caviar Benedict', price: 65.00, cat: 'Caviar', desc: 'Poached organic egg on toasted English muffin, Maine lobster claw, saffron hollandaise, and Siberian caviar top.', ing: ['English Muffin', 'Poached Egg', 'Maine Lobster', 'Hollandaise', 'Siberian Caviar'], nut: { calories: 540, protein: 32, carbs: 24, fats: 36 }, img: 'https://images.unsplash.com/photo-1608039829572-8e24b1d11822?auto=format&fit=crop&q=80&w=800' },

      // ── Sushi Selection (6) ──
      { name: 'Signature Omakase Selection', price: 85.00, cat: 'Sushi Selection', desc: "Chef's selection of 8 seasonal nigiri sushi and 1 handroll, featuring Otoro, Uni, Botan Ebi, and Wagyu Beef.", ing: ['Bluefin Tuna Belly (Otoro)', 'Sea Urchin (Uni)', 'Sweet Shrimp', 'A5 Wagyu', 'Aged Sushi Rice', 'Real Wasabi'], nut: { calories: 520, protein: 34, carbs: 62, fats: 14 }, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800' },
      { name: 'Aburi Wagyu Nigiri', price: 45.00, cat: 'Sushi Selection', desc: 'Torched A5 Miyazaki wagyu beef over seasoned sushi rice, finished with garlic chips and sweet soy glaze.', ing: ['A5 Miyazaki Beef', 'Sushi Rice', 'Garlic Chips', 'Sweet Soy', 'Wasabi'], nut: { calories: 430, protein: 20, carbs: 32, fats: 25 }, img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&q=80&w=800' },
      { name: 'Royal Dragon Tempura Roll', price: 32.00, cat: 'Sushi Selection', desc: 'King prawn tempura, cucumber, wrapped with fresh avocado slices and grilled freshwater eel, unagi sauce.', ing: ['King Prawn', 'Avocado', 'Freshwater Eel', 'Cucumber', 'Rice', 'Nori'], nut: { calories: 580, protein: 18, carbs: 68, fats: 26 }, img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800' },
      { name: 'Hokkaido Uni Gunkan', price: 54.00, cat: 'Sushi Selection', desc: 'Fresh sea urchin from Hokkaido wrapped in crisp nori, served with pickled ginger and aged soy.', ing: ['Hokkaido Sea Urchin', 'Sushi Rice', 'Nori seaweed', 'Pickled Ginger'], nut: { calories: 190, protein: 12, carbs: 24, fats: 5 }, img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&q=80&w=800' },
      { name: 'Crispy Rice with Spicy Otoro', price: 29.00, cat: 'Sushi Selection', desc: 'Pan-fried squares of seasoned rice, topped with spicy chopped bluefin tuna belly, jalapeno, and sriracha aioli.', ing: ['Otoro Tuna', 'Sushi Rice', 'Jalapeno', 'Spicy Aioli', 'Chives'], nut: { calories: 360, protein: 14, carbs: 36, fats: 18 }, img: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800' },
      { name: 'Bluefin Sashimi Platter Trio', price: 68.00, cat: 'Sushi Selection', desc: 'Nine-piece premium sashimi selection: 3 Otoro (Fatty), 3 Chutoro (Medium Fatty), and 3 Akami (Lean) cuts.', ing: ['Bluefin Tuna Belly', 'Pickled Ginger', 'Shiso Leaves', 'Wasabi'], nut: { calories: 310, protein: 38, carbs: 2, fats: 17 }, img: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&q=80&w=800' },

      // ── Charcoal Steaks (7) ──
      { name: 'Dry-Aged Tomahawk Steak', price: 110.00, cat: 'Charcoal Steaks', desc: '32-ounce prime bone-in ribeye, dry-aged for 45 days, char-grilled over white oak, finished with smoked sea salt.', ing: ['USDA Prime Tomahawk', 'White Oak Smoke', 'Garlic Butter', 'Rosemary', 'Maldon Sea Salt'], nut: { calories: 1250, protein: 98, carbs: 2, fats: 92 }, img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800' },
      { name: 'A5 Miyazaki Wagyu Ribeye (150g)', price: 160.00, cat: 'Charcoal Steaks', desc: 'Imported Japanese wagyu ribeye, BMS 12 marbling, seared on volcanic hot stone, served with ponzu and salt.', ing: ['A5 Miyazaki Ribeye', 'Volcanic Stone Sear', 'Ponzu Sauce', 'Maldon Salt'], nut: { calories: 580, protein: 32, carbs: 0, fats: 52 }, img: 'https://images.unsplash.com/photo-1504973960431-1c1c6b4a7e8d?auto=format&fit=crop&q=80&w=800' },
      { name: 'Filet Mignon Center Cut', price: 56.00, cat: 'Charcoal Steaks', desc: '9-ounce USDA Prime barrel-cut tenderloin steak, cooked to order, accompanied by black truffle butter.', ing: ['USDA Prime Tenderloin', 'Truffle Butter', 'Asparagus', 'Rosemary'], nut: { calories: 490, protein: 46, carbs: 1, fats: 34 }, img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800' },
      { name: 'Dry-Aged New York Strip', price: 48.00, cat: 'Charcoal Steaks', desc: '14-ounce Prime strip steak, dry-aged in-house for 28 days, charbroiled, served with bone marrow butter.', ing: ['USDA Prime NY Strip', 'Bone Marrow Butter', 'Garlic', 'Thyme'], nut: { calories: 690, protein: 55, carbs: 0, fats: 53 }, img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Prime Beef Wagyu Burger', price: 34.00, cat: 'Charcoal Steaks', desc: '8-ounce ground Wagyu patty, melted gruyere cheese, caramelized onions, truffle aioli, on toasted brioche bun.', ing: ['Wagyu Beef Patty', 'Gruyere', 'Caramelized Onion', 'Brioche Bun', 'Truffle Aioli'], nut: { calories: 890, protein: 48, carbs: 42, fats: 60 }, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
      { name: 'Smoked Short Rib of Beef', price: 44.00, cat: 'Charcoal Steaks', desc: '72-hour slow cooked USDA Choice beef short rib, smoked over cherry wood, glazed in house BBQ reduction.', ing: ['Beef Short Rib', 'Cherry Wood Smoke', 'Sweet Bourbon Glaze', 'Coleslaw'], nut: { calories: 750, protein: 42, carbs: 22, fats: 55 }, img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=800' },
      { name: 'T-Bone Steak Classic', price: 68.00, cat: 'Charcoal Steaks', desc: '20-ounce classic T-Bone steak offering both tenderloin and strip portions, wood-fired, seasoned with garlic rub.', ing: ['T-Bone Steak', 'Garlic Rub', 'Olive Oil', 'Sea Salt'], nut: { calories: 890, protein: 74, carbs: 0, fats: 66 }, img: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=800' },

      // ── Royal Indian (6) ──
      { name: 'Royal Butter Chicken & Saffron Naan', price: 29.00, cat: 'Royal Indian', desc: 'Tandoor-charred chicken thigh tikka cooked in a velvety tomato-cashew gravy with dried fenugreek leaves, served with gold-dusted saffron naan.', ing: ['Organic Chicken', 'Cashew Nuts', 'San Marzano Tomatoes', 'Dried Fenugreek (Kasuri Methi)', 'Saffron Naan'], nut: { calories: 840, protein: 42, carbs: 65, fats: 46 }, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800' },
      { name: 'Tandoori King Lobster Tail', price: 54.00, cat: 'Royal Indian', desc: 'Spiced lobster tails roasted in traditional clay oven, glazed with garlic-chili butter and mint chutney.', ing: ['King Lobster Tail', 'Kashmiri Chili', 'Garam Masala', 'Mint Chutney', 'Garlic Butter'], nut: { calories: 380, protein: 32, carbs: 12, fats: 22 }, img: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80&w=800' },
      { name: 'Kashmiri Lamb Shank Rogan Josh', price: 38.00, cat: 'Royal Indian', desc: 'Slow-braised lamb shank in traditional yogurt-onion sauce, seasoned with fennel and dry ginger.', ing: ['Lamb Shank', 'Yogurt Sauce', 'Fennel Seeds', 'Dry Ginger', 'Basmati Rice'], nut: { calories: 710, protein: 48, carbs: 44, fats: 38 }, img: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&q=80&w=800' },
      { name: 'Paneer Lababdar & Truffle Roti', price: 26.00, cat: 'Royal Indian', desc: 'Cottage cheese cubes cooked in spiced tomato onion gravy with chopped bell peppers, served with truffle oil roti.', ing: ['Paneer Cheese', 'Bell Peppers', 'Tomatoes', 'Onions', 'Truffle Roti'], nut: { calories: 620, protein: 22, carbs: 48, fats: 38 }, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800' },
      { name: 'Hyderabadi Royal Chicken Biryani', price: 32.00, cat: 'Royal Indian', desc: 'Aged basmati rice, marinated organic chicken, saffron, rose water, cooked under dum (steam) in a sealed clay pot.', ing: ['Basmati Rice', 'Organic Chicken', 'Saffron', 'Rose Water', 'Dum spices'], nut: { calories: 790, protein: 38, carbs: 88, fats: 31 }, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800' },
      { name: 'Gold Dusted Saffron Kulfi', price: 15.00, cat: 'Royal Indian', desc: 'Traditional slow-reduced Indian ice cream flavored with saffron, cardamom, topped with almonds, pistachios, gold leaf.', ing: ['Condensed Milk', 'Saffron', 'Cardamom', 'Pistachios', 'Almonds', 'Gold Leaf'], nut: { calories: 280, protein: 8, carbs: 24, fats: 16 }, img: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&q=80&w=800' }
    ];

    const menuItems = [];
    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];

      const customizationOptions = [];
      if (item.cat === 'Mains' || item.cat === 'Charcoal Steaks') {
        customizationOptions.push({ name: 'Doneness', options: ['Rare', 'Medium Rare', 'Medium', 'Well Done'] });
      } else if (item.cat === 'Royal Indian') {
        customizationOptions.push({ name: 'Spice Level', options: ['Mild', 'Medium', 'Hot', 'Imperial Spiced'] });
      }
      if (item.cat === 'Beverages') {
        customizationOptions.push({ name: 'Temperature', options: ['Chilled', 'Room Temperature'] });
      }

      const menuItem = await Menu.create({
        name: item.name,
        description: item.desc,
        category: catMap[item.cat],
        images: [item.img],
        price: item.price,
        ingredients: item.ing,
        nutrition: item.nut,
        featured: i < 6,
        rating: Number((4.3 + (i % 8) * 0.1).toFixed(1)),
        isAvailable: i !== 47, // make 1 item unavailable for realism
        customizationOptions
      });
      menuItems.push(menuItem);
    }
    console.log(`   ✓ ${menuItems.length} menu items created\n`);

    // ─── 9. Seed Reviews ──────────────────────────────────────────────
    console.log('⭐ Seeding Reviews...');
    const allUsers = [admin, ...customers];
    const foodReviewComments = [
      'Pure magic. The black truffle flavor is intense and perfectly balanced.',
      'Silky texture, absolutely delicious and decadent. Will order again.',
      'Exquisite quality, the presentation is stunning. Photo-worthy.',
      'Crispy edges, warm and molten center. Heavenly experience.',
      'Felt like sitting at a Tokyo counter. Otoro melts in the mouth.',
      'High quality ingredients, seasoned and temperature-controlled perfectly.',
      'An interesting and highly successful fusion of Italian and Japanese.',
      "Tastes just like my grandmother's ragu in Florence. Deep, complex flavors.",
      'Perfect medium rare. Crust was extremely flavorful. Easily feeds two.',
      'The creaminess and depth of spices is outstanding. Truly premium.',
      'The lavender glaze on the duck was an unexpected but brilliant touch.',
      'Every macaron in the box was a different flavour journey. Incredible.',
      'Best lobster thermidor outside of Paris. Cognac sauce is perfection.',
      'The saffron kulfi is a must-try. Gold leaf adds regal charm.',
      'Champagne was perfectly chilled and arrived in impeccable packaging.',
      'Sea bass was buttery and flaky. The saffron reduction elevated everything.',
      'Caviar was fresh, briny and utterly luxurious. The blinis were warm.',
      'This wagyu burger changed my definition of what a burger can be.',
      'Oysters were unbelievably fresh. Mignonette was classic and well balanced.',
      'The biryani had layers of fragrance — saffron, rose, and cardamom.'
    ];

    const reviews = [];
    for (let i = 0; i < 20; i++) {
      const reviewer = allUsers[i % allUsers.length];
      const menuItem = menuItems[i % menuItems.length];
      const review = await Review.create({
        user: reviewer._id,
        rating: i % 5 === 0 ? 4 : 5,
        comment: foodReviewComments[i],
        reviewType: 'Food',
        referenceId: menuItem._id
      });
      reviews.push(review);
    }

    // Restaurant reviews
    const restaurantReviewComments = [
      "Absolutely outstanding. FlavorDash redefines fine dining delivery. The packaging, delivery speeds, and taste are peerless.",
      "I've dined at L'Ambroisie in Paris — this delivery experience captures the same magic. Extraordinary.",
      "The attention to detail from chef to doorstep is remarkable. Every dish arrives as if plated at the restaurant.",
      "Premium in every sense. From the app experience to the first bite, it's flawless.",
      "Five stars isn't enough. The quality, the care, the flavour — everything is exceptional."
    ];
    for (let i = 0; i < 5; i++) {
      await Review.create({
        user: allUsers[i]._id,
        rating: 5,
        comment: restaurantReviewComments[i],
        reviewType: 'Restaurant',
        referenceId: restaurant._id
      });
    }
    console.log(`   ✓ ${reviews.length} food reviews + 5 restaurant reviews created\n`);

    // ─── 10. Seed Orders (diverse statuses) ───────────────────────────
    console.log('📦 Seeding Orders...');
    const orderStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'CANCELLED', 'DELIVERED'];
    const paymentMethods = ['COD', 'RAZORPAY', 'STRIPE'];
    const orders = [];

    for (let i = 0; i < 24; i++) {
      const customer = customers[i % customers.length];
      const selectedItems = pickN(menuItems, Math.floor(Math.random() * 3) + 1);
      const orderItems = selectedItems.map(item => ({
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: Math.floor(Math.random() * 2) + 1,
        customization: {}
      }));

      const subtotal = Number(orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0).toFixed(2));
      const tax = Number((subtotal * 0.10).toFixed(2));
      const deliveryFee = 15.00;
      const grandTotal = Number((subtotal + tax + deliveryFee).toFixed(2));

      const status = orderStatuses[i % orderStatuses.length];
      const method = paymentMethods[i % paymentMethods.length];
      const isDelivered = status === 'DELIVERED';
      const needsDriver = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status);

      const order = await Order.create({
        user: customer._id,
        items: orderItems,
        subtotal,
        tax,
        deliveryFee,
        grandTotal,
        status,
        paymentMethod: method,
        paymentStatus: isDelivered || method !== 'COD' ? 'PAID' : 'PENDING',
        deliveryAddress: customer.addresses[0]?.address || '42 Sterling Sq, Chelsea, London SW3 2HJ',
        deliveryPartner: needsDriver ? deliveryPartners[i % deliveryPartners.length]._id : undefined,
        createdAt: daysAgo(Math.floor(Math.random() * 30)),
        updatedAt: daysAgo(Math.floor(Math.random() * 5))
      });
      orders.push(order);
    }
    console.log(`   ✓ ${orders.length} orders created (mixed statuses)\n`);

    // ─── 11. Seed Carts (active carts for some customers) ─────────────
    console.log('🛒 Seeding Active Carts...');
    const cartsCreated = [];
    for (let i = 0; i < 3; i++) {
      const customer = customers[i];
      const cartItems = pickN(menuItems, 2).map(item => ({
        menuItem: item._id,
        quantity: Math.floor(Math.random() * 2) + 1,
        customization: {}
      }));

      const subtotal = Number(cartItems.reduce((sum, ci) => {
        const menuItem = menuItems.find(m => m._id.toString() === ci.menuItem.toString());
        return sum + (menuItem ? menuItem.price * ci.quantity : 0);
      }, 0).toFixed(2));

      const tax = Number((subtotal * 0.10).toFixed(2));
      const deliveryFee = subtotal > 0 ? 15.00 : 0;
      const grandTotal = Number((subtotal + tax + deliveryFee).toFixed(2));

      const cart = await Cart.create({
        user: customer._id,
        items: cartItems,
        subtotal,
        tax,
        deliveryFee,
        grandTotal
      });
      cartsCreated.push(cart);
    }
    console.log(`   ✓ ${cartsCreated.length} active carts created\n`);

    // ─── 12. Seed Notifications ───────────────────────────────────────
    console.log('🔔 Seeding Notifications...');
    const notificationData = [];
    for (const order of orders.slice(0, 12)) {
      const customer = customers.find(c => c._id.toString() === order.user.toString()) || customers[0];
      notificationData.push({
        user: customer._id,
        title: `Order ${order.status}`,
        message: `Your order #${order._id} status is now ${order.status}.`,
        type: 'Order',
        read: order.status === 'DELIVERED'
      });
    }
    // Delivery and Payment notifications
    notificationData.push(
      { user: customers[0]._id, title: 'Delivery Partner Assigned', message: 'Driver Dimitri Vance is heading to the restaurant to pick up your order.', type: 'Delivery', read: true },
      { user: customers[1]._id, title: 'Payment Confirmed', message: 'Payment of $245.50 using Stripe has been verified successfully.', type: 'Payment', read: false },
      { user: customers[2]._id, title: 'Exclusive Offer!', message: "Enjoy 15% off your next order with code LUXURY15. Valid for 48 hours.", type: 'Promotion', read: false },
      { user: customers[3]._id, title: 'Order Out For Delivery', message: 'Your order is on its way! Track your driver in real-time.', type: 'Delivery', read: false }
    );
    await Notification.create(notificationData);
    console.log(`   ✓ ${notificationData.length} notifications created\n`);

    // ─── 13. Seed Contact Inquiries ───────────────────────────────────
    console.log('📧 Seeding Contact Inquiries...');
    const contactInquiries = await Contact.create([
      {
        name: 'Alexander Vanderbilt',
        email: 'alexander@example.com',
        subject: 'Catering Inquiry',
        message: 'I would like to discuss a private catering arrangement for a dinner party of 20 guests at my Kensington residence. Could you have someone contact me at your earliest convenience?',
        resolved: false
      },
      {
        name: 'Isabelle Montague',
        email: 'isabelle@example.com',
        subject: 'Allergen Information',
        message: 'Could you confirm whether your Truffle Burrata dish contains any tree nuts? My guest has a severe allergy and I want to be absolutely certain before ordering.',
        resolved: true
      },
      {
        name: 'Giuseppe Moretti',
        email: 'giuseppe@example.com',
        subject: 'Partnership Proposal',
        message: "I represent a premium wine import business and believe our collection would complement your exceptional menu. I'd love to discuss a potential partnership.",
        resolved: false
      },
      {
        name: 'Yuki Tanaka',
        email: 'yuki@example.com',
        subject: 'Feedback on Omakase',
        message: 'I wanted to share that the Signature Omakase Selection was remarkable. The fish quality rivals the best sushi restaurants in Tokyo. Bravo to your chef.',
        resolved: true
      },
      {
        name: 'Priya Kapoor',
        email: 'priya@example.com',
        subject: 'Delivery Issue',
        message: 'My last order arrived 15 minutes past the estimated delivery window. The food was still warm but I wanted to flag this for your logistics team.',
        resolved: false
      }
    ]);
    console.log(`   ✓ ${contactInquiries.length} contact inquiries created\n`);

    // ─── 14. Seed Meal Plans (AI-generated samples) ───────────────────
    console.log('🧠 Seeding Sample Meal Plans...');
    const mealPlans = await MealPlan.create([
      {
        user: customers[0]._id,
        age: 35,
        weight: 82,
        goal: 'Build Lean Muscle',
        dietaryPreference: 'High Protein',
        plan: {
          breakfast: 'Organic Egg White Scramble with Spinach, Smoked Salmon, and Avocado on Sourdough Toast',
          lunch: 'Seared Salmon Salad with Quinoa, Cucumber, Olive Oil & Lemon dressing',
          dinner: 'Grilled A5 Wagyu Tenderloin with Roasted Asparagus and Sweet Potato Mash',
          calories: 2400,
          protein: 165,
          carbs: 220,
          fats: 85
        }
      },
      {
        user: customers[1]._id,
        age: 28,
        weight: 58,
        goal: 'Maintain Weight',
        dietaryPreference: 'Vegetarian',
        plan: {
          breakfast: 'High-protein Tofu Scramble with Spinach, Bell Peppers, and Avocado on Sourdough',
          lunch: 'Quinoa Bowl with Roasted Chickpeas, Avocado, Tomatoes, Tahini Dressing',
          dinner: "Truffle Lentil Shepherd's Pie with Sweet Potato Crust and Asparagus",
          calories: 1800,
          protein: 72,
          carbs: 245,
          fats: 58
        }
      },
      {
        user: customers[4]._id,
        age: 31,
        weight: 55,
        goal: 'Lose Weight',
        dietaryPreference: 'Keto',
        plan: {
          breakfast: 'Bacon & Cheddar Frittata with Avocado and Salsa',
          lunch: 'Chicken Caesar Salad with Parmesan Crisp and Avocado Oil dressing',
          dinner: 'Pan-seared Salmon in Lemon Garlic Butter Sauce with Steamed Broccoli',
          calories: 1500,
          protein: 110,
          carbs: 30,
          fats: 105
        }
      }
    ]);
    console.log(`   ✓ ${mealPlans.length} meal plans created\n`);

    // ─── 15. Set favorites for some customers ─────────────────────────
    console.log('❤️  Setting customer favorites...');
    for (let i = 0; i < customers.length; i++) {
      const favItems = pickN(menuItems, Math.floor(Math.random() * 4) + 2);
      customers[i].favorites = favItems.map(item => item._id);
      customers[i].savedRestaurants = [restaurant._id];
      await customers[i].save();
    }
    console.log(`   ✓ Favorites set for ${customers.length} customers\n`);

    // ─── Final Summary ────────────────────────────────────────────────
    console.log('══════════════════════════════════════════════');
    console.log('  ✅  Database Seeding Complete!');
    console.log('══════════════════════════════════════════════');
    console.log(`  Admin Users:        1`);
    console.log(`  Customer Users:     ${customers.length}`);
    console.log(`  Delivery Partners:  ${deliveryPartners.length}`);
    console.log(`  Driver Profiles:    ${driverProfiles.length}`);
    console.log(`  Restaurant:         1`);
    console.log(`  Categories:         ${categories.length}`);
    console.log(`  Menu Items:         ${menuItems.length}`);
    console.log(`  Reviews:            ${reviews.length + 5}`);
    console.log(`  Orders:             ${orders.length}`);
    console.log(`  Active Carts:       ${cartsCreated.length}`);
    console.log(`  Notifications:      ${notificationData.length}`);
    console.log(`  Contact Inquiries:  ${contactInquiries.length}`);
    console.log(`  Meal Plans:         ${mealPlans.length}`);
    console.log('══════════════════════════════════════════════');
    console.log('\n  Login Credentials:');
    console.log('  ─────────────────');
    console.log('  Admin:    admin@flavordash.com / password123');
    console.log('  Customer: alexander@example.com / password123');
    console.log('  Driver:   dimitri@flavordash.com / password123');
    console.log('══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Seeder failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
