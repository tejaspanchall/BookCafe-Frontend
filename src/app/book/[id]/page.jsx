'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/components/context/AuthContext';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookSkeleton } from '@/components/skeleton';
import { PlusCircle, DashCircle, PencilSquare, Trash, ArrowLeft } from 'react-bootstrap-icons';
import Link from 'next/link';

export default function BookDetail() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [isRemovingFromLibrary, setIsRemovingFromLibrary] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      if (token && user) {
        setIsLoggedIn(true);
        setUserRole(user.role);
      } else {
        const userData = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (userData && storedToken) {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserRole(parsedUser.role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      }
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('loginStateChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginStateChange', checkAuth);
    };
  }, [token, user]);

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
    if (!isLoggedIn || !token) {
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
    if (book && isLoggedIn) {
      fetchLibraryStatus();
    }
  }, [book, id, token, isLoggedIn]);

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
    const currentToken = token || localStorage.getItem('token');
    if (!isLoggedIn || !currentToken) {
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

    setIsAddingToLibrary(true);
    try {
      const res = await fetch(`${BACKEND}/books/${id}/add-to-library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
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
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!isLoggedIn || !token) {
      router.push('/login');
      return;
    }

    setIsRemovingFromLibrary(true);
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
    } finally {
      setIsRemovingFromLibrary(false);
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn || userRole !== 'teacher' || !token) {
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
    return <BookSkeleton />;
    
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

  // Add logging for book data
  console.log('BookDetail - Book data:', {
    bookId: book.id,
    imagePath: book.image,
    constructedImageUrl: book.image ? `${BACKEND}/storage/${book.image}` : "https://via.placeholder.com/200x300?text=Book+Cover"
  });

  const getImageUrl = (imagePath) => {
    console.log('BookDetail - Processing image path:', {
      originalPath: imagePath,
      backendUrl: BACKEND
    });

    if (!imagePath) {
      console.log('BookDetail - No image path, using placeholder');
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('BookDetail - Using direct URL:', imagePath);
      return imagePath;
    }

    const baseUrl = BACKEND.replace('/api', '');

    const imageName = imagePath.replace(/^books\//, '');
    const finalUrl = `${baseUrl}/storage/books/${encodeURIComponent(imageName)}`;
    console.log('BookDetail - Constructed storage URL:', {
      baseUrl,
      imagePath,
      imageName,
      finalUrl
    });
    return finalUrl;
  };

  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 lg:w-1/4">
          <img
            src={getImageUrl(book.image)}
            className="w-full rounded-lg shadow-md"
            style={{ maxHeight: "100%", maxWidth: "300px", objectFit: "cover" }}
            onError={(e) => {
              console.error('BookDetail - Image load error:', {
                bookId: book.id,
                imagePath: book.image,
                constructedUrl: getImageUrl(book.image),
                error: e.message
              });
              e.target.src = "https://via.placeholder.com/200x300?text=Book+Cover";
            }}
          />
        </div>
        <div className="md:w-2/3 lg:w-3/4">
          <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
            {book.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-bg-primary)" }}>
              {book.authors && book.authors.length > 0 
                ? book.authors.map(author => author.name).join(', ')
                : 'Unknown Author'}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-button-primary)", color: "var(--color-bg-primary)" }}>
              ISBN: {book.isbn}
            </span>
            {book.categories && book.categories.length > 0 ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-bg-primary)" }}>
                Categories: {book.categories.map(cat => cat.name).join(', ')}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-bg-primary)" }}>
                No Categories
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Description
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>{book.description}</p>
          </div>

          {book.price !== null && (
            <div className="mb-4">
              <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Price
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>₹{book.price}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isLoggedIn && (
              <>
                {inLibrary ? (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 hover:bg-red-600"
                    onClick={handleRemoveFromLibrary}
                    disabled={isRemovingFromLibrary}
                    style={{ backgroundColor: "#dc2626", color: "white" }}
                  >
                    {isRemovingFromLibrary ? (
                      <LoadingSpinner size="w-5 h-5" />
                    ) : (
                      <><DashCircle className="mr-2" />Remove from Library</>
                    )}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 hover:bg-emerald-600"
                    onClick={handleAddToLibrary}
                    disabled={isAddingToLibrary}
                    style={{ backgroundColor: "#059669", color: "white" }}
                  >
                    {isAddingToLibrary ? (
                      <LoadingSpinner size="w-5 h-5" />
                    ) : (
                      <><PlusCircle className="mr-2" />Add to Library</>
                    )}
                  </button>
                )}
              </>
            )}

            {isLoggedIn && userRole === 'teacher' && (
              <>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200 hover:bg-blue-600 flex items-center"
                  onClick={() => router.push(`/book/${book.id}/edit`)}
                  style={{ backgroundColor: "#2563eb", color: "white" }}
                >
                  <PencilSquare className="mr-2" />Edit Book
                </button>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200 disabled:opacity-50 hover:bg-rose-600 flex items-center"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ backgroundColor: "#e11d48", color: "white" }}
                >
                  {isDeleting ? (
                    <LoadingSpinner size="w-5 h-5" />
                  ) : (
                    <><Trash className="mr-2" />Delete Book</>
                  )}
                </button>
              </>
            )}
            <button
              className="px-4 py-2 font-medium rounded-lg transition duration-200 hover:bg-gray-600 flex items-center"
              onClick={() => router.push('/catalog')}
              style={{ backgroundColor: "#4b5563", color: "white" }}
            >
              <ArrowLeft className="mr-2" />Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}