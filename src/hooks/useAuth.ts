/**
 * useAuth Hook
 * 
 * Provides authentication state and actions.
 * Listens for auth state changes from Supabase.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { migrateAnonymousProgress, loadProgressFromServer } from '@/services/ProgressService';

interface AuthUser {
    id: string;
    email: string | undefined;
}

export function useAuth() {
    const userId = useAppStore(state => state.userId);
    const setUserId = useAppStore(state => state.setUserId);
    const setAuthModalOpen = useAppStore(state => state.setAuthModalOpen);
    
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Check initial auth state and listen for changes
    useEffect(() => {
        // Get initial session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                    });
                    setUserId(session.user.id);
                    
                    // Load/migrate progress
                    await migrateAnonymousProgress(session.user.id);
                    await loadProgressFromServer();
                }
            } catch (err) {
                console.error('[useAuth] Session check failed:', err);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkSession();
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[useAuth] Auth state changed:', event);
                
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                    });
                    setUserId(session.user.id);
                    
                    if (event === 'SIGNED_IN') {
                        // Migrate progress on new sign in
                        await migrateAnonymousProgress(session.user.id);
                        await loadProgressFromServer();
                    }
                } else {
                    setUser(null);
                    setUserId(null);
                }
            }
        );
        
        return () => {
            subscription.unsubscribe();
        };
    }, [setUserId]);
    
    // Logout function
    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setUserId(null);
        } catch (err) {
            console.error('[useAuth] Logout failed:', err);
            throw err;
        }
    }, [setUserId]);
    
    // Open auth modal
    const openAuthModal = useCallback(() => {
        setAuthModalOpen(true);
    }, [setAuthModalOpen]);
    
    return {
        // State
        user,
        userId,
        isAuthenticated: !!userId,
        isAnonymous: !userId,
        isLoading,
        
        // Actions
        logout,
        openAuthModal,
    };
}
