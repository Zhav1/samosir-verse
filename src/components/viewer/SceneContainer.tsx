'use client';

import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { Compass as CompassIcon } from 'lucide-react';
import { Compass } from '@/components/ui/Compass';
import { supabase } from '@/lib/supabase';
import { Node } from '@/types';
import MarkerManager from './MarkerManager';

import { useAppStore } from '@/store/useAppStore';

interface SceneContainerProps {
    initialNodeId: string;
}

export default function SceneContainer({ initialNodeId }: SceneContainerProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstanceRef = useRef<Viewer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGyroEnabled, setIsGyroEnabled] = useState(false);

    useEffect(() => {
        // Guard against double initialization
        if (!viewerRef.current || viewerInstanceRef.current) return;

        let isMounted = true;

        const initViewer = async () => {
            try {
                setIsLoading(true);
                console.log('🔄 Initializing panorama viewer for node:', initialNodeId);

                // Fetch nodes
                const { data: nodes, error: supabaseError } = await supabase.from('nodes').select('*');
                if (supabaseError) {
                    console.error('❌ Supabase error:', supabaseError);
                    throw supabaseError;
                }
                if (!nodes || nodes.length === 0) {
                    console.error('❌ No nodes found in database');
                    throw new Error('No nodes found');
                }

                console.log(`✅ Loaded ${nodes.length} nodes from database`);

                // Check if component is still mounted and no viewer exists
                if (!isMounted || viewerInstanceRef.current || !viewerRef.current) {
                    console.log('⚠️ Component unmounted or viewer already exists');
                    return;
                }

                // Map nodes to plugin format
                const tourNodes = nodes.map((node: Node) => ({
                    id: node.id,
                    panorama: node.panorama_url,
                    thumbnail: node.thumbnail_url,
                    name: node.name,
                    links: node.links,
                    gps: node.links?.find((l) => l.gps)?.gps,
                    defaultYaw: node.default_yaw,
                    defaultPitch: node.default_pitch,
                }));

                const currentNode = tourNodes.find(n => n.id === initialNodeId);
                if (!currentNode) {
                    console.error(`❌ Node "${initialNodeId}" not found in database`);
                    throw new Error(`Node "${initialNodeId}" not found`);
                }

                console.log(`🎯 Loading panorama from: ${currentNode.panorama}`);
                console.log(`📊 Total nodes available: ${tourNodes.length}`);

                // When using VirtualTourPlugin, don't pass panorama to main Viewer
                // The plugin handles loading via its nodes array
                const viewer = new Viewer({
                    container: viewerRef.current,
                    navbar: false,
                    plugins: [
                        [VirtualTourPlugin, {
                            positionMode: 'manual',
                            renderMode: '3d',
                            nodes: tourNodes,
                            startNodeId: initialNodeId,
                            transitionOptions: {
                                speed: '20rpm',
                                rotation: true,
                                zoomTo: 20,
                            }
                        }],
                        [MarkersPlugin, {}],
                        [GyroscopePlugin, {
                            touchmove: true,
                            absolutePosition: true,
                        }]
                    ],
                });

                // Listen for viewer ready event - THIS is when the panorama is actually loaded
                viewer.addEventListener('ready', () => {
                    console.log('✅ Panorama viewer ready!');
                    if (isMounted) {
                        setIsLoading(false);
                    }
                });

                // Listen for panorama load errors
                viewer.addEventListener('panorama-error', (err) => {
                    console.error('❌ Panorama load error:', err);
                    if (isMounted) {
                        setError('Failed to load panorama image');
                        setIsLoading(false);
                    }
                });

                const virtualTour = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;
                virtualTour.addEventListener('node-changed', (e: { node: { id: string } }) => {
                    console.log('🔄 Node changed to:', e.node.id);
                    useAppStore.getState().setCurrentNode(e.node.id);
                });

                viewerInstanceRef.current = viewer;
                console.log('✅ Viewer initialized successfully (waiting for panorama to load...)');

                // Fallback timeout in case 'ready' event never fires
                const currentIsLoading = isLoading;
                setTimeout(() => {
                    if (isMounted && currentIsLoading) {
                        console.warn('⚠️ Panorama took too long to load, hiding spinner anyway');
                        setIsLoading(false);
                    }
                }, 10000); // 10 second timeout
            } catch (err) {
                const error = err as Error;
                console.error('❌ Error initializing viewer:', error);
                if (isMounted) {
                    setError(error.message || 'Failed to load virtual tour');
                    setIsLoading(false);
                }
            }
        };

        initViewer();

        return () => {
            isMounted = false;
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.destroy();
                viewerInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialNodeId]);

    const toggleGyroscope = async () => {
        if (!viewerInstanceRef.current) return;

        const gyroPlugin = viewerInstanceRef.current.getPlugin(GyroscopePlugin) as any;
        if (!gyroPlugin) return;

        try {
            if (isGyroEnabled) {
                gyroPlugin.stop();
                setIsGyroEnabled(false);
            } else {
                await gyroPlugin.start();
                setIsGyroEnabled(true);
            }
        } catch (err) {
            console.error('Failed to toggle gyroscope:', err);
            // On iOS 13+ we might need to request permission
            if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
                (DeviceOrientationEvent as any).requestPermission()
                    .then((response: string) => {
                        if (response === 'granted') {
                            gyroPlugin.start();
                            setIsGyroEnabled(true);
                        } else {
                            alert('Gyroscope permission denied');
                        }
                    })
                    .catch(console.error);
            }
        }
    };

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                <div className="text-center max-w-md px-4">
                    <p className="text-red-500 mb-4 text-xl">❌ Error loading panorama</p>
                    <p className="text-sm text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div ref={viewerRef} className="w-full h-full absolute inset-0" />
            <MarkerManager viewer={viewerInstanceRef.current} />

            {/* Compass HUD */}
            <Compass viewer={viewerInstanceRef.current} />

            {/* Gyroscope Toggle Button - Mobile Only */}
            <button
                onClick={toggleGyroscope}
                className={`fixed top-[1.5rem] right-20 z-10 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isGyroEnabled
                    ? 'bg-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'bg-black/30 text-white/70 hover:bg-black/50'
                    } md:hidden`}
                aria-label="Toggle Gyroscope"
            >
                <CompassIcon className={`w-6 h-6 ${isGyroEnabled ? 'animate-pulse' : ''}`} />
            </button>

            {
                isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-white">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <p className="text-sm font-medium tracking-wider animate-pulse">LOADING PANORAMA...</p>
                            <p className="text-xs text-gray-400">Node: {initialNodeId}</p>
                        </div>
                    </div>
                )
            }
        </>
    );
}
