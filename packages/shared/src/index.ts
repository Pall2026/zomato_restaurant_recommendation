export interface RestaurantRecommendation {
    id: string;
    name: string;
    location: string;
    cuisine: string;
    priceRange: string;
    rating: number;
    aiRationale: string;
}

export interface UserPreferences {
    location?: string;
    priceRange?: string;
    cuisine?: string;
    minRating?: number;
}
