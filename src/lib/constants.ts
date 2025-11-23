import {
    Flame,
    Music,
    UtensilsCrossed,
    BookOpen,
    TreePine,
    LucideIcon
} from 'lucide-react';

// Category type matching database enum
export type Category = 'folklore' | 'music' | 'food' | 'history' | 'nature';

export const CATEGORIES: Category[] = ['folklore', 'music', 'food', 'history', 'nature'];

// Category metadata
export interface CategoryInfo {
    id: Category;
    label: string;
    icon: LucideIcon;
    color: string;
    hoverColor: string;
    bgColor: string;
    activeColor: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryInfo> = {
    folklore: {
        id: 'folklore',
        label: 'Folklore',
        icon: Flame,
        color: '#A855F7', // purple-500
        hoverColor: '#9333EA', // purple-600
        bgColor: 'rgba(168, 85, 247, 0.1)',
        activeColor: 'rgba(168, 85, 247, 0.2)',
    },
    music: {
        id: 'music',
        label: 'Music',
        icon: Music,
        color: '#3B82F6', // blue-500
        hoverColor: '#2563EB', // blue-600
        bgColor: 'rgba(59, 130, 246, 0.1)',
        activeColor: 'rgba(59, 130, 246, 0.2)',
    },
    food: {
        id: 'food',
        label: 'Food',
        icon: UtensilsCrossed,
        color: '#F97316', // orange-500
        hoverColor: '#EA580C', // orange-600
        bgColor: 'rgba(249, 115, 22, 0.1)',
        activeColor: 'rgba(249, 115, 22, 0.2)',
    },
    history: {
        id: 'history',
        label: 'History',
        icon: BookOpen,
        color: '#EAB308', // yellow-500
        hoverColor: '#CA8A04', // yellow-600
        bgColor: 'rgba(234, 179, 8, 0.1)',
        activeColor: 'rgba(234, 179, 8, 0.2)',
    },
    nature: {
        id: 'nature',
        label: 'Nature',
        icon: TreePine,
        color: '#10B981', // green-500
        hoverColor: '#059669', // green-600
        bgColor: 'rgba(16, 185, 129, 0.1)',
        activeColor: 'rgba(16, 185, 129, 0.2)',
    },
};

// Simple color mapping for 3D materials (Phase 5)
export const CATEGORY_COLORS: Record<Category, string> = {
    folklore: '#8b5cf6',  // purple-500
    music: '#3b82f6',     // blue-500
    food: '#f97316',      // orange-500
    history: '#eab308',   // yellow-500
    nature: '#10b981',    // green-500
};

// Glassmorphism styling constants
export const GLASS_STYLES = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};
