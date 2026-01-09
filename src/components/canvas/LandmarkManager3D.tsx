"use client";

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { Landmark3D } from './Landmark3D';
import type { Landmark } from '@/types';

export function LandmarkManager3D() {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [loading, setLoading] = useState(true);
    const activeFilters = useAppStore((state) => state.activeFilters);

    useEffect(() => {
        fetchLandmarks();
    }, []);

    const fetchLandmarks = async () => {
        try {
            console.log('🔍 [LandmarkManager3D] Fetching landmarks with position_3d...');

            const { data, error } = await supabase
                .from('landmarks')
                .select('*')
                .not('position_3d', 'is', null);

            if (error) {
                console.error('❌ [LandmarkManager3D] Error fetching 3D landmarks:', error);
                return;
            }

            console.log(`✅ [LandmarkManager3D] Fetched ${data?.length || 0} landmarks with position_3d`);
            if (data && data.length > 0) {
                console.log('📍 [LandmarkManager3D] First landmark:', data[0]);
            }

            setLandmarks(data || []);
        } catch (err) {
            console.error('❌ [LandmarkManager3D] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter landmarks based on active filters
    const visibleLandmarks = landmarks.filter((landmark) =>
        activeFilters.includes(landmark.category)
    );

    console.log(`🎯 [LandmarkManager3D] Active filters: [${activeFilters.join(', ')}]`);
    console.log(`🎯 [LandmarkManager3D] Visible landmarks: ${visibleLandmarks.length}/${landmarks.length}`);

    if (loading) return null;

    return (
        <group>
            {visibleLandmarks.map((landmark) => {
                if (!landmark.position_3d) return null;

                const position = new THREE.Vector3(
                    landmark.position_3d.x,
                    landmark.position_3d.y,
                    landmark.position_3d.z
                );

                return (
                    <Landmark3D
                        key={landmark.id}
                        id={landmark.id}
                        position={position}
                        nodeId={landmark.node_id}
                        title={landmark.title}
                        category={landmark.category}
                        landmark={landmark}
                    />
                );
            })}
        </group>
    );
}
