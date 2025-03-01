'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
          Welcome to Book Cafe
        </h1>
        <div className="space-x-4 mt-6">
          <button
            onClick={() => router.push('/catalog')}
            className="px-6 py-3 bg-[var(--color-button-primary)] text-white rounded-lg hover:bg-[var(--color-button-hover)] transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}