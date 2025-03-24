'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/books/BookCard';
import Pagination from '@/components/books/Pagination';
import { Search, Funnel, Check, ArrowUp, ArrowDown, XCircle } from 'react-bootstrap-icons';
import { CardSkeleton } from '@/components/skeleton';

export default function BookCatalog() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const BOOKS_PER_PAGE = 18; // 6 books per row * 3 rows = 18 books per page

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
      filteredBooks = filteredBooks.filter(book => 
        selectedCategories.includes(book.category || 'Uncategorized')
      );
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
      const uniqueCategories = [...new Set(books.map(book => book.category || 'Uncategorized'))];
      setCategories(uniqueCategories);
      
      const filteredBooks = applyFilter(books);
      setAllBooks(books);

      const total = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
      setTotalPages(total || 1);

      updateDisplayedBooks(filteredBooks, 1);
      setMessage("");
    } catch (error) {
      console.error("Fetch error details:", error);
      setMessage(`Search failed: ${error.message}`);
      setAllBooks([]);
      setDisplayedBooks([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedBooks = (books, page) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    setDisplayedBooks(books.slice(startIndex, endIndex));
    setCurrentPage(page);
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
      const filteredBooks = applyFilter(allBooks);
      updateDisplayedBooks(filteredBooks, 1);
      setTotalPages(Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1);
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

  const handlePriceRangeChange = (index, value) => {
    setPriceRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setFilter("recent");
  };

  const FilterSidebar = () => (
    <div 
      className={`bg-white p-4 rounded-lg shadow-md ${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}
      style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Filters</h3>
        <button 
          onClick={clearFilters}
          className="text-sm flex items-center gap-1 hover:underline"
          style={{ color: "var(--color-secondary)" }}
        >
          <XCircle size={14} /> Clear all
        </button>
      </div>
      
      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Sort By</h4>
        <div className="space-y-2">
          <button 
            onClick={() => setFilter("recent")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'recent' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'recent' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'recent' && <Check size={14} />} Recently Added
          </button>
          <button 
            onClick={() => setFilter("last")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'last' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'last' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'last' && <Check size={14} />} Last Added
          </button>
          <button 
            onClick={() => setFilter("asc")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'asc' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'asc' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'asc' && <Check size={14} />} Title (A-Z)
          </button>
          <button 
            onClick={() => setFilter("desc")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'desc' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'desc' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'desc' && <Check size={14} />} Title (Z-A)
          </button>
          <button 
            onClick={() => setFilter("price_low_high")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'price_low_high' ? 'font-semibold' : ''}`}
            style={{ 
              backgroundColor: filter === 'price_low_high' ? "var(--color-border)" : "transparent",
            }}
          >
            {filter === 'price_low_high' && <Check size={14} />} Price <ArrowUp size={14} />
          </button>
          <button 
            onClick={() => setFilter("price_high_low")}
            className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded ${filter === 'price_high_low' ? 'font-semibold' : ''}`}
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
        <h4 className="font-semibold mb-2">Price Range</h4>
        <div className="mb-2 text-sm flex justify-between">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[0]}
            onChange={(e) => handlePriceRangeChange(0, Number(e.target.value))}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(1, Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            min="0"
            max={priceRange[1]}
            value={priceRange[0]}
            onChange={(e) => handlePriceRangeChange(0, Number(e.target.value))}
            className="w-1/2 px-2 py-1 text-xs rounded border"
            style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)" }}
          />
          <input
            type="number"
            min={priceRange[0]}
            max="5000"
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(1, Number(e.target.value))}
            className="w-1/2 px-2 py-1 text-xs rounded border"
            style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)" }}
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Category</h4>
        <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
          {categories.map(category => (
            <label key={category} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-opacity-20 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="text-blue-600 rounded"
              />
              {category}
            </label>
          ))}
        </div>
      </div>
      
      {/* Apply Filters Button (Mobile Only) */}
      <button 
        className="w-full md:hidden py-2 px-4 rounded font-medium mt-4"
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
            <CardSkeleton count={allBooks.length > 0 ? allBooks.length : 12} />
          ) : displayedBooks.length === 0 ? (
            <div className="text-center mt-8">
              <p style={{ color: "var(--color-text-secondary)" }}>No books found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {displayedBooks.map((book) => (
                  <div key={book.id}>
                    <BookCard
                      book={book}
                      onClick={() => handleBookClick(book.id)}
                      getImageUrl={getImageUrl}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 md:mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => updateDisplayedBooks(allBooks, page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}