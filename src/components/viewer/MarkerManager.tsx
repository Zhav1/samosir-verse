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
    // Use individual selectors for stability
    const currentNodeId = useAppStore(state => state.currentNodeId);
    const activeFilters = useAppStore(state => state.activeFilters);
    const setCurrentLandmark = useAppStore(state => state.setCurrentLandmark);
    const setNPCModalOpen = useAppStore(state => state.setNPCModalOpen);
    const setItemDetailId = useAppStore(state => state.setItemDetailId);
    const setTortorModalOpen = useAppStore(state => state.setTortorModalOpen);

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

        console.log('[MarkerManager] Total landmarks:', landmarks.length);
        console.log('[MarkerManager] Active filters:', activeFilters);
        console.log('[MarkerManager] Filtered landmarks:', filteredLandmarks.length);
        console.log('[MarkerManager] Filtered landmark IDs:', filteredLandmarks.map(l => l.id));

        // Add markers for filtered landmarks
        filteredLandmarks.forEach((landmark) => {
            const config = CATEGORY_CONFIG[landmark.category];

            // 1. Special Handling for Hasapi
            if (landmark.title === 'Hasapi') {
                try {
                    markersPlugin.addMarker({
                        id: 'hasapi', // Keep 'hasapi' ID for consistency with click handlers
                        position: {
                            yaw: 6.2739,
                            pitch: -0.4881
                        },
                        html: `
                          <div class="group relative flex items-center justify-center" style="width: 100%; height: 100%; overflow: visible;">
                            <!-- Hitbox Transparan (Area Klik) -->
                            <div class="absolute inset-0 hover: transition-colors cursor-pointer rounded-lg"></div>
                            
                            <!-- Floating Button (Always visible on mobile, Hover on Desktop) -->
                            <div class="absolute left-full ml-4 opacity-100 translate-x-0 md:opacity-0 md:group-hover:opacity-100 md:translate-x-[-10px] md:group-hover:translate-x-0 transition-all duration-300" style="pointer-events: auto;">
                              <button class="js-hasapi-detail-btn bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 hover:bg-white whitespace-nowrap">
                                <span>🔍 ${t('explore.viewDetail')}</span>
                              </button>
                            </div>
                          </div>
                        `,
                        size: { width: 80, height: 450 },
                        anchor: 'center center',
                        tooltip: 'Hasapi (Batak Lute)',
                        data: landmark,
                    });
                } catch (e) {
                    console.error('Error adding Hasapi marker:', e);
                }
                return; // Skip generic marker
            }

            // 2. Special Handling for Tor-Tor Dancers
            if (landmark.title === 'Tor-Tor Dance') {
                try {
                    markersPlugin.addMarker({
                        id: 'tortor-dancers', // Unique ID for click handler
                        position: {
                            yaw: 6.3039,
                            pitch: -0.2981
                        },
                        html: `
                          <div class="group relative flex items-center justify-center" style="width: 100%; height: 100%; overflow: visible;">
                            <!-- Hitbox Transparan (Area Klik) -->
                            <div class="absolute inset-0 hover: transition-colors cursor-pointer rounded-lg border border-transparent"></div>
                            
                            <!-- Floating Button (Always visible on mobile, Hover on Desktop) -->
                            <div class="absolute bottom-full mb-4 opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 md:translate-y-[10px] md:group-hover:translate-y-0 transition-all duration-300" style="pointer-events: auto;">
                              <button class="js-tortor-play-btn bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 hover:bg-blue-500 whitespace-nowrap">
                                <span>▶ Tonton Pertunjukan Tor-tor</span>
                              </button>
                            </div>
                          </div>
                        `,
                        size: { width: 800, height: 300 }, // Approximate size for group of dancers
                        anchor: 'center center',
                        tooltip: 'Tor-Tor Dancers',
                        data: landmark,
                    });
                } catch (e) {
                    console.error('Error adding Tor-Tor marker:', e);
                }
                return; // Skip generic marker
            }

            // 3. Generic Marker
            try {
                markersPlugin.addMarker({
                    id: landmark.id,
                    position: {
                        yaw: landmark.coordinates.yaw,
                        pitch: landmark.coordinates.pitch
                    },
                    html: `
                        <div class="custom-marker pulse-marker" data-marker-id="${landmark.id}" style="
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
                            pointer-events: auto;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleMarkerClick = (e: any) => {
            console.log('[MarkerManager] ==== MARKER CLICKED ====');
            console.log('[MarkerManager] Full event:', e);
            console.log('[MarkerManager] Marker object:', e.marker);

            const markerId = e.marker.id;
            const landmark = e.marker.data;

            console.log('[MarkerManager] Marker ID:', markerId);
            console.log('[MarkerManager] Landmark data:', landmark);
            console.log('[MarkerManager] Landmark ID:', landmark?.id);

            // Track landmark visit for gamification (all landmarks)
            if (landmark?.id) {
                console.log('[MarkerManager] ✅ Tracking landmark visit:', landmark.id);
                useAppStore.getState().markLandmarkVisited(landmark.id);
            } else {
                console.log('[MarkerManager] ⚠️ No landmark.id found, using markerId:', markerId);
                // Fallback: use marker ID if no landmark.id
                if (markerId && markerId !== 'hasapi' && markerId !== 'tortor-dancers') {
                    useAppStore.getState().markLandmarkVisited(markerId);
                }
            }

            // Only open NPC modal if it's NOT the Hasapi object or Tor-Tor
            if (markerId === 'hasapi') {
                setItemDetailId('hasapi');
            } else if (markerId === 'tortor-dancers') {
                setTortorModalOpen(true);
            } else {
                setCurrentLandmark(landmark);
                setNPCModalOpen(true);
            }
        };

        console.log('[MarkerManager] Setting up marker click handler...');
        markersPlugin.addEventListener('select-marker', handleMarkerClick);

        return () => {
            markersPlugin.removeEventListener('select-marker', handleMarkerClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewer, landmarks, activeFilters, setCurrentLandmark, setNPCModalOpen, setTortorModalOpen]);

    // Handle custom button clicks for Hasapi/Tor-Tor AND generic markers (Bypassing Viewer Events)
    // PSV's select-marker event doesn't fire reliably for HTML markers
    useEffect(() => {
        const handleCustomClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Hasapi Button
            const hasapiBtn = target.closest('.js-hasapi-detail-btn');
            if (hasapiBtn) {
                console.log('[MarkerManager] Hasapi detail button clicked via DOM');
                // Find the hasapi landmark to track
                const hasapiLandmark = landmarks.find(l => l.title === 'Hasapi');
                if (hasapiLandmark?.id) {
                    console.log('[MarkerManager] ✅ Tracking Hasapi visit:', hasapiLandmark.id);
                    useAppStore.getState().markLandmarkVisited(hasapiLandmark.id);
                }
                setItemDetailId('hasapi');
                return;
            }

            // Tor-Tor Button
            const tortorBtn = target.closest('.js-tortor-play-btn');
            if (tortorBtn) {
                console.log('[MarkerManager] Tor-Tor play button clicked via DOM');
                // Find the tortor landmark to track
                const tortorLandmark = landmarks.find(l => l.title === 'Tor-Tor Dance');
                if (tortorLandmark?.id) {
                    console.log('[MarkerManager] ✅ Tracking Tor-Tor visit:', tortorLandmark.id);
                    useAppStore.getState().markLandmarkVisited(tortorLandmark.id);
                }
                setTortorModalOpen(true);
                return;
            }

            // Generic marker click (custom-marker class)
            const markerElement = target.closest('.custom-marker') as HTMLElement | null;
            if (markerElement) {
                console.log('[MarkerManager] ==== GENERIC MARKER CLICKED (DOM) ====');

                // Get marker ID directly from the element (we set it as data-marker-id)
                const markerId = markerElement.getAttribute('data-marker-id');

                console.log('[MarkerManager] Marker element:', markerElement);
                console.log('[MarkerManager] Marker ID from attribute:', markerId);

                // Find landmark by ID
                const landmark = landmarks.find(l => l.id === markerId);
                console.log('[MarkerManager] Found landmark:', landmark);

                if (landmark?.id) {
                    console.log('[MarkerManager] ✅ Tracking landmark visit:', landmark.id);
                    useAppStore.getState().markLandmarkVisited(landmark.id);
                    setCurrentLandmark(landmark);
                    setNPCModalOpen(true);
                } else if (landmarks.length === 1) {
                    // Fallback: if only 1 landmark in current node, use that
                    const onlyLandmark = landmarks[0];
                    console.log('[MarkerManager] ✅ Using only landmark:', onlyLandmark.id);
                    useAppStore.getState().markLandmarkVisited(onlyLandmark.id);
                    setCurrentLandmark(onlyLandmark);
                    setNPCModalOpen(true);
                }
                return;
            }
        };

        // Use capture phase to ensure we get it before viewer swallows it
        document.addEventListener('click', handleCustomClick, true);
        return () => document.removeEventListener('click', handleCustomClick, true);
    }, [landmarks, setItemDetailId, setTortorModalOpen, setCurrentLandmark, setNPCModalOpen]);

    return null; // This is a logic-only component
}
