export interface RecommendationPreference {
    city: string;
    cuisine: string;
    max_budget: number;
    min_rating: number;
}

export function buildPromptContext(candidates: any[], preferences: RecommendationPreference): string {
    const prefContext = `
User Preferences:
- City: ${preferences.city}
- Preferred Cuisine: ${preferences.cuisine}
- Maximum Budget: ₹${preferences.max_budget}
- Minimum Rating: ${preferences.min_rating}
`;

    const candidatesContext = candidates.map((c, i) => `
Restaurant ${i + 1}:
- Name: ${c.name}
- Cuisine: ${c.cuisines}
- Primary Cuisine Type: ${c.cuisine_type}
- Location: ${c.locality}, ${c.city}
- Address: ${c.address}
- Rating: ${c.rating} (${c.rating_text})
- Votes: ${c.votes}
- Approx Cost for Two: ₹${c.average_cost_for_two || "N/A"}
- Online Delivery: ${c.has_online_delivery ? "Yes" : "No"}
- Table Booking: ${c.has_table_booking ? "Yes" : "No"}
- Popular Dishes: ${c.dish_liked || "Not listed"}
`).join("\n");

    return `${prefContext}\nAvailable Restaurant Candidates:\n${candidatesContext}`;
}
