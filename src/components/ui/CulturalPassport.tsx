'use client';

/**
 * Cultural Passport Component
 * 
 * Visual "passport" with stamp collection representing visited landmarks.
 * Each category has its own section with stamp slots.
 * Now fetches landmarks from Supabase for correct ID matching.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Book, ChevronLeft, ChevronRight,
    Sparkles, Lock, Stamp
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_COLORS, Category } from '@/lib/constants';
import { Landmark } from '@/types';
const LANDMARKS_BY_CATEGORY: Record<Category, { id: string; title: string; titleId: string }[]> = {
    folklore: [
        { id: 'sigale-gale', title: 'Sigale-gale', titleId: 'Sigale-gale' },
        { id: 'batu-gantung', title: 'Batu Gantung', titleId: 'Batu Gantung' },
        { id: 'tunggal-panaluan', title: 'Tunggal Panaluan', titleId: 'Tunggal Panaluan' },
        { id: 'legend-of-toba', title: 'Legend of Toba', titleId: 'Legenda Danau Toba' },
        { id: 'tomb-of-king-sidabutar', title: 'Tomb of King Sidabutar', titleId: 'Makam Raja Sidabutar' },
    ],
    music: [
        { id: 'gondang-sabangunan', title: 'Gondang Sabangunan', titleId: 'Gondang Sabangunan' },
        { id: 'hasapi', title: 'Hasapi', titleId: 'Hasapi' },
        { id: 'tor-tor-dance', title: 'Tor-Tor Dance', titleId: 'Tari Tor-Tor' },
        { id: 'sarune-bolon', title: 'Sarune Bolon', titleId: 'Sarune Bolon' },
        { id: 'taganing', title: 'Taganing', titleId: 'Taganing' },
    ],
    food: [
        { id: 'arsik', title: 'Arsik', titleId: 'Arsik' },
        { id: 'naniura', title: 'Naniura', titleId: 'Naniura' },
        { id: 'ombus-ombus', title: 'Ombus-Ombus', titleId: 'Ombus-Ombus' },
        { id: 'dali-ni-horbo', title: 'Dali Ni Horbo', titleId: 'Dali Ni Horbo' },
        { id: 'mie-gomak', title: 'Mie Gomak', titleId: 'Mie Gomak' },
    ],
    history: [
        { id: 'stone-chairs', title: 'Stone Chairs', titleId: 'Batu Parsidangan' },
        { id: 'huta-siallagan', title: 'Huta Siallagan', titleId: 'Huta Siallagan' },
        { id: 'museum-huta-bolon', title: 'Museum Huta Bolon', titleId: 'Museum Huta Bolon' },
        { id: 'tele-tower', title: 'Tele Tower', titleId: 'Menara Tele' },
        { id: 'tugu-aritonang', title: 'Tugu Aritonang', titleId: 'Tugu Aritonang' },
    ],
    nature: [
        { id: 'pusuk-buhit', title: 'Pusuk Buhit', titleId: 'Pusuk Buhit' },
        { id: 'holbung-hill', title: 'Holbung Hill', titleId: 'Bukit Holbung' },
        { id: 'binangalom-waterfall', title: 'Binangalom Waterfall', titleId: 'Air Terjun Binangalom' },
        { id: 'efrata-waterfall', title: 'Efrata Waterfall', titleId: 'Air Terjun Efrata' },
        { id: 'parbaba-beach', title: 'Parbaba Beach', titleId: 'Pantai Parbaba' },
    ],
};

interface CulturalPassportProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CulturalPassport({ isOpen, onClose }: CulturalPassportProps) {
    const language = useAppStore(state => state.language);
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);

    const [currentPage, setCurrentPage] = useState(0);
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch landmarks from Supabase
    useEffect(() => {
        const fetchLandmarks = async () => {
            try {
                const { data, error } = await supabase
                    .from('landmarks')
                    .select('*');

                if (error) {
                    console.error('[CulturalPassport] Error fetching landmarks:', error);
                    return;
                }

                console.log('[CulturalPassport] Fetched', data?.length, 'landmarks');
                setLandmarks(data || []);
            } catch (err) {
                console.error('[CulturalPassport] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchLandmarks();
        }
    }, [isOpen]);

    const categories = CATEGORIES;
    const currentCategory = categories[currentPage];

    // Filter landmarks by current category
    const categoryLandmarks = landmarks.filter(l => l.category === currentCategory);
    const categoryColor = CATEGORY_COLORS[currentCategory];

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    const getCategoryTitle = (category: Category) => {
        const titles: Record<Category, { en: string; id: string }> = {
            folklore: { en: 'Folklore & Legends', id: 'Cerita Rakyat & Legenda' },
            music: { en: 'Music & Dance', id: 'Musik & Tarian' },
            food: { en: 'Traditional Cuisine', id: 'Kuliner Tradisional' },
            history: { en: 'History & Heritage', id: 'Sejarah & Warisan' },
            nature: { en: 'Nature & Scenery', id: 'Alam & Pemandangan' },
        };
        return getText(titles[category].en, titles[category].id);
    };

    const isLandmarkVisited = (landmarkId: string) => {
        // Check both the exact ID and possible variations
        return visitedLandmarks.some(v =>
            v === landmarkId ||
            v.toLowerCase().includes(landmarkId.toLowerCase()) ||
            landmarkId.toLowerCase().includes(v.toLowerCase())
        );
    };

    const visitedInCategory = categoryLandmarks.filter(l => isLandmarkVisited(l.id)).length;

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
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70]"
                    />

                    {/* Passport Container - Centered with flex */}
                    <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                            className="w-full max-w-[500px] h-[90vh] max-h-[600px]
                                       bg-gradient-to-br from-amber-800 to-amber-950
                                       rounded-xl shadow-2xl
                                       overflow-hidden flex flex-col pointer-events-auto"
                            style={{ perspective: '1000px' }}
                        >
                            {/* Passport Cover Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute inset-0"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(
                                         45deg,
                                         transparent,
                                         transparent 10px,
                                         rgba(255,255,255,0.03) 10px,
                                         rgba(255,255,255,0.03) 20px
                                     )`
                                    }}
                                />
                            </div>

                            {/* Header */}
                            <div className="relative border-b border-amber-700/50 p-4">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full 
                                           hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-amber-200/70" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-600/30 rounded-lg">
                                        <Book size={24} className="text-amber-200" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-amber-100">
                                            {getText('Cultural Passport', 'Paspor Budaya')}
                                        </h2>
                                        <p className="text-sm text-amber-300/60">
                                            {getText('Samosir Island Explorer', 'Penjelajah Pulau Samosir')}
                                        </p>
                                    </div>
                                </div>

                                {/* Page indicator */}
                                <div className="flex justify-center gap-2 mt-4">
                                    {categories.map((cat, idx) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCurrentPage(idx)}
                                            className={`w-2 h-2 rounded-full transition-all
                                                   ${idx === currentPage
                                                    ? 'w-6 bg-amber-400'
                                                    : 'bg-amber-600/50'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Page Content */}
                            <div className="flex-1 p-4 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentCategory}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="h-full flex flex-col"
                                    >
                                        {/* Category Header */}
                                        <div className="text-center mb-4">
                                            <h3
                                                className="text-lg font-bold"
                                                style={{ color: categoryColor }}
                                            >
                                                {getCategoryTitle(currentCategory)}
                                            </h3>
                                            <p className="text-sm text-amber-300/50">
                                                {visitedInCategory}/{categoryLandmarks.length} {getText('collected', 'dikumpulkan')}
                                            </p>
                                        </div>

                                        {/* Stamps Grid */}
                                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 
                                                    content-start overflow-y-auto">
                                            {categoryLandmarks.map((landmark, idx) => {
                                                const visited = isLandmarkVisited(landmark.id);
                                                // Use landmark.title - database stores titles directly
                                                const title = landmark.title;

                                                return (
                                                    <motion.div
                                                        key={landmark.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className={`relative aspect-square rounded-xl
                                                               flex flex-col items-center justify-center
                                                               p-3 transition-all duration-300
                                                               ${visited
                                                                ? 'bg-gradient-to-br from-amber-600/40 to-amber-800/40 border-2'
                                                                : 'bg-amber-900/30 border border-amber-700/30'
                                                            }`}
                                                        style={{
                                                            borderColor: visited ? categoryColor : undefined,
                                                        }}
                                                    >
                                                        {visited ? (
                                                            <>
                                                                {/* Stamp effect */}
                                                                <motion.div
                                                                    initial={{ rotate: -15, scale: 0 }}
                                                                    animate={{ rotate: 0, scale: 1 }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        delay: idx * 0.1 + 0.2
                                                                    }}
                                                                    className="relative"
                                                                >
                                                                    <div
                                                                        className="w-12 h-12 rounded-full border-4 
                                                                               flex items-center justify-center"
                                                                        style={{ borderColor: categoryColor }}
                                                                    >
                                                                        <Stamp
                                                                            size={24}
                                                                            style={{ color: categoryColor }}
                                                                        />
                                                                    </div>
                                                                    <Sparkles
                                                                        size={16}
                                                                        className="absolute -top-1 -right-1 text-yellow-400"
                                                                    />
                                                                </motion.div>
                                                                <span className="text-xs text-center text-amber-100 
                                                                           mt-2 line-clamp-2 font-medium">
                                                                    {title}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 rounded-full 
                                                                           border-2 border-dashed border-amber-700/50
                                                                           flex items-center justify-center">
                                                                    <Lock
                                                                        size={20}
                                                                        className="text-amber-700/50"
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-center text-amber-600/50 
                                                                           mt-2 line-clamp-2">
                                                                    {title}
                                                                </span>
                                                            </>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigation */}
                            <div className="border-t border-amber-700/50 p-3 flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg hover:bg-white/10 
                                           disabled:opacity-30 disabled:cursor-not-allowed
                                           transition-colors"
                                >
                                    <ChevronLeft size={24} className="text-amber-200" />
                                </button>

                                <div className="text-amber-300/60 text-sm">
                                    {currentPage + 1} / {categories.length}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(categories.length - 1, p + 1))}
                                    disabled={currentPage === categories.length - 1}
                                    className="p-2 rounded-lg hover:bg-white/10 
                                           disabled:opacity-30 disabled:cursor-not-allowed
                                           transition-colors"
                                >
                                    <ChevronRight size={24} className="text-amber-200" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
