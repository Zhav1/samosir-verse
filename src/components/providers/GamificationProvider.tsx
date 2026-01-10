'use client';

/**
 * Gamification Provider Component
 * 
 * Wraps the app with all gamification UI components and initializes
 * auth listeners, progress tracking, and achievement checks.
 * 
 * This is the single point of integration for the entire gamification system.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { loadProgressFromServer, migrateAnonymousProgress } from '@/services/ProgressService';
import { checkAndUnlockAchievements } from '@/services/AchievementService';

// Gamification UI Components
import { AchievementToast } from '@/components/ui/AchievementToast';
import { ProgressPanel } from '@/components/ui/ProgressPanel';
import { CulturalPassport } from '@/components/ui/CulturalPassport';
import { ProgressBarFloating } from '@/components/ui/ProgressBarFloating';
import { QuizModal } from '@/components/ui/QuizModal';
import { AuthModal } from '@/components/ui/AuthModal';

// Types
import { Landmark } from '@/types';

interface GamificationProviderProps {
    children: React.ReactNode;
    landmarks?: Landmark[];
}

export function GamificationProvider({ children, landmarks = [] }: GamificationProviderProps) {
    // Get store state
    const setUserId = useAppStore(state => state.setUserId);
    const setUserEmail = useAppStore(state => state.setUserEmail);
    const getOrCreateAnonymousId = useAppStore(state => state.getOrCreateAnonymousId);
    const currentLandmark = useAppStore(state => state.currentLandmark);
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);

    // Gamification UI state
    const isAuthModalOpen = useAppStore(state => state.isAuthModalOpen);
    const setAuthModalOpen = useAppStore(state => state.setAuthModalOpen);
    const isProgressPanelOpen = useAppStore(state => state.isProgressPanelOpen);
    const setProgressPanelOpen = useAppStore(state => state.setProgressPanelOpen);
    const isQuizModalOpen = useAppStore(state => state.isQuizModalOpen);
    const setQuizModalOpen = useAppStore(state => state.setQuizModalOpen);

    // Local state for Cultural Passport
    const [isPassportOpen, setIsPassportOpen] = useState(false);

    // Initialize anonymous ID and auth listener on mount
    useEffect(() => {
        // Ensure anonymous ID exists
        getOrCreateAnonymousId();

        // Load progress from server
        loadProgressFromServer();

        // Handle hash-based auth redirect (Supabase sends tokens in URL hash)
        const handleHashAuth = async () => {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const type = params.get('type');

                if (accessToken && refreshToken) {
                    console.log('[GamificationProvider] Found tokens in hash, setting session...');
                    try {
                        const { data: { session }, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (error) {
                            console.error('[GamificationProvider] Error setting session:', error);
                            return;
                        }

                        if (session?.user) {
                            console.log('[GamificationProvider] Session set successfully');
                            setUserId(session.user.id);
                            setUserEmail(session.user.email || null);
                            await migrateAnonymousProgress(session.user.id);
                            await loadProgressFromServer();

                            // Clear the hash from URL
                            window.history.replaceState(null, '', window.location.pathname);

                            // If it's a password reset, redirect to reset page
                            if (type === 'recovery') {
                                window.location.href = '/auth/reset-password';
                            }
                        }
                    } catch (err) {
                        console.error('[GamificationProvider] Hash auth error:', err);
                    }
                }
            }
        };

        handleHashAuth();

        // Check for existing session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUserId(session.user.id);
                    setUserEmail(session.user.email || null);
                    await migrateAnonymousProgress(session.user.id);
                    await loadProgressFromServer();
                }
            } catch (err) {
                console.error('[GamificationProvider] Auth init error:', err);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[GamificationProvider] Auth state changed:', event);

                if (session?.user) {
                    setUserId(session.user.id);
                    setUserEmail(session.user.email || null);

                    if (event === 'SIGNED_IN') {
                        await migrateAnonymousProgress(session.user.id);
                        await loadProgressFromServer();
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('[GamificationProvider] User signed out - resetting all progress');

                    // Clear all progress state
                    useAppStore.getState().resetProgress();

                    // Clear localStorage to prevent stale data on next load
                    localStorage.removeItem('samosir360-storage');

                    setUserId(null);
                    setUserEmail(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [getOrCreateAnonymousId, setUserId]);

    // Check achievements when visited landmarks change
    useEffect(() => {
        if (visitedLandmarks.length > 0) {
            console.log('[GamificationProvider] Visited landmarks changed, checking achievements...');
            checkAndUnlockAchievements().then(unlocked => {
                if (unlocked.length > 0) {
                    console.log('[GamificationProvider] Newly unlocked achievements:', unlocked);
                }
            });
        }
    }, [visitedLandmarks]);

    // Handlers
    const handleOpenPassport = useCallback(() => {
        setIsPassportOpen(true);
    }, []);

    const handleOpenPanel = useCallback(() => {
        setProgressPanelOpen(true);
    }, [setProgressPanelOpen]);

    return (
        <>
            {/* Main app content */}
            {children}

            {/* Floating Progress Bar - Bottom center on mobile, bottom left on desktop */}
            <ProgressBarFloating
                onOpenPassport={handleOpenPassport}
                onOpenPanel={handleOpenPanel}
            />

            {/* Achievement Toast - Shows when achievement unlocked */}
            <AchievementToast />

            {/* Progress Panel - Slide-out from right */}
            <ProgressPanel
                isOpen={isProgressPanelOpen}
                onClose={() => setProgressPanelOpen(false)}
            />

            {/* Cultural Passport - Modal overlay (centered) */}
            <CulturalPassport
                isOpen={isPassportOpen}
                onClose={() => setIsPassportOpen(false)}
            />

            {/* Quiz Modal - Shows when triggered from landmark */}
            <QuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setQuizModalOpen(false)}
                landmark={currentLandmark}
            />

            {/* Auth Modal - For saving progress */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />
        </>
    );
}
