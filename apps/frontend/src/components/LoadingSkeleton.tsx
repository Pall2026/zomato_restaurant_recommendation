import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-80 animate-pulse">
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
      <div className="h-20 w-full bg-orange-50/50 rounded-xl"></div>
      <div className="h-6 w-1/2 bg-red-50 rounded-full"></div>
    </div>
  </div>
);

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
      {[...Array(6)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
