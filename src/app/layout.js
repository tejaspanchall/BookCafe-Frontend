import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BookCafe | Your Digital Educational Library',
  description: 'BookCafe is an educational platform for students and teachers to discover, read, and learn with our extensive collection of digital books.',
  keywords: 'books, education, digital library, learning, reading, students, teachers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />  
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}