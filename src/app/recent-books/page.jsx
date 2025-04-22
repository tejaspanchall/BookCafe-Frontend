'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AuthContext } from '@/components/context/AuthContext';

export default function RecentBooks() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    fetchRecentBooks();
  }, []);

  const fetchRecentBooks = async () => {
    try {
      const response = await fetch(`${BACKEND}/books/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch recent books');
      const data = await response.json();
      setRecentBooks(data.books || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent books:', error);
      setRecentBooks([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Recently Added Books</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        </div>

        <div className="space-y-4">
          {recentBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center border border-gray-100">
              <div className="flex-shrink-0 w-16 h-20 mr-4">
                <img
                  src={book.image_url || '/default-book-cover.jpg'}
                  alt={book.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{book.title}</h3>
                <p className="text-gray-600 text-sm">
                  {book.authors?.map(author => author.name).join(', ')}
                </p>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <span>Added on {new Date(book.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/book/${book.id}`)}
                className="ml-4 px-4 py-2 bg-[var(--color-button-primary)] text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
          {recentBooks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No books have been added recently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 