'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut } from 'lucide-react';

export default function StaticImageViewer() {
    const currentLandmark = useAppStore((state) => state.currentLandmark);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (!currentLandmark?.image_asset) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <p className="text-white/70">No image available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-white/70">Loading image...</p>
                    </div>
                </div>
            )}

            {/* Main Image */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
            >
                <img
                    src={currentLandmark.image_asset}
                    alt={currentLandmark.title}
                    className={`max-w-full max-h-full transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                    style={{ objectFit: 'contain' }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    onClick={() => setIsZoomed(!isZoomed)}
                />
            </motion.div>

            {/* Zoom Controls */}
            {!isLoading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex gap-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl">
                        <button
                            onClick={() => setIsZoomed(false)}
                            className={`p-3 rounded-full transition-all ${!isZoomed
                                    ? 'bg-white/20 text-white'
                                    : 'bg-transparent text-white/50 hover:bg-white/10'
                                }`}
                            aria-label="Fit to screen"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsZoomed(true)}
                            className={`p-3 rounded-full transition-all ${isZoomed
                                    ? 'bg-white/20 text-white'
                                    : 'bg-transparent text-white/50 hover:bg-white/10'
                                }`}
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Image Info Overlay */}
            <div className="absolute top-8 left-8 z-20 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl max-w-md">
                <h2 className="text-2xl font-bold text-white mb-1">
                    {currentLandmark.title}
                </h2>
                <p className="text-white/70 text-sm capitalize">
                    {currentLandmark.category}
                </p>
            </div>
        </div>
    );
}
