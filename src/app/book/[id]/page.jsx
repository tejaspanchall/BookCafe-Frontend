'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/components/context/AuthContext';
import Swal from 'sweetalert2';

export default function BookDetail() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const { id } = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated, isTeacher, logout, authState } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { isAuthenticated: isAuth, isTeacher: isTeach } = authState;

  const fetchBook = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BACKEND}/books/get-books?id=${id}`, {
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch book");
      }

      const data = await res.json();

      if (!data || data.status !== 'success') {
        throw new Error("No data received from server");
      }

      const foundBook = Array.isArray(data.books) 
        ? data.books.find(b => parseInt(b.id) === parseInt(id))
        : null;
        
      if (!foundBook) {
        throw new Error("Book not found");
      }

      setBook(foundBook);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibraryStatus = async () => {
    if (!isAuthenticated() || !token) {
      setInLibrary(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/books/my-library`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }
      });

      if (res.status === 401) {
        setInLibrary(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch library status (${res.status})`);
      }

      const response = await res.json();

      if (response.status === "success" && Array.isArray(response.books)) {
        const hasBook = response.books.some((book) => parseInt(book.id) === parseInt(id));
        setInLibrary(hasBook);
      } else {
        setInLibrary(false);
      }
    } catch (error) {
      console.error("Library status error:", error);
      setInLibrary(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book && isAuth) {
      fetchLibraryStatus();
    }
  }, [book, id, token, isAuth]);

  useEffect(() => {
    if (location.state?.successMessage) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: location.state.successMessage,
        timer: 3000,
        timerProgressBar: true
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAddToLibrary = async () => {
    if (!isAuthenticated() || !token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to add books to your library',
        icon: 'warning',
        confirmButtonColor: 'var(--color-button-primary)',
        confirmButtonText: 'Log In'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/books/${id}/add-to-library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add book to library');
      }

      setInLibrary(true);
      Swal.fire({
        title: 'Success!',
        text: 'Book added to your library',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } catch (error) {
      console.error('Add to library error:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to add book to library',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!isAuthenticated() || !token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/books/${id}/remove-from-library`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove book from library');
      }

      setInLibrary(false);
      Swal.fire({
        title: 'Success!',
        text: 'Book removed from your library',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } catch (error) {
      console.error('Remove from library error:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to remove book from library',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated() || !isTeacher() || !token) {
      Swal.fire({
        title: 'Unauthorized',
        text: 'Only teachers can delete books',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-button-primary)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const res = await fetch(`${BACKEND}/books/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete book');
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Book has been deleted.',
          icon: 'success',
          confirmButtonColor: 'var(--color-button-primary)'
        }).then(() => {
          router.push('/catalog');
        });
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to delete book',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)'
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading)
    return (
      <div className="container mx-auto py-12" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        Loading...
      </div>
    );
    
  if (error)
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <div className="p-4 rounded-lg" role="alert" style={{ backgroundColor: "rgba(var(--color-accent), 0.2)", color: "var(--color-text-light)" }}>
          Error: {error}
        </div>
      </div>
    );
    
  if (!book)
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        Book not found
      </div>
    );

  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 lg:w-1/4">
          <img
            src={book.image || "https://via.placeholder.com/200x300?text=Book+Cover"}
            alt={book.title}
            className="w-full rounded-lg shadow-md"
            style={{ maxHeight: "100%", maxWidth: "300px", objectFit: "cover" }}
          />
        </div>
        <div className="md:w-2/3 lg:w-3/4">
          <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
            {book.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-bg-primary)" }}>
              {book.author}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-button-primary)", color: "var(--color-bg-primary)" }}>
              ISBN: {book.isbn}
            </span>
          </div>
          <div className="mb-6 max-h-40 overflow-y-auto pr-2" style={{ color: "var(--color-text-secondary)" }}>
            <p>{book.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAuth && (
              <>
                {inLibrary ? (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200"
                    onClick={handleRemoveFromLibrary}
                    style={{ backgroundColor: "green", color: "var(--color-bg-primary)" }}
                  >
                    Remove from Library
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200"
                    onClick={handleAddToLibrary}
                    style={{ backgroundColor: "green", color: "var(--color-bg-primary)" }}
                  >
                    Add to Library
                  </button>
                )}
              </>
            )}

            {isAuth && isTeach && (
              <>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200"
                  onClick={() => router.push(`/book/${book.id}/edit`)}
                  style={{ backgroundColor: "yellow", color: "var(--color-text-primary)" }}
                >
                  Edit Book
                </button>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ backgroundColor: "red", color: "var(--color-bg-primary)" }}
                >
                  {isDeleting ? "Deleting..." : "Delete Book"}
                </button>
              </>
            )}
      <button
      className="px-4 py-2 font-medium rounded-lg transition duration-200"
        onClick={() => router.back()}
        style={{ backgroundColor: "var(--color-text-secondary)", color: "var(--color-bg-primary)", borderColor: "var(--color-bg-primary)" }}
      >
        Back to Catalog
      </button>
      </div>
        </div>
      </div>
    </div>
  );
}