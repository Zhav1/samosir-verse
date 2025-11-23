"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AtmosphereEffects() {
    const particlesRef = useRef<THREE.Points>(null);

    // Create particle positions
    const particles = useMemo(() => {
        const count = 200;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15; // x
            positions[i * 3 + 1] = Math.random() * 10; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
        }

        return positions;
    }, []);

    // Animate particles
    useFrame((state, delta) => {
        if (!particlesRef.current) return;

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            // Drift upward slowly
            positions[i + 1] += delta * 0.2;

            // Loop back to bottom when reaching top
            if (positions[i + 1] > 10) {
                positions[i + 1] = 0;
            }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
}
