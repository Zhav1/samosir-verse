'use client';

/**
 * Progress Panel Component
 * 
 * Slide-out panel showing exploration progress, visited landmarks,
 * and unlocked achievements. Includes "Save Progress" CTA for anonymous users
 * and logout functionality for authenticated users.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MapPin, Trophy, ChevronRight,
    User, Sparkles, CheckCircle2, LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { CATEGORIES, CATEGORY_COLORS, Category } from '@/lib/constants';
import { Landmark } from '@/types';

interface ProgressPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProgressPanel({ isOpen, onClose }: ProgressPanelProps) {
    const language = useAppStore(state => state.language);
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);
    const achievements = useAppStore(state => state.achievements);
    const userId = useAppStore(state => state.userId);
    const userEmail = useAppStore(state => state.userEmail);
    const setAuthModalOpen = useAppStore(state => state.setAuthModalOpen);

    const [landmarks, setLandmarks] = useState<Landmark[]>([]);

    const isAnonymous = !userId;

    // Fetch landmarks for category progress
    useEffect(() => {
        const fetchLandmarks = async () => {
            const { data } = await supabase.from('landmarks').select('*');
            if (data) setLandmarks(data);
        };
        if (isOpen) fetchLandmarks();
    }, [isOpen]);

    // DEBUG: Log what the component is actually receiving
    console.log('[ProgressPanel] === RENDER DEBUG ===');
    console.log('[ProgressPanel] visitedLandmarks:', visitedLandmarks);
    console.log('[ProgressPanel] visitedLandmarks.length:', visitedLandmarks.length);
    console.log('[ProgressPanel] achievements:', achievements);
    console.log('[ProgressPanel] userId:', userId);

    // Calculate stats
    const visitedCount = visitedLandmarks.length;
    const totalLandmarks = 25;
    const visitedPercentage = Math.round((visitedCount / totalLandmarks) * 100);

    const unlockedCount = achievements.length;
    const totalAchievements = ACHIEVEMENTS.length;

    // Category progress - calculated from actual landmarks
    const categoryProgress: Record<Category, { visited: number; total: number }> = {
        folklore: { visited: 0, total: 0 },
        music: { visited: 0, total: 0 },
        food: { visited: 0, total: 0 },
        history: { visited: 0, total: 0 },
        nature: { visited: 0, total: 0 },
    };

    // Calculate from fetched landmarks
    landmarks.forEach(landmark => {
        if (categoryProgress[landmark.category as Category]) {
            categoryProgress[landmark.category as Category].total++;
            if (visitedLandmarks.includes(landmark.id)) {
                categoryProgress[landmark.category as Category].visited++;
            }
        }
    });

    const handleSaveProgress = () => {
        onClose();
        setAuthModalOpen(true);
    };

    const handleLogout = async () => {
        try {
            console.log('[ProgressPanel] Starting logout...');

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Clear ALL localStorage (not just our key)
            // This ensures Supabase session storage is also cleared
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => {
                console.log('[ProgressPanel] Removing localStorage key:', key);
                localStorage.removeItem(key);
            });

            // Also clear sessionStorage just in case
            sessionStorage.clear();

            console.log('[ProgressPanel] All storage cleared, reloading...');

            // Reload the page to get a completely fresh state
            window.location.reload();
        } catch (error) {
            console.error('[ProgressPanel] Logout error:', error);
        }
    };

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md 
                                   bg-slate-900/95 backdrop-blur-xl z-[61]
                                   border-l border-white/10 shadow-2xl
                                   overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md 
                                        border-b border-white/10 p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MapPin className="text-blue-400" size={24} />
                                {getText('Your Journey', 'Perjalananmu')}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white/70" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6">
                            {/* User Info Section (when authenticated) */}
                            {!isAnonymous && (
                                <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-4 border border-green-500/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <User className="text-green-400" size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-green-400 font-medium truncate">
                                                {userEmail || getText('Authenticated User', 'Pengguna Terautentikasi')}
                                            </p>
                                            <p className="text-xs text-white/40 font-mono truncate">
                                                ID: {userId?.slice(0, 8)}...{userId?.slice(-4)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 
                                                     border border-red-500/30 transition-colors"
                                            title={getText('Logout', 'Keluar')}
                                        >
                                            <LogOut className="text-red-400" size={18} />
                                        </button>
                                    </div>
                                </section>
                            )}
                            {/* Overall Progress */}
                            <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white/70">
                                        {getText('Exploration Progress', 'Progres Eksplorasi')}
                                    </span>
                                    <span className="text-2xl font-bold text-white">
                                        {visitedCount}/{totalLandmarks}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${visitedPercentage}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                    />
                                </div>

                                <p className="text-sm text-white/50 mt-2">
                                    {getText(
                                        `${visitedPercentage}% of Samosir explored`,
                                        `${visitedPercentage}% Samosir dijelajahi`
                                    )}
                                </p>
                            </section>

                            {/* Category Progress */}
                            <section>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Sparkles size={18} className="text-yellow-400" />
                                    {getText('Categories', 'Kategori')}
                                </h3>

                                <div className="space-y-2">
                                    {CATEGORIES.map(category => {
                                        const color = CATEGORY_COLORS[category];
                                        const progress = categoryProgress[category];
                                        const percentage = (progress.visited / progress.total) * 100;

                                        return (
                                            <div
                                                key={category}
                                                className="bg-white/5 rounded-xl p-3 border border-white/5"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span
                                                        className="text-sm font-medium capitalize"
                                                        style={{ color }}
                                                    >
                                                        {category}
                                                    </span>
                                                    <span className="text-xs text-white/50">
                                                        {progress.visited}/{progress.total}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Achievements */}
                            <section>
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Trophy size={18} className="text-amber-400" />
                                    {getText('Achievements', 'Pencapaian')}
                                    <span className="text-sm font-normal text-white/50">
                                        ({unlockedCount}/{totalAchievements})
                                    </span>
                                </h3>

                                <div className="grid grid-cols-3 gap-2">
                                    {ACHIEVEMENTS.map(achievement => {
                                        const isUnlocked = achievements.some(a => a.id === achievement.id);
                                        const title = language === 'id' || language === 'bt'
                                            ? achievement.titleId
                                            : achievement.title;

                                        return (
                                            <div
                                                key={achievement.id}
                                                className={`relative p-3 rounded-xl text-center
                                                           transition-all duration-300
                                                           ${isUnlocked
                                                        ? 'bg-amber-500/20 border border-amber-500/30'
                                                        : 'bg-white/5 border border-white/5 opacity-50'
                                                    }`}
                                            >
                                                <div className="text-2xl mb-1">
                                                    {achievement.icon}
                                                </div>
                                                <div className="text-xs text-white/70 line-clamp-2">
                                                    {title}
                                                </div>
                                                {isUnlocked && (
                                                    <CheckCircle2
                                                        size={14}
                                                        className="absolute top-1 right-1 text-green-400"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Save Progress CTA (for anonymous users) */}
                            {isAnonymous && (
                                <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                                                    rounded-2xl p-4 border border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/10 rounded-full">
                                            <User size={20} className="text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white">
                                                {getText('Save Your Progress', 'Simpan Progressmu')}
                                            </h4>
                                            <p className="text-sm text-white/60 mt-1">
                                                {getText(
                                                    'Create an account to keep your achievements across devices.',
                                                    'Buat akun untuk menyimpan pencapaianmu di semua perangkat.'
                                                )}
                                            </p>
                                            <button
                                                onClick={handleSaveProgress}
                                                className="mt-3 flex items-center gap-2 px-4 py-2
                                                           bg-blue-500 hover:bg-blue-600 
                                                           text-white text-sm font-medium
                                                           rounded-lg transition-colors"
                                            >
                                                {getText('Sign Up Free', 'Daftar Gratis')}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
