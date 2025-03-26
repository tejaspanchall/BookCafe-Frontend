'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AuthForm from '@/components/auth/AuthForm';
import { AuthContext } from '@/components/context/AuthContext';
import { AddBookSkeleton } from '@/components/skeleton';
import CategorySelect from '@/components/books/CategorySelect';

export default function AddBook() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const { token, isTeacher } = useContext(AuthContext);
  const [book, setBook] = useState({
    title: '',
    image: null,
    description: '',
    isbn: '',
    author: '',
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

      const requiredFields = ['title', 'isbn', 'author'];
      for (const field of requiredFields) {
        if (!book[field] || !book[field].trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      if (book.price && isNaN(parseFloat(book.price))) {
        throw new Error('Price must be a valid number');
      }

      const formData = new FormData();
      formData.append('title', book.title.trim());
      formData.append('description', book.description.trim());
      formData.append('isbn', book.isbn.trim());
      formData.append('author', book.author.trim());
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add book');
      }

      const data = await res.json();
      
      Swal.fire({
        title: 'Success!',
        text: 'Book added successfully!',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)'
      }).then(() => {
        router.refresh();
        router.push('/catalog');
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to connect to server',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
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
        <div className="max-w-2xl mx-auto p-6 bg-[var(--color-bg-primary)] rounded-lg shadow-md">
          <AuthForm
            onSubmit={handleSubmit}
            title="Add New Book"
            footerLink={{ to: '/catalog', text: 'Back to Catalog' }}
          >
            <div className="mb-3">
              <input
                type="text"
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Title"
                value={book.title}
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                onChange={handleImageChange}
              />
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
            <div className="mb-3">
              <textarea
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Description"
                value={book.description}
                onChange={(e) => setBook({ ...book, description: e.target.value })}
                required
                rows="4"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="ISBN"
                value={book.isbn}
                onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Author"
                value={book.author}
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CategorySelect
                value={book.categories}
                onChange={(value) => setBook({ ...book, categories: value })}
                style={{ 
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)"
                }}
              />
            </div>
            <div className="mb-3">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-2 bg-white rounded border focus:outline-none"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                }}
                placeholder="Price (₹)"
                value={book.price}
                onChange={(e) => setBook({ ...book, price: e.target.value })}
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-2 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </AuthForm>
        </div>
      )}
    </>
  );
}