'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/components/context/AuthContext';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';
import { EditBookSkeleton } from '@/components/skeleton';
import CategorySelect from '@/components/books/CategorySelect';
import AuthorInput from '@/components/books/AuthorInput';

const getStorageValue = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Error accessing localStorage for key ${key}:`, e);
    return null;
  }
};

export default function EditBook() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const { id } = useParams();
  const router = useRouter();
  const { token, user, authState, logout } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [editedBook, setEditedBook] = useState({
    title: "",
    authors: [],
    isbn: "",
    description: "",
    image: null,
    categories: [],
    price: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentToken = token || getStorageValue('token');
    const currentUser = user || (() => {
      try {
        const stored = getStorageValue('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })();

    if (!currentToken || !currentUser || currentUser.role !== 'teacher') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You must be logged in as a teacher to edit books',
        confirmButtonColor: 'var(--color-button-primary)'
      }).then(() => {
        router.push('/login');
      });
      setIsLoading(false);
      return;
    }

    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BACKEND}/books/get-books?id=${id}`, {
          headers: { 
            "Accept": "application/json",
            "Authorization": `Bearer ${currentToken}`
          }
        });

        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

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
        setEditedBook({ 
          ...foundBook,
          categories: foundBook.categories ? foundBook.categories.map(cat => cat.name) : [],
          authors: foundBook.authors ? foundBook.authors.map(auth => auth.name) : [],
          image: null // Reset image to null since we'll handle it as a file
        });

        const getImageUrl = (imagePath) => {
          console.log('EditBook - Processing image path:', {
            originalPath: imagePath,
            backendUrl: BACKEND
          });

          if (!imagePath) {
            console.log('EditBook - No image path, using placeholder');
            return null;
          }

          // If it's already a full URL (starts with http:// or https://)
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            console.log('EditBook - Using direct URL:', imagePath);
            return imagePath;
          }

          // Remove /api/ from BACKEND URL if it exists
          const baseUrl = BACKEND.replace('/api', '');

          // For local storage paths, ensure we don't duplicate the 'books' directory
          const imageName = imagePath.replace(/^books\//, '');
          const finalUrl = `${baseUrl}/storage/books/${imageName}`;
          console.log('EditBook - Constructed storage URL:', {
            baseUrl,
            imagePath,
            imageName,
            finalUrl
          });
          return finalUrl;
        };

        // Set the preview URL to the current image if it exists
        if (foundBook.image) {
          const previewPath = getImageUrl(foundBook.image);
          console.log('EditBook - Setting preview URL:', {
            originalImage: foundBook.image,
            constructedUrl: previewPath
          });
          setPreviewUrl(previewPath);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        
        if (error.message.includes("session has expired")) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Your session has expired. You will be redirected to login.',
            timer: 2000,
            timerProgressBar: true
          });
          
          setTimeout(() => {
            logout();
            router.refresh();
            router.push("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, token, user, router, BACKEND]);

  useEffect(() => {
    // Map author data when book data is loaded
    if (book && book.authors) {
      console.log('EditBook - Setting authors:', book.authors);
      // Extract author names from the authors array
      const authorNames = book.authors.map(author => author.name);
      setEditedBook(prev => ({
        ...prev,
        authors: authorNames
      }));
    }
  }, [book]);

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'isbn', 'description'];
    
    requiredFields.forEach(field => {
      if (!editedBook[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (editedBook.authors.length === 0) {
      errors.authors = 'At least one author is required';
    }

    if (editedBook.price && isNaN(parseFloat(editedBook.price))) {
      errors.price = 'Price must be a valid number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('EditBook - New image selected:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        console.warn('EditBook - Image too large:', {
          fileSize: file.size,
          maxSize: 2 * 1024 * 1024
        });
        Swal.fire({
          title: 'Error!',
          text: 'Image size should not exceed 2MB',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)',
          didOpen: () => {
            // Ensure DOM is updated correctly
            Swal.hideLoading();
          }
        });
        e.target.value = '';
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(file.type)) {
        console.warn('EditBook - Invalid image type:', {
          fileType: file.type,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
        });
        Swal.fire({
          title: 'Error!',
          text: 'Please upload a valid image file (JPEG, PNG, GIF)',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)',
          didOpen: () => {
            // Ensure DOM is updated correctly
            Swal.hideLoading();
          }
        });
        e.target.value = '';
        return;
      }

      setEditedBook({ ...editedBook, image: file });
      const previewUrl = URL.createObjectURL(file);
      console.log('EditBook - Preview URL created:', previewUrl);
      setPreviewUrl(previewUrl);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook((prev) => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const currentToken = token || getStorageValue('token');
    const currentUser = user || (() => {
      try {
        const stored = getStorageValue('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })();

    if (!currentToken || !currentUser || currentUser.role !== 'teacher') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You must be logged in as a teacher to edit books',
        confirmButtonColor: 'var(--color-button-primary)'
      }).then(() => {
        router.push('/login');
      });
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('title', editedBook.title.trim());
      formData.append('isbn', editedBook.isbn.trim());
      formData.append('description', editedBook.description?.trim() || '');
      
      if (editedBook.authors && editedBook.authors.length > 0) {
        editedBook.authors.forEach((author, index) => {
          formData.append(`authors[${index}]`, author.trim());
        });
      }
      
      if (editedBook.categories && editedBook.categories.length > 0) {
        editedBook.categories.forEach((category, index) => {
          formData.append(`categories[${index}]`, category.trim());
        });
      }
      
      if (editedBook.price) {
        formData.append('price', parseFloat(editedBook.price));
      }
      if (editedBook.image) {
        formData.append('image', editedBook.image);
      }

      const res = await fetch(`${BACKEND}/books/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'X-HTTP-Method-Override': 'PUT'
        },
        body: formData
      });
      
      if (res.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update book");
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Book updated successfully',
        confirmButtonColor: 'var(--color-button-primary)',
        didOpen: () => {
          // Ensure DOM is updated correctly
          Swal.hideLoading();
        }
      }).then(() => {
        router.push(`/book/${id}`);
      });
    } catch (error) {
      console.error("Update error:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update book',
        confirmButtonColor: 'var(--color-button-primary)',
        didOpen: () => {
          // Ensure DOM is updated correctly
          Swal.hideLoading();
        }
      });
      
      if (error.message.includes("session has expired")) {
        setTimeout(() => {
          logout();
          router.refresh();
          router.push("/login");
        }, 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <EditBookSkeleton />;
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-[var(--color-bg-primary)] rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-[var(--color-danger)]">Error</h1>
        <p className="text-[var(--color-text-primary)]">{error}</p>
        <button 
          onClick={() => router.push('/catalog')}
          className="mt-4 px-4 py-2 bg-[var(--color-button-primary)] text-white rounded-md"
        >
          Back to Catalog
        </button>
      </div>
    );
  }
  
  if (!book) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[var(--color-bg-primary)] rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Book</h1>
      
      <form onSubmit={handleSaveEdit} className="space-y-6">
        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={editedBook.title}
            onChange={handleInputChange}
            className="w-full p-2 rounded border focus:outline-none"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.title ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 rounded border focus:outline-none"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.image ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.image && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.image}</p>
          )}
          {previewUrl && (
            <div className="mt-2">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full h-auto max-h-48 rounded"
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={editedBook.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-2 rounded border focus:outline-none"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.description ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">ISBN</label>
          <input
            type="text"
            name="isbn"
            value={editedBook.isbn}
            onChange={handleInputChange}
            className="w-full p-2 rounded border focus:outline-none"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.isbn ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.isbn && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.isbn}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Authors</label>
          <AuthorInput
            value={editedBook.authors}
            onChange={(value) => setEditedBook({ ...editedBook, authors: value })}
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.authors ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.authors && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.authors}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Categories</label>
          <CategorySelect
            value={editedBook.categories}
            onChange={(value) => setEditedBook({ ...editedBook, categories: value })}
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
        </div>

        <div>
          <label className="block mb-2">Price (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={editedBook.price}
            onChange={handleInputChange}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2 px-4 rounded transition duration-200"
            style={{ 
              backgroundColor: "var(--color-bg-primary)",
              borderColor: "var(--color-border)",
              borderWidth: "1px",
              color: "var(--color-text-primary)"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            style={{ 
              backgroundColor: "var(--color-button-primary)",
              color: "var(--color-bg-primary)"
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}