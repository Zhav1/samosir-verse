"use client";

import { useEffect, useRef, useState } from 'react';

interface AudioTrack {
    id: string;
    src: string;
    volume?: number; // 0-100
}

interface UseAudioOptions {
    autoplay?: boolean;
    loop?: boolean;
    crossfadeDuration?: number; // milliseconds
}

interface UseAudioReturn {
    isPlaying: boolean;
    currentTrack: string | null;
    volume: number;
    play: () => void;
    pause: () => void;
    setVolume: (vol: number) => void;
    switchTrack: (trackId: string) => void;
    togglePlayPause: () => void;
}

/**
 * useAudio - Global audio management with crossfade support
 * 
 * Manages background music with smooth transitions between tracks.
 * Supports crossfade for seamless audio experience when switching contexts.
 * 
 * @example
 * const audio = useAudio({
 *   tracks: [
 *     { id: '3d', src: '/audio/sky-ambient.mp3' },
 *     { id: '360', src: '/audio/panorama-ambient.mp3' }
 *   ],
 *   autoplay: true
 * });
 */
export function useAudio(
    tracks: AudioTrack[],
    options: UseAudioOptions = {}
): UseAudioReturn {
    const {
        autoplay = false,
        loop = true,
        crossfadeDuration = 2000,
    } = options;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [volume, setVolumeState] = useState(70); // 0-100

    // Dual audio elements for crossfading
    const audioRef1 = useRef<HTMLAudioElement | null>(null);
    const audioRef2 = useRef<HTMLAudioElement | null>(null);
    const activeAudioRef = useRef<'audio1' | 'audio2'>('audio1');

    // Initialize audio elements
    useEffect(() => {
        if (typeof window === 'undefined') return;

        audioRef1.current = new Audio();
        audioRef2.current = new Audio();

        audioRef1.current.loop = loop;
        audioRef2.current.loop = loop;

        // Always load the first track
        if (tracks.length > 0) {
            loadTrack(tracks[0].id, audioRef1.current);
            setCurrentTrack(tracks[0].id);
        }

        // Start first track if autoplay
        if (autoplay && tracks.length > 0) {
            play();
        }

        return () => {
            audioRef1.current?.pause();
            audioRef2.current?.pause();
            audioRef1.current = null;
            audioRef2.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Apply volume changes
    useEffect(() => {
        if (audioRef1.current) audioRef1.current.volume = volume / 100;
        if (audioRef2.current) audioRef2.current.volume = volume / 100;
    }, [volume]);

    const loadTrack = (trackId: string, audioElement: HTMLAudioElement) => {
        const track = tracks.find(t => t.id === trackId);
        if (!track) {
            console.warn(`Track ${trackId} not found`);
            return;
        }

        audioElement.src = track.src;
        audioElement.load();
    };

    const play = () => {
        const activeAudio = activeAudioRef.current === 'audio1' 
            ? audioRef1.current 
            : audioRef2.current;

        activeAudio?.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Audio play failed:', err));
    };

    const pause = () => {
        audioRef1.current?.pause();
        audioRef2.current?.pause();
        setIsPlaying(false);
    };

    const setVolume = (vol: number) => {
        const clampedVol = Math.max(0, Math.min(100, vol));
        setVolumeState(clampedVol);
    };

    /**
     * Switch to a different track with crossfade
     */
    const switchTrack = (trackId: string) => {
        if (!audioRef1.current || !audioRef2.current) return;
        if (currentTrack === trackId) return;

        const currentAudio = activeAudioRef.current === 'audio1' 
            ? audioRef1.current 
            : audioRef2.current;

        const nextAudio = activeAudioRef.current === 'audio1' 
            ? audioRef2.current 
            : audioRef1.current;

        // Load new track into inactive audio element
        loadTrack(trackId, nextAudio);
        
        // Start crossfade
        crossfade(currentAudio, nextAudio);

        // Toggle active reference
        activeAudioRef.current = activeAudioRef.current === 'audio1' 
            ? 'audio2' 
            : 'audio1';

        setCurrentTrack(trackId);
    };

    /**
     * Crossfade between two audio elements
     */
    const crossfade = (fadeOut: HTMLAudioElement, fadeIn: HTMLAudioElement) => {
        const steps = 50;
        const interval = crossfadeDuration / steps;
        const targetVolume = volume / 100;
        let step = 0;

        // Start new track at zero volume
        fadeIn.volume = 0;
        fadeIn.play().catch(err => console.error('Crossfade play failed:', err));

        const crossfadeInterval = setInterval(() => {
            step++;
            const progress = step / steps;

            // Fade out current track
            fadeOut.volume = targetVolume * (1 - progress);

            // Fade in new track
            fadeIn.volume = targetVolume * progress;

            if (step >= steps) {
                clearInterval(crossfadeInterval);
                fadeOut.pause();
                fadeOut.currentTime = 0;
            }
        }, interval);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    return {
        isPlaying,
        currentTrack,
        volume,
        play,
        pause,
        setVolume,
        switchTrack,
        togglePlayPause,
    };
}
