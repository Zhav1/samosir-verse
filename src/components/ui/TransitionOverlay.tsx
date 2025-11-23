"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState, useRef } from 'react';

export function TransitionOverlay() {
    const viewMode = useAppStore((state) => state.viewMode);
    const [isVisible, setIsVisible] = useState(false);

    // Use useRef for previous value to prevent extra render cycles
    const prevViewModeRef = useRef(viewMode);

    useEffect(() => {
        const prevViewMode = prevViewModeRef.current;

        // Check if viewMode actually changed
        if (prevViewMode !== viewMode) {

            // Logic: Transition when entering OR leaving any immersive mode (360-panorama or static-image)
            // We do NOT want to transition between '3d-sky' and '3d-focused' (that's just a camera zoom)
            const isEnteringImmersive = viewMode === '360-panorama' || viewMode === 'static-image';
            const isLeavingImmersive = prevViewMode === '360-panorama' || prevViewMode === 'static-image';

            if (isEnteringImmersive || isLeavingImmersive) {
                setIsVisible(true);

                // Force visibility off after animation duration
                // 1000ms = 500ms fade in + small pause + 500ms fade out logic
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 1000);

                // Update the ref
                prevViewModeRef.current = viewMode;

                // Cleanup to prevent memory leaks, but we generally want the timer to finish
                return () => clearTimeout(timer);
            }

            // Update ref even if we didn't trigger a transition
            prevViewModeRef.current = viewMode;
        }
    }, [viewMode]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="white-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="fixed inset-0 bg-white z-[9999] pointer-events-none"
                />
            )}
        </AnimatePresence>
    );
}