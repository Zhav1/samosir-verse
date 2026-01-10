/**
 * useProgress Hook
 * 
 * Convenience hook for accessing progress state and actions.
 * Wraps Zustand store with progress-specific utilities.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { checkAndUnlockAchievements } from '@/services/AchievementService';
import { syncProgressToServer, loadProgressFromServer } from '@/services/ProgressService';
import { Landmark } from '@/types';

// Debounce sync to avoid too many requests
const SYNC_DEBOUNCE_MS = 5000; // 5 seconds

export function useProgress(landmarks: Landmark[] = []) {
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get state from store
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);
    const achievements = useAppStore(state => state.achievements);
    const opungChatCount = useAppStore(state => state.opungChatCount);
    const pendingAchievementToast = useAppStore(state => state.pendingAchievementToast);
    
    // Get actions from store
    const markLandmarkVisited = useAppStore(state => state.markLandmarkVisited);
    const incrementOpungChat = useAppStore(state => state.incrementOpungChat);
    const setPendingAchievementToast = useAppStore(state => state.setPendingAchievementToast);
    const getOrCreateAnonymousId = useAppStore(state => state.getOrCreateAnonymousId);
    
    // Initialize anonymous ID on mount
    useEffect(() => {
        getOrCreateAnonymousId();
    }, [getOrCreateAnonymousId]);
    
    // Load progress from server on mount
    useEffect(() => {
        loadProgressFromServer();
    }, []);
    
    // Debounced sync to server
    const scheduleSyncToServer = useCallback(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
            syncProgressToServer();
        }, SYNC_DEBOUNCE_MS);
    }, []);
    
    // Visit a landmark and check achievements
    const visitLandmark = useCallback((landmarkId: string) => {
        const wasVisited = visitedLandmarks.includes(landmarkId);
        
        if (!wasVisited) {
            markLandmarkVisited(landmarkId);
            
            // Check for new achievements
            setTimeout(() => {
                checkAndUnlockAchievements(landmarks);
                scheduleSyncToServer();
            }, 100);
        }
    }, [visitedLandmarks, markLandmarkVisited, landmarks, scheduleSyncToServer]);
    
    // Record Opung chat interaction
    const recordOpungChat = useCallback(() => {
        incrementOpungChat();
        
        // Check for Opung-related achievements
        setTimeout(() => {
            checkAndUnlockAchievements(landmarks);
            scheduleSyncToServer();
        }, 100);
    }, [incrementOpungChat, landmarks, scheduleSyncToServer]);
    
    // Dismiss achievement toast
    const dismissAchievementToast = useCallback(() => {
        setPendingAchievementToast(null);
    }, [setPendingAchievementToast]);
    
    // Calculate stats
    const stats = {
        visitedCount: visitedLandmarks.length,
        totalLandmarks: 25,
        visitedPercentage: Math.round((visitedLandmarks.length / 25) * 100),
        achievementsUnlocked: achievements.length,
        totalAchievements: 12,
        achievementsPercentage: Math.round((achievements.length / 12) * 100),
    };
    
    // Check if a specific landmark is visited
    const isLandmarkVisited = useCallback((landmarkId: string) => {
        return visitedLandmarks.includes(landmarkId);
    }, [visitedLandmarks]);
    
    // Get visited landmarks by category
    const getVisitedByCategory = useCallback((category: string) => {
        return landmarks.filter(l => 
            l.category === category && visitedLandmarks.includes(l.id)
        );
    }, [landmarks, visitedLandmarks]);
    
    return {
        // State
        visitedLandmarks,
        achievements,
        opungChatCount,
        pendingAchievementToast,
        stats,
        
        // Actions
        visitLandmark,
        recordOpungChat,
        dismissAchievementToast,
        isLandmarkVisited,
        getVisitedByCategory,
        
        // Force sync (use sparingly)
        forceSyncToServer: syncProgressToServer,
    };
}
