"use client";

import { useState } from "react";
import RecommendationCard from "../components/RecommendationCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

const CITIES = [
  "BTM",
  "Koramangala 7th Block",
  "Koramangala 5th Block",
  "Koramangala 4th Block",
  "Koramangala 6th Block",
  "Jayanagar",
  "JP Nagar",
  "Indiranagar",
  "Church Street",
  "MG Road",
  "Brigade Road",
  "Lavelle Road",
  "HSR",
  "Marathahalli",
  "Whitefield",
  "Residency Road",
  "Bannerghatta Road",
  "Brookefield",
  "Old Airport Road",
  "Kammanahalli",
  "Banashankari",
  "Basavanagudi",
  "Kalyan Nagar",
  "New BEL Road",
  "Rajajinagar",
];

export default function Home() {
  const [city, setCity] = useState("BTM");
  const [cuisine, setCuisine] = useState("");
  const [budget, setBudget] = useState("9999");
  const [rating, setRating] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          ...(cuisine && { cuisine }),
          max_budget: Number(budget),
          min_rating: Number(rating),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the recommendation service. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDFB]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-500 to-red-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-md">
            Find Your Next Favorite Meal
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-10">
            AI-powered recommendations based on your preferences and real Zomato data.
          </p>

          {/* Search Form */}
          <form 
            onSubmit={handleSearch}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-end text-gray-800"
          >
            <div className="w-full md:w-1/4 text-left">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">City</label>
              <select 
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-full md:w-1/4 text-left">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Cuisine</label>
              <select 
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">All Cuisines</option>
                <option value="North Indian">North Indian</option>
                <option value="South Indian">South Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Italian">Italian</option>
                <option value="Continental">Continental</option>
                <option value="Cafe">Cafe</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Biryani">Biryani</option>
                <option value="Street Food">Street Food</option>
                <option value="Mughlai">Mughlai</option>
                <option value="Pizza">Pizza</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            <div className="w-full md:w-1/4 text-left">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Budget (for two)</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="9999">Any Budget</option>
                <option value="300">Under ₹300</option>
                <option value="500">Under ₹500</option>
                <option value="800">Under ₹800</option>
                <option value="1000">Under ₹1000</option>
                <option value="1500">Under ₹1500</option>
                <option value="2000">Under ₹2000</option>
              </select>
            </div>

            <div className="w-full md:w-1/4 text-left">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-tight">
                Rating ({rating}+)
              </label>
              <div className="flex items-center h-12 w-full">
                <input 
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? "SEARCHING..." : "FIND"}
            </button>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-10 animate-pulse">Our AI is picking the best spots for you...</h2>
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-100 p-8 rounded-3xl text-center">
            <span className="text-5xl mb-4 block">😕</span>
            <h3 className="text-xl font-bold text-red-800 mb-2">Oops! No luck.</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {recommendations.length > 0 && !loading && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-10 border-l-8 border-red-500 pl-4">
              AI Recommendations for {city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((res, i) => (
                <RecommendationCard key={i} restaurant={res} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <span className="text-8xl mb-6 block">🍽️</span>
            <p className="text-2xl font-bold text-gray-400">Select your preferences to see recommendations</p>
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 border-t border-gray-100">
        <p>© 2026 AI Restaurant Recommendation Service • Built with Next.js & Groq</p>
      </footer>
    </main>
  );
}
