/**
 * Achievement Service
 * 
 * Handles checking and unlocking achievements based on user progress.
 * Runs client-side using Zustand store data.
 */

import { useAppStore, QuizScore } from '@/store/useAppStore';
import { ACHIEVEMENTS, AchievementDefinition } from '@/lib/achievements';
import { Landmark } from '@/types';

/**
 * Check all achievements and unlock any that are newly earned
 * Call this after any progress-related action
 */
export function checkAndUnlockAchievements(landmarks: Landmark[]): string[] {
    const store = useAppStore.getState();
    const { 
        visitedLandmarks, 
        opungChatCount, 
        quizScores,
        hasAchievement,
        unlockAchievement 
    } = store;
    
    const newlyUnlocked: string[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (hasAchievement(achievement.id)) continue;
        
        // Check if requirement is met
        const isUnlocked = checkRequirement(
            achievement,
            visitedLandmarks,
            opungChatCount,
            quizScores,
            landmarks
        );
        
        if (isUnlocked) {
            unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement.id);
        }
    }
    
    return newlyUnlocked;
}

/**
 * Check if a specific achievement requirement is met
 */
function checkRequirement(
    achievement: AchievementDefinition,
    visitedLandmarks: string[],
    opungChatCount: number,
    quizScores: QuizScore[],
    allLandmarks: Landmark[]
): boolean {
    const req = achievement.requirement;
    
    switch (req.type) {
        case 'visit_count':
            return visitedLandmarks.length >= req.value;
            
        case 'visit_category': {
            // Count visited landmarks in specific category
            const categoryLandmarks = allLandmarks.filter(l => l.category === req.category);
            const visitedInCategory = categoryLandmarks.filter(l => 
                visitedLandmarks.includes(l.id)
            );
            return visitedInCategory.length >= req.value;
        }
            
        case 'opung_chat':
            return opungChatCount >= req.value;
            
        case 'quiz_complete':
            return quizScores.length >= req.value;
            
        case 'quiz_perfect':
            return quizScores.some(q => q.score === q.maxScore);
            
        default:
            return false;
    }
}

/**
 * Get progress towards a specific achievement
 * Returns { current, required, percentage }
 */
export function getAchievementProgress(
    achievement: AchievementDefinition,
    landmarks: Landmark[]
): { current: number; required: number; percentage: number } {
    const store = useAppStore.getState();
    const { visitedLandmarks, opungChatCount, quizScores } = store;
    
    const req = achievement.requirement;
    let current = 0;
    let required = 0;
    
    switch (req.type) {
        case 'visit_count':
            current = visitedLandmarks.length;
            required = req.value;
            break;
            
        case 'visit_category': {
            const categoryLandmarks = landmarks.filter(l => l.category === req.category);
            const visitedInCategory = categoryLandmarks.filter(l => 
                visitedLandmarks.includes(l.id)
            );
            current = visitedInCategory.length;
            required = req.value;
            break;
        }
            
        case 'opung_chat':
            current = opungChatCount;
            required = req.value;
            break;
            
        case 'quiz_complete':
            current = quizScores.length;
            required = req.value;
            break;
            
        case 'quiz_perfect':
            current = quizScores.some(q => q.score === q.maxScore) ? 1 : 0;
            required = req.value;
            break;
    }
    
    const percentage = Math.min(100, Math.round((current / required) * 100));
    
    return { current, required, percentage };
}

/**
 * Get summary of all achievements
 */
export function getAchievementSummary(): {
    total: number;
    unlocked: number;
    percentage: number;
} {
    const { achievements } = useAppStore.getState();
    const total = ACHIEVEMENTS.length;
    const unlocked = achievements.length;
    const percentage = Math.round((unlocked / total) * 100);
    
    return { total, unlocked, percentage };
}
