"use client";

import { SkyIsland } from "@/components/canvas/SkyIsland";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";
import PanoramaViewer from "@/components/explore/PanoramaViewer";
import StaticImageViewer from "@/components/viewer/StaticImageViewer";
import { NPCModal } from "@/components/ui/NPCModal";
import { useAppStore } from "@/store/useAppStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTranslation } from "@/hooks/useTranslation";
import { LocalizedText } from "@/components/ui/LocalizedText";

export default function Home() {
  const viewMode = useAppStore((state) => state.viewMode);

  return (
    <>
      {/* Transition Overlay for smooth mode changes */}
      <TransitionOverlay />

      {/* Conditionally render based on view mode */}
      {(viewMode === '3d-sky' || viewMode === '3d-focused') && (
        <ErrorBoundary>
          <SkyIsland />
        </ErrorBoundary>
      )}

      {viewMode === '360-panorama' && (
        <main className="w-full h-screen overflow-hidden relative bg-black">
          <ErrorBoundary>
            {/* Panorama Viewer - Full screen */}
            <div className="absolute inset-0 z-10">
              <PanoramaViewer />
            </div>

            {/* NPC Modal Sidebar */}
            <NPCModal />

            {/* Return to Sky View button */}
            <div className="absolute top-0 left-0 w-full z-50">
              <ReturnToSkyButton />
            </div>
          </ErrorBoundary>
        </main>
      )}

      {viewMode === 'static-image' && (
        <main className="w-full h-screen overflow-hidden relative bg-black">
          <ErrorBoundary>
            {/* Static Image Viewer - Full screen */}
            <div className="absolute inset-0 z-10">
              <StaticImageViewer />
            </div>

            {/* NPC Modal Sidebar */}
            <NPCModal />

            {/* Return to Sky View button */}
            <div className="absolute top-0 left-0 w-full z-50">
              <ReturnToSkyButton />
            </div>
          </ErrorBoundary>
        </main>
      )}
    </>
  );
}

function ReturnToSkyButton() {
  const setViewMode = useAppStore((state) => state.setViewMode);
  const setSelectedLandmark3D = useAppStore((state) => state.setSelectedLandmark3D);
  const { t } = useTranslation();

  const handleReturn = () => {
    setViewMode('3d-sky');
    setSelectedLandmark3D(null);
  };

  return (
    <button
      onClick={handleReturn}
      className="fixed top-6 left-6 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 shadow-lg flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span className="font-medium"><LocalizedText text={t('explore.backToMap')} /></span>
    </button>
  );
}
