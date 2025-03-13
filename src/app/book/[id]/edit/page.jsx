'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/components/context/AuthContext';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditBook() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const { id } = useParams();
  const router = useRouter();
  const { token, isAuthenticated, isTeacher, logout } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [editedBook, setEditedBook] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    image: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated() || !isTeacher()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You must be logged in as a teacher to edit books'
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
            "Authorization": `Bearer ${token}`
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
  }, [id, token, isAuthenticated, isTeacher, logout, router, BACKEND]);

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'author', 'isbn', 'description'];
    
    requiredFields.forEach(field => {
      if (!editedBook[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
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
          confirmButtonColor: 'var(--color-button-primary)'
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
          confirmButtonColor: 'var(--color-button-primary)'
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
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      if (!isAuthenticated() || !isTeacher()) {
        throw new Error("You must be logged in as a teacher to edit books");
      }
      
      const formData = new FormData();
      formData.append('title', editedBook.title.trim());
      formData.append('author', editedBook.author.trim());
      formData.append('isbn', editedBook.isbn.trim());
      formData.append('description', editedBook.description?.trim() || '');
      if (editedBook.image) {
        formData.append('image', editedBook.image);
      }

      const res = await fetch(`${BACKEND}/books/${id}`, {
        method: 'POST', // Changed to POST since we're using FormData
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-HTTP-Method-Override': 'PUT' // Add this to handle PUT with FormData
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
        confirmButtonColor: 'var(--color-button-primary)'
      }).then(() => {
        router.push(`/book/${id}`);
      });
    } catch (error) {
      console.error("Update error:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: 'var(--color-button-primary)'
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
    return (
      <div className="container mx-auto py-12" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push('/catalog')}
            className="px-4 py-2 font-medium rounded-lg transition duration-200"
            style={{ backgroundColor: "var(--color-button-primary)", color: "var(--color-bg-primary)" }}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <div className="text-center">
          <p className="text-xl mb-4">Book not found</p>
          <button
            onClick={() => router.push('/catalog')}
            className="px-4 py-2 font-medium rounded-lg transition duration-200"
            style={{ backgroundColor: "var(--color-button-primary)", color: "var(--color-bg-primary)" }}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
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
          <label className="block mb-2">Author</label>
          <input
            type="text"
            name="author"
            value={editedBook.author}
            onChange={handleInputChange}
            className="w-full p-2 rounded border focus:outline-none"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: validationErrors.author ? "red" : "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          />
          {validationErrors.author && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.author}</p>
          )}
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