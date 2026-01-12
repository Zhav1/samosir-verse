/**
 * AI Model Configuration with 4-Stage Fallback Support
 * 
 * Provides model selection with automatic fallback when primary model
 * fails (e.g., token exhaustion, rate limits).
 * 
 * Selection Criteria for Opung (cultural storytelling with RAG):
 * - Low hallucination risk (larger models = more knowledge)
 * - High rate limits (TPM) for reliability
 * - Good instruction following for persona consistency
 * 
 * 4-Stage Fallback Chain:
 * 
 * 1. llama-3.3-70b-versatile (PRIMARY)
 *    - 70B params, 12K TPM
 *    - Excellent instruction following, versatile
 *    - Best for persona consistency (Opung character)
 * 
 * 2. openai/gpt-oss-120b (FALLBACK)
 *    - 120B params (LARGEST), 8K TPM
 *    - Most knowledgeable, lowest hallucination risk
 *    - Best fallback when quality matters most
 * 
 * 3. meta-llama/llama-4-scout-17b-16e-instruct (TERTIARY)
 *    - 17B params (16 experts MoE), 30K TPM
 *    - Fastest response, high TPM for your 10-20K token usage
 *    - Good instruction following, JSON mode supported
 * 
 * 4. groq/compound (EMERGENCY)
 *    - 70K TPM (HIGHEST), compound AI
 *    - Guaranteed availability, complex reasoning
 *    - Used when all else fails
 */

import Groq from "groq-sdk";

// Model configuration - ordered by preference (4 stages)
export const AI_MODELS = {
    primary: "llama-3.3-70b-versatile",                      // 70B - best quality + persona
    fallback: "openai/gpt-oss-120b",                         // 120B - most knowledge, low hallucination
    tertiary: "meta-llama/llama-4-scout-17b-16e-instruct",   // 17B MoE - fast, 30K TPM
    emergency: "groq/compound",                               // 70K TPM - guaranteed availability
} as const;

// Error patterns that indicate we should try fallback
const FALLBACK_ERROR_PATTERNS = [
    "rate_limit",
    "tokens",
    "exhausted",
    "quota",
    "capacity",
    "overloaded",
    "503",
    "429",
];

/**
 * Check if error should trigger fallback to alternative model
 */
export function shouldUseFallback(error: unknown): boolean {
    const errorMessage = error instanceof Error 
        ? error.message.toLowerCase() 
        : String(error).toLowerCase();
    
    return FALLBACK_ERROR_PATTERNS.some(pattern => 
        errorMessage.includes(pattern)
    );
}

interface ChatCompletionParams {
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
}

interface CompletionResult {
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Create chat completion with automatic 4-stage fallback
 * 
 * Fallback chain:
 * 1. Primary (llama-3.3-70b-versatile) - best quality, 70B params
 * 2. Fallback (openai/gpt-oss-120b) - most knowledge, 120B params
 * 3. Tertiary (llama-4-scout-17b-16e) - fast MoE, 30K TPM
 * 4. Emergency (groq/compound) - 70K TPM, guaranteed availability
 */
export async function createChatCompletionWithFallback(
    groq: Groq,
    params: ChatCompletionParams
): Promise<CompletionResult> {
    const { messages, temperature = 0.7, max_tokens = 200, response_format } = params;
    const modelsToTry = [
        AI_MODELS.primary, 
        AI_MODELS.fallback, 
        AI_MODELS.tertiary, 
        AI_MODELS.emergency
    ];
    
    let lastError: unknown;

    for (const model of modelsToTry) {
        try {
            console.log(`[AI] Trying model: ${model}`);
            
            const completion = await groq.chat.completions.create({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                messages: messages as any,
                model,
                temperature,
                max_tokens,
                response_format,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error(`No response from model: ${model}`);
            }

            if (model !== AI_MODELS.primary) {
                console.log(`[AI] Succeeded with fallback model: ${model}`);
            }

            return {
                content,
                model,
                usage: completion.usage,
            };
        } catch (error) {
            console.warn(`[AI] Model ${model} failed:`, error);
            lastError = error;

            // Check if we should try next model
            if (!shouldUseFallback(error)) {
                throw error; // Don't try fallback for non-recoverable errors
            }
            // Continue to next model in the chain
        }
    }

    // All models failed
    console.error(`[AI] All 4 models exhausted, last error:`, lastError);
    throw lastError;
}
