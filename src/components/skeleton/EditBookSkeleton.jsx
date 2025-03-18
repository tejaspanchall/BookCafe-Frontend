import Skeleton from './Skeleton';

export default function EditBookSkeleton() {
  return (
    <div className="flex justify-center bg-[var(--color-bg-primary)] py-8">
      <div className="w-full max-w-2xl p-8 rounded-lg shadow-md" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        {/* Form title skeleton */}
        <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
        
        {/* Loading indicator at the top */}
        <div className="flex justify-center mb-6">
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book ID (readonly) */}
          <div className="mb-2">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md opacity-60" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* Title field */}
          <div className="mb-2">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* Author field */}
          <div className="mb-2">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* ISBN field */}
          <div className="mb-2">
            <Skeleton className="h-4 w-14 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* Price field */}
          <div className="mb-2">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* Category dropdown */}
          <div className="mb-2">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
          
          {/* Stock field */}
          <div className="mb-2">
            <Skeleton className="h-4 w-18 mb-2" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
        </div>
        
        {/* Description field - full width */}
        <div className="mt-4 mb-6">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton 
            className="h-32 w-full rounded-md" 
            style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
          />
        </div>
        
        {/* Current cover image preview */}
        <div className="mb-4">
          <Skeleton className="h-4 w-36 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-32 w-24 rounded-md" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* New cover image upload */}
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton 
            className="h-24 w-full rounded-md flex items-center justify-center" 
            style={{ borderWidth: "1px", borderStyle: "dashed", borderColor: "var(--color-border)" }}
          >
            <Skeleton className="h-16 w-16 rounded-md" />
          </Skeleton>
        </div>
        
        {/* Updated at timestamp */}
        <div className="mb-6 text-right">
          <Skeleton className="h-4 w-48 ml-auto" />
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
          {/* Delete button - left */}
          <Skeleton 
            className="h-12 w-full md:w-32 rounded-md" 
            style={{ backgroundColor: "var(--color-danger)", opacity: 0.3 }}
          />
          
          {/* Cancel and Save buttons - right */}
          <div className="flex gap-4">
            <Skeleton 
              className="h-12 w-32 rounded-md" 
              style={{ backgroundColor: "var(--color-bg-secondary)", opacity: 0.3 }}
            />
            <Skeleton 
              className="h-12 w-32 rounded-md" 
              style={{ backgroundColor: "var(--color-button-primary)", opacity: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 