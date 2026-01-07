'use client';

import { cn } from '@/lib/utils';

interface LocalizedTextProps {
    text: string;
    className?: string;
    subtitleClassName?: string;
}

export const LocalizedText = ({ text, className, subtitleClassName }: LocalizedTextProps) => {
    // Unified rendering for all languages (Latin font)
    return (
        <span className={cn(className, subtitleClassName)}>
            {text}
        </span>
    );
};
