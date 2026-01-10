/**
 * Achievement Definitions
 * 
 * Static definition of all achievements.
 * This is used client-side for display without needing to fetch from DB.
 */

export interface AchievementDefinition {
    id: string;
    title: string;
    titleId: string;
    description: string;
    descriptionId: string;
    icon: string;
    category: 'exploration' | 'category' | 'quiz' | 'special';
    requirement: AchievementRequirement;
}

export type AchievementRequirement = 
    | { type: 'visit_count'; value: number }
    | { type: 'visit_category'; category: string; value: number }
    | { type: 'opung_chat'; value: number }
    | { type: 'quiz_complete'; value: number }
    | { type: 'quiz_perfect'; value: number };

// All achievements in the game
export const ACHIEVEMENTS: AchievementDefinition[] = [
    // Exploration achievements
    {
        id: 'first_step',
        title: 'First Step',
        titleId: 'Langkah Pertama',
        description: 'Visit your first landmark',
        descriptionId: 'Kunjungi landmark pertamamu',
        icon: '👣',
        category: 'exploration',
        requirement: { type: 'visit_count', value: 1 },
    },
    {
        id: 'explorer_5',
        title: 'Young Explorer',
        titleId: 'Penjelajah Muda',
        description: 'Visit 5 landmarks',
        descriptionId: 'Kunjungi 5 landmark',
        icon: '🗺️',
        category: 'exploration',
        requirement: { type: 'visit_count', value: 5 },
    },
    {
        id: 'explorer_15',
        title: 'Experienced Explorer',
        titleId: 'Penjelajah Berpengalaman',
        description: 'Visit 15 landmarks',
        descriptionId: 'Kunjungi 15 landmark',
        icon: '🧭',
        category: 'exploration',
        requirement: { type: 'visit_count', value: 15 },
    },
    {
        id: 'explorer_25',
        title: 'Samosir Master',
        titleId: 'Master Samosir',
        description: 'Visit all 25 landmarks',
        descriptionId: 'Kunjungi semua 25 landmark',
        icon: '🏆',
        category: 'exploration',
        requirement: { type: 'visit_count', value: 25 },
    },
    
    // Category mastery achievements
    {
        id: 'folklore_master',
        title: 'Folklore Lover',
        titleId: 'Pecinta Cerita Rakyat',
        description: 'Visit all 5 folklore landmarks',
        descriptionId: 'Kunjungi semua 5 landmark cerita rakyat',
        icon: '📜',
        category: 'category',
        requirement: { type: 'visit_category', category: 'folklore', value: 5 },
    },
    {
        id: 'music_lover',
        title: 'Batak Music Lover',
        titleId: 'Pecinta Musik Batak',
        description: 'Visit all 5 music landmarks',
        descriptionId: 'Kunjungi semua 5 landmark musik',
        icon: '🎵',
        category: 'category',
        requirement: { type: 'visit_category', category: 'music', value: 5 },
    },
    {
        id: 'foodie',
        title: 'Batak Foodie',
        titleId: 'Kuliner Batak',
        description: 'Visit all 5 food landmarks',
        descriptionId: 'Kunjungi semua 5 landmark kuliner',
        icon: '🍲',
        category: 'category',
        requirement: { type: 'visit_category', category: 'food', value: 5 },
    },
    {
        id: 'historian',
        title: 'Samosir Historian',
        titleId: 'Sejarawan Samosir',
        description: 'Visit all 5 history landmarks',
        descriptionId: 'Kunjungi semua 5 landmark sejarah',
        icon: '📚',
        category: 'category',
        requirement: { type: 'visit_category', category: 'history', value: 5 },
    },
    {
        id: 'nature_explorer',
        title: 'Nature Explorer',
        titleId: 'Penjelajah Alam',
        description: 'Visit all 5 nature landmarks',
        descriptionId: 'Kunjungi semua 5 landmark alam',
        icon: '🌿',
        category: 'category',
        requirement: { type: 'visit_category', category: 'nature', value: 5 },
    },
    
    // Special achievements
    {
        id: 'opung_friend',
        title: "Opung's Friend",
        titleId: 'Sahabat Opung',
        description: 'Chat with Opung 10 times',
        descriptionId: 'Ngobrol dengan Opung 10 kali',
        icon: '👴',
        category: 'special',
        requirement: { type: 'opung_chat', value: 10 },
    },
    
    // Quiz achievements
    {
        id: 'quiz_starter',
        title: 'New Student',
        titleId: 'Murid Baru',
        description: 'Complete your first quiz',
        descriptionId: 'Selesaikan kuis pertamamu',
        icon: '🎓',
        category: 'quiz',
        requirement: { type: 'quiz_complete', value: 1 },
    },
    {
        id: 'quiz_master',
        title: 'Cultural Genius',
        titleId: 'Cerdas Budaya',
        description: 'Score 100% on any quiz',
        descriptionId: 'Raih skor 100% di kuis manapun',
        icon: '🧠',
        category: 'quiz',
        requirement: { type: 'quiz_perfect', value: 1 },
    },
];

// Helper to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
}
