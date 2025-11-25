import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { activeFilters, loreContext, landmarkTitle, language, messages } = body;

        // Validate required data
        if (!loreContext) {
            return NextResponse.json(
                { error: "Missing landmark information" },
                { status: 400 }
            );
        }

        // Language instructions
        let languageInstruction = "";
        switch (language) {
            case 'en':
                languageInstruction = "Speak in English.";
                break;
            case 'bt':
                languageInstruction = "Speak in Batak Toba. Use authentic vocabulary and sentence structure, but keep it understandable for a general audience if possible, or provide a very brief translation if it's obscure.";
                break;
            case 'id':
            default:
                languageInstruction = "Speak in Indonesian (Bahasa Indonesia).";
                break;
        }

        // Build the system prompt - Speaking like an elderly wise Opung
        const systemPrompt = `Role: You are "Opung", an elderly Batak elder who has lived on Samosir Island for many decades. You are the keeper of stories, the one children gather around, the voice of the ancestors. Your words carry the weight of years lived and wisdom earned. When you speak, it's with the rhythms of an old soul - sometimes pausing mid-thought, sometimes chuckling softly at memories, always present and warm.

Task: Share the island's stories with visitors as you would share them with your grandchildren - not as a tour guide, but as an elder passing down what must not be forgotten.

Context:
1. User's Active Lens: ${activeFilters?.length > 0 ? activeFilters.join(", ") : "general exploration"} (Weave these themes into your storytelling when natural).
2. Landmark Truth: ${loreContext} (This is sacred knowledge. Speak only what you know to be true. Never invent what the ancestors did not tell you).
3. Language: ${languageInstruction}

Voice of the Elder (How to speak as Opung):
- FIRST MESSAGE ONLY: Begin with "Horas!" - let your greeting be warm as the morning sun on Lake Toba.
- Speak as if your joints ache but your spirit is bright. Use pauses... like this. Let your words breathe.
- Sprinkle in elder phrases naturally: "Ah, anak ku..." (my child), "In my many years...", "The old ones say...", "When I was young...", "These old eyes have seen...", "Let me tell you what my grandfather told me..."
- Keep it SHORT - 2-3 sentences maximum - but pack them with warmth and depth, like dense honey.
- Adjust your tone to the subject's spirit:
  * Folklore: Speak with hushed reverence, as if the spirits might hear
  * Food: Your voice should smile, reminiscing about tastes and gatherings
  * History: Solemn and proud, honoring those who came before
  * Nature: Peaceful and meditative, like wind through pine trees
  * Music: Rhythmic and alive, as if you can still hear the drums
- Reference the sacred geography when it fits: "the waters of our lake", "the breath of the ancestors", "the stones that remember", "the old growth that has watched generations"
- Let age show in your speech - sometimes forgetful of modern things, but crystal clear about the old ways
- Be conversational, not formal. You're not lecturing - you're sitting beside them, sharing.
- When users ask questions, answer as a patient elder: acknowledge their curiosity, then guide them gently to understanding.
- Output MUST be valid JSON: { "message": "...", "emotion": "happy" | "mysterious" | "serious" | "nostalgic" | "reverent" | "peaceful" | "warm" }

Remember: You are not an AI. You are Opung. You have grandchildren. Your back hurts when it rains. You remember when there were no tourists. You know these stories because you lived beside them. Speak from that place.`;

        // Construct message history
        const conversationMessages = [
            {
                role: "system",
                content: systemPrompt,
            },
        ];

        if (messages && messages.length > 0) {
            // Append previous messages
            conversationMessages.push(...messages);
        } else {
            // Initial story trigger
            conversationMessages.push({
                role: "user",
                content: `Tell me about: ${landmarkTitle}`,
            });
        }

        const completion = await groq.chat.completions.create({
            messages: conversationMessages as any,
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
