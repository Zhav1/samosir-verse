'use client';

import SceneContainer from '@/components/viewer/SceneContainer';
import { useAppStore } from '@/store/useAppStore';

import ItemDetailModal from '@/components/ui/ItemDetailModal';

export default function PanoramaViewer() {
    // Get currentNodeId from store (set when entering 360° view)
    const currentNodeId = useAppStore((state) => state.currentNodeId);

    // Fallback to sigale-gale if no node is set
    const initialNodeId = currentNodeId || 'sigale-gale';

    return (
        <div className="relative w-full h-screen bg-black">
            <SceneContainer initialNodeId={initialNodeId} />
            <ItemDetailModal />
        </div>
    );
}
