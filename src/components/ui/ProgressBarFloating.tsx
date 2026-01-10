'use client';

/**
 * Floating Progress Bar Component
 * 
 * Compact floating indicator showing exploration progress.
 * Expands on hover to show more details. Click opens full panel.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, ChevronUp, Book } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface ProgressBarFloatingProps {
    onOpenPassport: () => void;
    onOpenPanel: () => void;
}

export function ProgressBarFloating({ onOpenPassport, onOpenPanel }: ProgressBarFloatingProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);
    const achievements = useAppStore(state => state.achievements);
    const language = useAppStore(state => state.language);

    const visitedCount = visitedLandmarks.length;
    const totalLandmarks = 25;
    const percentage = Math.round((visitedCount / totalLandmarks) * 100);

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="fixed bottom-4 left-4 z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <AnimatePresence>
                {isExpanded ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-slate-900/90 backdrop-blur-xl rounded-2xl 
                                   border border-white/10 shadow-2xl p-4 min-w-[200px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/60 text-sm">
                                {getText('Your Progress', 'Progressmu')}
                            </span>
                            <ChevronUp size={16} className="text-white/40" />
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-white flex items-center gap-1">
                                    <MapPin size={14} className="text-blue-400" />
                                    {visitedCount}/{totalLandmarks}
                                </span>
                                <span className="text-white/50">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Achievements count */}
                        <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                            <span className="flex items-center gap-1">
                                <Trophy size={14} className="text-amber-400" />
                                {getText('Achievements', 'Pencapaian')}
                            </span>
                            <span className="text-amber-400 font-medium">
                                {achievements.length}/12
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={onOpenPassport}
                                className="flex-1 flex items-center justify-center gap-1
                                           py-2 px-3 rounded-lg bg-amber-600/20 
                                           hover:bg-amber-600/30 transition-colors
                                           text-amber-400 text-sm font-medium"
                            >
                                <Book size={14} />
                                {getText('Passport', 'Paspor')}
                            </button>
                            <button
                                onClick={onOpenPanel}
                                className="flex-1 py-2 px-3 rounded-lg bg-white/5 
                                           hover:bg-white/10 transition-colors
                                           text-white/70 text-sm"
                            >
                                {getText('Details', 'Detail')}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onOpenPanel}
                        className="bg-slate-900/80 backdrop-blur-md rounded-full 
                                   border border-white/10 shadow-lg
                                   px-4 py-2 flex items-center gap-3
                                   hover:bg-slate-800/80 transition-colors"
                    >
                        {/* Mini progress ring */}
                        <div className="relative w-8 h-8">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="16"
                                    cy="16"
                                    r="14"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="3"
                                />
                                <motion.circle
                                    cx="16"
                                    cy="16"
                                    r="14"
                                    fill="none"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={88}
                                    initial={{ strokeDashoffset: 88 }}
                                    animate={{ strokeDashoffset: 88 - (88 * percentage / 100) }}
                                    transition={{ duration: 1 }}
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#22D3EE" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <MapPin
                                size={14}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400"
                            />
                        </div>

                        <div className="text-left">
                            <div className="text-white text-sm font-medium">
                                {visitedCount}/{totalLandmarks}
                            </div>
                            <div className="text-white/50 text-xs">
                                {getText('explored', 'dijelajahi')}
                            </div>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
