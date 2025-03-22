'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { JournalBookmark, Book, People, Laptop, ChevronRight, ChevronLeft } from 'react-bootstrap-icons';
import BookCard from '@/components/books/BookCard';
import { CardSkeleton } from '@/components/skeleton';
import CategoryHighlight from '@/components/books/CategoryHighlight';

export default function Home() {
  const router = useRouter();
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const [popularBooks, setPopularBooks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [noBooks, setNoBooks] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  // Categories to display
  const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'Educational', 'Mystery', 'Biography'];
  
  // Helper function to get categories that have books
  const getAvailableCategories = () => {
    return categories.filter(cat => popularBooks[cat]?.length > 0);
  };
  
  const getImageUrl = (imagePath) => {
    try {
      // If no image path provided, return placeholder
      if (!imagePath) {
        return "https://via.placeholder.com/200x300?text=Book+Cover";
      }

      // If it's already a full URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // Make sure we have a backend URL
      if (!BACKEND) {
        return "https://via.placeholder.com/200x300?text=Error+Loading+Image";
      }

      // Remove /api/ from BACKEND URL if it exists
      const baseUrl = BACKEND.replace('/api', '');

      // For local storage paths, ensure we don't duplicate the 'books' directory
      const imageName = imagePath.replace(/^books\//, '');
      return `${baseUrl}/storage/books/${imageName}`;
    } catch (error) {
      console.error("Error generating image URL:", error);
      return "https://via.placeholder.com/200x300?text=Error+Loading+Image";
    }
  };

  useEffect(() => {
    const fetchPopularBooks = async () => {
      setIsLoading(true);
      try {
        // Validate backend URL
        if (!BACKEND) {
          console.error("Backend URL is not defined. Check your .env file");
          setNoBooks(true);
          return;
        }

        const results = {};
        // Fetch all books at once
        const url = `${BACKEND}/books/get-books`;
        console.log("Fetching books from:", url);
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch books: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        if (data.status === 'success') {
          const allBooks = data.books || [];
          console.log("Total books fetched:", allBooks.length);
          
          if (allBooks.length === 0) {
            setNoBooks(true);
            return;
          }
          
          let totalBooksFound = 0;
          
          // Process each category
          for (const category of categories) {
            // Case-insensitive filtering with more flexible matching
            const categoryBooks = allBooks
              .filter(book => {
                if (!book.category) return false;
                
                const bookCategory = book.category.toLowerCase();
                const searchCategory = category.toLowerCase();
                
                // Try different matching strategies
                return (
                  bookCategory === searchCategory ||
                  bookCategory.includes(searchCategory) ||
                  searchCategory.includes(bookCategory) ||
                  // Handle plurals (e.g., "Science" matches "Sciences")
                  (bookCategory.endsWith('s') && searchCategory === bookCategory.slice(0, -1)) ||
                  (searchCategory.endsWith('s') && bookCategory === searchCategory.slice(0, -1))
                );
              })
              // Sort by popularity metrics instead of just ID
              // This prioritizes books with ratings or views if available, then falls back to newest (ID)
              .sort((a, b) => {
                // First sort by rating if available
                if (a.rating !== undefined && b.rating !== undefined) {
                  return b.rating - a.rating;
                }
                // Then by view count if available
                if (a.views !== undefined && b.views !== undefined) {
                  return b.views - a.views;
                }
                // Finally sort by newest (ID)
                return b.id - a.id;
              })
              .slice(0, 6);
            
            console.log(`Books in ${category} category:`, categoryBooks.length);
            results[category] = categoryBooks;
            totalBooksFound += categoryBooks.length;
          }
          
          // If no books found in any category
          setNoBooks(totalBooksFound === 0);
        } else {
          console.error("API returned error:", data);
          setNoBooks(true);
        }
        
        setPopularBooks(results);
        
        // Initialize categories 
        initializeCategories(results);

      } catch (error) {
        console.error("Error fetching popular books:", error);
        setNoBooks(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to initialize categories after fetching data
    const initializeCategories = (booksData) => {
      // Get only categories that have books
      const availableCategories = categories.filter(cat => booksData[cat]?.length > 0);
      
      if (availableCategories.length > 0) {
        // Set active category to the first one that has books
        const firstCategoryWithBooks = availableCategories[0];
        setActiveCategory(firstCategoryWithBooks);
        // Also set category index to match
        setCategoryIndex(categories.indexOf(firstCategoryWithBooks));
      } else {
        // If no categories have books, set noBooks to true
        setNoBooks(true);
      }
    };
    
    fetchPopularBooks();
  }, []);
  
  const handleNextCategory = () => {
    // Get only categories that have books
    const availableCategories = getAvailableCategories();
    if (availableCategories.length === 0) return;
    
    // Find current index in available categories
    const currentIndex = availableCategories.indexOf(activeCategory);
    // Get next index, wrapping around if needed
    const nextIndex = (currentIndex + 1) % availableCategories.length;
    // Get the actual category at that index
    const nextCategory = availableCategories[nextIndex];
    
    // Use the handleCategoryChange to update the active category
    handleCategoryChange(nextCategory, categories.indexOf(nextCategory));
  };
  
  const handlePrevCategory = () => {
    // Get only categories that have books
    const availableCategories = getAvailableCategories();
    if (availableCategories.length === 0) return;
    
    // Find current index in available categories
    const currentIndex = availableCategories.indexOf(activeCategory);
    // Get previous index, wrapping around if needed
    const prevIndex = (currentIndex - 1 + availableCategories.length) % availableCategories.length;
    // Get the actual category at that index
    const prevCategory = availableCategories[prevIndex];
    
    // Use the handleCategoryChange to update the active category
    handleCategoryChange(prevCategory, categories.indexOf(prevCategory));
  };
  
  const handleCategoryChange = (category, index) => {
    setCategoryLoading(true);
    setActiveCategory(category);
    setCategoryIndex(index);
    // Use setTimeout to create a small delay for transition effect
    setTimeout(() => {
      setCategoryLoading(false);
    }, 300);
  };
  
  const handleBookClick = (bookId) => {
    router.push(`/book/${bookId}`);
  };

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

      {/* Popular Books Section */}
      <section className="py-12 md:py-16 bg-[var(--color-bg-primary)]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              Popular Books
            </h2>
            <button
              onClick={() => router.push('/catalog')}
              className="text-[var(--color-primary)] hover:underline font-medium flex items-center"
            >
              View All <ChevronRight className="ml-1" />
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center overflow-x-auto pb-2 max-w-[80%] md:max-w-none hide-scrollbar">
              {getAvailableCategories().map((category, index) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category, categories.indexOf(category))}
                  className={`mr-2 px-4 py-2 rounded-full text-sm md:text-base transition-colors duration-200 whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-[var(--color-secondary)] text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {getAvailableCategories().length > 1 && (
              <div className="flex space-x-2 ml-2">
                <button
                  onClick={handlePrevCategory}
                  className="p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={handleNextCategory}
                  className="p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <CardSkeleton count={6} />
          ) : noBooks ? (
            <div className="text-center py-10 bg-[var(--color-bg-secondary)] rounded-lg">
              <h3 className="text-[var(--color-text-primary)] text-xl font-medium mb-2">No Books Found</h3>
              <p className="text-[var(--color-text-secondary)] mb-6">We couldn't find any books in our catalog. Would you like to add some?</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => router.push('/catalog')}
                  className="px-4 py-2 bg-[var(--color-bg-primary)] text-[var(--color-primary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                >
                  Browse Catalog
                </button>
                <button
                  onClick={() => router.push('/add-book')}
                  className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Add New Book
                </button>
              </div>
            </div>
          ) : categoryLoading ? (
            <CardSkeleton count={6} />
          ) : popularBooks[activeCategory]?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularBooks[activeCategory].map((book) => (
                <div key={book.id} className="flex justify-center">
                  <BookCard
                    book={book}
                    onClick={() => handleBookClick(book.id)}
                    getImageUrl={getImageUrl}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-center py-8 bg-[var(--color-bg-secondary)] rounded-lg mb-8">
                <p className="text-[var(--color-text-secondary)] mb-4">No books found in the "{activeCategory}" category</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => {
                      // Get available categories
                      const availableCategories = getAvailableCategories();
                      if (availableCategories.length > 0) {
                        // Get the first available category
                        const firstAvailableCategory = availableCategories[0];
                        handleCategoryChange(firstAvailableCategory, categories.indexOf(firstAvailableCategory));
                      }
                    }}
                    className="px-4 py-2 bg-[var(--color-bg-primary)] text-[var(--color-primary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                  >
                    Show Available Books
                  </button>
                  <button
                    onClick={() => router.push('/add-book')}
                    className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Add Book in {activeCategory}
                  </button>
                </div>
              </div>
              
              {/* Recommendations from other categories */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  Explore other categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAvailableCategories()
                    .filter(cat => cat !== activeCategory)
                    .slice(0, 3)
                    .map(category => (
                      <CategoryHighlight 
                        key={category}
                        title={category}
                        books={popularBooks[category]}
                        onBookClick={handleBookClick}
                        getImageUrl={getImageUrl}
                        onAddBook={() => router.push('/add-book')}
                      />
                    ))
                  }
                </div>
              </div>
            </div>
          )}
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