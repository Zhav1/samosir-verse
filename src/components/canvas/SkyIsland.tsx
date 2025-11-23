"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { IslandMesh } from "./IslandMesh";
import { OceanPlane } from "./OceanPlane";
import { AtmosphereEffects } from "./AtmosphereEffects";
import { useCameraAnimation } from "@/hooks/useCameraAnimation";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import FilterSidebar from "@/components/ui/FilterSidebar";

export function SkyIsland() {
    const selectedLandmark3D = useAppStore((state) => state.selectedLandmark3D);
    const setViewMode = useAppStore((state) => state.setViewMode);
    const setCurrentNode = useAppStore((state) => state.setCurrentNode);
    const isCameraAnimating = useAppStore((state) => state.isCameraAnimating);
    const setCurrentLandmark = useAppStore((state) => state.setCurrentLandmark);
    const setNPCModalOpen = useAppStore((state) => state.setNPCModalOpen);
    const [showEnterButton, setShowEnterButton] = useState(false);

    // Show "Enter 360° View" button 3 seconds after camera animation completes
    useEffect(() => {
        if (selectedLandmark3D && !isCameraAnimating) {
            const timer = setTimeout(() => {
                setShowEnterButton(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowEnterButton(false);
        }
    }, [selectedLandmark3D, isCameraAnimating]);

    const handleEnter360View = () => {
        if (!selectedLandmark3D) return;

        setCurrentNode(selectedLandmark3D.nodeId);

        // Auto-open NPC Modal
        if (selectedLandmark3D.landmark) {
            setCurrentLandmark(selectedLandmark3D.landmark);
            setNPCModalOpen(true);
        }

        // Determine if this should be panorama or static-image based on landmark
        const landmark = selectedLandmark3D.landmark;
        console.log('🎯 Enter View clicked for:', {
            title: landmark.title,
            category: landmark.category,
            display_mode: landmark.display_mode,
            nodeId: selectedLandmark3D.nodeId
        });

        // Only use static-image if explicitly set in display_mode
        if (landmark.display_mode === 'static-image') {
            console.log('📸 Setting view mode to static-image');
            setViewMode('static-image');
        } else {
            // Default to panorama for all categories
            console.log('🌍 Setting view mode to 360-panorama');
            setViewMode('360-panorama');
        }
    };

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 to-sky-100">
            {/* FilterSidebar - Should be visible in 3D view! */}
            <div className="absolute left-0 top-0 h-full z-50">
                <FilterSidebar />
            </div>

            {/* 3D Canvas */}
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 10, 0]} fov={50} />

                {/* Golden Hour Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={3.0}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    color="#ffd700"
                />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffaa00" />

                {/* Scene Objects */}
                <IslandMesh />
                <OceanPlane />

                {/* Phase 5: Atmosphere Effects */}
                <AtmosphereEffects />

                {/* Camera Controls - Phase 5: Enhanced with zoom */}
                <OrbitControls
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={30}
                    enablePan={false}
                    enableRotate={!selectedLandmark3D}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 2.2}
                    autoRotate={!selectedLandmark3D}
                    autoRotateSpeed={0.5}
                />

                {/* Camera Animation Hook */}
                <CameraAnimationController />
            </Canvas>

            {/* Overlay Text */}
            {!selectedLandmark3D && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-center"
                    >
                        <h1 className="text-6xl font-bold text-white drop-shadow-2xl mb-4">
                            Samosir 360
                        </h1>
                        <p className="text-xl text-white/90 drop-shadow-lg mb-8">
                            Explore the Cultural Heritage of Samosir Island
                        </p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-white/80 text-sm"
                        >
                            Click on a glowing landmark to explore
                        </motion.div>
                    </motion.div>
                </div>
            )}

            {/* Phase 5: Enter 360° View Button */}
            <AnimatePresence>
                {(selectedLandmark3D && !isCameraAnimating && showEnterButton) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
                    >
                        <button
                            onClick={handleEnter360View}
                            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-md border-2 border-white/30 rounded-full text-white hover:from-purple-600/95 hover:to-blue-600/95 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 text-lg font-semibold"
                        >
                            <span>Enter View</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper component to use the camera animation hook inside Canvas
function CameraAnimationController() {
    useCameraAnimation();
    return null;
}
