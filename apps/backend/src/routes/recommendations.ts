import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { query } from "../db/client";
import { getGroqRecommendations } from "../llm/groq";

const recommendationsRouter = Router();

const RecommendationRequestSchema = z.object({
    city: z.string().min(1, "City is required"),
    cuisine: z.string().optional().nullable(),
    max_budget: z.number().optional().default(9999),
    min_rating: z.number().optional().default(0).refine(val => val >= 0 && val <= 5, {
        message: "min_rating must be between 0 and 5"
    })
});

recommendationsRouter.post("/recommendations", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const validation = RecommendationRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: validation.error.flatten().fieldErrors
            });
        }

        const { city, cuisine, max_budget, min_rating } = validation.data;

        // Query database for candidates
        const dbQuery = `
            SELECT id, name, cuisine_type, city, locality, address, 
                   price_range, average_cost_for_two, rating, 
                   rating_text, votes, has_online_delivery, 
                   has_table_booking, cuisines,
                   raw_data->>'dish_liked' as dish_liked
            FROM restaurants
            WHERE city ILIKE $1
            AND ($2::text IS NULL OR cuisine_type ILIKE $2)
            AND (average_cost_for_two <= $3 OR average_cost_for_two = 0 OR average_cost_for_two IS NULL)
            AND (rating >= $4 OR rating IS NULL OR $4 = 0)
            ORDER BY COALESCE(rating, 0) * 1000 + COALESCE(votes, 0) DESC
            LIMIT 20
        `;

        const result = await query(dbQuery, [
            city,
            cuisine || null,
            max_budget,
            min_rating
        ]);

        const candidates = result.rows;

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No restaurants found matching your criteria"
            });
        }

        // Get AI recommendations from Groq
        const recommendations = await getGroqRecommendations(candidates, {
            city,
            cuisine: cuisine || "Any",
            max_budget,
            min_rating
        });

        res.json({
            success: true,
            count: recommendations.length,
            preferences: { city, cuisine, max_budget, min_rating },
            recommendations
        });

    } catch (error) {
        next(error);
    }
});

export default recommendationsRouter;
 
