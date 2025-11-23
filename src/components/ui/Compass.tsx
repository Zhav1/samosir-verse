"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from 'lucide-react';

interface CompassProps {
    /**
     * Current yaw (rotation) in radians from PhotoSphereViewer
     * 0 = North, π/2 = East, π = South, 3π/2 = West
     */
    yaw: number;

    /**
     * Auto-hide on mobile after inactivity (milliseconds)
     */
    autoHideDelay?: number;
}

/**
 * Compass - Direction indicator HUD for 360 viewer
 * Shows N/S/E/W orientation based on current view rotation
 */
export function Compass({ yaw, autoHideDelay = 3000 }: CompassProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Convert yaw (radians) to degrees
    // PhotoSphereViewer: 0 = North, positive rotation = clockwise
    const degrees = ((yaw * 180) / Math.PI + 360) % 360;

    // Cardinal direction
    const getCardinalDirection = (deg: number): string => {
        if (deg >= 337.5 || deg < 22.5) return 'N';
        if (deg >= 22.5 && deg < 67.5) return 'NE';
        if (deg >= 67.5 && deg < 112.5) return 'E';
        if (deg >= 112.5 && deg < 157.5) return 'SE';
        if (deg >= 157.5 && deg < 202.5) return 'S';
        if (deg >= 202.5 && deg < 247.5) return 'SW';
        if (deg >= 247.5 && deg < 292.5) return 'W';
        return 'NW';
    };

    const direction = getCardinalDirection(degrees);

    // Reset activity timer when yaw changes
    useEffect(() => {
        setLastActivity(Date.now());
        setIsVisible(true);
    }, [yaw]);

    // Auto-hide on mobile after inactivity
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isMobile = window.innerWidth < 768;
        if (!isMobile) return;

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, autoHideDelay);

        return () => clearTimeout(timer);
    }, [lastActivity, autoHideDelay]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
                >
                    {/* Glassmorphism Container */}
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
                        {/* Compass Rose */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* Rotating North Indicator */}
                            <motion.div
                                animate={{ rotate: -degrees }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Navigation
                                    className="w-8 h-8 text-red-400"
                                    strokeWidth={2.5}
                                />
                            </motion.div>

                            {/* Cardinal Directions */}
                            <div className="absolute inset-0">
                                {/* North */}
                                <span
                                    className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-red-400"
                                    style={{ fontSize: '10px' }}
                                >
                                    N
                                </span>
                                {/* East */}
                                <span
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-white/60"
                                    style={{ fontSize: '10px' }}
                                >
                                    E
                                </span>
                                {/* South */}
                                <span
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-bold text-white/60"
                                    style={{ fontSize: '10px' }}
                                >
                                    S
                                </span>
                                {/* West */}
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-white/60"
                                    style={{ fontSize: '10px' }}
                                >
                                    W
                                </span>
                            </div>
                        </div>

                        {/* Direction Label */}
                        <div className="mt-2 text-center">
                            <span className="text-sm font-bold text-white tracking-wider">
                                {direction}
                            </span>
                            <div className="text-xs text-white/50 mt-1">
                                {Math.round(degrees)}°
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
