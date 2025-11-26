import { Suspense, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useVideoTexture, Html, DeviceOrientationControls } from '@react-three/drei';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';

function VideoSphere({ isMuted }: { isMuted: boolean }) {
  // Load the video texture using Drei's hook
  const texture = useVideoTexture('/videos/tortor.mp4', {
    unsuspend: 'canplay',
    muted: isMuted,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: 'Anonymous',
  });

  // "Anti-Burik" Strategy: Visual Quality Upgrades
  useEffect(() => {
    if (texture) {
      // 1. Sharpness & Filtering
      texture.generateMipmaps = false; // Prevents blurriness
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat; // Ensure correct format
      
      // 2. Color Correction (Fix washed-out colors)
      texture.colorSpace = THREE.SRGBColorSpace;
      
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Handle mute toggling
  useEffect(() => {
    if (texture.image) {
      texture.image.muted = isMuted;
    }
  }, [isMuted, texture]);

  // Cleanup on Unmount (Soft Cleanup)
  useEffect(() => {
    return () => {
      const videoElement = texture.image;
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
        // DO NOT clear src or load() here, as useVideoTexture caches the element
      }
      // DO NOT dispose texture here to allow re-use
    };
  }, [texture]);

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* High-Poly Geometry: 128 segments to prevent distortion */}
      <sphereGeometry args={[500, 128, 128]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.BackSide} />
    </mesh>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white text-sm font-medium">Loading Experience...</p>
      </div>
    </Html>
  );
}

export function TortorVideoModal() {
  const { isTortorModalOpen, setTortorModalOpen } = useAppStore();
  const [isMuted, setIsMuted] = useState(true);

  // Platform Detection
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // Reset mute state when modal opens
  useEffect(() => {
    if (isTortorModalOpen) {
      setIsMuted(true);
    }
  }, [isTortorModalOpen]);

  if (!isTortorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
      {/* Canvas Container */}
      <div className="w-full h-full relative">
        <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
          <Suspense fallback={<Loader />}>
            <VideoSphere isMuted={isMuted} />
            
            {/* Adaptive Controls */}
            {/* 1. OrbitControls: Enabled for everyone (Drag to look, Scroll/Pinch to Zoom) */}
            <OrbitControls 
              enableZoom={true} 
              enablePan={false} 
              rotateSpeed={-0.5} // Negative for "drag scene" feel
              minDistance={1}
              maxDistance={100}
            />
            
            {/* 2. DeviceOrientationControls: ONLY for Mobile (Gyroscope) */}
            {isMobile && <DeviceOrientationControls />}
          </Suspense>
        </Canvas>
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-6 right-6 z-[80] flex gap-4">
        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md border border-white/20"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        {/* Close Button */}
        <button
          onClick={() => setTortorModalOpen(false)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md border border-white/20"
        >
          <X size={24} />
        </button>
      </div>

      {/* Overlay Title */}
      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-[80]">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Tor-Tor Dance</h2>
        <p className="text-white/80 text-sm">
          {isMobile 
            ? "Experience in 360° • Move phone or drag to look • Pinch to zoom" 
            : "Experience in 360° • Drag to look • Scroll to zoom"}
        </p>
      </div>
    </div>
  );
}
