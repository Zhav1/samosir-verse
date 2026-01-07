import React, { useRef, useEffect } from 'react';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Opung3D() {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/village_head.glb');

    useEffect(() => {
        console.log('Opung3D Scene Graph (Village Head):', scene);
        let meshCount = 0;
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                console.log('Mesh found:', child.name, (child as THREE.Mesh).geometry, (child as THREE.Mesh).material);
                meshCount++;
            }
        });
        if (meshCount === 0) {
            console.warn('⚠️ NO MESHES FOUND IN VILLAGE_HEAD.GLB');
        } else {
            console.log(`✅ Found ${meshCount} meshes in village_head.glb`);
        }
    }, [scene]);

    return (
        <group ref={group} dispose={null}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                <primitive
                    object={scene}
                    scale={0.14}
                    position={[0, -8, 0]}
                    rotation={[0, 0, 0]}
                />
            </Float>
        </group>
    );
}

useGLTF.preload('/models/village_head.glb');
