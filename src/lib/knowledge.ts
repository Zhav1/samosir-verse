/**
 * Knowledge Base Loader for Opung AI Chatbot
 * 
 * Provides grounding context from markdown files to reduce hallucination.
 * Includes in-memory caching and token truncation.
 */

import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

// Initialize Groq client for prompt guard
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// CACHING SYSTEM
// ============================================================

interface CacheEntry {
    content: string;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): string | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    
    return entry.content;
}

function setCache(key: string, content: string): void {
    cache.set(key, {
        content,
        timestamp: Date.now(),
    });
}

// ============================================================
// FILE READING UTILITIES
// ============================================================

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

function readKnowledgeFile(relativePath: string): string | null {
    const cacheKey = `file:${relativePath}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
        const filePath = path.join(KNOWLEDGE_DIR, relativePath);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        setCache(cacheKey, content);
        return content;
    } catch (error) {
        console.error(`[Knowledge] Failed to read ${relativePath}:`, error);
        return null;
    }
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get the Opung agent persona/skills definition
 */
export function getOpungSkills(): string {
    return readKnowledgeFile('opung-skills.md') || '';
}

/**
 * Get the global cultural term glossary
 */
export function getGlossary(): string {
    return readKnowledgeFile('glossary.md') || '';
}

/**
 * Get detailed knowledge for a specific landmark
 * @param title - Landmark title (e.g., "Sigale-gale")
 * @param category - Category (e.g., "folklore")
 */
export function getLandmarkKnowledge(title: string, category: string): string | null {
    // Convert title to slug format (e.g., "Sigale-gale" -> "sigale-gale")
    const slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    
    const relativePath = `landmarks/${category}/${slug}.md`;
    return readKnowledgeFile(relativePath);
}

/**
 * Truncate text to approximate token limit
 * Uses rough estimate: 1 token ≈ 4 characters
 * @param text - Text to truncate
 * @param maxTokens - Maximum tokens allowed
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 4; // Rough estimate
    
    if (text.length <= maxChars) {
        return text;
    }
    
    // Truncate and add indicator
    return text.substring(0, maxChars - 20) + '\n\n[Content truncated]';
}

// ============================================================
// PROMPT GUARD
// ============================================================

interface SafetyCheckResult {
    safe: boolean;
    reason?: string;
}

/**
 * Check if user input is safe using Llama Prompt Guard
 * Detects prompt injection and jailbreak attempts
 * @param userMessage - The user's input message
 */
export async function checkPromptSafety(userMessage: string): Promise<SafetyCheckResult> {
    // Skip check for very short messages (likely safe)
    if (userMessage.length < 10) {
        return { safe: true };
    }
    
    try {
        const response = await groq.chat.completions.create({
            model: 'meta-llama/llama-prompt-guard-2-86m',
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
            max_tokens: 50,
            temperature: 0,
        });
        
        const result = response.choices[0]?.message?.content?.toLowerCase() || '';
        
        // Check for unsafe indicators
        if (result.includes('unsafe') || result.includes('jailbreak') || result.includes('injection')) {
            return { 
                safe: false, 
                reason: 'prompt_injection_detected' 
            };
        }
        
        return { safe: true };
    } catch (error) {
        console.error('[PromptGuard] Safety check failed:', error);
        // Fail open - allow message if guard fails (better UX)
        return { safe: true };
    }
}

/**
 * Build enhanced context for AI prompt
 * Combines landmark knowledge + glossary + skills reference
 */
export function buildEnhancedContext(
    landmarkTitle: string,
    category: string,
    dbLoreContext: string,
    language: 'en' | 'id' | 'bt'
): string {
    const landmarkKnowledge = getLandmarkKnowledge(landmarkTitle, category);
    const glossary = getGlossary();
    
    // Language-specific guidance
    const languageGuide = {
        en: 'Use English terms from the glossary.',
        id: 'Use Indonesian terms from the glossary. Keep sacred terms (Ulos, Dalihan Na Tolu) untranslated.',
        bt: 'Use Batak Toba terms from the glossary. Speak in authentic Batak Toba.',
    };
    
    let enhancedContext = dbLoreContext;
    
    if (landmarkKnowledge) {
        enhancedContext += `\n\n## Detailed Knowledge (Source of Truth):\n${truncateToTokenLimit(landmarkKnowledge, 500)}`;
    }
    
    if (glossary) {
        // Only include relevant sections of glossary (to save tokens)
        const glossarySection = extractRelevantGlossary(glossary, category);
        enhancedContext += `\n\n## Term Glossary:\n${glossarySection}`;
    }
    
    enhancedContext += `\n\n## Language Guidance:\n${languageGuide[language]}`;
    
    return enhancedContext;
}

/**
 * Extract glossary sections relevant to the category
 */
function extractRelevantGlossary(fullGlossary: string, category: string): string {
    // Always include Core Batak Terms
    const sections: string[] = [];
    
    // Extract Core Batak Terms section
    const coreMatch = fullGlossary.match(/## Core Batak Terms[\s\S]*?(?=##|$)/);
    if (coreMatch) {
        sections.push(coreMatch[0].trim());
    }
    
    // Extract category-specific section
    const categoryMap: Record<string, string> = {
        folklore: 'Sacred/Religious Terms',
        music: 'Music Terms',
        food: 'Food Terms',
        history: 'Place Terms',
        nature: 'Place Terms',
    };
    
    const sectionName = categoryMap[category];
    if (sectionName) {
        const regex = new RegExp(`## ${sectionName}[\\s\\S]*?(?=##|$)`);
        const match = fullGlossary.match(regex);
        if (match) {
            sections.push(match[0].trim());
        }
    }
    
    return sections.join('\n\n');
}
