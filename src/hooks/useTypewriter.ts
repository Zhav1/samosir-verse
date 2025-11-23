import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  enabled?: boolean; // allow disabling the effect
}

interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  reset: () => void;
}

/**
 * Custom hook for typewriter effect
 * Reveals text character by character with configurable speed
 */
export function useTypewriter({
  text,
  speed = 40,
  onComplete,
  enabled = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset function
  const reset = () => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    // If effect is disabled, show full text immediately
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Reset when text changes
    if (text !== displayedText && currentIndex === 0) {
      setDisplayedText('');
      setIsTyping(true);
    }

    // If we've finished typing
    if (currentIndex >= text.length) {
      setIsTyping(false);
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Type next character
    setIsTyping(true);
    timeoutRef.current = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, currentIndex, speed, enabled, onComplete]);

  // Reset when text prop changes
  useEffect(() => {
    reset();
  }, [text]);

  return {
    displayedText,
    isTyping,
    reset,
  };
}
