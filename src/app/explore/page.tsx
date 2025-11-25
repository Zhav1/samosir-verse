'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PanoramaViewer from '@/components/explore/PanoramaViewer';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { NPCModal } from '@/components/ui/NPCModal';
import { useAppStore } from '@/store/useAppStore';
import { ProductDetailModal } from '@/components/ui/ProductDetailModal';
import { getProductById } from '@/lib/mockProducts';

function ExploreContent() {
    const searchParams = useSearchParams();
    const { setCurrentNode, setViewMode, setSelectedLandmark, itemDetailId, setItemDetailId } = useAppStore();

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

    // Debug logging
    console.log('ExplorePage Render:', { itemDetailId, product: itemDetailId ? getProductById(itemDetailId) : null });

    return (
        <main className="w-full h-screen overflow-hidden relative">
            <FilterSidebar />
            <div className="ml-0 md:ml-64 w-full md:w-[calc(100%-16rem)] h-full">
                <PanoramaViewer />
            </div>
            <NPCModal />

            {/* Product Detail Modal for Hasapi/Marketplace items */}
            <ProductDetailModal
                product={itemDetailId ? getProductById(itemDetailId) || null : null}
                isOpen={!!itemDetailId && itemDetailId !== 'hasapi'}
                onClose={() => setItemDetailId(null)}
            />
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
