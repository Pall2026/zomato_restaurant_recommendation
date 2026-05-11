import React from 'react';

interface Recommendation {
  name: string;
  cuisine: string;
  location: string;
  rating: number | string;
  approx_cost: string;
  why_recommended: string;
  must_try_dish: string;
}

const RecommendationCard: React.FC<{ restaurant: Recommendation }> = ({ restaurant }) => {
  const ratingValue = typeof restaurant.rating === 'string' ? parseFloat(restaurant.rating) : restaurant.rating;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-orange-100 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight pr-2">{restaurant.name}</h3>
          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded-lg text-sm font-bold shrink-0">
            {ratingValue.toFixed(1)} ★
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-2 italic">🍲</span> {restaurant.cuisine}
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-2 text-red-500">📍</span> {restaurant.location}
          </p>
          <p className="text-sm font-semibold text-gray-800 flex items-center">
            <span className="mr-2 text-green-600">💰</span> {restaurant.approx_cost}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl mb-4 border-l-4 border-orange-400">
          <p className="text-sm text-orange-900 italic font-medium">
            "{restaurant.why_recommended}"
          </p>
        </div>

        <div className="mt-auto">
          <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Must Try: {restaurant.must_try_dish}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
