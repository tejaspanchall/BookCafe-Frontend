'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { AuthContext } from '@/components/context/AuthContext';
import { CardSkeleton } from '@/components/skeleton';
import { 
  Book, 
  PersonFill, 
  PlusCircle, 
  FileEarmarkPlus, 
  FileEarmarkArrowDown, 
  BoxArrowRight 
} from 'react-bootstrap-icons';

export default function Dashboard() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const { user, isAuthenticated, isTeacher } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksInLibrary: 0,
    categories: 0,
    authors: 0
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchStats();
  }, [isAuthenticated, router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch library books for stats
      const response = await fetch(`${BACKEND}/books/my-library`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const libraryBooks = data.books || [];
        
        // Calculate statistics
        const uniqueCategories = new Set(
          libraryBooks.flatMap(book => book.categories?.map(cat => cat.name) || [])
        );
        
        const uniqueAuthors = new Set(
          libraryBooks.flatMap(book => book.authors?.map(author => author.name) || [])
        );

        setStats({
          totalBooks: isTeacher() ? (await fetchTotalBooks()) : 0,
          booksInLibrary: libraryBooks.length,
          categories: uniqueCategories.size,
          authors: uniqueAuthors.size
        });
      } else {
        console.error("Failed to fetch library stats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load dashboard data. Please try again later.',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalBooks = async () => {
    try {
      const response = await fetch(`${BACKEND}/books/get-books`, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        return data.books?.length || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching total books:", error);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            Dashboard
          </h1>
        </div>
        <CardSkeleton count={4} layout="dashboard" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          Welcome, {user?.firstname || 'User'}!
        </h1>
        <p className="text-gray-600">
          Manage your book collection and library from one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="flex items-center mb-2">
            <Book className="text-2xl mr-2" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-lg font-semibold">Books in Library</h2>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {stats.booksInLibrary}
          </p>
        </div>

        {isTeacher() && (
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: 'var(--color-text-secondary)' }}>
            <div className="flex items-center mb-2">
              <Book className="text-2xl mr-2" style={{ color: 'var(--color-text-secondary)' }} />
              <h2 className="text-lg font-semibold">Total Books</h2>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.totalBooks}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: 'var(--color-text-light)' }}>
          <div className="flex items-center mb-2">
            <PersonFill className="text-2xl mr-2" style={{ color: 'var(--color-text-light)' }} />
            <h2 className="text-lg font-semibold">Authors</h2>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {stats.authors}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: 'var(--color-accent)' }}>
          <div className="flex items-center mb-2">
            <PlusCircle className="text-2xl mr-2" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-semibold">Categories</h2>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {stats.categories}
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        <Link href="/my-library" className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition duration-300 border border-gray-100">
          <Book className="text-4xl mb-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            My Library
          </h3>
          <p className="text-gray-600 text-sm">
            View and manage the books in your personal library
          </p>
        </Link>

        {isTeacher() && (
          <>
            <Link href="/add-book" className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition duration-300 border border-gray-100">
              <PlusCircle className="text-4xl mb-4" style={{ color: 'var(--color-text-secondary)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Add Book
              </h3>
              <p className="text-gray-600 text-sm">
                Add a new book to the collection
              </p>
            </Link>

            <Link href="/add-multiple-books" className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition duration-300 border border-gray-100">
              <FileEarmarkPlus className="text-4xl mb-4" style={{ color: 'var(--color-text-light)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Bulk Import
              </h3>
              <p className="text-gray-600 text-sm">
                Import multiple books using Excel spreadsheets
              </p>
            </Link>

            <div 
              className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition duration-300 border border-gray-100 cursor-pointer"
              onClick={() => handleExportBooks()}
            >
              <FileEarmarkArrowDown className="text-4xl mb-4" style={{ color: 'var(--color-accent)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Export Books
              </h3>
              <p className="text-gray-600 text-sm">
                Export all books to Excel format
              </p>
            </div>
          </>
        )}

        <Link href="/catalog" className="bg-white hover:bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center transition duration-300 border border-gray-100">
          <Book className="text-4xl mb-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Book Catalog
          </h3>
          <p className="text-gray-600 text-sm">
            Browse all available books
          </p>
        </Link>
      </div>
    </div>
  );

  async function handleExportBooks() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Show loading message
      Swal.fire({
        title: 'Exporting Books',
        text: 'Please wait while we prepare your Excel file...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await fetch(`${BACKEND}/books/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link and trigger the download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Get current date for filename
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        a.download = `books-export-${formattedDate}.xlsx`;
        
        // Append to the document and trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Swal.fire({
          title: 'Success!',
          text: 'Books have been exported successfully',
          icon: 'success',
          confirmButtonColor: 'var(--color-button-primary)'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export books');
      }
    } catch (error) {
      console.error('Error exporting books:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to export books',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } finally {
      setLoading(false);
    }
  }
} 