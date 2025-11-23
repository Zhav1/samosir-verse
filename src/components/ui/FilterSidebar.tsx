'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_CONFIG, CATEGORIES, Category } from '@/lib/constants';

export default function FilterSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { activeFilters, toggleFilter } = useAppStore();

    const handleFilterToggle = (category: Category) => {
        toggleFilter(category);
        // Glitter effect is handled by AnimatePresence below
    };

    const SidebarContent = () => (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-1">Cultural Lens</h2>
                <p className="text-xs text-white/60">Filter by category</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col gap-3">
                {CATEGORIES.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const Icon = config.icon;
                    const isActive = activeFilters.includes(category);

                    return (
                        <motion.button
                            key={category}
                            onClick={() => handleFilterToggle(category)}
                            className="relative group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Glitter particles on filter change */}
                            <AnimatePresence>
                                {isActive && (
                                    <>
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 h-1 rounded-full"
                                                style={{
                                                    backgroundColor: config.color,
                                                    left: '50%',
                                                    top: '50%',
                                                }}
                                                initial={{ opacity: 1, scale: 0 }}
                                                animate={{
                                                    opacity: 0,
                                                    scale: 1,
                                                    x: Math.cos((i / 8) * Math.PI * 2) * 50,
                                                    y: Math.sin((i / 8) * Math.PI * 2) * 50,
                                                }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.6 }}
                                            />
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>

                            {/* Button */}
                            <div
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    backdrop-blur-md transition-all duration-300
                                    border
                                    ${isActive
                                        ? 'bg-white/20 border-white/30 shadow-lg'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }
                                `}
                                style={{
                                    backgroundColor: isActive ? config.activeColor : undefined,
                                    borderColor: isActive ? config.color : undefined,
                                }}
                            >
                                <Icon
                                    size={20}
                                    style={{ color: isActive ? config.color : '#ffffff80' }}
                                    className="transition-colors duration-300"
                                />
                                <span
                                    className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/60'
                                        }`}
                                >
                                    {config.label}
                                </span>

                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="ml-auto w-2 h-2 rounded-full"
                                        style={{ backgroundColor: config.color }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Active count */}
            <div className="text-center text-xs text-white/40 pt-2 border-t border-white/10">
                {activeFilters.length} of {CATEGORIES.length} active
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile burger menu button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-40 glass-panel">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="md:hidden fixed left-0 top-0 h-full w-64 z-50 glass-panel"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
