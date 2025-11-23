/**
 * Mock Product Data for Marketplace
 * Food and Music items available on Samosir Island
 */

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'music';
  price: number; // in IDR
  description: string;
  address: string;
  image: string; // placeholder for now
  rating: number; // 1-5
  reviewCount: number;
  whatsappNumber: string;
}

export const MOCK_PRODUCTS: Product[] = [
  // FOOD CATEGORY
  {
    id: 'food-arsik',
    name: 'Arsik Ikan Mas',
    category: 'food',
    price: 85000,
    description: 'Ikan mas segar dimasak dengan bumbu khas Batak yang pedas dan asam. Disajikan dengan nasi panas dan sambal andaliman.',
    address: 'Warung Makan Toba Nauli, Jl. Sisingamangaraja, Tomok',
    image: '/images/products/arsik.jpg',
    rating: 4.8,
    reviewCount: 127,
    whatsappNumber: '081234567890',
  },
  {
    id: 'food-naniura',
    name: 'Naniura (Sashimi Batak)',
    category: 'food',
    price: 95000,
    description: 'Ikan mas segar yang dimarinasi dengan bumbu khas Batak, disajikan mentah seperti sashimi dengan rasa asam segar.',
    address: 'Restoran Bagus Bay, Tuktuk Siadong',
    image: '/images/products/naniura.jpg',
    rating: 4.6,
    reviewCount: 89,
    whatsappNumber: '081234567891',
  },
  {
    id: 'food-miegomak',
    name: 'Mie Gomak Khas Toba',
    category: 'food',
    price: 25000,
    description: 'Mie tebal khas Batak dengan kuah kental bumbu andaliman yang pedas dan gurih. Cocok untuk sarapan atau makan siang.',
    address: 'Warung Mie Gomak Siantar, Pasar Tomok',
    image: '/images/products/mie-gomak.jpg',
    rating: 4.9,
    reviewCount: 203,
    whatsappNumber: '081234567892',
  },
  {
    id: 'food-ombus',
    name: 'Ombus-Ombus',
    category: 'food',
    price: 35000,
    description: 'Kue tradisional Batak yang manis dan lembut, terbuat dari tepung beras dan gula merah. Sempurna untuk camilan.',
    address: 'Toko Oleh-Oleh Samosir, Jl. Pelabuhan Tomok',
    image: '/images/products/ombus-ombus.jpg',
    rating: 4.5,
    reviewCount: 64,
    whatsappNumber: '081234567893',
  },
  {
    id: 'food-dali',
    name: 'Dali Ni Horbo (Susu Kerbau)',
    category: 'food',
    price: 15000,
    description: 'Susu kerbau segar khas Samosir, kaya nutrisi dan memiliki rasa yang unik. Dijual dalam botol 250ml.',
    address: 'Peternakan Samosir Jaya, Simanindo',
    image: '/images/products/dali-horbo.jpg',
    rating: 4.7,
    reviewCount: 92,
    whatsappNumber: '081234567894',
  },

  // MUSIC CATEGORY
  {
    id: 'music-gondang',
    name: 'Pertunjukan Gondang Sabangunan',
    category: 'music',
    price: 500000,
    description: 'Paket pertunjukan musik tradisional Gondang Sabangunan lengkap dengan 5 musisi profesional. Durasi 1 jam.',
    address: 'Sanggar Seni Batak, Museum Huta Bolon Simanindo',
    image: '/images/products/gondang.jpg',
    rating: 5.0,
    reviewCount: 45,
    whatsappNumber: '081234567895',
  },
  {
    id: 'music-hasapi',
    name: 'Hasapi (Alat Musik Petik)',
    category: 'music',
    price: 1500000,
    description: 'Hasapi tradisional handmade dari kayu berkualitas tinggi. Alat musik petik khas Batak dengan suara merdu.',
    address: 'Pengrajin Alat Musik Tradisional, Jl. Simanindo',
    image: '/images/products/hasapi.jpg',
    rating: 4.8,
    reviewCount: 23,
    whatsappNumber: '081234567896',
  },
  {
    id: 'music-tortor',
    name: 'Kelas Tari Tor-Tor',
    category: 'music',
    price: 200000,
    description: 'Belajar tarian tradisional Tor-Tor dengan instruktur berpengalaman. Paket 3 sesi, termasuk kostum tradisional.',
    address: 'Sanggar Tari Sigale-gale, Tomok',
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
