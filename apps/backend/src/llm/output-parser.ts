import { z } from "zod";

const RecommendationSchema = z.object({
    name: z.string(),
    cuisine: z.string(),
    location: z.string(),
    rating: z.union([z.number(), z.string()]),
    approx_cost: z.union([z.number(), z.string()]),
    why_recommended: z.string(),
    must_try_dish: z.string().nullable(),
});

const RecommendationsArraySchema = z.array(RecommendationSchema);

export type Recommendation = z.infer<typeof RecommendationSchema>;

export function parseGroqResponse(rawResponse: string): Recommendation[] | null {
    try {
        // Find the start and end of the JSON object or array in case there is surrounding text
        const firstBrace = rawResponse.indexOf("{");
        const firstBracket = rawResponse.indexOf("[");
        const jsonStart = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
        
        const lastBrace = rawResponse.lastIndexOf("}");
        const lastBracket = rawResponse.lastIndexOf("]");
        const jsonEnd = lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket) ? lastBrace + 1 : lastBracket + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            console.error("[llm-parser]: No JSON found in response");
            return null;
        }

        const jsonContent = rawResponse.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonContent);
        
        // Handle both wrapper object and direct array formats
        const dataToValidate = parsed.recommendations ? parsed.recommendations : parsed;
        const result = RecommendationsArraySchema.safeParse(dataToValidate);
        if (!result.success) {
            console.error("[llm-parser]: Zod validation failed", result.error);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error("[parser]: Failed to parse:", rawResponse);
        console.error("[llm-parser]: Failed to parse LLM response", error);
        return null;
    }
}
