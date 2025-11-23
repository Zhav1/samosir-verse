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
  const [isTyping, setIsTyping] = useState(false);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset function
  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDisplayedText('');
    setIsTyping(false);
    currentIndexRef.current = 0;
  };

  // Handle text changes
  useEffect(() => {
    currentIndexRef.current = 0;
    setDisplayedText('');
    // Don't set isTyping here, let the typing effect handle it
  }, [text]);

  useEffect(() => {
    // Cleanup previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If disabled, show full text immediately
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Typing loop
    const typeNextChar = () => {
      const currentIndex = currentIndexRef.current;
      
      if (currentIndex < text.length) {
        setIsTyping(true);
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndexRef.current += 1;
        
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    };

    // Start typing if we haven't finished and text is not empty
    if (text && currentIndexRef.current < text.length) {
       timeoutRef.current = setTimeout(typeNextChar, speed);
    } else if (!text) {
        setDisplayedText('');
        setIsTyping(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, enabled, onComplete]);

  return {
    displayedText,
    isTyping,
    reset,
  };
}
