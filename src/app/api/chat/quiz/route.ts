import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildEnhancedContext, getOpungSkills } from "@/lib/knowledge";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export async function POST(request: NextRequest) {
    // Rate limiting (stricter for quiz generation - 5 per minute)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'anonymous';
    
    const rateLimitResult = checkRateLimit(`quiz:${ip}`);
    
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Too many quiz requests. Please wait a moment." },
            { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
        );
    }

    try {
        const body = await request.json();
        const { landmarkTitle, category, loreContext, language } = body;

        if (!landmarkTitle || !loreContext) {
            return NextResponse.json(
                { error: "Missing landmark information" },
                { status: 400 }
            );
        }

        // Build context for quiz generation
        const enhancedContext = buildEnhancedContext(
            landmarkTitle,
            category || 'folklore',
            loreContext,
            language || 'en'
        );

        const opungSkills = getOpungSkills();

        // Language-specific instructions
        const langInstructions = {
            en: 'Generate questions and answers in English.',
            id: 'Generate questions and answers in Indonesian (Bahasa Indonesia).',
            bt: 'Generate questions and answers in Indonesian, but include Batak terms where appropriate.',
        };

        const systemPrompt = `${opungSkills}

---

You are Opung, creating a cultural quiz about ${landmarkTitle}.

Context about this landmark:
${enhancedContext}

${langInstructions[language as keyof typeof langInstructions] || langInstructions.en}

Generate exactly 5 multiple-choice questions about this landmark. Each question should:
1. Test knowledge about the cultural/historical significance
2. Have 4 options (only one correct)
3. Include a brief explanation of the correct answer
4. Be appropriate for cultural education

Questions should cover different aspects:
- Historical facts
- Cultural significance
- Traditional practices
- Interesting details from the lore

IMPORTANT: Output MUST be valid JSON in this exact format:
{
    "questions": [
        {
            "question": "The question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0,
            "explanation": "Brief explanation of why this is correct."
        }
    ]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create a cultural quiz about ${landmarkTitle}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            throw new Error("No response from AI");
        }

        // Log usage
        if (completion.usage) {
            console.log('[Quiz Usage]', {
                landmark: landmarkTitle,
                totalTokens: completion.usage.total_tokens,
            });
        }

        const parsedResponse = JSON.parse(responseContent);

        // Validate response structure
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error("Invalid quiz format");
        }

        // Validate each question
        const validQuestions: QuizQuestion[] = parsedResponse.questions
            .filter((q: QuizQuestion) => 
                q.question && 
                Array.isArray(q.options) && 
                q.options.length === 4 &&
                typeof q.correctIndex === 'number' &&
                q.correctIndex >= 0 &&
                q.correctIndex < 4 &&
                q.explanation
            )
            .slice(0, 5); // Max 5 questions

        if (validQuestions.length === 0) {
            throw new Error("No valid questions generated");
        }

        return NextResponse.json(
            { questions: validQuestions },
            { headers: getRateLimitHeaders(rateLimitResult) }
        );

    } catch (error) {
        console.error("Quiz Generation Error:", error);
        
        // Fallback with sample questions
        return NextResponse.json({
            questions: [
                {
                    question: "This quiz could not be generated. Would you like to explore more landmarks first?",
                    options: [
                        "Yes, let me explore",
                        "I'll try again later",
                        "Tell me more about this landmark",
                        "Show me another landmark"
                    ],
                    correctIndex: 0,
                    explanation: "Exploring landmarks helps you learn about Batak culture!"
                }
            ]
        });
    }
}
