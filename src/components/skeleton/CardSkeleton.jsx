import Skeleton from './Skeleton';

export default function CardSkeleton({ count = 6 }) {
  // Create an array with the specified count
  const skeletons = Array(count).fill(0);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {skeletons.map((_, index) => (
        <div 
          key={index} 
          className="rounded-lg shadow-md overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-primary)" }}
        >
          {/* Book cover skeleton */}
          <Skeleton className="w-full h-48" />
          
          <div className="p-4">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4 mb-2" />
            
            {/* Author skeleton */}
            <Skeleton className="h-4 w-1/2 mb-3" />
            
            {/* Button skeleton */}
            <Skeleton 
              className="h-8 w-full rounded-md mt-2" 
              style={{ backgroundColor: "var(--color-button-primary)", opacity: 0.3 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 