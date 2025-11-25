import { Canvas } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';
import { X, Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HasapiModel from '@/components/canvas/HasapiModel';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { LocalizedText } from '@/components/ui/LocalizedText';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-sm font-medium">{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  );
}

export default function ItemDetailModal() {
  const { itemDetailId, setItemDetailId } = useAppStore();
  const { t } = useTranslation();

  // Check if this specific modal should be open
  const isOpen = itemDetailId === 'hasapi';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">

            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setItemDetailId(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Title Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                Hasapi
              </h2>
              <p className="text-gray-300 text-sm mt-1">The Melody of Batak</p>
            </div>

            {/* 3D Canvas */}
            <div className="w-full h-full cursor-move">
              <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
                <Suspense fallback={<Loader />}>
                  <HasapiModel />
                  <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={false}
                  />
                </Suspense>
              </Canvas>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
              <p className="text-white/50 text-xs uppercase tracking-widest">
                <LocalizedText text={t('itemDetail.dragRotate')} />
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}