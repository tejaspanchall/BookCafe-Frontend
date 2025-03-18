import Skeleton from './Skeleton';

export default function AuthSkeleton() {
  return (
    <div className="flex justify-center bg-[var(--color-bg-primary)] pt-20">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: "var(--color-bg-primary)" }}>
        {/* Form title skeleton */}
        <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
        
        {/* Username/Email field */}
        <div className="mb-5">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton 
            className="h-10 w-full rounded-md" 
            style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
          />
        </div>
        
        {/* Password field */}
        <div className="mb-5">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton 
            className="h-10 w-full rounded-md" 
            style={{ borderWidth: "1px", borderColor: "var(--color-border)" }}
          />
        </div>
        
        {/* Remember me / Forgot password */}
        <div className="flex justify-between mb-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        
        {/* Submit button skeleton */}
        <Skeleton 
          className="h-12 w-full rounded-md mb-4" 
          style={{ backgroundColor: "var(--color-button-primary)", opacity: 0.3 }}
        />
        
        {/* Sign up / Login alternative text */}
        <div className="text-center mt-5">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
} 