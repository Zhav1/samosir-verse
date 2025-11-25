'use client';

import { useAppStore } from '@/store/useAppStore';
import { toSuratBatak } from '@/lib/surat-batak';
import { cn } from '@/lib/utils';

interface LocalizedTextProps {
    text: string;
    className?: string;
    subtitleClassName?: string;
}

export const LocalizedText = ({ text, className, subtitleClassName }: LocalizedTextProps) => {
    const { language } = useAppStore();

    // Unified rendering for all languages (Latin font)
    return (
        <span className={cn(className, subtitleClassName)}>
            {text}
        </span>
    );
};
