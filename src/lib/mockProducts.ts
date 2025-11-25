/**
 * Mock Product Data for Marketplace
 * Food and Music items available on Samosir Island
 */

export interface LocalizedString {
  en: string;
  id: string;
  bt: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  category: 'food' | 'music';
  price: number; // in IDR
  description: LocalizedString;
  address: LocalizedString;
  image: string; // placeholder for now
  rating: number; // 1-5
  reviewCount: number;
  whatsappNumber: string;
}

export const MOCK_PRODUCTS: Product[] = [
  // FOOD CATEGORY
  {
    id: 'food-arsik',
    name: {
      en: 'Arsik Goldfish',
      id: 'Arsik Ikan Mas',
      bt: 'Arsik Ihan Batak',
    },
    category: 'food',
    price: 85000,
    description: {
      en: 'Fresh carp cooked with spicy and sour Batak spices. Served with hot rice and andaliman chili sauce.',
      id: 'Ikan mas segar dimasak dengan bumbu khas Batak yang pedas dan asam. Disajikan dengan nasi panas dan sambal andaliman.',
      bt: 'Dengke Mas na rata dipamasak dohot bumbu khas Batak na pedas dohot asom. Dihidanghon dohot indahan na las dohot sambal andaliman.',
    },
    address: {
      en: 'Toba Nauli Restaurant, Sisingamangaraja St, Tomok',
      id: 'Warung Makan Toba Nauli, Jl. Sisingamangaraja, Tomok',
      bt: 'Lapo Mangan Toba Nauli, Jl. Sisingamangaraja, Tomok',
    },
    image: '/images/products/arsik.jpg',
    rating: 4.8,
    reviewCount: 127,
    whatsappNumber: '081234567890',
  },
  {
    id: 'food-naniura',
    name: {
      en: 'Naniura (Batak Sashimi)',
      id: 'Naniura (Sashimi Batak)',
      bt: 'Naniura',
    },
    category: 'food',
    price: 95000,
    description: {
      en: 'Fresh carp marinated with special Batak spices, served raw like sashimi with a fresh sour taste.',
      id: 'Ikan mas segar yang dimarinasi dengan bumbu khas Batak, disajikan mentah seperti sashimi dengan rasa asam segar.',
      bt: 'Dengke Mas na rata dimarinasi dohot bumbu khas Batak, dihidanghon mentah songon sashimi dohot rasa asom na segar.',
    },
    address: {
      en: 'Bagus Bay Restaurant, Tuktuk Siadong',
      id: 'Restoran Bagus Bay, Tuktuk Siadong',
      bt: 'Restoran Bagus Bay, Tuktuk Siadong',
    },
    image: '/images/products/naniura.jpg',
    rating: 4.6,
    reviewCount: 89,
    whatsappNumber: '081234567891',
  },
  {
    id: 'food-miegomak',
    name: {
      en: 'Mie Gomak Toba Style',
      id: 'Mie Gomak Khas Toba',
      bt: 'Mie Gomak Khas Toba',
    },
    category: 'food',
    price: 25000,
    description: {
      en: 'Thick Batak noodles with thick, spicy and savory andaliman sauce. Perfect for breakfast or lunch.',
      id: 'Mie tebal khas Batak dengan kuah kental bumbu andaliman yang pedas dan gurih. Cocok untuk sarapan atau makan siang.',
      bt: 'Mie tebal khas Batak dohot kuah kental bumbu andaliman na pedas dohot gurih. Cocok tu sarapan manang mangan siang.',
    },
    address: {
      en: 'Siantar Mie Gomak Stall, Tomok Market',
      id: 'Warung Mie Gomak Siantar, Pasar Tomok',
      bt: 'Lapo Mie Gomak Siantar, Pasar Tomok',
    },
    image: '/images/products/mie-gomak.jpg',
    rating: 4.9,
    reviewCount: 203,
    whatsappNumber: '081234567892',
  },
  {
    id: 'food-ombus',
    name: {
      en: 'Ombus-Ombus Cake',
      id: 'Kue Ombus-Ombus',
      bt: 'Kue Ombus-Ombus',
    },
    category: 'food',
    price: 35000,
    description: {
      en: 'Sweet and soft traditional Batak cake, made from rice flour and brown sugar. Perfect for a snack.',
      id: 'Kue tradisional Batak yang manis dan lembut, terbuat dari tepung beras dan gula merah. Sempurna untuk camilan.',
      bt: 'Kue tradisional Batak na manis dohot lembut, dibahen sian tepung boras dohot gula merah. Sempurna tu camilan.',
    },
    address: {
      en: 'Samosir Souvenir Shop, Tomok Harbor St',
      id: 'Toko Oleh-Oleh Samosir, Jl. Pelabuhan Tomok',
      bt: 'Toko Oleh-Oleh Samosir, Jl. Pelabuhan Tomok',
    },
    image: '/images/products/ombus-ombus.jpg',
    rating: 4.5,
    reviewCount: 64,
    whatsappNumber: '081234567893',
  },
  {
    id: 'food-dali',
    name: {
      en: 'Dali Ni Horbo (Buffalo Milk)',
      id: 'Dali Ni Horbo (Susu Kerbau)',
      bt: 'Dali Ni Horbo',
    },
    category: 'food',
    price: 15000,
    description: {
      en: 'Fresh buffalo milk typical of Samosir, rich in nutrients and has a unique taste. Sold in 250ml bottles.',
      id: 'Susu kerbau segar khas Samosir, kaya nutrisi dan memiliki rasa yang unik. Dijual dalam botol 250ml.',
      bt: 'Susu horbo segar khas Samosir, kaya nutrisi dohot adong rasa na unik. Digadis bagas botol 250ml.',
    },
    address: {
      en: 'Samosir Jaya Farm, Simanindo',
      id: 'Peternakan Samosir Jaya, Simanindo',
      bt: 'Peternakan Samosir Jaya, Simanindo',
    },
    image: '/images/products/dali-horbo.jpg',
    rating: 4.7,
    reviewCount: 92,
    whatsappNumber: '081234567894',
  },

  // MUSIC CATEGORY
  {
    id: 'music-gondang',
    name: {
      en: 'Gondang Sabangunan Performance',
      id: 'Pertunjukan Gondang Sabangunan',
      bt: 'Gondang Sabangunan',
    },
    category: 'music',
    price: 500000,
    description: {
      en: 'Traditional Gondang Sabangunan music performance package complete with 5 professional musicians. Duration 1 hour.',
      id: 'Paket pertunjukan musik tradisional Gondang Sabangunan lengkap dengan 5 musisi profesional. Durasi 1 jam.',
      bt: 'Paket pertunjukan musik tradisional Gondang Sabangunan lengkap dohot 5 parmusik profesional. Durasi 1 jam.',
    },
    address: {
      en: 'Batak Art Studio, Huta Bolon Simanindo Museum',
      id: 'Sanggar Seni Batak, Museum Huta Bolon Simanindo',
      bt: 'Sanggar Seni Batak, Museum Huta Bolon Simanindo',
    },
    image: '/images/products/gondang.jpg',
    rating: 5.0,
    reviewCount: 45,
    whatsappNumber: '081234567895',
  },
  {
    id: 'hasapi',
    name: {
      en: 'Hasapi (Lute Instrument)',
      id: 'Hasapi (Alat Musik Petik)',
      bt: 'Hasapi',
    },
    category: 'music',
    price: 1500000,
    description: {
      en: 'Traditional handmade Hasapi from high quality wood. Batak stringed instrument with melodious sound.',
      id: 'Hasapi tradisional handmade dari kayu berkualitas tinggi. Alat musik petik khas Batak dengan suara merdu.',
      bt: 'Hasapi tradisional handmade sian hau na berkualitas tinggi. Alat musik petik khas Batak dohot suara na merdu.',
    },
    address: {
      en: 'Traditional Musical Instrument Craftsman, Simanindo St',
      id: 'Pengrajin Alat Musik Tradisional, Jl. Simanindo',
      bt: 'Pande Alat Musik Tradisional, Jl. Simanindo',
    },
    image: '/images/products/hasapi.jpg',
    rating: 4.8,
    reviewCount: 23,
    whatsappNumber: '081234567896',
  },
  {
    id: 'music-tortor',
    name: {
      en: 'Tor-Tor Dance Class',
      id: 'Kelas Tari Tor-Tor',
      bt: 'Marsiajar Manortor',
    },
    category: 'music',
    price: 200000,
    description: {
      en: 'Learn traditional Tor-Tor dance with experienced instructors. Package of 3 sessions, including traditional costumes.',
      id: 'Belajar tarian tradisional Tor-Tor dengan instruktur berpengalaman. Paket 3 sesi, termasuk kostum tradisional.',
      bt: 'Marsiajar tarian tradisional Tor-Tor dohot instruktur na berpengalaman. Paket 3 sesi, termasuk ulos.',
    },
    address: {
      en: 'Sigale-gale Dance Studio, Tomok',
      id: 'Sanggar Tari Sigale-gale, Tomok',
      bt: 'Sanggar Tari Sigale-gale, Tomok',
    },
    image: '/images/products/tortor.jpg',
    rating: 4.9,
    reviewCount: 67,
    whatsappNumber: '081234567897',
  },
];

/**
 * Get products by category
 */
export function getProductsByCategory(category: 'food' | 'music'): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}
