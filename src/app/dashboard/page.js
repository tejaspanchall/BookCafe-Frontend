'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { PersonFill, BookFill, PlusCircle, Download } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AuthContext } from '@/components/context/AuthContext';

export default function Dashboard() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const { token, isTeacher } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleExportBooks = async () => {
    try {
      setIsExporting(true);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = `${BACKEND}/books/export`;
      a.download = `books_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Add authorization header
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      
      // Fetch the file
      const response = await fetch(`${BACKEND}/books/export`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }
      
      // Get blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Swal.fire({
        title: 'Success!',
        text: 'Books exported successfully',
        icon: 'success',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } catch (error) {
      console.error('Error exporting books:', error);
      Swal.fire({
        title: 'Error!',
        text: `Failed to export books: ${error.message}`,
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } finally {
      setIsExporting(false);
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
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-[var(--color-primary)] p-4 rounded-full">
            <PersonFill className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{`${user?.firstname} ${user?.lastname}`}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-[var(--color-primary)] font-semibold capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Library Card */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
          onClick={() => router.push('/my-library')}
        >
          <div className="flex items-center space-x-4 mb-4">
            <BookFill className="text-[var(--color-primary)] text-2xl" />
            <h2 className="text-xl font-semibold">My Library</h2>
          </div>
          <p className="text-gray-600">Access your borrowed books and reading history</p>
        </div>

        {user?.role === 'teacher' && (
          <>
            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
              onClick={() => router.push('/add-book')}
            >
              <div className="flex items-center space-x-4 mb-4">
                <PlusCircle className="text-[var(--color-primary)] text-2xl" />
                <h2 className="text-xl font-semibold">Add Book</h2>
              </div>
              <p className="text-gray-600">Add a new book to the library catalog</p>
            </div>

            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
              onClick={() => router.push('/add-multiple-books')}
            >
              <div className="flex items-center space-x-4 mb-4">
                <PlusCircle className="text-[var(--color-text-secondary)] text-2xl" />
                <h2 className="text-xl font-semibold">Add Multiple Books</h2>
              </div>
              <p className="text-gray-600">Add multiple books at once using a spreadsheet</p>
            </div>

            <div 
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300"
              onClick={handleExportBooks}
            >
              <div className="flex items-center space-x-4 mb-4">
                {isExporting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="text-[var(--color-primary)] text-2xl" />
                )}
                <h2 className="text-xl font-semibold">Export Books</h2>
              </div>
              <p className="text-gray-600">Download all books data as Excel spreadsheet</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 