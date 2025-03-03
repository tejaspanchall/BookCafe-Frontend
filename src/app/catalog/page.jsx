'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/books/BookCard';
import Pagination from '@/components/books/Pagination';
import { Search } from 'react-bootstrap-icons';

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
  const BOOKS_PER_PAGE = 18;

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const applyFilter = (books) => {
    switch (filter) {
      case "asc":
        return [...books].sort((a, b) => a.title.localeCompare(b.title));
      case "desc":
        return [...books].sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
        return [...books].sort((a, b) => b.id - a.id);
      case "last":
        return [...books].sort((a, b) => a.id - b.id);
      default:
        return books;
    }
  };

  const searchBooks = async () => {
    setIsLoading(true);
    try {
      let url = `${BACKEND}/books/search.php`;
      if (search) {
        url += `?q=${encodeURIComponent(search)}`;
      }
      
      console.log("Fetching from URL:", url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("API Response:", data);
      
      const books = Array.isArray(data) ? data : [];
      const filteredBooks = applyFilter(books);
      setAllBooks(filteredBooks);

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
    const filteredBooks = applyFilter(allBooks);
    updateDisplayedBooks(filteredBooks, 1);
    setTotalPages(Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1);
  }, [filter]);

  const handleBookClick = (bookId) => {
    router.refresh();
    router.push(`/book/${bookId}`);
  };

  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <div className="mb-12">
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
            <button 
              onClick={searchBooks} 
              className="px-6 py-3 font-medium rounded-lg transition duration-200 disabled:opacity-50"
              disabled={isLoading}
              style={{ 
                backgroundColor: "var(--color-button-primary)", 
                color: "var(--color-bg-primary)"
              }}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>

            <div className="relative inline-block">
              <button
                className="px-6 py-3 font-medium rounded-lg transition duration-200"
                type="button"
                id="filterDropdown"
                aria-expanded="false"
                onClick={() => {
                  const dropdown = document.getElementById('filterDropdownMenu');
                  dropdown.classList.toggle('hidden');
                }}
                style={{ 
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--color-bg-primary)"
                }}
              >
                Filter
              </button>
              <ul 
                id="filterDropdownMenu"
                className="hidden absolute z-10 mt-1 w-40 rounded-lg shadow-lg py-1"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
              >
                <li>
                  <a
                    className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{ 
                      color: "var(--color-text-primary)",
                      "&:hover": { backgroundColor: "var(--color-border)" }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilter("asc");
                      document.getElementById('filterDropdownMenu').classList.add('hidden');
                    }}
                  >
                    A-Z
                  </a>
                </li>
                <li>
                  <a
                    className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{ 
                      color: "var(--color-text-primary)",
                      "&:hover": { backgroundColor: "var(--color-border)" }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilter("desc");
                      document.getElementById('filterDropdownMenu').classList.add('hidden');
                    }}
                  >
                    Z-A
                  </a>
                </li>
                <li>
                  <a
                    className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{ 
                      color: "var(--color-text-primary)",
                      "&:hover": { backgroundColor: "var(--color-border)" }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilter("recent");
                      document.getElementById('filterDropdownMenu').classList.add('hidden');
                    }}
                  >
                    Recently Added
                  </a>
                </li>
                <li>
                  <a
                    className="block px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{ 
                      color: "var(--color-text-primary)",
                      "&:hover": { backgroundColor: "var(--color-border)" }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilter("last");
                      document.getElementById('filterDropdownMenu').classList.add('hidden');
                    }}
                  >
                    Last Added
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="p-4 mb-6 rounded-lg"
          style={{ 
            backgroundColor: message.includes("success") ? "rgba(var(--color-bg-secondary), 0.2)" : "rgba(var(--color-accent), 0.2)",
            color: message.includes("success") ? "var(--color-text-secondary)" : "var(--color-text-light)"
          }}
        >
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: "var(--color-accent)" }}></div>
          <span className="sr-only">Loading...</span>
        </div>
      ) : displayedBooks.length === 0 ? (
        <div className="text-center mt-8">
          <p style={{ color: "var(--color-text-secondary)" }}>No books found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateDisplayedBooks(allBooks, page)}
            />
          )}
        </>
      )}
    </div>
  );
}