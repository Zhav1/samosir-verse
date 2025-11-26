"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function VolumeControl() {
    const [isOpen, setIsOpen] = useState(false);
    const { volume, setVolume, isAudioPlaying, setIsAudioPlaying } = useAppStore();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
                {isAudioPlaying && volume > 0 ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex flex-col items-center gap-4 w-12"
                    >
                        <div className="h-32 w-1 bg-white/20 rounded-full relative">
                            <div
                                className="absolute bottom-0 left-0 w-full bg-white rounded-full"
                                style={{ height: `${volume}%` }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                            />
                        </div>

                        <button
                            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            {isAudioPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
