# Samosir 360 — Platform Warisan Budaya Imersif

![Samosir 360 Banner](/public/banner-placeholder.png)

> **"Culture First, Technology Second."**
> *Horas!* Selamat datang di Samosir 360 — Digital Twin atmosferik dari Pulau Samosir.

## 🌟 Tentang Proyek

Samosir 360 adalah platform tur virtual interaktif yang menghadirkan kekayaan budaya Pulau Samosir langsung ke layar pengguna. Menggabungkan teknologi 3D low-poly dan panorama 360°, platform ini memungkinkan pengguna menjelajahi landmark-landmark bersejarah Danau Toba dengan pengalaman yang mendalam dan atmosferik.

## ✨ Fitur Utama

🏝️ **Pulau 3D Interaktif**
Model pulau bergaya low-poly dengan pencahayaan "golden hour" yang dapat dijelajahi dengan rotasi otomatis dan zoom.

🌐 **Navigasi Panorama 360°**
12 titik panorama berkualitas tinggi dengan navigasi virtual tour seperti Google Street View, tanpa menggunakan API Google Maps.

🔮 **25 Glowmarks Budaya**
Titik-titik interaktif yang tersebar di 5 kategori: Folklore (cerita rakyat), Music & Dance (musik & tarian), Food (kuliner), History (sejarah), dan Nature (alam).

🧓 **AI "Opung" Storyteller**
Chatbot berbasis AI yang berperan sebagai tetua Batak yang bijak. Didukung oleh knowledge base mendalam untuk memastikan akurasi informasi, serta Prompt Guard untuk mencegah serangan prompt injection.

🛒 **Marketplace Terintegrasi**
Fitur pembelian produk kuliner tradisional dengan deep link ke WhatsApp.

🧭 **Kompas & Dukungan Gyroscope**
Kompas digital untuk orientasi dalam mode 360°, serta dukungan gyroscope pada perangkat mobile untuk pengalaman yang lebih natural — cukup gerakkan ponsel untuk melihat sekeliling.

💃 **Video Panorama 360° Tari Tor-Tor**
Pengalaman imersif menonton pertunjukan tari tradisional Batak dalam format video 360°, membuat pengguna seolah-olah berada di tengah-tengah upacara adat.

🎸 **Model 3D Alat Musik Hasapi**
Pengguna dapat melihat dan berinteraksi dengan model 3D Hasapi (alat musik tradisional Batak) secara detail dari berbagai sudut pandang.

🎮 **Sistem Gamifikasi**
Progress tracking dengan pencapaian (achievements), paspor budaya, dan leaderboard untuk meningkatkan engagement pengguna.

🔐 **Autentikasi Pengguna**
Login dengan Supabase Auth untuk menyimpan progress eksplorasi secara permanen.

## 🛠️ Teknologi yang Digunakan

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | React framework dengan SSR |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Smooth animations |

### 3D Engine
| Technology | Purpose |
|------------|---------|
| React-Three-Fiber | React renderer untuk Three.js |
| @react-three/drei | Useful helpers untuk R3F |

### 360° Viewer
| Technology | Purpose |
|------------|---------|
| PhotoSphereViewer | Core panorama engine |
| Virtual Tour Plugin | Node-based navigation |
| Markers Plugin | Interactive glowmarks |
| Gyroscope Plugin | Mobile orientation support |

### AI Layer
| Technology | Purpose |
|------------|---------|
| Groq SDK | Fast LLM inference |
| Llama 3.3 70B | Main language model |
| Prompt Guard (llama-prompt-guard-2-86m) | Input safety filtering |
| Knowledge Base | 25 landmark-specific files |

### Database
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL + Auth + Storage |

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main Entry (3D / 360 / Static modes)
│   └── api/                # Server Actions & API Routes
├── components/
│   ├── canvas/             # R3F 3D Components
│   ├── explore/            # 360 Viewer Components
│   ├── ui/                 # UI Elements
│   └── viewer/             # Shared Viewer Logic
├── lib/
│   ├── supabase.ts         # Database Client
│   └── knowledge.ts        # AI Knowledge Loader
├── services/
│   ├── ProgressService.ts  # Progress sync
│   └── AchievementService.ts # Achievement logic
└── store/
    └── useAppStore.ts      # Zustand global state

knowledge/                   # AI Knowledge Base
├── opung-skills.md         # Agent persona
├── glossary.md             # Term translations
└── landmarks/              # 25 detailed landmark files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/samosir-verse.git
cd samosir-verse

# Install dependencies
npm install

# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start exploring.

## 🧠 AI Architecture

The "Opung" persona is a **Deterministic Cultural Storyteller**:

- **Prompt Guard**: Filters malicious/off-topic inputs
- **Knowledge Base**: 25 files × ~1000 words each for grounded responses
- **Context Injection**: Active filters + landmark facts injected per request
- **Trilingual**: English, Indonesian, and Batak Toba support

## 🤝 Contributing

We welcome contributions that respect the cultural integrity of the project.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Horas!** 🐃
