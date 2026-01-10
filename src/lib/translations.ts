export type Language = 'id' | 'en' | 'bt';

export const translations = {
  explore: {
    title: {
      en: 'Explore Samosir',
      id: 'Jelajahi Samosir',
      bt: 'Manjalahi Samosir',
    },
    subtitle: {
      en: 'Immerse yourself in the culture',
      id: 'Rasakan budaya samosir secara langsung',
      bt: 'Panghilalahon ma budaya na bagas',
    },
    backToMap: {
      en: 'Back to Map',
      id: 'Kembali ke Peta',
      bt: 'Mulak tu Peta',
    },
    viewDetail: {
      en: 'View Detail',
      id: 'Lihat Detail',
      bt: 'Bereng Hatorangan',
    },
  },
  filters: {
    folklore: {
      en: 'Folklore',
      id: 'Cerita Rakyat',
      bt: 'Turi-turian',
    },
    music: {
      en: 'Music & Dance',
      id: 'Musik & Tari',
      bt: 'Gondang & Tortor',
    },
    food: {
      en: 'Culinary',
      id: 'Kuliner',
      bt: 'Sipanganon',
    },
    history: {
      en: 'History',
      id: 'Sejarah',
      bt: 'Sejarah',
    },
    nature: {
      en: 'Nature',
      id: 'Alam',
      bt: 'Luat Nauli',
    },
  },
  skyIsland: {
    title: {
      en: 'Samosir 360',
      id: 'Samosir 360',
      bt: 'Samosir 360',
    },
    subtitle: {
      en: 'Explore the Cultural Heritage of Samosir Island',
      id: 'Jelajahi Warisan Budaya Pulau Samosir',
      bt: 'Jalahi Tona Budaya Pulo Samosir',
    },
    instruction: {
      en: 'Click on a glowing landmark to explore',
      id: 'Klik pada landmark untuk menjelajah',
      bt: 'Dorguk ma inganan na marsinondang laho manjahali',
    },
    enterView: {
      en: 'Enter View',
      id: 'Masuk Tampilan',
      bt: 'Masuk Tu Tampilan',
    },
  },
  npc: {
    opung: {
      en: 'Opung',
      id: 'Opung',
      bt: 'Opung',
    },
    role: {
      en: 'Village Elder',
      id: 'Tetua Desa',
      bt: 'Pangituai Ni Huta',
    },
    chatPlaceholder: {
      en: 'Ask Opung about this place...',
      id: 'Tanya Opung tentang tempat ini...',
      bt: 'Sukkun Opung taringot inganan on...',
    },
    send: {
      en: 'Send',
      id: 'Kirim',
      bt: 'Tongos',
    },
    listening: {
      en: 'Opung is thinking...',
      id: 'Opung sedang berpikir...',
      bt: 'Marfikir dope Opung...',
    },
    poweredBy: {
      en: 'Powered by SAMOSIR-VERSE & Llama-3.1-8B • Cultural heritage of Samosir Island',
      id: 'Didukung oleh SAMOSIR-VERSE & Llama-3.1-8B • Warisan budaya Pulau Samosir',
      bt: 'Diurupi SAMOSIR-VERSE & Llama-3.1-8B • Tona budaya Pulo Samosir',
    },
  },
  itemDetail: {
    dragRotate: {
      en: 'Drag to Rotate • Scroll to Zoom',
      id: 'Tarik untuk Memutar • Gulir untuk Memperbesar',
      bt: 'Tarik laho Puta • Gulir laho Pabalga',
    },
  },
  marketplace: {
    price: {
      en: 'Price',
      id: 'Harga',
      bt: 'Arga',
    },
    buy: {
      en: 'Buy Now',
      id: 'Beli Sekarang',
      bt: 'Tuhor Saonari',
    },
    contactSeller: {
      en: 'Contact Seller',
      id: 'Hubungi Penjual',
      bt: 'Hubungi Panggadis',
    },
    reviews: {
      en: 'reviews',
      id: 'ulasan',
      bt: 'ulasan',
    },
    location: {
      en: 'Location:',
      id: 'Lokasi:',
      bt: 'Inganan:',
    },
    messageViaWhatsApp: {
      en: 'Message via WhatsApp',
      id: 'Pesan via WhatsApp',
      bt: 'Pesan via WhatsApp',
    },
    redirectInfo: {
      en: 'You will be redirected to WhatsApp to place your order',
      id: 'Anda akan diarahkan ke WhatsApp untuk melakukan pemesanan',
      bt: 'Diarahon do hamu tu WhatsApp laho manongos pesanan',
    },
    perPackage: {
      en: '/ package',
      id: '/ paket',
      bt: '/ paket',
    },
    perPortion: {
      en: '/ portion',
      id: '/ porsi',
      bt: '/ porsi',
    },
  },
  quiz: {
    title: {
      en: 'Take Quiz',
      id: 'Ikuti Kuis',
      bt: 'Ikuti Kuis',
    },
    question: {
      en: 'Question',
      id: 'Pertanyaan',
      bt: 'Sungkun',
    },
    correct: {
      en: 'Correct!',
      id: 'Benar!',
      bt: 'Tutu!',
    },
    incorrect: {
      en: 'Incorrect',
      id: 'Salah',
      bt: 'Sala',
    },
  },
  compass: {
    north: { en: 'N', id: 'U', bt: 'U' },
    east: { en: 'E', id: 'T', bt: 'T' },
    south: { en: 'S', id: 'S', bt: 'S' },
    west: { en: 'W', id: 'B', bt: 'B' },
  },
  common: {
    loading: {
      en: 'Loading...',
      id: 'Memuat...',
      bt: 'Paimahon...',
    },
    error: {
      en: 'Something went wrong',
      id: 'Terjadi kesalahan',
      bt: 'Adong na sala',
    },
  }
};

export type TranslationKey = keyof typeof translations;
