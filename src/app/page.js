'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { JournalBookmark, Book, People, Laptop } from 'react-bootstrap-icons';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-secondary)] text-white py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">Welcome to BookCafe</h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8">Your digital library for educational resources. Discover, read, and learn with our extensive collection of books.</p>
            <button
              onClick={() => router.push('/catalog')}
              className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-[var(--color-bg-primary)] text-[var(--color-primary)] rounded-lg font-bold text-lg hover:bg-[var(--color-bg-secondary)] transition-colors shadow-lg"
            >
              Explore Our Catalog
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* Front book */}
              <div className="absolute transform rotate-6 w-56 h-72 md:w-64 md:h-80 z-20">
                {/* Book spine */}
                <div className="absolute left-0 top-0 w-6 h-full bg-blue-800 rounded-l-md shadow-inner flex items-center justify-center">
                  <div className="transform rotate-90 text-white text-xs whitespace-nowrap font-semibold">RANDOM BOOK NAME</div>
                </div>
                {/* Book cover */}
                <div className="absolute left-6 top-0 right-0 bottom-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-r-md shadow-md p-4">
                  <div className="h-2/3 flex items-center justify-center">
                    <JournalBookmark className="text-white text-5xl" />
                  </div>
                  <div className="h-1/3">
                    <div className="h-3 bg-white bg-opacity-70 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white bg-opacity-70 rounded w-1/2"></div>
                  </div>
                </div>
                {/* Book pages */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-white"></div>
              </div>
              
              {/* Middle book */}
              <div className="absolute transform -rotate-6 w-56 h-72 md:w-64 md:h-80 z-10">
                {/* Book spine */}
                <div className="absolute left-0 top-0 w-6 h-full bg-amber-800 rounded-l-md shadow-inner flex items-center justify-center">
                  <div className="transform rotate-90 text-white text-xs whitespace-nowrap font-semibold">CLASSIC FICTION</div>
                </div>
                {/* Book cover */}
                <div className="absolute left-6 top-0 right-0 bottom-0 bg-gradient-to-br from-amber-400 to-red-500 rounded-r-md shadow-md p-4">
                  <div className="h-2/3 flex items-center justify-center">
                    <Book className="text-white text-5xl" />
                  </div>
                  <div className="h-1/3">
                    <div className="h-3 bg-white bg-opacity-70 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white bg-opacity-70 rounded w-1/2"></div>
                  </div>
                </div>
                {/* Book pages */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-white"></div>
              </div>
              
              {/* Back book */}
              <div className="absolute transform rotate-[-15deg] w-56 h-72 md:w-64 md:h-80 -z-10 left-4">
                {/* Book spine */}
                <div className="absolute left-0 top-0 w-6 h-full bg-green-800 rounded-l-md shadow-inner flex items-center justify-center">
                  <div className="transform rotate-90 text-white text-xs whitespace-nowrap font-semibold">SCIENCE & NATURE</div>
                </div>
                {/* Book cover */}
                <div className="absolute left-6 top-0 right-0 bottom-0 bg-gradient-to-tr from-green-500 to-teal-400 rounded-r-md shadow-md p-4">
                  <div className="h-2/3 flex items-center justify-center">
                    <JournalBookmark className="text-white text-5xl" />
                  </div>
                  <div className="h-1/3">
                    <div className="h-3 bg-white bg-opacity-70 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white bg-opacity-70 rounded w-1/2"></div>
                  </div>
                </div>
                {/* Book pages */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-[var(--color-bg-secondary)]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-[var(--color-text-primary)]">Why Choose BookCafe?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[var(--color-bg-primary)] p-6 md:p-8 rounded-lg shadow-md text-center">
              <div className="text-[var(--color-primary)] text-3xl md:text-4xl mb-4 flex justify-center">
                <Book />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">Extensive Collection</h3>
              <p className="text-[var(--color-text-secondary)]">Access thousands of educational books across various subjects and disciplines.</p>
            </div>
            
            <div className="bg-[var(--color-bg-primary)] p-6 md:p-8 rounded-lg shadow-md text-center">
              <div className="text-[var(--color-primary)] text-3xl md:text-4xl mb-4 flex justify-center">
                <People />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">Community Learning</h3>
              <p className="text-[var(--color-text-secondary)]">Join a community of learners and educators sharing knowledge and resources.</p>
            </div>
            
            <div className="bg-[var(--color-bg-primary)] p-6 md:p-8 rounded-lg shadow-md text-center sm:col-span-2 md:col-span-1 mx-auto sm:mx-0 sm:max-w-none">
              <div className="text-[var(--color-primary)] text-3xl md:text-4xl mb-4 flex justify-center">
                <Laptop />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)]">Digital Access</h3>
              <p className="text-[var(--color-text-secondary)]">Read anywhere, anytime with our digital platform optimized for all devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 bg-[var(--color-secondary)] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-[rgba(255,255,255,0.1)] p-5 md:p-6 rounded-lg">
              <p className="italic mb-4">&quot;BookCafe has transformed how I access educational materials. The interface is intuitive and the collection is impressive.&quot;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)]"></div>
                <div className="ml-4">
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm opacity-75">Literature Student</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.1)] p-5 md:p-6 rounded-lg">
              <p className="italic mb-4">&quot;As an educator, I find BookCafe to be an invaluable resource for both myself and my students. The digital access makes learning accessible to everyone.&quot;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)]"></div>
                <div className="ml-4">
                  <p className="font-semibold">Dr. Michael Chen</p>
                  <p className="text-sm opacity-75">Professor of History</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-lg md:text-xl max-w-2xl mx-auto">Join our growing community of readers and educators who are discovering the power of digital learning.</p>
          </div>
        </div>
      </section>
    </main>
  );
}