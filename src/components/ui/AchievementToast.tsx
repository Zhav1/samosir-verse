'use client';

/**
 * Achievement Toast Component
 * 
 * Celebratory pop-up notification when user unlocks an achievement.
 * Features confetti animation and slide-in effect.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAchievementById } from '@/lib/achievements';

export function AchievementToast() {
    const pendingAchievement = useAppStore(state => state.pendingAchievementToast);
    const setPendingAchievementToast = useAppStore(state => state.setPendingAchievementToast);
    const language = useAppStore(state => state.language);

    const [isVisible, setIsVisible] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            setPendingAchievementToast(null);
        }, 300);
    }, [setPendingAchievementToast]);

    useEffect(() => {
        if (pendingAchievement) {
            setIsVisible(true);

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [pendingAchievement, handleDismiss]);

    if (!pendingAchievement) return null;

    const definition = getAchievementById(pendingAchievement.id);
    if (!definition) return null;

    const title = language === 'id' || language === 'bt'
        ? definition.titleId
        : definition.title;
    const description = language === 'id' || language === 'bt'
        ? definition.descriptionId
        : definition.description;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
                >
                    {/* Confetti particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 1,
                                    scale: 0,
                                    x: 0,
                                    y: 0,
                                }}
                                animate={{
                                    opacity: 0,
                                    scale: 1,
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 200,
                                }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: [
                                        '#FFD700', '#FF6B6B', '#4ECDC4',
                                        '#45B7D1', '#F7DC6F', '#BB8FCE'
                                    ][i % 6],
                                }}
                            />
                        ))}
                    </div>

                    {/* Toast content */}
                    <div className="relative bg-gradient-to-r from-amber-500/90 to-yellow-500/90 
                                    backdrop-blur-md rounded-2xl shadow-2xl border border-yellow-300/50
                                    px-6 py-4 min-w-[320px] max-w-[400px]">
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl -z-10" />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 rounded-full 
                                       hover:bg-white/20 transition-colors"
                        >
                            <X size={16} className="text-yellow-900" />
                        </button>

                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <motion.div
                                initial={{ rotate: -180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="relative"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/30 
                                                flex items-center justify-center text-4xl
                                                shadow-inner">
                                    {definition.icon}
                                </div>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <Sparkles size={20} className="text-yellow-200" />
                                </motion.div>
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-yellow-900/80 text-sm font-medium">
                                    <Trophy size={14} />
                                    <span>
                                        {language === 'id' || language === 'bt'
                                            ? 'Pencapaian Terbuka!'
                                            : 'Achievement Unlocked!'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-yellow-900 mt-1">
                                    {title}
                                </h3>
                                <p className="text-sm text-yellow-900/70">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
