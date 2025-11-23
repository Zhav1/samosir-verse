import { create } from 'zustand';
import { Landmark } from '@/types';
import { CATEGORIES, Category } from '@/lib/constants';
import * as THREE from 'three';

// Phase 5: View Mode State Machine
type ViewMode = '3d-sky' | '3d-focused' | '360-panorama' | 'static-image';

interface SelectedLandmark3D {
    id: string;
    position: THREE.Vector3;
    nodeId: string;
    title: string;
    landmark: Landmark;
}

interface AppState {
    // Navigation System
    currentNodeId: string | null;
    setCurrentNode: (id: string) => void;

    // The "Lens" System
    activeFilters: Category[];
    toggleFilter: (category: Category) => void;

    // UI State
    isNPCModalOpen: boolean;
    currentLandmark: Landmark | null;
    setNPCModalOpen: (isOpen: boolean) => void;
    setCurrentLandmark: (landmark: Landmark | null) => void;

    // Phase 5: 3D View Mode State Machine
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;

    selectedLandmark3D: SelectedLandmark3D | null;
    setSelectedLandmark3D: (landmark: SelectedLandmark3D | null) => void;

    // Camera Animation State
    cameraTarget: THREE.Vector3 | null;
    isCameraAnimating: boolean;
    setCameraTarget: (target: THREE.Vector3 | null) => void;
    setIsCameraAnimating: (isAnimating: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Navigation
    currentNodeId: 'sigale-gale', // Changed from 'tomok-harbor' to match available panorama nodes
    setCurrentNode: (id) => set({ currentNodeId: id }),

    // Filters - All categories active by default
    activeFilters: [...CATEGORIES],
    toggleFilter: (category) => set((state) => ({
        activeFilters: state.activeFilters.includes(category)
            ? state.activeFilters.filter(c => c !== category)
            : [...state.activeFilters, category]
    })),

    // NPC Modal
    isNPCModalOpen: false,
    currentLandmark: null,
    setNPCModalOpen: (isOpen) => set({ isNPCModalOpen: isOpen }),
    setCurrentLandmark: (landmark) => set({ currentLandmark: landmark }),

    // Phase 5: View Mode State Machine
    viewMode: '3d-sky',
    setViewMode: (mode) => set({ viewMode: mode }),

    selectedLandmark3D: null,
    setSelectedLandmark3D: (landmark) => set({ selectedLandmark3D: landmark }),

    // Camera Animation State
    cameraTarget: null,
    isCameraAnimating: false,
    setCameraTarget: (target) => set({ cameraTarget: target }),
    setIsCameraAnimating: (isAnimating) => set({ isCameraAnimating: isAnimating }),
}));
