import React from 'react';

export const CardSkeleton = ({ count = 6, layout = "grid", showStats = false, showFilters = false }) => {
  // Dashboard layout
  if (layout === "dashboard") {
    return (
      <>
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-200 animate-pulse">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-16 mt-2"></div>
            </div>
          ))}
        </div>

        {/* Action Cards Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(count)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Stats section skeleton for My Library page
  const StatsSection = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex-1 bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );

  // Filters section skeleton for My Library page
  const FiltersSection = () => (
    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 animate-pulse">
      <div className="flex md:flex-row flex-col gap-4 w-full md:w-auto">
        <div className="w-full md:w-64 h-10 bg-gray-200 rounded-full"></div>
        <div className="w-full md:w-48 h-10 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (layout === "my-library") {
    return (
      <>
        {showStats && <StatsSection />}
        {showFilters && <FiltersSection />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
          {[...Array(count)].map((_, index) => (
            <div key={index} className="bg-white rounded-md shadow-md overflow-hidden h-[360px] flex flex-col animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 flex-grow">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="px-4 pb-4 flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
  
  // Default grid layout (for catalog)
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white rounded-md shadow-md overflow-hidden h-[360px] flex flex-col animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 flex-grow">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="px-4 pb-4 flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List layout for books
  return (
    <div className="flex flex-col gap-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-white rounded-md shadow-md overflow-hidden flex animate-pulse">
          <div className="w-32 h-48 bg-gray-200"></div>
          <div className="p-4 flex-grow">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <div className="h-10 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Book detail page skeleton
export const BookSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Back button */}
      <div className="mb-6">
        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Book cover */}
        <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
          <div className="w-64 h-96 bg-gray-200 rounded-lg shadow-md"></div>
        </div>
        
        {/* Book details */}
        <div className="w-full lg:w-2/3">
          {/* Title */}
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          
          {/* Author and categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="h-8 bg-gray-200 rounded-full w-32"></div>
            <div className="h-8 bg-gray-200 rounded-full w-28"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          </div>
          
          {/* Book metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 