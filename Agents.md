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
    page.tsx
    explore/page.tsx
  components/
    canvas/
      IslandMesh.tsx
      OceanPlane.tsx
      LandmarkManager3D.tsx
    viewer/
      SceneContainer.tsx
      MarkerManager.tsx
    ui/
      FilterSidebar.tsx
      NPCModal.tsx
      TransitionOverlay.tsx
      ProductCard.tsx
      Compass.tsx
  lib/
    supabase.ts


R3F cannot use <primitive object={new THREE.ConeGeometry}>
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
    page.tsx
    explore/page.tsx
  components/
    canvas/
      IslandMesh.tsx
      OceanPlane.tsx
      LandmarkManager3D.tsx
    viewer/
      SceneContainer.tsx
      MarkerManager.tsx
    ui/
      FilterSidebar.tsx
      NPCModal.tsx
      TransitionOverlay.tsx
      ProductCard.tsx
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