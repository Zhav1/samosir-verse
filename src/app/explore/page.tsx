'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PanoramaViewer from '@/components/explore/PanoramaViewer';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { NPCModal } from '@/components/ui/NPCModal';
import { useAppStore } from '@/store/useAppStore';

function ExploreContent() {
    const searchParams = useSearchParams();
    const { setCurrentNode, setViewMode, setSelectedLandmark } = useAppStore();

    // Deep linking support
    useEffect(() => {
        const nodeId = searchParams.get('node');
        const landmarkId = searchParams.get('landmark');

        if (nodeId) {
            // Navigate to specific node
            setCurrentNode(nodeId);
            setViewMode('360-panorama');

            // If landmark is specified, auto-select it
            if (landmarkId) {
                // Fetch landmark data and set it
                // This will be handled by the PanoramaViewer component
                setSelectedLandmark(landmarkId);
            }
        }
    }, [searchParams, setCurrentNode, setViewMode, setSelectedLandmark]);

    return (
        <main className="w-full h-screen overflow-hidden relative">
            <FilterSidebar />
            <div className="ml-0 md:ml-64 w-full md:w-[calc(100%-16rem)] h-full">
                <PanoramaViewer />
            </div>
            <NPCModal />
        </main>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="w-full h-screen bg-black" />}>
            <ExploreContent />
        </Suspense>
    );
}
