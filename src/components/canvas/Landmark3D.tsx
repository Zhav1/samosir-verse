"use client";

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_COLORS } from '@/lib/constants';
import type { Category } from '@/lib/constants';

import { Landmark } from '@/types';

interface Landmark3DProps {
    id: string;
    position: THREE.Vector3;
    nodeId: string;
    title: string;
    category: Category;
    landmark: Landmark;
}

export function Landmark3D({ id, position, nodeId, title, category, landmark }: Landmark3DProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const setSelectedLandmark3D = useAppStore((state) => state.setSelectedLandmark3D);
    const setViewMode = useAppStore((state) => state.setViewMode);

    // Pulsing animation
    useFrame((state) => {
        if (!meshRef.current) return;

        const scale = hovered
            ? 1.4
            : 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.1; // 1.0 → 1.1 → 1.0

        meshRef.current.scale.setScalar(scale);
    });

    const handleClick = () => {
        // Store the landmark data
        setSelectedLandmark3D({
            id,
            position,
            nodeId,
            title,
            landmark,
        });

        // Determine view mode based on display_mode or fallback logic
        const targetViewMode = determineViewMode(landmark);

        if (targetViewMode === 'static-image') {
            // For static images, go directly to the image viewer
            setViewMode('static-image');
        } else {
            // For panoramas, use the focus animation first
            setViewMode('3d-focused');
        }
    };

    // Helper function to determine the appropriate view mode
    const determineViewMode = (landmark: Landmark): '3d-focused' | 'static-image' => {
        // If display_mode is explicitly set to static-image, use it
        if (landmark.display_mode === 'static-image') {
            return 'static-image';
        }

        // Default to panorama mode for all categories
        return '3d-focused';
    };

    const color = CATEGORY_COLORS[category];

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 1.0 : 0.5}
                    roughness={0.3}
                    metalness={0.8}
                />
            </mesh>

            {/* Tooltip on hover */}
            {hovered && (
                <Html
                    position={[0, 0.3, 0]}
                    center
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <div className="bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm">
                        {title}
                    </div>
                </Html>
            )}
        </group>
    );
}
