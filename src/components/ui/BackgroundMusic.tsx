"use client";

import { useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useAppStore } from '@/store/useAppStore';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

export function BackgroundMusic() {
    const { isAudioPlaying, volume, setIsAudioPlaying } = useAppStore();

    const {
        play,
        pause,
        setVolume: setAudioVolume,
        isPlaying: audioIsPlaying
    } = useAudio([
        {
            id: 'ambience',
            src: '/sounds/ambience-song.mp3',
            volume: volume
        }
    ], {
        autoplay: false,
        loop: true,
        crossfadeDuration: 1000
    });

    // Handle autoplay and user interaction
    useEffect(() => {
        // Try to play immediately if store says so
        if (isAudioPlaying) {
            play();
        } else {
            // If not playing, but we want to autoplay on first load
            // We can set isAudioPlaying to true, but we need to handle browser policy
            setIsAudioPlaying(true);
        }

        // Add global click listener to unlock audio context if needed
        const handleInteraction = () => {
            if (isAudioPlaying) {
                play();
            }
            // Remove listener after first interaction
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []); // Run once on mount

    // Sync volume from store to audio
    useEffect(() => {
        setAudioVolume(volume);
    }, [volume, setAudioVolume]);

    // Sync play/pause from store to audio
    useEffect(() => {
        if (isAudioPlaying) {
            play();
        } else {
            pause();
        }
    }, [isAudioPlaying, play, pause]);

    // If audio is supposed to be playing but isn't (due to browser policy), show a button
    if (isAudioPlaying && !audioIsPlaying) {
        return (
            <button
                onClick={() => {
                    play();
                    setIsAudioPlaying(true);
                }}
                className="fixed top-20 sm:top-10 left-1/2 -translate-x-1/2 z-[100] bg-black/50 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/70 transition-all animate-pulse"
            >
                <VolumeX size={16} />
                <span className="text-xs font-medium">Tap to Enable Audio</span>
            </button>
        );
    }

    return null;
}
