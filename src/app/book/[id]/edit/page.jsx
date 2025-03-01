'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/components/context/AuthContext';
import Swal from 'sweetalert2';

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
    image: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
        const res = await fetch(`${BACKEND}/books/get-books.php?id=${id}`, {
          credentials: "include",
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

        const text = await res.text();
        let data;

        try {
          data = text.trim() ? JSON.parse(text) : null;
        } catch (e) {
          throw new Error("Invalid response format from server");
        }

        if (!data) {
          throw new Error("No data received from server");
        }

        setBook(data);
        setEditedBook({ ...data });
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
            router.push("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, token, isAuthenticated, isTeacher, logout, router.push, BACKEND]);

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'author', 'isbn', 'description'];
    
    requiredFields.forEach(field => {
      if (!editedBook[field]?.trim()) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
  
    if (editedBook.image && !isValidURL(editedBook.image)) {
      errors.image = "Please enter a valid URL";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
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
    
    if (!isAuthenticated() || !isTeacher()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You must be a teacher to edit books'
      });
      return;
    }

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check the form for errors'
      });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch(`${BACKEND}/books/update-book.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: editedBook.id,
          title: editedBook.title.trim(),
          author: editedBook.author.trim(),
          isbn: editedBook.isbn.trim(),
          description: editedBook.description.trim(),
          image: editedBook.image?.trim() || "",
        }),
      });

      if (res.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to update book");

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Book updated successfully!',
        timer: 1500,
        timerProgressBar: true
      });
      
      router.push(`/book/${id}`, { state: { successMessage: "Book updated successfully!" } });
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
      
      if (error.message.includes("session has expired")) {
        setTimeout(() => {
          logout();
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
        Loading...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <div className="mt-4">
          <button
            onClick={() => router.push(-1)}
            className="px-4 py-2 font-medium rounded-lg transition duration-200"
            style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)", borderWidth: "1px", color: "var(--color-text-primary)" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        Book not found
        <div className="mt-4">
          <button
            onClick={() => router.push(-1)}
            className="px-4 py-2 font-medium rounded-lg transition duration-200"
            style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)", borderWidth: "1px", color: "var(--color-text-primary)" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Edit Book</h1>
        
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1" style={{ color: "var(--color-text-secondary)" }}>Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full p-3 border rounded-lg"
              style={{ 
                backgroundColor: "var(--color-bg-primary)", 
                color: "var(--color-text-primary)",
                borderColor: validationErrors.title ? "red" : "var(--color-border)"
              }}
              value={editedBook.title || ""}
              onChange={handleInputChange}
              placeholder="Book Title"
            />
            {validationErrors.title && (
              <p className="text-sm mt-1" style={{ color: "red" }}>{validationErrors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="author" className="block mb-1" style={{ color: "var(--color-text-secondary)" }}>Author*</label>
            <input
              type="text"
              id="author"
              name="author"
              className="w-full p-3 border rounded-lg"
              style={{ 
                backgroundColor: "var(--color-bg-primary)", 
                color: "var(--color-text-primary)",
                borderColor: validationErrors.author ? "red" : "var(--color-border)"
              }}
              value={editedBook.author || ""}
              onChange={handleInputChange}
              placeholder="Author"
            />
            {validationErrors.author && (
              <p className="text-sm mt-1" style={{ color: "red" }}>{validationErrors.author}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="isbn" className="block mb-1" style={{ color: "var(--color-text-secondary)" }}>ISBN*</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              className="w-full p-3 border rounded-lg"
              style={{ 
                backgroundColor: "var(--color-bg-primary)", 
                color: "var(--color-text-primary)",
                borderColor: validationErrors.isbn ? "red" : "var(--color-border)"
              }}
              value={editedBook.isbn || ""}
              onChange={handleInputChange}
              placeholder="ISBN"
            />
            {validationErrors.isbn && (
              <p className="text-sm mt-1" style={{ color: "red" }}>{validationErrors.isbn}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="image" className="block mb-1" style={{ color: "var(--color-text-secondary)" }}>Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              className="w-full p-3 border rounded-lg"
              style={{ 
                backgroundColor: "var(--color-bg-primary)", 
                color: "var(--color-text-primary)",
                borderColor: validationErrors.image ? "red" : "var(--color-border)"
              }}
              value={editedBook.image || ""}
              onChange={handleInputChange}
              placeholder="Image URL"
            />
            {validationErrors.image && (
              <p className="text-sm mt-1" style={{ color: "red" }}>{validationErrors.image}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-1" style={{ color: "var(--color-text-secondary)" }}>Description*</label>
            <textarea
              id="description"
              name="description"
              className="w-full p-3 border rounded-lg"
              style={{ 
                backgroundColor: "var(--color-bg-primary)", 
                color: "var(--color-text-primary)",
                borderColor: validationErrors.description ? "red" : "var(--color-border)"
              }}
              value={editedBook.description || ""}
              onChange={handleInputChange}
              placeholder="Book Description"
              rows="4"
            />
            {validationErrors.description && (
              <p className="text-sm mt-1" style={{ color: "red" }}>{validationErrors.description}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 font-medium rounded-lg transition duration-200"
              style={{ 
                backgroundColor: "var(--color-button-primary)", 
                color: "var(--color-bg-primary)",
                opacity: isSaving ? "0.7" : "1"
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push(-1)}
              className="px-4 py-2 font-medium rounded-lg transition duration-200"
              style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)", borderWidth: "1px", color: "var(--color-text-primary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}