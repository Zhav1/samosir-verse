'use client';

import { useEffect, useState, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { Landmark } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/constants';

interface MarkerManagerProps {
    viewer: Viewer | null;
}

export default function MarkerManager({ viewer }: MarkerManagerProps) {
    const { currentNodeId, activeFilters, setCurrentLandmark, setNPCModalOpen } = useAppStore();
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const markersPluginRef = useRef<MarkersPlugin | null>(null);

    // Fetch landmarks for current node
    useEffect(() => {
        if (!currentNodeId) return;

        const fetchLandmarks = async () => {
            const { data, error } = await supabase
                .from('landmarks')
                .select('*')
                .eq('node_id', currentNodeId);

            if (error) {
                console.error('Error fetching landmarks:', error);
                return;
            }

            setLandmarks(data || []);
        };

        fetchLandmarks();
    }, [currentNodeId]);

    // Update markers when landmarks or filters change
    useEffect(() => {
        if (!viewer || landmarks.length === 0) return;

        // Get markers plugin
        try {
            markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
        } catch (e) {
            console.error('Markers plugin not found:', e);
            return;
        }

        const markersPlugin = markersPluginRef.current;
        if (!markersPlugin) return;

        // Clear existing markers
        markersPlugin.clearMarkers();

        // Filter landmarks based on active filters
        const filteredLandmarks = landmarks.filter(landmark =>
            activeFilters.includes(landmark.category)
        );

        // Add markers for filtered landmarks
        filteredLandmarks.forEach((landmark) => {
            const config = CATEGORY_CONFIG[landmark.category];

            try {
                markersPlugin.addMarker({
                    id: landmark.id,
                    position: {
                        yaw: landmark.coordinates.yaw,
                        pitch: landmark.coordinates.pitch
                    },
                    html: `
                        <div class="custom-marker pulse-marker" style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: ${config.color};
                            box-shadow: 0 0 20px ${config.color}80;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: transform 0.3s ease;
                        ">
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="white" 
                                stroke="white" 
                                stroke-width="2"
                            >
                                <circle cx="12" cy="12" r="8" />
                            </svg>
                        </div>
                    `,
                    tooltip: {
                        content: landmark.title,
                        position: 'top center',
                    },
                    data: landmark,
                });
            } catch (e) {
                console.error('Error adding marker:', e);
            }
        });

        // Handle marker clicks
        const handleMarkerClick = (e: { marker: { data: Landmark } }) => {
            const landmark = e.marker.data;
            setCurrentLandmark(landmark);
            setNPCModalOpen(true);
        };

        markersPlugin.addEventListener('select-marker', handleMarkerClick);

        return () => {
            markersPlugin.removeEventListener('select-marker', handleMarkerClick);
        };
    }, [viewer, landmarks, activeFilters, setCurrentLandmark, setNPCModalOpen]);

    return null; // This is a logic-only component
}
