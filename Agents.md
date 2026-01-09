1. Executive Summary

We are building Samosir 360, an immersive cultural-heritage platform that blends:

• A stylized 3D low-poly island (React-Three-Fiber)
• A custom 360° panorama engine (PhotoSphereViewer)
• A Hub & Spoke content model (25 glowmarks → ~5 360 nodes)
• An AI “Opung” storyteller (Groq SDK / Llama 3.1)
• A Marketplace extension for buyable items
• A fully custom navigation pipeline (no Google Maps)

This is not a GIS or Earth clone.
This is a vibe-first atmospheric cultural experience.

2. Core Principles

• Culture first — facts come from lore_context only
• No hallucinations — AI must stay grounded
• Clean transitions — 3D → 360 → 3D
• Atmosphere — wind, particles, warm lighting
• Low poly — aesthetic > accuracy

3. Tech Stack (Locked)
Layer	Libraries / Notes
Column	Type	Description
id	text (PK)	slug (“tomok”, “ambarita”, etc)
name	text	display name
panorama_url	text	HD equirectangular
thumbnail_url	text	low-res blurred loader
default_yaw	float	initial view
default_pitch	float	initial pitch
links	jsonb	list of {nodeId, yaw, pitch}

positionMode: "manual" must be used.
Do NOT use GPS mode.

Table: landmarks (Glowmarks / Content)
Column	Type	Description
id	uuid	PK
node_id	text (FK)	Which 360 node it belongs to
category	text	folklore, music, food, history, nature
title	text	Name (e.g., Sigale-gale)
lore_context	text	Ground truth for AI, max 500 chars
position_3d	jsonb	{x, y, z} relative to R3F center
marker_config	jsonb	buyable bool, custom icon, price

position_3d is now mandatory for all 25 glowmarks.

5. The Content Matrix (25 Glowmarks) — Final, Canonical

All inconsistencies removed.
This is the correct mapping.

A. Folklore (Purple)

Sigale-gale — Tomok

Batu Gantung — Lake View

Tunggal Panaluan — Museum

Legend of Toba — Lake View

Tomb of King Sidabutar — Tomok

B. Music & Dance (Blue)

Gondang Sabangunan — Simanindo

Hasapi — Simanindo

Tor-Tor Dance — Simanindo

Sarune Bolon — Simanindo

Taganing — Simanindo

C. Food (Orange) [Marketplace]

Arsik — Market

Naniura — Market

Ombus-Ombus — Market

Dali Ni Horbo — Market

Mie Gomak — Market

D. History (Red)

Stone Chairs — Ambarita

Huta Siallagan — Ambarita

Museum Huta Bolon — Simanindo

Tele Tower — Tele

Tugu Aritonang — Monument View

E. Nature (Green)

Pusuk Buhit — Mountain View

Holbung Hill — Hill View

Binangalom Waterfall — Lake View

Efrata Waterfall — Waterfall View

Parbaba Beach — Parbaba

This entire matrix must exist in the DB.

6. 3D Architecture
6.1 GLB Model

Loaded using useGLTF('/models/samosir.glb')

Must be wrapped in <Suspense fallback>

Scale must be exactly: 0.0005

OrbitControls enabled

Auto-rotation + slow-down on hover

Warm lighting ("golden hour")

6.2 Glowmarks (3D Landmark Spheres)

Glowmarks replace Google Map pins.

Properties:

sphere geometry

emissive color by category

pulsing animation (scale 1 → 1.2 → 1)

raycasting for click

hover tooltip

smooth fade when filters toggle

6.3 State Machine (Final)
Mode	Description
3d-sky	floating overview, all glowmarks
3d-focused	camera zoomed to landmark
360-panorama	immersive floor-level viewer

Flow:
3D click → animate → fade → load 360 node → auto-open AI → allow return.

7. 360 Viewer Architecture (Custom PSV Engine)

Using @photo-sphere-viewer

Links handled by virtual-tour-plugin

Markers controlled by MarkerManager.ts

Uses manual yaw/pitch navigation

No GPS used anywhere

8. AI “Opung” Storyteller (Final Spec)
System Prompt Rules

Must greet with “Horas!”

No hallucinations

Must use ONLY facts from lore_context

3 sentences maximum

Tone shifts based on category

Output must be JSON:

{ "message": "...", "emotion": "happy" }


AI also receives:

current filters

the selected landmark’s fact sheet

9. Folder Structure (Unified)

This is the final canonical structure:

src/
  app/
    layout.tsx
    page.tsx            # Main Entry (Handles View Modes)
    api/                # API Routes (Chat, etc.)
  components/
    canvas/
      SkyIsland.tsx
      AtmosphereEffects.tsx
    explore/
      PanoramaViewer.tsx
    ui/
      FilterSidebar.tsx
      NPCModal.tsx
      TransitionOverlay.tsx
      ProductDetailModal.tsx
      Compass.tsx
  lib/
    supabase.ts


R3F cannot use <primitive object={new THREE.ConeGeometry}>

Use <coneGeometry args={[...]}/> instead

positionMode: 'manual' is mandatory

3D → 360 transitions must use fade-to-white

10. Phase 5 Progress Log (Updated: 2025-11-23)
Current Status: ~90% Complete

Completed:
✔ Rendering fix: primitive → declarative geometry
✔ GLB loaded successfully  
✔ position_3d added to DB
✔ Landmark3D component created
✔ Camera animation system (zoom, return)
✔ Zustand state machine (viewMode, selectors)
✔ Basic 3D → 360 transition logic
✔ Hover + pulse animations
✔ Content matrix finalized
✔ ProductCard.tsx - Marketplace with WhatsApp deep link
✔ Compass.tsx - Direction HUD for 360 viewer  
✔ useAudio.ts - Audio crossfade system
✔ seed-all-landmarks.ts - Complete seeder (12 nodes + 25 landmarks)
✔ marker_config field added to Landmark type
✔ Gyroscope support for mobile devices (@photo-sphere-viewer/gyroscope-plugin)
✔ AI Chatbot fully functional with context-aware responses
✔ Mobile UI: Glowmark names visible on hover/tap
✔ Hasapi 3D model integration and adjustments
✔ Language filter (Batak Toba/English/Indonesian) implemented


Pending (Remaining 10%):
□ Improve raycasting precision
□ Complete TransitionOverlay → router push sync
□ Deep linking: /explore?node=x&focus=y
□ Mobile: sidebar collapse
□ Mobile: remove hover states
□ Performance tuning

11. Recent Updates (Mobile UX & Audio - 2025-11-26)
- **Audio System**:
    - Global background music with crossfade (`useAudio.ts`).
    - Visible "Tap to Enable Audio" button for browser autoplay policies.
    - Volume control in Sidebar and floating HUD.
    - Fixed `useAudio` to ensure tracks load even if autoplay is blocked.
- **Mobile UX**:
    - **NPC Button**: Moved to top-right (offset) to avoid corner overlaps. Auto-hides when Detail Modal is open.
    - **Visual Cues**: "Tap to view" indicator for Hasapi (always visible on mobile).
    - **Tor-Tor Video**: Manual Gyroscope toggle (default OFF). Improved text visibility with dark backdrop.
- **Gyroscope Config**:
    - Panorama: `SceneContainer.tsx` (GyroscopePlugin).
    - Tor-Tor: `TortorVideoModal.tsx` (DeviceOrientationControls).

11. Critical Implementation Notes (Do Not Delete

React 18 Strict Mode calls effects twice — must gate initialization with isMounted

PSV viewer must never initialize twice

R3F cannot use <primitive object={new THREE.ConeGeometry}>

12. Polish Requirements (Still Required)

Global audio crossfades

Particles for “glitter” filter change

Blurred thumbnail placeholder for 360 images

MiniMap HUD (optional)

Marketplace uses WhatsApp deep link

Typewriter animation for AI speech

13. Final Integration Notes

Entire system assumes a Hub & Spoke design

All 25 glowmarks must map to real 360 nodes, even if multiple share the same node

Opung must always use lore_context, never invent facts

Agents reading this file must treat it as “persistent world-state”

14. Known Issues & Future Work (Localization)
- **Hardcoded Strings**: Many UI elements (e.g., Explore page headers, buttons) are hardcoded in English. The `LanguageSwitcher` currently only affects dynamic content (AI Story) and specific components wrapped in `LocalizedText`.
- **Batak Toba Mode**: Currently, selecting 'BT' applies the Surat Batak font style but does not translate the hardcoded English text. This results in English text being rendered in Batak glyphs without the intended dual-text or translation.
- **Resolution Plan**:
    - Create a dictionary/translation file for static UI text.
    - Replace hardcoded strings with a translation hook (e.g., `useTranslation`).
    - Ensure `LocalizedText` or the translation hook handles the dual-text display for all static content when 'BT' is active.

---

## 15. AI Knowledge Base System (Added: 2026-01-09)

### 15.1 Architecture Overview

The AI Opung chatbot now uses a **file-based RAG-like knowledge system** for grounding responses:

```
knowledge/
├── opung-skills.md           # Agent persona definition (included in EVERY request)
├── glossary.md               # Cultural term translations (EN/ID/BT)
└── landmarks/
    ├── folklore/ (5 files)
    ├── music/ (5 files)
    ├── food/ (5 files)
    ├── history/ (5 files)
    └── nature/ (5 files)
```

### 15.2 Knowledge File Structure

Each landmark knowledge file (~1000 words) contains:

| Section | Purpose |
|---------|---------|
| **Core Knowledge** | Extended historical/cultural content |
| **Opung's Memory** | First-person anecdotes in Opung's voice |
| **Sensory Details** | Sight, sound, smell, touch descriptions |
| **Key Facts** | Quick reference bullet points |
| **Cultural Connections** | Cross-references to related landmarks |
| **Common Misconceptions** | Table correcting false assumptions |
| **Term Glossary** | EN/ID/Batak Toba translations |

### 15.3 Knowledge Loader (`src/lib/knowledge.ts`)

Key features:
- **In-memory cache** with 5-minute TTL
- **Token truncation** (max 600 tokens per knowledge block)
- **Smart slug generation** from titles
- **Fallback to DB lore_context** if file not found

```typescript
// Core functions
getOpungSkills()           // Persona definition - included in EVERY request
getLandmarkKnowledge(title, category)  // Specific landmark content
buildEnhancedContext(title, category, loreContext, language)  // Combines all
truncateToTokenLimit(text, maxTokens)   // Token management
```

### 15.4 Important: Opung Skills Inclusion

**CRITICAL**: `opung-skills.md` is now included in EVERY API request regardless of landmark. This ensures consistent role-playing behavior with:
- Warm "Horas!" greetings
- Batak elder persona
- Appropriate tone shifts by category
- Cultural boundaries (no speculation beyond facts)

---

## 16. Prompt Guard Integration (Added: 2026-01-09)

### 16.1 Model Used

```
meta-llama/llama-prompt-guard-2-86m
```

### 16.2 Implementation

Location: `src/lib/knowledge.ts` → `checkPromptSafety()`

The guard runs on **every user message** (not just follow-ups):

```typescript
async function checkPromptSafety(userMessage: string): Promise<{safe: boolean, reason?: string}>
```

### 16.3 Response When Blocked

If unsafe input detected, returns polite in-character rejection:

```json
{
  "message": "Horas! I sense you wish to speak of things beyond our traditions. Perhaps we can discuss the wonders of Samosir instead?",
  "emotion": "serious"
}
```

### 16.4 Environment Requirements

```bash
GROQ_API_KEY=gsk_xxxxx  # Required for both main model and prompt guard
```

---

## 17. Critical Implementation Discoveries

### 17.1 React Strict Mode + PhotoSphereViewer

**Problem**: React 18 Strict Mode runs effects twice in development.
**Solution**: Use `isMounted` flag to prevent double initialization:

```typescript
useEffect(() => {
  let isMounted = true;
  if (isMounted && !viewerInstanceRef.current) {
    // Initialize viewer only once
  }
  return () => { isMounted = false; };
}, []);
```

### 17.2 VirtualTourPlugin Configuration

**CRITICAL**: Use `positionMode: 'manual'` (NOT 'gps')

The current database schema doesn't include GPS coordinates. Manual mode calculates positions automatically from the `links` field.

### 17.3 React-Three-Fiber Geometry

**CRITICAL DISCOVERY**: Cannot use `<primitive object={geometry}>` for THREE.Geometry objects.

```typescript
// ❌ WRONG - will fail silently
<primitive object={new THREE.ConeGeometry(2, 1.5, 8, 1)} />

// ✅ CORRECT - declarative component
<coneGeometry args={[2, 1.5, 8, 1]} />
```

### 17.4 Knowledge File Loading on Vercel

**Important**: Using `fs` module with `process.cwd()` for file paths:

```typescript
const filePath = path.join(process.cwd(), 'knowledge', 'landmarks', category, `${slug}.md`);
```

This works because Next.js includes the `knowledge/` directory in the build output.

### 17.5 Token Management Strategy

**Max tokens per knowledge block**: 600 tokens
**Estimation method**: `text.length / 4` (rough approximation)
**Truncation**: Smart sentence-boundary truncation

---

## 18. Updated Folder Structure

```
src/
  app/
    layout.tsx
    page.tsx
    api/
      chat/
        story/
          route.ts        # ← Enhanced with knowledge + prompt guard
  components/
    canvas/
      SkyIsland.tsx
      AtmosphereEffects.tsx
    explore/
      PanoramaViewer.tsx
    ui/
      FilterSidebar.tsx
      NPCModal.tsx         # ← Passes category to API
      TransitionOverlay.tsx
      ProductDetailModal.tsx
      Compass.tsx
  lib/
    supabase.ts
    knowledge.ts           # ← NEW: Knowledge loader + prompt guard
    constants.ts

knowledge/                  # ← NEW: Root-level knowledge base
  opung-skills.md
  glossary.md
  landmarks/
    folklore/*.md (5)
    music/*.md (5)
    food/*.md (5)
    history/*.md (5)
    nature/*.md (5)
```

---

## 19. Phase 6 Progress Log (Updated: 2026-01-09)

### Completed:
✔ Knowledge base directory structure created
✔ `opung-skills.md` persona definition written
✔ `glossary.md` with EN/ID/BT translations
✔ All 25 landmark knowledge files enhanced (~1000 words each)
✔ `knowledge.ts` with caching, truncation, and context building
✔ Prompt guard integration using `llama-prompt-guard-2-86m`
✔ API route updated to inject knowledge context
✔ NPCModal passes `category` parameter
✔ Build verification passed

### Pending:
□ Live testing of chat functionality
□ Prompt injection testing
□ Performance monitoring of cache hit rates