# Background Music & UI Fixes Implementation Plan

## Goal
Add background music (`ambience-song.mp3`) with volume controls in the Filter Modal and Panorama Page. Ensure responsive design and fix UI overlaps on mobile.

## User Review Required
> [!IMPORTANT]
> I will be moving the audio state to the global store to share volume and playing status across components.

## Proposed Changes

### Store
#### [MODIFY] [useAppStore.ts](file:///d:/College/BUDAYA_GO/samosir-verse/src/store/useAppStore.ts)
- Add `isAudioPlaying`, `volume`, `setVolume`, `setIsAudioPlaying` to `AppState`.

### Components
#### [NEW] [BackgroundMusic.tsx](file:///d:/College/BUDAYA_GO/samosir-verse/src/components/ui/BackgroundMusic.tsx)
- A component that initializes `useAudio` with `ambience-song.mp3`.
- **CRITICAL**: Set `loop: true` in `useAudio` options to ensure continuous playback.
- Syncs local audio state with the global store.
- **CRITICAL**: Mounted in `src/app/layout.tsx` to ensure audio persists across page navigation.

#### [MODIFY] [FilterSidebar.tsx](file:///d:/College/BUDAYA_GO/samosir-verse/src/components/ui/FilterSidebar.tsx)
- Add a volume slider section.
- Use `useAppStore` to control volume.

#### [NEW] [VolumeControl.tsx](file:///d:/College/BUDAYA_GO/samosir-verse/src/components/ui/VolumeControl.tsx)
- A floating button for the Panorama page.
- On click, reveals a vertical volume slider.
- Positioned to avoid overlaps (e.g., bottom-right or top-right, distinct from Gyroscope/Chat).

#### [MODIFY] [page.tsx](file:///d:/College/BUDAYA_GO/samosir-verse/src/app/page.tsx)
- Mount `BackgroundMusic`.
- Mount `VolumeControl` in the Panorama view section.
- Adjust existing buttons (Chat, Return) if necessary to prevent overlap.

#### [MODIFY] [NPCModal.tsx](file:///d:/College/BUDAYA_GO/samosir-verse/src/components/ui/NPCModal.tsx)
- Adjust z-index or margins to prevent the close button from overlapping with other UI elements on mobile.

## Verification Plan

### Manual Verification
1.  **Audio Playback**:
    - Open the app. Verify `ambience-song.mp3` plays (might require user interaction due to browser autoplay policies).
    - Check if the music loops.
2.  **Volume Control (Filter Sidebar)**:
    - Open Filter Sidebar.
    - Adjust volume slider. Verify music volume changes.
3.  **Volume Control (Panorama Page)**:
    - Go to Panorama view.
    - Click the new Volume button.
    - Adjust the popup slider. Verify music volume changes.
    - Ensure the button doesn't overlap with Gyroscope or Chat button.
4.  **Mobile Overlaps**:
    - Switch to mobile view (dev tools).
    - Open Hasapi detail modal (if applicable) or NPC Modal.
    - Verify the Close button is clickable and doesn't overlap with the OpenAI chat button.
