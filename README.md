# Samosir 360 — Immersive Cultural Heritage Platform

![Samosir 360 Banner](/public/banner-placeholder.png)

> **"Culture First, Technology Second."**
> An immersive "Digital Twin" of Samosir Island focused on atmosphere, storytelling, and cultural preservation rather than GIS accuracy.

## 🌟 The Vibe

Samosir 360 is not a Google Earth clone. It is a stylized, atmospheric journey into the heart of Batak Toba culture.
- **The Hook**: A low-poly, golden-hour 3D view of Samosir Island floating on a reflective lake.
- **The Core**: A seamless 360° virtual tour connecting 25+ cultural landmarks.
- **The Magic**: "Opung" — an AI-powered elder storyteller who guides you with wisdom, humor, and strict cultural accuracy.

## ✨ Key Features

- **3D Sky Island Intro**: Interactive low-poly 3D model of Samosir Island built with **React Three Fiber**.
- **Immersive 360° Exploration**: Custom virtual tour engine using **Photo Sphere Viewer** with "Hub & Spoke" navigation.
- **AI "Opung" Storyteller**:
  - Powered by **Groq SDK (Llama 3.1)** for instant, low-latency storytelling.
  - Context-aware: Reacts to your active "Cultural Lens" (Filters).
  - Culturally Grounded: Strictly adheres to a "Lore Context" fact sheet to prevent hallucinations.
  - **Trilingual**: Speaks English, Indonesian, and Batak Toba.
- **Cultural Lenses**: Toggle filters (Folklore, Music, Food, History, Nature) to change the atmosphere and visible landmarks.
- **Marketplace Integration**: Discover local products (Ulos, Andaliman) and connect directly with artisans via WhatsApp.
- **Responsive & Mobile-First**: Optimized for all devices with gyroscope support for mobile immersion.

## 🛠️ Tech Stack

### Core
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion

### 3D & Immersion
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (@react-three/fiber, @react-three/drei)
- **360° Viewer**: [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/) (Core, Virtual Tour, Markers, Gyroscope)

### Backend & AI
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **AI Inference**: [Groq](https://groq.com/) (Llama 3.1-8b-instant)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main Entry (Handles View Modes: 3D / 360 / Static)
│   └── api/                # Server Actions & API Routes
├── components/
│   ├── canvas/             # R3F 3D Components (SkyIsland, Atmosphere)
│   ├── explore/            # 360 Viewer Components (PanoramaViewer)
│   ├── ui/                 # UI Elements (Sidebar, NPCModal, HUD)
│   └── viewer/             # Shared Viewer Logic
├── lib/
│   ├── supabase.ts         # Database Client
│   └── mockProducts.ts     # Marketplace Data
└── store/                  # Global State (Zustand)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/samosir-verse.git
   cd samosir-verse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) to start exploring.

## 🧠 AI Architecture

The "Opung" persona is designed to be a **Deterministic Cultural Storyteller**.
- **System Prompt**: Enforces a specific persona (Batak Elder) and strict negative constraints (e.g., "Do not invent facts", "Do not confuse cultures").
- **Context Injection**:
  1. **User's Active Lens**: (e.g., "Food" lens makes Opung talk about taste and memories).
  2. **Landmark Fact Sheet**: Hardcoded "Ground Truth" text injected into the prompt to ensure accuracy.

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
