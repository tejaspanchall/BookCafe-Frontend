import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BookCafe',
  description: 'Educational platform for students and teachers',
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