'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/books/BookCard';
import { Search, Funnel, Check, ArrowUp, ArrowDown, XCircle } from 'react-bootstrap-icons';
import { CardSkeleton } from '@/components/skeleton';

// Add custom styles for the scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-secondary);
  }
`;

export default function BookCatalog() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState("recent");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const BOOKS_PER_PAGE = 18; // 6 books per row * 3 rows = 18 books per page
  
  const observer = useRef();
  const lastBookElementRef = useCallback(node => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreBooks();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMore]);

  const getImageUrl = (imagePath) => {
    console.log('Catalog - Constructing image URL:', {
      originalPath: imagePath,
      backendUrl: BACKEND
    });

    // If no image path provided, return placeholder
    if (!imagePath) {
      console.log('Catalog - No image path provided, using placeholder');
      return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

    // If it's already a full URL (starts with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('Catalog - Using direct URL:', imagePath);
      return imagePath;
    }

    // If it's a data URL, use it directly
    if (imagePath.startsWith('data:')) {
      console.log('Catalog - Using data URL'); 
      return imagePath;
    }

    // Get the base URL without /api
    const baseUrl = BACKEND.replace('/api', '');

    // For local storage paths, ensure we don't duplicate the 'books' directory
    const imageName = imagePath.replace(/^books\//, '');
    const finalUrl = `${baseUrl}/storage/books/${encodeURIComponent(imageName)}`;
    
    console.log('Catalog - Constructed storage URL:', {
      baseUrl,
      imagePath,
      imageName,
      finalUrl,
      fullPath: `${baseUrl}/storage/books/${encodeURIComponent(imageName)}`
    });
    
    return finalUrl;
  };

  const applyFilter = (books) => {
    // First filter by selected categories
    let filteredBooks = books;
    
    if (selectedCategories.length > 0) {
      filteredBooks = filteredBooks.filter(book => {
        // If book has no categories, check if 'Uncategorized' is selected
        if (!book.categories || book.categories.length === 0) {
          return selectedCategories.includes('Uncategorized');
        }
        
        // Check if any of the book's categories match any of the selected categories
        return book.categories.some(cat => 
          selectedCategories.includes(cat.name)
        );
      });
    }
    
    // Then filter by price range
    filteredBooks = filteredBooks.filter(book => {
      const price = parseFloat(book.price || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Finally apply sorting
    switch (filter) {
      case "asc":
        return [...filteredBooks].sort((a, b) => a.title.localeCompare(b.title));
      case "desc":
        return [...filteredBooks].sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
        return [...filteredBooks].sort((a, b) => b.id - a.id);
      case "last":
        return [...filteredBooks].sort((a, b) => a.id - b.id);
      case "price_low_high":
        return [...filteredBooks].sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
      case "price_high_low":
        return [...filteredBooks].sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
      default:
        return filteredBooks;
    }
  };

  const searchBooks = async () => {
    setIsLoading(true);
    setPageNumber(1);
    try {
      let url;
      if (search) {
        url = `${BACKEND}/books/search?query=${encodeURIComponent(search)}`;
      } else {
        url = `${BACKEND}/books/get-books`;
      }
      
      console.log("Fetching from URL:", url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("API Response:", data);
      
      const books = data.status === 'success' ? data.books : [];
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        books.flatMap(book => 
          book.categories && book.categories.length > 0 
            ? book.categories.map(cat => cat.name) 
            : ['Uncategorized']
        )
      )].sort();
      setCategories(uniqueCategories);
      
      const filteredBooks = applyFilter(books);
      setAllBooks(books);

      // Set displayed books to first page
      const booksToDisplay = filteredBooks.slice(0, BOOKS_PER_PAGE);
      setDisplayedBooks(booksToDisplay);
      
      // Determine if there are more books to load
      setHasMore(filteredBooks.length > BOOKS_PER_PAGE);
      
      setMessage("");
    } catch (error) {
      console.error("Fetch error details:", error);
      setMessage(`Search failed: ${error.message}`);
      setAllBooks([]);
      setDisplayedBooks([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreBooks = () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Calculate next page
    const nextPage = pageNumber + 1;
    const startIndex = (nextPage - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    
    // Get filtered books
    const filteredBooks = applyFilter(allBooks);
    
    // Get next batch of books
    const nextBatch = filteredBooks.slice(startIndex, endIndex);
    
    // Update state after a small delay to avoid UI freezes
    setTimeout(() => {
      setDisplayedBooks(prev => [...prev, ...nextBatch]);
      setPageNumber(nextPage);
      setHasMore(endIndex < filteredBooks.length);
      setIsLoadingMore(false);
    }, 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchBooks().catch(err => {
        console.error("Initial load error:", err);
        setMessage("Could not load books. Please check your API configuration.");
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (allBooks.length) {
      setPageNumber(1);
      const filteredBooks = applyFilter(allBooks);
      const booksToDisplay = filteredBooks.slice(0, BOOKS_PER_PAGE);
      setDisplayedBooks(booksToDisplay);
      setHasMore(filteredBooks.length > BOOKS_PER_PAGE);
    }
  }, [filter, selectedCategories, priceRange]);

  const handleBookClick = (bookId) => {
    router.refresh();
    router.push(`/book/${bookId}`);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handlePriceRangeChange = (value) => {
    setPriceRange([0, value]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setFilter("recent");
  };

  const FilterSidebar = () => (
    <div 
      className={`bg-white p-4 rounded-lg shadow-md ${isMobileFilterOpen ? 'block' : 'hidden'} md:block md:sticky md:top-4`}
      style={{ 
        backgroundColor: "var(--color-bg-secondary)", 
        color: "var(--color-text-primary)",
        maxHeight: "calc(100vh - 2rem)",
        overflowY: "auto"
      }}
    >
      <div className="flex justify-between items-center mb-4 sticky top-0 pt-1 pb-2 bg-inherit z-10">
        <h3 className="text-lg font-bold">Filters</h3>
        <button 
          onClick={clearFilters}
          className="text-sm flex items-center gap-1 hover:underline transition-colors duration-200 px-2 py-1 rounded-md"
          style={{ 
            color: "var(--color-secondary)",
            backgroundColor: "rgba(var(--color-secondary-rgb), 0.1)"
          }}
        >
          <XCircle size={14} /> Clear all
        </button>
      </div>
      
      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2 border-b pb-1" style={{ borderColor: "var(--color-border)" }}>Sort By</h4>
        <div className="space-y-1.5">
          <button 
            onClick={() => setFilter("recent")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'recent' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'recent' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'recent' && <Check size={14} />} Recently Added
          </button>
          <button 
            onClick={() => setFilter("last")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'last' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'last' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'last' && <Check size={14} />} Last Added
          </button>
          <button 
            onClick={() => setFilter("asc")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'asc' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'asc' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'asc' && <Check size={14} />} Title (A-Z)
          </button>
          <button 
            onClick={() => setFilter("desc")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'desc' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'desc' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'desc' && <Check size={14} />} Title (Z-A)
          </button>
          <button 
            onClick={() => setFilter("price_low_high")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'price_low_high' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'price_low_high' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'price_low_high' && <Check size={14} />} Price <ArrowUp size={14} />
          </button>
          <button 
            onClick={() => setFilter("price_high_low")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors duration-200 ${filter === 'price_high_low' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'price_high_low' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'price_high_low' && <Check size={14} />} Price <ArrowDown size={14} />
          </button>
        </div>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2 border-b pb-1" style={{ borderColor: "var(--color-border)" }}>Price Range</h4>
        <div className="mb-2 text-sm flex justify-between">
          <span>₹0</span>
          <span className="px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.1)" }}>₹{priceRange[1]}</span>
        </div>
        <div className="px-1 mb-2">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(Number(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: "var(--color-primary)" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Max price:</span>
          <input
            type="number"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(Number(e.target.value))}
            className="flex-1 px-2 py-1.5 text-xs rounded border focus:outline-none focus:ring-1"
            style={{ 
              backgroundColor: "var(--color-bg-primary)", 
              borderColor: "var(--color-border)",
              "--tw-ring-color": "var(--color-focus-ring)" 
            }}
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2 border-b pb-1" style={{ borderColor: "var(--color-border)" }}>Categories</h4>
        <div className="max-h-64 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {categories.map(category => (
            <label 
              key={category} 
              className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1.5 rounded transition-colors duration-200 hover:bg-opacity-50"
              style={{ 
                backgroundColor: selectedCategories.includes(category) 
                  ? "rgba(var(--color-primary-rgb), 0.1)" 
                  : "transparent" 
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="text-blue-600 rounded"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className={selectedCategories.includes(category) ? "font-medium" : ""}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Apply Filters Button (Mobile Only) */}
      <button 
        className="w-full md:hidden py-2 px-4 rounded font-medium mt-4 transition-colors duration-200"
        style={{ 
          backgroundColor: "var(--color-button-primary)", 
          color: "var(--color-bg-primary)"
        }}
        onClick={() => setIsMobileFilterOpen(false)}
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="container mx-auto py-8 md:py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      {/* Add custom scrollbar styles and color variables */}
      <style jsx global>{`
        ${scrollbarStyles}
        
        :root {
          --color-primary-rgb: 59, 130, 246;    /* Blue shade - adjust to match your primary color */
          --color-secondary-rgb: 107, 114, 128; /* Gray shade - adjust to match your secondary color */
          --color-bg-secondary-rgb: 243, 244, 246; /* Light gray shade for backgrounds */
        }
      `}</style>
      
      <div className="mb-8 md:mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow flex">
              <span className="inline-flex items-center px-3 bg-black border border-black text-white rounded-l-lg" style={{ 
                backgroundColor: "var(--color-secondary)", 
                borderColor: "var(--color-secondary)",
                color: "var(--color-bg-primary)"
              }}>
                <Search />
              </span>
              <input
                type="text"
                className="flex-grow px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBooks()}
                style={{ 
                  backgroundColor: "var(--color-bg-secondary)", 
                  color: "var(--color-text-primary)", 
                  borderColor: "var(--color-border)",
                  "--tw-ring-color": "var(--color-focus-ring)"
                }}
              />
            </div>
            <div className="flex flex-row gap-3">
              <button 
                onClick={searchBooks} 
                className="flex-1 md:flex-none px-6 py-3 font-medium rounded-lg transition duration-200 disabled:opacity-50"
                disabled={isLoading}
                style={{ 
                  backgroundColor: "var(--color-button-primary)", 
                  color: "var(--color-bg-primary)"
                }}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>

              {/* Mobile Filter Button */}
              <button 
                className="md:hidden flex-1 md:flex-none px-6 py-3 font-medium rounded-lg transition duration-200"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                style={{ 
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--color-bg-primary)"
                }}
              >
                <Funnel className="inline-block mr-2" /> Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="p-4 mb-6 rounded-lg text-center"
          style={{ 
            backgroundColor: message.includes("success") ? "rgba(var(--color-bg-secondary), 0.2)" : "rgba(var(--color-accent), 0.2)",
            color: message.includes("success") ? "var(--color-text-secondary)" : "var(--color-text-light)"
          }}
        >
          {message}
        </div>
      )}

      {/* Main Content with sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="md:w-1/4 lg:w-1/5">
          <FilterSidebar />
        </div>
        
        {/* Book Grid */}
        <div className="md:w-3/4 lg:w-4/5">
          {isLoading ? (
            <CardSkeleton count={12} />
          ) : displayedBooks.length === 0 ? (
            <div className="text-center mt-8">
              <p style={{ color: "var(--color-text-secondary)" }}>No books found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-1">
                {displayedBooks.map((book, index) => (
                  <div 
                    key={book.id} 
                    ref={index === displayedBooks.length - 1 ? lastBookElementRef : null}
                    className="transform transition-transform duration-300 hover:-translate-y-1"
                  >
                    <BookCard
                      book={book}
                      onClick={() => handleBookClick(book.id)}
                      getImageUrl={getImageUrl}
                    />
                  </div>
                ))}
              </div>

              {isLoadingMore && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full animate-dot-bounce" style={{ backgroundColor: "var(--color-secondary)" }}></div>
                    <div className="h-2 w-2 rounded-full animate-dot-bounce" style={{ backgroundColor: "var(--color-secondary)", animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 rounded-full animate-dot-bounce" style={{ backgroundColor: "var(--color-secondary)", animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              
              {!hasMore && displayedBooks.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="py-3 px-6 rounded-lg inline-block text-sm"
                     style={{ 
                       backgroundColor: "rgba(var(--color-bg-secondary-rgb), 0.3)",
                       color: "var(--color-text-secondary)" 
                     }}>
                    You've reached the end of the catalog
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}