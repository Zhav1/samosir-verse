import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useSpring, config } from '@react-spring/three';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';

export function useCameraAnimation() {
    const { camera } = useThree();
    const hasZoomedOnLoad = useRef(false);
    const selectedLandmark3D = useAppStore((state) => state.selectedLandmark3D);
    const setIsCameraAnimating = useAppStore((state) => state.setIsCameraAnimating);

    // Camera animation spring
    const [, api] = useSpring(() => ({
        position: [camera.position.x, camera.position.y, camera.position.z],
        config: config.slow,
        onChange: ({ value }) => {
            camera.position.set(value.position[0], value.position[1], value.position[2]);
        },
    }));

    const flyToLandmark = (localPos: THREE.Vector3) => {
        setIsCameraAnimating(true);

        // Convert from landmark's local coordinates to world coordinates
        // Landmarks are children of island group which has:
        // - scale: 0.0005
        // - landmarks group scale: 2000 (cancel out to 1.0)
        // - floating animation on Y
        // So we can use the position directly, but need to account for floating
        
        // Position camera to view the landmark from a good angle
        const cameraDistance = 3; // Distance from landmark
        const cameraHeight = 1; // Height above landmark
        
        const cameraPos = new THREE.Vector3(
            localPos.x,
            localPos.y + cameraHeight,
            localPos.z + cameraDistance
        );

        api.start({
            position: [cameraPos.x, cameraPos.y, cameraPos.z],
            config: { ...config.slow, duration: 2000 },
            onRest: () => {
                setIsCameraAnimating(false);
            },
        });

        // Make camera look at the landmark
        camera.lookAt(localPos);
    };

    const returnToSkyView = () => {
        setIsCameraAnimating(true);

        api.start({
            position: [0, 2, 8],
            config: { ...config.slow, duration: 2000 },
            onRest: () => {
                setIsCameraAnimating(false);
            },
        });
    };

    const zoomOnLoad = () => {
        // Start from far away
        camera.position.set(0, 20, 30);

        setIsCameraAnimating(true);

        api.start({
            position: [0, 2, 8],
            config: { ...config.molasses, duration: 3000 },
            onRest: () => {
                setIsCameraAnimating(false);
            },
        });
    };

    // Zoom on load effect
    useEffect(() => {
        if (!hasZoomedOnLoad.current) {
            hasZoomedOnLoad.current = true;
            zoomOnLoad();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fly to landmark when selected
    useEffect(() => {
        if (selectedLandmark3D) {
            flyToLandmark(selectedLandmark3D.position);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLandmark3D]);



    return {
        flyToLandmark,
        returnToSkyView,
        zoomOnLoad,
    };
}
