'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import BookCard from '@/components/books/BookCard';
import Pagination from '@/components/books/Pagination';

export default function MyLibrary() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const BOOKS_PER_PAGE = 18;

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    }
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const updateDisplayedBooks = (books, page) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const booksToDisplay = books.slice(startIndex, endIndex);
    setDisplayedBooks(booksToDisplay);
    setCurrentPage(page);
    setTotalPages(Math.ceil(books.length / BOOKS_PER_PAGE));
  };

  const handleRemoveFromLibrary = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.refresh();
        router.push("/login");
        return;
      }

      const response = await fetch(`${BACKEND}/books/${bookId}/remove-from-library`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove book from library');
      }

      // Remove the book from the state
      const updatedBooks = allBooks.filter(book => book.id !== bookId);
      setAllBooks(updatedBooks);
      updateDisplayedBooks(updatedBooks, currentPage);

      Swal.fire({
        title: 'Success',
        text: 'Book removed from your library',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } catch (error) {
      console.error("Remove error:", error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to remove book from library',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    }
  };

  useEffect(() => {
    const fetchMyLibrary = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.refresh();
          router.push("/login");
          return;
        }
        
        const response = await fetch(`${BACKEND}/books/my-library`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch library');
        }

        if (data.status === 'error') {
          throw new Error(data.message);
        }

        const books = data.status === 'success' ? data.books : [];
        setAllBooks(books);
        updateDisplayedBooks(books, 1);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error.message?.includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          router.refresh();

          router.push("/login");
          return;
        }
        setError(error.message || "Failed to fetch library. Please try again later.");
        
        Swal.fire({
          title: 'Error',
          text: error.message || "Failed to fetch library. Please try again later.",
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: 'var(--color-button-primary)'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyLibrary();
  }, [BACKEND, router]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-center items-center min-h-[200px]">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{ 
              borderColor: 'var(--color-border)',
              borderTopColor: 'var(--color-primary)'
            }}
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="text-center py-5">
          <button 
            className="px-4 py-2 rounded transition duration-300"
            style={{ 
              backgroundColor: 'var(--color-button-primary)',
              color: 'var(--color-bg-primary)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          My Library
        </h2>
        <button 
          className="px-4 py-2 rounded transition duration-300"
          style={{ 
            backgroundColor: 'var(--color-button-primary)',
            color: 'var(--color-bg-primary)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
          onClick={() => router.push("/")}
        >
          Browse More Books
        </button>
      </div>

      {allBooks.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ color: 'var(--color-text-light)' }} className="mb-4">Your library is empty</p>
          <div className="flex justify-center">
            <button 
              className="px-6 py-3 text-lg rounded transition duration-300"
              style={{ 
                backgroundColor: 'var(--color-button-primary)',
                color: 'var(--color-bg-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
              onClick={() => {
                Swal.fire({
                  title: 'Library Empty',
                  text: 'Would you like to browse our collection to add books to your library?',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, browse books',
                  cancelButtonText: 'No, thanks',
                  confirmButtonColor: 'var(--color-button-primary)',
                  cancelButtonColor: 'var(--color-button-secondary)'
                }).then((result) => {
                  if (result.isConfirmed) {
                    router.push("/");
                  }
                });
              }}
            >
              Discover Books
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-10">
            {displayedBooks.map((book) => (
              <div key={book.id}>
                <BookCard
                  book={book}
                  onClick={() => router.push(`/book/${book.id}`)}
                  getImageUrl={getImageUrl}
                  showRemoveButton={true}
                  onRemove={handleRemoveFromLibrary}
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