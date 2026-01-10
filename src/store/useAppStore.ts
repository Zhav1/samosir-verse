import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Landmark } from '@/types';
import { CATEGORIES, Category } from '@/lib/constants';
import * as THREE from 'three';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

// Phase 5: View Mode State Machine
type ViewMode = '3d-sky' | '3d-focused' | '360-panorama' | 'static-image';

interface SelectedLandmark3D {
    id: string;
    position: THREE.Vector3;
    nodeId: string;
    title: string;
    landmark: Landmark;
}

// Phase 6: Gamification Types
export interface Achievement {
    id: string;
    unlockedAt: string; // ISO date string
}

export interface QuizScore {
    landmarkId: string;
    score: number;
    maxScore: number;
    completedAt: string;
}

// ============================================================
// STATE INTERFACE
// ============================================================

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
    
    // Deep linking support
    selectedLandmarkId: string | null;
    setSelectedLandmark: (landmarkId: string | null) => void;

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

    // Language System
    language: 'id' | 'en' | 'bt';
    setLanguage: (lang: 'id' | 'en' | 'bt') => void;

    // Item Detail Modal State
    itemDetailId: string | null;
    setItemDetailId: (id: string | null) => void;

    // Tor-Tor Video Modal State
    isTortorModalOpen: boolean;
    setTortorModalOpen: (isOpen: boolean) => void;

    // Audio System
    isAudioPlaying: boolean;
    volume: number;
    setIsAudioPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;

    // ============================================================
    // PHASE 6: GAMIFICATION STATE
    // ============================================================
    
    // Anonymous ID (for progress tracking before auth)
    anonymousId: string | null;
    getOrCreateAnonymousId: () => string;
    
    // Progress Tracking
    visitedLandmarks: string[]; // Array of landmark IDs
    markLandmarkVisited: (landmarkId: string) => void;
    
    // Achievements
    achievements: Achievement[];
    unlockAchievement: (achievementId: string) => void;
    hasAchievement: (achievementId: string) => boolean;
    
    // Quiz Scores
    quizScores: QuizScore[];
    addQuizScore: (score: QuizScore) => void;
    
    // Opung Chat Count (for achievement)
    opungChatCount: number;
    incrementOpungChat: () => void;
    
    // UI State for gamification
    isProgressPanelOpen: boolean;
    setProgressPanelOpen: (isOpen: boolean) => void;
    isQuizModalOpen: boolean;
    setQuizModalOpen: (isOpen: boolean) => void;
    
    // Recently unlocked achievement (for toast)
    pendingAchievementToast: Achievement | null;
    setPendingAchievementToast: (achievement: Achievement | null) => void;
    
    // Auth State (for optional signup)
    userId: string | null;
    userEmail: string | null;
    setUserId: (id: string | null) => void;
    setUserEmail: (email: string | null) => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    
    // Reset all progress (call on logout)
    resetProgress: () => void;
    
    // Set progress atomically (REPLACE, not merge - for loading from server)
    setProgress: (data: {
        visitedLandmarks?: string[];
        achievements?: Achievement[];
        quizScores?: QuizScore[];
        opungChatCount?: number;
    }) => void;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateAnonymousId(): string {
    return 'anon_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ============================================================
// STORE CREATION WITH PERSIST
// ============================================================

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Navigation
            currentNodeId: 'sigale-gale',
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
            
            // Deep linking support
            selectedLandmarkId: null,
            setSelectedLandmark: (landmarkId) => set({ selectedLandmarkId: landmarkId }),

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

            // Language System
            language: 'id',
            setLanguage: (lang) => set({ language: lang }),

            // Item Detail Modal State
            itemDetailId: null,
            setItemDetailId: (id: string | null) => set({ itemDetailId: id }),

            // Tor-Tor Video Modal State
            isTortorModalOpen: false,
            setTortorModalOpen: (isOpen: boolean) => set({ isTortorModalOpen: isOpen }),

            // Audio System
            isAudioPlaying: false,
            volume: 50,
            setIsAudioPlaying: (isPlaying) => set({ isAudioPlaying: isPlaying }),
            setVolume: (volume) => set({ volume }),

            // ============================================================
            // PHASE 6: GAMIFICATION IMPLEMENTATION
            // ============================================================
            
            // Anonymous ID
            anonymousId: null,
            getOrCreateAnonymousId: () => {
                const current = get().anonymousId;
                if (current) return current;
                
                const newId = generateAnonymousId();
                set({ anonymousId: newId });
                return newId;
            },
            
            // Progress Tracking
            visitedLandmarks: [],
            markLandmarkVisited: (landmarkId) => set((state) => {
                console.log('[useAppStore] markLandmarkVisited called with:', landmarkId);
                console.log('[useAppStore] Current visitedLandmarks:', state.visitedLandmarks);
                
                if (state.visitedLandmarks.includes(landmarkId)) {
                    console.log('[useAppStore] ⚠️ Already visited, skipping');
                    return state; // Already visited
                }
                
                const newVisited = [...state.visitedLandmarks, landmarkId];
                console.log('[useAppStore] ✅ Adding to visited, new array:', newVisited);
                
                return {
                    visitedLandmarks: newVisited
                };
            }),
            
            // Achievements
            achievements: [],
            unlockAchievement: (achievementId) => set((state) => {
                if (state.achievements.some(a => a.id === achievementId)) {
                    return state; // Already unlocked
                }
                const newAchievement: Achievement = {
                    id: achievementId,
                    unlockedAt: new Date().toISOString(),
                };
                return {
                    achievements: [...state.achievements, newAchievement],
                    pendingAchievementToast: newAchievement,
                };
            }),
            hasAchievement: (achievementId) => {
                return get().achievements.some(a => a.id === achievementId);
            },
            
            // Quiz Scores
            quizScores: [],
            addQuizScore: (score) => set((state) => ({
                quizScores: [...state.quizScores, score]
            })),
            
            // Opung Chat Count
            opungChatCount: 0,
            incrementOpungChat: () => set((state) => ({
                opungChatCount: state.opungChatCount + 1
            })),
            
            // Gamification UI State
            isProgressPanelOpen: false,
            setProgressPanelOpen: (isOpen) => set({ isProgressPanelOpen: isOpen }),
            isQuizModalOpen: false,
            setQuizModalOpen: (isOpen) => set({ isQuizModalOpen: isOpen }),
            
            // Achievement Toast
            pendingAchievementToast: null,
            setPendingAchievementToast: (achievement) => set({ pendingAchievementToast: achievement }),
            
            // Auth State
            userId: null,
            userEmail: null,
            setUserId: (id) => set({ userId: id }),
            setUserEmail: (email) => set({ userEmail: email }),
            isAuthModalOpen: false,
            setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
            
            // Reset all progress (call on logout)
            resetProgress: () => set({
                visitedLandmarks: [],
                achievements: [],
                quizScores: [],
                opungChatCount: 0,
                pendingAchievementToast: null,
                anonymousId: null, // Will regenerate on next visit
                userId: null,
                userEmail: null,
            }),
            
            // Set progress atomically (REPLACE, not merge - for loading from server)
            setProgress: (data) => set((state) => ({
                visitedLandmarks: data.visitedLandmarks ?? state.visitedLandmarks,
                achievements: data.achievements ?? state.achievements,
                quizScores: data.quizScores ?? state.quizScores,
                opungChatCount: data.opungChatCount ?? state.opungChatCount,
            })),
        }),
        {
            name: 'samosir360-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist specific fields (not transient UI state)
            partialize: (state) => ({
                // User preferences
                language: state.language,
                volume: state.volume,
                
                // Gamification data (persist these!)
                anonymousId: state.anonymousId,
                visitedLandmarks: state.visitedLandmarks,
                achievements: state.achievements,
                quizScores: state.quizScores,
                opungChatCount: state.opungChatCount,
                
                // Auth
                userId: state.userId,
            }),
        }
    )
);
