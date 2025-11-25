'use client';

import { useEffect, useState, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { Landmark } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';

interface MarkerManagerProps {
    viewer: Viewer | null;
}

export default function MarkerManager({ viewer }: MarkerManagerProps) {
    const { currentNodeId, activeFilters, setCurrentLandmark, setNPCModalOpen, setItemDetailId } = useAppStore();
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const markersPluginRef = useRef<MarkersPlugin | null>(null);
    const { t } = useTranslation();

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

        // Add Special Hasapi Marker
        console.log('Checking for Hasapi marker. Current Node:', currentNodeId);
        if (currentNodeId?.includes('simanindo') || currentNodeId === 'hasapi') {
            console.log('Adding Hasapi marker...');
            try {
                markersPlugin.addMarker({
                    id: 'hasapi',
                    position: { yaw: 6.2739, pitch: -0.4881 },
                    html: `
                      <div class="group relative flex items-center justify-center" style="width: 100%; height: 100%; overflow: visible;">
                        <!-- Hitbox Transparan (Area Klik) -->
                        <div class="absolute inset-0 hover: transition-colors cursor-pointer rounded-lg"></div>
                        
                        <!-- Floating Button (Muncul saat Hover group) -->
                        <div class="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0" style="pointer-events: auto;">
                          <button class="js-hasapi-detail-btn bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 hover:bg-white whitespace-nowrap">
                            <span>🔍 ${t('explore.viewDetail')}</span>
                          </button>
                        </div>
                      </div>
                    `,
                    size: { width: 80, height: 450 },
                    anchor: 'center center',
                    tooltip: 'Hasapi (Batak Lute)',
                    data: {
                        id: 'hasapi',
                        title: 'Hasapi',
                        category: 'music',
                        description: 'Traditional Batak Lute',
                        node_id: currentNodeId,
                        coordinates: { yaw: 6.2739, pitch: -0.4881 }
                    } as any,
                });
                console.log('Hasapi marker added successfully');
            } catch (e) {
                console.error('Error adding Hasapi marker:', e);
            }
        } else {
            console.log('Skipping Hasapi marker (not in simanindo)');
        }

        // Handle marker clicks
        const handleMarkerClick = (e: any) => {
            const landmark = e.marker.data;
            // Only open NPC modal if it's NOT the Hasapi object
            if (landmark.id === 'hasapi') {
                setItemDetailId('hasapi');
            } else {
                setCurrentLandmark(landmark);
                setNPCModalOpen(true);
            }
        };

        markersPlugin.addEventListener('select-marker', handleMarkerClick);

        return () => {
            markersPlugin.removeEventListener('select-marker', handleMarkerClick);
        };
    }, [viewer, landmarks, activeFilters, setCurrentLandmark, setNPCModalOpen]);

    // Handle custom button clicks for Hasapi (Bypassing Viewer Events)
    useEffect(() => {
        const handleCustomClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const btn = target.closest('.js-hasapi-detail-btn');
            if (btn) {
                // e.stopPropagation(); // Optional: might need this if it bubbles to viewer
                console.log('Hasapi detail button clicked via DOM listener');
                setItemDetailId('hasapi');
            }
        };

        // Use capture phase to ensure we get it before viewer swallows it (if it does)
        document.addEventListener('click', handleCustomClick, true);
        return () => document.removeEventListener('click', handleCustomClick, true);
    }, [setItemDetailId]);

    return null; // This is a logic-only component
}
