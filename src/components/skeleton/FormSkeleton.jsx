import Skeleton from './Skeleton';

export default function FormSkeleton({ fields = 3 }) {
  return (
    <div className="flex justify-center bg-[var(--color-bg-primary)] pt-40">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        {/* Form title skeleton */}
        <Skeleton className="h-8 w-1/2 mx-auto mb-6" />
        
        {/* Form fields */}
        {Array(fields).fill(0).map((_, index) => (
          <div key={index} className="mb-4">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton 
              className="h-10 w-full rounded-md" 
              style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
            />
          </div>
        ))}
        
        {/* Submit button skeleton */}
        <Skeleton 
          className="h-12 w-full rounded-md mt-6" 
          style={{ backgroundColor: "var(--color-button-primary)", opacity: 0.3 }}
        />
      </div>
    </div>
  );
} 