"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function OceanPlane() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;
        const geometry = meshRef.current.geometry;
        const position = geometry.attributes.position;

        // ---------------------------------------------------------
        // WAVE SETTINGS
        // ---------------------------------------------------------
        // Match Island Speed: You used 0.3 for the island, so we use 0.3 here.
        const speed = 0.5; 
        
        // Frequency: Lower number = wider, larger waves (better for huge oceans)
        const frequency = 0.2; 
        
        // Amplitude: How high the waves go
        const amplitude = 0.2; 
        // ---------------------------------------------------------

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i); // This is actually Z in world space before rotation

            // We combine two sine waves for a more organic look
            const wave1 = Math.sin(x * frequency + time * speed);
            const wave2 = Math.cos(y * frequency + time * (speed * 0.8)); // Slightly different speed
            
            // Apply height
            position.setZ(i, (wave1 + wave2) * amplitude);
        }
        
        position.needsUpdate = true;
    });

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.5, 0]} // Lowered slightly so it doesn't clip through the island bottom
            receiveShadow
        >
            {/* args: [width, height, segments, segments] 
               Size: 500 (Huge)
               Segments: 64 (Enough detail without crashing the browser)
            */}
            <planeGeometry args={[50, 50, 32, 32]} />
            
            <meshStandardMaterial
                color="#0477bf"
                metalness={0.8}     // Increased for more reflection
                roughness={0.2}     // Lowered so it looks 'wet' and shiny
                transparent
                opacity={1}
                flatShading={false} // Smooths the look
            />
        </mesh>
    );
}
