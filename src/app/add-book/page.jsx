'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { AuthContext } from '@/components/context/AuthContext';
import { AddBookSkeleton } from '@/components/skeleton';
import CategorySelect from '@/components/books/CategorySelect';
import AuthorInput from '@/components/books/AuthorInput';
import Link from 'next/link';

export default function AddBook() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const { token, isTeacher } = useContext(AuthContext);
  const [book, setBook] = useState({
    title: '',
    image: null,
    description: '',
    isbn: '',
    authors: [],
    categories: [],
    price: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
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
        Swal.fire({
          title: 'Error!',
          text: 'Please upload a valid image file (JPEG, PNG, GIF)',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)'
        });
        e.target.value = '';
        return;
      }

      setBook({ ...book, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!token || !isTeacher()) {
        throw new Error('Only teachers can add books');
      }

      const requiredFields = ['title', 'isbn'];
      for (const field of requiredFields) {
        if (!book[field] || !book[field].trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      if (book.authors.length === 0) {
        throw new Error('At least one author is required');
      }

      if (book.price && isNaN(parseFloat(book.price))) {
        throw new Error('Price must be a valid number');
      }

      const formData = new FormData();
      formData.append('title', book.title.trim());
      formData.append('description', book.description.trim());
      formData.append('isbn', book.isbn.trim());
      if (book.authors.length > 0) {
        book.authors.forEach((author, index) => {
          formData.append(`authors[${index}]`, author.trim());
        });
      }
      if (book.categories.length > 0) {
        book.categories.forEach((category, index) => {
          formData.append(`categories[${index}]`, category.trim());
        });
      }
      if (book.price) {
        formData.append('price', parseFloat(book.price));
      }
      if (book.image) {
        formData.append('image', book.image);
      }
      
      const res = await fetch(`${BACKEND}/books/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add book');
      }
      
      Swal.fire({
        title: 'Success!',
        text: 'Book added successfully!',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)',
        didOpen: () => {
          // Ensure DOM is updated correctly
          Swal.hideLoading();
        }
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          router.refresh();
          router.push('/catalog');
        }
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to connect to server',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)',
        didOpen: () => {
          // Ensure DOM is updated correctly
          Swal.hideLoading();
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <AddBookSkeleton />
      ) : (
        <div className="max-w-3xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center text-[var(--color-text-primary)]">Add New Book</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Book Title</label>
              <input
                type="text"
                className="w-full p-3 bg-transparent rounded focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Enter book title"
                value={book.title}
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-3 bg-transparent rounded focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                onChange={handleImageChange}
              />
              {previewUrl && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full h-auto max-h-64 rounded"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Description</label>
              <textarea
                className="w-full p-3 bg-transparent rounded focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Enter book description"
                value={book.description}
                onChange={(e) => setBook({ ...book, description: e.target.value })}
                rows="4"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">ISBN</label>
              <input
                type="text"
                className="w-full p-3 bg-transparent rounded focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Enter ISBN number"
                value={book.isbn}
                onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Author(s)</label>
              <AuthorInput
                value={book.authors}
                onChange={(value) => setBook({ ...book, authors: value })}
                style={{ 
                  backgroundColor: "transparent",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)"
                }}
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Categories</label>
              <CategorySelect
                value={book.categories}
                onChange={(value) => setBook({ ...book, categories: value })}
                style={{ 
                  backgroundColor: "transparent",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)"
                }}
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[var(--color-text-primary)] font-medium">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-3 bg-transparent rounded focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Enter book price"
                value={book.price}
                onChange={(e) => setBook({ ...book, price: e.target.value })}
              />
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full py-3 rounded-lg text-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: isLoading ? 'var(--color-text-light)' : 'var(--color-button-primary)',
                  color: 'var(--color-bg-primary)', 
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
                disabled={isLoading}
              >
                {isLoading ? 'Adding Book...' : 'Add Book'}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <Link 
                href="/catalog" 
                className="text-[var(--color-link)] hover:underline font-medium"
              >
                Back to Catalog
              </Link>
            </div>
          </form>
        </div>
      )}
    </>
  );
}