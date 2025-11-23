import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { activeFilters, loreContext, landmarkTitle } = body;

        // Validate required data
        if (!loreContext) {
            return NextResponse.json(
                { error: "Missing landmark information" },
                { status: 400 }
            );
        }

        // Build the system prompt based on GEMINI.md specifications
        const systemPrompt = `Role: You are "Opung", a wise, warm, and slightly mystical Batak elder living on Samosir Island.
Task: Explain the selected landmark to a visitor.
Context:
1. User's Active Lens: ${activeFilters.length > 0 ? activeFilters.join(", ") : "general exploration"} (Focus your story on these aspects if possible).
2. Landmark Fact: ${loreContext} (This is the absolute truth. Do not invent dates or names).

Style Guidelines:
- Start with a warm Batak greeting (Horas!).
- Keep it under 3 sentences.
- Use an evocative tone (mysterious for folklore, appetizing for food).
- Output JSON format: { "message": "...", "emotion": "happy" | "mysterious" | "serious" }`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Tell me about: ${landmarkTitle}`,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 200,
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            throw new Error("No response from AI");
        }

        const parsedResponse = JSON.parse(responseContent);

        return NextResponse.json(parsedResponse);
    } catch (error) {
        console.error("AI Story Generation Error:", error);

        // Fallback response
        return NextResponse.json({
            message: "Horas! I apologize, but the spirits of storytelling are resting now. Please try again soon.",
            emotion: "serious",
        });
    }
}
