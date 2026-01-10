"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SkyIsland } from "@/components/canvas/SkyIsland";
import { TransitionOverlay } from "@/components/ui/TransitionOverlay";
import PanoramaViewer from "@/components/explore/PanoramaViewer";
import StaticImageViewer from "@/components/viewer/StaticImageViewer";
import { NPCModal } from "@/components/ui/NPCModal";
import { useAppStore } from "@/store/useAppStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTranslation } from "@/hooks/useTranslation";
import { LocalizedText } from "@/components/ui/LocalizedText";
import { MessageCircle } from "lucide-react";
import { ProductDetailModal } from "@/components/ui/ProductDetailModal";
import { getProductById } from "@/lib/mockProducts";
import { TortorVideoModal } from "@/components/ui/TortorVideoModal";
import { VolumeControl } from "@/components/ui/VolumeControl";
import { GamificationProvider } from "@/components/providers/GamificationProvider";

function HomeContent() {
  const {
    viewMode,
    setCurrentNode,
    setViewMode,
    setSelectedLandmark,
    itemDetailId,
    setItemDetailId,
    isNPCModalOpen,
    setNPCModalOpen,
    isTortorModalOpen
  } = useAppStore();

  const searchParams = useSearchParams();

  // Deep linking support
  useEffect(() => {
    const nodeId = searchParams.get('node');
    const landmarkId = searchParams.get('landmark');

    if (nodeId) {
      // Navigate to specific node
      setCurrentNode(nodeId);
      setViewMode('360-panorama');

      // If landmark is specified, auto-select it
      if (landmarkId) {
        setSelectedLandmark(landmarkId);
      }
    }
  }, [searchParams, setCurrentNode, setViewMode, setSelectedLandmark]);

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
            {/* Sidebar is only visible in panorama mode */}
            <div className="w-full h-full relative">
              {/* Panorama Viewer - Full screen */}
              <div className="absolute inset-0 z-10">
                <PanoramaViewer />
              </div>

              {/* Floating Chat Button - Only visible when NPC Modal is closed AND no item detail is open */}
              {!isNPCModalOpen && !itemDetailId && (
                <button
                  onClick={() => setNPCModalOpen(true)}
                  className="fixed top-5 right-5 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Open Chat"
                >
                  <MessageCircle className="w-6 h-6 text-white group-hover:text-amber-400 transition-colors" />
                </button>
              )}
            </div>

            {/* NPC Modal Sidebar */}
            <NPCModal />

            {/* Return to Sky View button */}
            <div className="absolute top-0 left-0 w-full z-50">
              <ReturnToSkyButton />
            </div>

            {/* Volume Control */}
            <div className="fixed bottom-6 right-6 z-50 ">
              <VolumeControl />
            </div>
          </ErrorBoundary>
        </main>
      )}

      {viewMode === 'static-image' && (
        <main className="w-full h-screen overflow-hidden relative bg-black">
          <ErrorBoundary>
            <div className="w-full h-full relative">
              {/* Static Image Viewer - Full screen */}
              <div className="absolute inset-0 z-10">
                <StaticImageViewer />
              </div>

              {/* Floating Chat Button - Only visible when NPC Modal is closed AND no item detail is open */}
              {!isNPCModalOpen && !itemDetailId && (
                <button
                  onClick={() => setNPCModalOpen(true)}
                  className="fixed top-4 right-16 md:right-4 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Open Chat"
                >
                  <MessageCircle className="w-6 h-6 text-white group-hover:text-amber-400 transition-colors" />
                </button>
              )}
            </div>

            {/* NPC Modal Sidebar */}
            <NPCModal />

            {/* Return to Sky View button */}
            <div className="absolute top-0 left-0 w-full z-50">
              <ReturnToSkyButton />
            </div>

            {/* Volume Control */}
            <div className="fixed bottom-6 right-6 z-50">
              <VolumeControl />
            </div>
          </ErrorBoundary>
        </main>
      )}

      {/* Product Detail Modal for Hasapi/Marketplace items */}
      <ProductDetailModal
        product={itemDetailId ? getProductById(itemDetailId) || null : null}
        isOpen={!!itemDetailId && itemDetailId !== 'hasapi'}
        onClose={() => setItemDetailId(null)}
      />

      {/* Tor-Tor Video Modal - Conditionally rendered to prevent WebGL context loss */}
      {isTortorModalOpen && <TortorVideoModal />}
    </>
  );
}

export default function Home() {
  return (
    <GamificationProvider>
      <Suspense fallback={<div className="w-full h-screen bg-black" />}>
        <HomeContent />
      </Suspense>
    </GamificationProvider>
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
