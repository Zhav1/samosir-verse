import PanoramaViewer from '@/components/explore/PanoramaViewer';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { NPCModal } from '@/components/ui/NPCModal';

export default function ExplorePage() {
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
