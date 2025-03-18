import Skeleton from './Skeleton';

export default function BookSkeleton() {
  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book cover skeleton */}
        <div className="md:w-1/3 lg:w-1/4">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </div>
        
        <div className="md:w-2/3 lg:w-3/4">
          {/* Title skeleton */}
          <Skeleton className="h-8 w-3/4 mb-3" />
          
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton 
              className="h-6 w-24 rounded-full" 
              style={{ backgroundColor: "var(--color-secondary)", opacity: 0.3 }}
            />
            <Skeleton 
              className="h-6 w-32 rounded-full" 
              style={{ backgroundColor: "var(--color-button-primary)", opacity: 0.3 }}
            />
          </div>
          
          {/* Description skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex flex-wrap gap-3">
            <Skeleton 
              className="h-10 w-32 rounded-md" 
              style={{ backgroundColor: "#059669", opacity: 0.3 }}
            />
            <Skeleton 
              className="h-10 w-32 rounded-md" 
              style={{ backgroundColor: "#2563eb", opacity: 0.3 }}
            />
            <Skeleton 
              className="h-10 w-32 rounded-md" 
              style={{ backgroundColor: "#4b5563", opacity: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 