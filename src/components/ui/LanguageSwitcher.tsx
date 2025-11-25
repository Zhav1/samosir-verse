import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

const languages = [
    { code: 'id', label: 'ID', fullName: 'Indonesia' },
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'bt', label: 'BT', fullName: 'Batak Toba' },
] as const;

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useAppStore();

    return (
        <div className="flex gap-2 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                        relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                        ${language === lang.code
                            ? 'text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                    `}
                >
                    {language === lang.code && (
                        <motion.div
                            layoutId="activeLanguage"
                            className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{lang.label}</span>
                </button>
            ))}
        </div>
    );
};
