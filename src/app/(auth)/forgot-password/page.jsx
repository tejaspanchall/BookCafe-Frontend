'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AuthForm from '@/components/auth/AuthForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ForgotPassword() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message || 'Reset instructions sent to your email',
          icon: 'success',
          confirmButtonColor: 'var(--color-button-primary)'
        });

        router.refresh();

      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Failed to send reset instructions',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send reset instructions',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Forgot Password"
      footerLink={{ href: '/login', text: 'Back to Login' }}
    >
      <div className="mb-6">
        <input 
          type="email"
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      
      <button 
        type="submit"
        className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingSpinner size="w-5 h-5" />
        ) : (
          'Reset Password'
        )}
      </button>
    </AuthForm>
  );
}