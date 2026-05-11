import Groq from "groq-sdk";
import dotenv from "dotenv";
import { buildPromptContext, RecommendationPreference } from "./context-assembler";
import { parseGroqResponse, Recommendation } from "./output-parser";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function getGroqRecommendations(
    candidates: any[],
    preferences: RecommendationPreference
): Promise<Recommendation[]> {
    const context = buildPromptContext(candidates, preferences);

    const systemPrompt = `You are an expert food critic and restaurant recommendation engine for Zomato India.
Your goal is to analyze a list of restaurant candidates and pick the top 5 that best match the user's preferences.
Provide a compelling reason for each recommendation.
You must ONLY recommend must_try_dish from the Popular Dishes list provided for each restaurant. Never invent or hallucinate dish names that are not in the Popular Dishes list. If Popular Dishes is empty or "Not listed", set must_try_dish to null.

Return ONLY a valid JSON array of objects. Do not include any conversational text before or after the JSON.
Each object must follow this schema:
{
  "name": "Restaurant Name",
  "cuisine": "Cuisine Types",
  "location": "Locality, City",
  "rating": 4.5,
  "approx_cost": "₹800 for two",
  "why_recommended": "Reason why this matches user preferences",
  "must_try_dish": "A specific popular dish"
}`;

    const userPrompt = `User Preferences and Candidate Restaurants Context:
${context}

Please provide the top 5 recommendations in the specified JSON format.`;

    const callGroq = async () => {
        console.log("[groq]: Calling Groq API with", candidates.length, "candidates");
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1000,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" } // Using json_object for better consistency
        });

        const rawContent = response.choices[0]?.message?.content || "";
        console.log("[groq]: Raw response:", rawContent);
        return rawContent;
    };

    try {
        console.log("[groq]: Requesting recommendations from LLM...");
        const rawResponse = await callGroq();
        const recommendations = parseGroqResponse(rawResponse);
        
        if (recommendations) return recommendations;
        throw new Error("Failed to parse valid recommendations from Groq");

    } catch (error) {
        console.error("[groq]: Groq API error:", error);
        console.warn("[groq]: Groq API or parsing failed, attempting retry in 2s...", error);
        
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const rawResponse = await callGroq();
            const recommendations = parseGroqResponse(rawResponse);
            if (recommendations) return recommendations;
        } catch (retryError) {
            console.error("[groq]: Retry failed, falling back to database candidates", retryError);
        }

        // Fallback: return top 5 candidates sorted by rating
        console.log("[groq]: Returning fallback recommendations from candidates list");
        return candidates
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
            .map(c => ({
                name: c.name,
                cuisine: c.cuisines,
                location: `${c.locality}, ${c.city}`,
                rating: c.rating,
                approx_cost: `₹${c.average_cost_for_two || "N/A"} for two`,
                why_recommended: "Recommended based on high rating and matching criteria (Fallback)",
                must_try_dish: "Signature Dish"
            }));
    }
}
