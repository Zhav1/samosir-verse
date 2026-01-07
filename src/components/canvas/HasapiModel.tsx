import React, { useRef } from 'react';
import { useGLTF, Stage, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HasapiModel() {
  // Load GLB (pastikan file ada di public/models/)
  const { scene } = useGLTF('/models/hasapi_3d.glb');
  const meshRef = useRef<THREE.Group>(null);

  // Optional: Slow rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <primitive
          ref={meshRef}
          object={scene}
          scale={1.5} // Sesuaikan scale agar pas di layar
        />
      </Float>
    </Stage>
  );
}

// Preload agar tidak lag saat dibuka
useGLTF.preload('/models/hasapi_3d.glb');