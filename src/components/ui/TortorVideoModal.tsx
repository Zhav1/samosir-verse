import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useVideoTexture, Html, DeviceOrientationControls } from '@react-three/drei';
import { X, Volume2, VolumeX, Smartphone } from 'lucide-react';
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

// Custom FOV Zoom Handler (Desktop Wheel + Mobile Pinch) with Smooth Damping
function ZoomHandler() {
  const { camera, gl } = useThree();
  const targetFov = useRef<number>(75); // Initial FOV target
  const initialPinchDistance = useRef<number>(0);

  // Smooth Animation Loop (Lerp to target FOV)
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const smoothing = 0.1; // Lower = smoother/slower, Higher = snappier

    // Only update if there's a meaningful difference
    if (Math.abs(cam.fov - targetFov.current) > 0.1) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov.current, smoothing);
      cam.updateProjectionMatrix();
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;

    // Desktop: Mouse Wheel Handler (Updates Target FOV)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.03; // Reduced sensitivity for smoother feel
      targetFov.current = THREE.MathUtils.clamp(targetFov.current + delta, 30, 100);
    };

    // Mobile: Pinch Gesture Handler (Updates Target FOV)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance.current = Math.hypot(
          touch2.pageX - touch1.pageX,
          touch2.pageY - touch1.pageY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance.current > 0) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.pageX - touch1.pageX,
          touch2.pageY - touch1.pageY
        );

        const delta = (initialPinchDistance.current - currentDistance) * 0.08; // Reduced for smoothness
        targetFov.current = THREE.MathUtils.clamp(targetFov.current + delta, 30, 100);

        initialPinchDistance.current = currentDistance; // Update for next move
      }
    };

    const handleTouchEnd = () => {
      initialPinchDistance.current = 0;
    };

    // Attach listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl]);

  return null; // This is a logic-only component
}

export function TortorVideoModal() {
  const { isTortorModalOpen, setTortorModalOpen } = useAppStore();
  const [isMuted, setIsMuted] = useState(true);
  const [isGyroEnabled, setIsGyroEnabled] = useState(false);

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
            {/* 1. OrbitControls: For rotation only (zoom disabled - using custom FOV zoom) */}
            <OrbitControls
              enableZoom={false}      // DISABLED - using custom FOV zoom
              enablePan={false}       // Keep camera centered
              enableDamping={true}    // Smooth stop
              dampingFactor={0.05}
              rotateSpeed={-0.5}      // Drag direction fix
            />

            {/* 2. Custom FOV Zoom Handler (Wheel + Pinch) */}
            <ZoomHandler />

            {/* 3. DeviceOrientationControls: ONLY when Gyro is manually enabled */}
            {isMobile && isGyroEnabled && <DeviceOrientationControls />}
          </Suspense>
        </Canvas>
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-6 right-6 z-[80] flex gap-4">
        {/* Gyro Toggle (Mobile Only) */}
        {isMobile && (
          <button
            onClick={() => setIsGyroEnabled(!isGyroEnabled)}
            className={`p-3 rounded-full transition-colors backdrop-blur-md border pointer-events-auto ${isGyroEnabled
                ? 'bg-white text-black border-white hover:bg-gray-200'
                : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
            title={isGyroEnabled ? "Disable Gyroscope" : "Enable Gyroscope"}
          >
            <Smartphone size={24} />
          </button>
        )}

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md border border-white/20 pointer-events-auto"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        {/* Close Button */}
        <button
          onClick={() => setTortorModalOpen(false)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md border border-white/20 pointer-events-auto"
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
