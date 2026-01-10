/**
 * Progress Service
 * 
 * Handles syncing progress between client (Zustand) and server (Supabase).
 * Supports anonymous users with optional upgrade to authenticated.
 */

import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

interface ServerProgress {
    visited_landmarks: string[];
    achievements: string[];
    opung_chat_count: number;
    quiz_scores: unknown[];
}

/**
 * Sync local progress to Supabase
 * Call this periodically or on significant events
 */
export async function syncProgressToServer(): Promise<boolean> {
    const store = useAppStore.getState();
    const { 
        anonymousId, 
        userId,
        visitedLandmarks, 
        achievements, 
        opungChatCount,
        quizScores 
    } = store;
    
    // Need either anonymous ID or user ID
    const identifier = userId || anonymousId;
    if (!identifier) {
        console.warn('[ProgressService] No identifier available for sync');
        return false;
    }
    
    try {
        const progressData = {
            visited_landmarks: visitedLandmarks,
            achievements: achievements.map(a => a.id),
            opung_chat_count: opungChatCount,
            quiz_scores: quizScores,
            last_sync_at: new Date().toISOString(),
        };
        
        if (userId) {
            // Authenticated user - use user_id
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    ...progressData,
                }, {
                    onConflict: 'user_id',
                });
                
            if (error) throw error;
        } else {
            // Anonymous user - use anonymous_id
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    anonymous_id: anonymousId,
                    ...progressData,
                }, {
                    onConflict: 'anonymous_id',
                });
                
            if (error) throw error;
        }
        
        console.log('[ProgressService] Progress synced successfully');
        return true;
    } catch (error) {
        // Log but don't crash - just means server sync failed
        // Local progress in Zustand + localStorage still works
        console.warn('[ProgressService] Sync failed (local progress preserved):', error);
        return false;
    }
}

/**
 * Load progress from server and merge with local
 * Call on app initialization
 */
export async function loadProgressFromServer(): Promise<boolean> {
    const store = useAppStore.getState();
    const { anonymousId, userId } = store;
    
    console.log('[ProgressService] loadProgressFromServer called');
    console.log('[ProgressService] userId:', userId);
    console.log('[ProgressService] anonymousId:', anonymousId);
    console.log('[ProgressService] Current visitedLandmarks:', store.visitedLandmarks);
    
    const identifier = userId || anonymousId;
    if (!identifier) {
        console.log('[ProgressService] No identifier, skipping load');
        return false;
    }
    
    console.log('[ProgressService] Loading progress for identifier:', identifier);
    
    try {
        let query = supabase.from('user_progress').select('*');
        
        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            query = query.eq('anonymous_id', anonymousId);
        }
        
        const { data, error } = await query.single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No record found - that's okay for new users
                console.log('[ProgressService] No existing progress found, starting fresh');
                return true;
            }
            // Handle missing table (406) gracefully
            if (error.message?.includes('406') || error.code === '42P01') {
                console.warn('[ProgressService] Table not found - SQL migration may not be run yet. Local progress still works.');
                return true; // Don't throw, just continue with local state
            }
            throw error;
        }
        
        if (data) {
            // REPLACE local state with server data (not merge!)
            // This ensures authenticated user sees ONLY their saved progress,
            // not mixed with anonymous session data
            console.log('[ProgressService] Replacing local state with server data');
            replaceWithServerProgress(data as ServerProgress);
        }
        
        return true;
    } catch (error) {
        // Log but don't crash - local progress still works
        console.warn('[ProgressService] Load failed (local progress still works):', error);
        return false; // Return false but don't throw
    }
}

/**
 * REPLACE local progress with server data (not merge!)
 * Called on login to show authenticated user's progress only
 */
function replaceWithServerProgress(serverData: ServerProgress): void {
    const store = useAppStore.getState();
    
    // Clear local state first, then set server data
    // This ensures no leftover anonymous progress
    const serverVisited = serverData.visited_landmarks || [];
    const serverAchievementIds = serverData.achievements || [];
    const serverChatCount = serverData.opung_chat_count || 0;
    
    // Convert achievement IDs to Achievement objects
    const achievements = serverAchievementIds.map(id => ({
        id,
        unlockedAt: new Date().toISOString(), // We don't store unlocked date on server, use now
    }));
    
    console.log('[ProgressService] Replacing with server data:', {
        visitedLandmarks: serverVisited.length,
        achievements: achievements.length,
        opungChatCount: serverChatCount
    });
    
    // Use setProgress for atomic replacement
    store.setProgress({
        visitedLandmarks: serverVisited,
        achievements,
        opungChatCount: serverChatCount,
    });
}

/**
 * @deprecated Use replaceWithServerProgress instead
 * Merge server progress into local Zustand store
 * Uses union for arrays, max for counts
 */
function _mergeServerProgress(serverData: ServerProgress): void {
    const store = useAppStore.getState();
    
    // Merge visited landmarks (union)
    const serverVisited = serverData.visited_landmarks || [];
    const localVisited = store.visitedLandmarks;
    const mergedVisited = Array.from(new Set([...localVisited, ...serverVisited]));
    
    // Merge achievements (union)
    const serverAchievements = serverData.achievements || [];
    const localAchievementIds = store.achievements.map(a => a.id);
    const newAchievementIds = serverAchievements.filter(id => !localAchievementIds.includes(id));
    
    // Update store with merged data
    if (mergedVisited.length > localVisited.length) {
        for (const landmarkId of mergedVisited) {
            if (!localVisited.includes(landmarkId)) {
                store.markLandmarkVisited(landmarkId);
            }
        }
    }
    
    // Unlock achievements from server
    for (const achievementId of newAchievementIds) {
        store.unlockAchievement(achievementId);
    }
    
    // Take max chat count
    const serverChatCount = serverData.opung_chat_count || 0;
    if (serverChatCount > store.opungChatCount) {
        // Set directly via store action would be cleaner, but this works
        for (let i = store.opungChatCount; i < serverChatCount; i++) {
            store.incrementOpungChat();
        }
    }
}

/**
 * Migrate anonymous progress to authenticated user
 * Call after successful login/signup
 */
export async function migrateAnonymousProgress(userId: string): Promise<boolean> {
    const store = useAppStore.getState();
    const { anonymousId } = store;
    
    if (!anonymousId) {
        return true; // Nothing to migrate
    }
    
    try {
        // Call the database function to merge
        const { error } = await supabase.rpc('merge_anonymous_progress', {
            p_anonymous_id: anonymousId,
            p_user_id: userId,
        });
        
        if (error) throw error;
        
        // Update local store
        store.setUserId(userId);
        
        console.log('[ProgressService] Anonymous progress migrated successfully');
        return true;
    } catch (error) {
        console.error('[ProgressService] Migration failed:', error);
        return false;
    }
}

/**
 * Get progress statistics for display
 */
export function getProgressStats(): {
    visitedCount: number;
    totalLandmarks: number;
    visitedPercentage: number;
    achievementsUnlocked: number;
    totalAchievements: number;
} {
    const store = useAppStore.getState();
    const totalLandmarks = 25; // Fixed total
    const totalAchievements = 12; // Fixed total
    
    return {
        visitedCount: store.visitedLandmarks.length,
        totalLandmarks,
        visitedPercentage: Math.round((store.visitedLandmarks.length / totalLandmarks) * 100),
        achievementsUnlocked: store.achievements.length,
        totalAchievements,
    };
}
