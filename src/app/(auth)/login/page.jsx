'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AuthForm from '@/components/auth/AuthForm';

export default function Login() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      Swal.fire({
        title: 'Error!',
        text: 'All fields are required',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Login failed',
          icon: 'error',
          confirmButtonColor: 'var(--color-button-primary)'
        });
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('loginStateChange'));
      router.refresh();
      router.push('/catalog');
      
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to connect to server',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Login" 
      footerLink={{ href: '/forgot-password', text: 'Forgot Password?' }}
    >
      <div className="mb-4">
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
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
      
      <button type="submit" className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]">
        Login
      </button>
    </AuthForm>
  );
}