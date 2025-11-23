"use client";

import { useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { LandmarkManager3D } from "./LandmarkManager3D";

function SamosirModel() {
    const meshRef = useRef<THREE.Group>(null);
    const hoverRef = useRef(false);

    // Load the Samosir Island GLB model
    const gltf = useGLTF('/models/samosir-2.glb');

    // Clone the scene to avoid material sharing issues
    const scene = gltf.scene.clone(true);

    // Traverse the scene to fix materials and enable proper rendering
    scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            // Enable shadows for all meshes
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Ensure materials are properly configured
            if (mesh.material) {
                const material = mesh.material as THREE.MeshStandardMaterial;

                // Ensure the material side is correct (sometimes Blender exports with wrong side)
                material.side = THREE.FrontSide;

                // Force the material to update
                material.needsUpdate = true;

                // If there's a map (diffuse texture), ensure it's properly configured
                if (material.map) {
                    material.map.needsUpdate = true;
                    material.map.colorSpace = THREE.SRGBColorSpace;
                }

                // Ensure proper metalness and roughness for realistic rendering
                if (material.roughness === undefined) material.roughness = 1;
                if (material.metalness === undefined) material.metalness = 0;
            }
        }
    });

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Auto-rotation, slowed when hovered
        const rotationSpeed = hoverRef.current ? 0.1 : 0.2;
        meshRef.current.rotation.y += delta * rotationSpeed;

        // Gentle floating animation
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.5;
    });


    return (
        <group
            ref={meshRef}
            position={[0, 0, 0]}
            scale={0.0005}
            onPointerEnter={() => (hoverRef.current = true)}
            onPointerLeave={() => (hoverRef.current = false)}
        >
            <primitive object={scene} />

            {/* Phase 5: 3D Landmarks - as children so they rotate/float with the island */}
            <group scale={2000}>
                <LandmarkManager3D />
            </group>
        </group>
    );
}

export function IslandMesh() {
    return (
        <Suspense fallback={<PlaceholderIsland />}>
            <SamosirModel />
        </Suspense>
    );
}

// Placeholder cone while GLB loads
function PlaceholderIsland() {
    return (
        <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[2, 1.5, 8, 1]} />
            <meshStandardMaterial
                color="#3a7f5f"
                flatShading
                roughness={0.8}
                metalness={0.2}
            />
        </mesh>
    );
}

// Preload the model for better performance
useGLTF.preload('/models/samosir-2.glb');
