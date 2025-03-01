'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import AuthForm from '@/components/auth/AuthForm';

export default function ResetPassword() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Error!',
        text: 'Password must be at least 6 characters long',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/auth/reset-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Password reset successful',
          icon: 'success',
          confirmButtonColor: 'var(--color-button-primary)'
        }).then(() => {
          router.push('/login');
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Failed to reset password',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reset password',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Reset Password"
      footerLink={{ href: '/login', text: 'Back to Login' }}
    >
      <div className="mb-6">
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] mb-3"
            placeholder="New Password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text-primary)]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text-primary)]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      <button 
        type="submit"
        className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
      >
        Reset Password
      </button>
    </AuthForm>
  );
}