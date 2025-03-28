'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AuthForm from '@/components/auth/AuthForm';
import FormInput from '@/components/auth/FormInput';
import FormButton from '@/components/auth/FormButton';
import { FiMail } from 'react-icons/fi';

export default function ForgotPassword() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      Swal.fire({
        title: 'Error!',
        text: 'Email is required',
        icon: 'error',
        confirmButtonColor: 'var(--color-button-primary)'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <AuthForm 
        title="Check Your Email"
        subtitle={`We've sent password reset instructions to ${email}`}
        footerLink={{ href: '/login', text: 'Back to Login' }}
      >
        <div className="text-center mb-4">
          <div className="flex justify-center mb-6">
            <div className="bg-[var(--color-success-light)] p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-[var(--color-text-primary)]">
            Follow the instructions in the email to reset your password. If you don't see the email, check your spam folder.
          </p>
        </div>
        
        <FormButton 
          type="button"
          onClick={() => router.push('/login')}
        >
          Return to Login
        </FormButton>
      </AuthForm>
    );
  }

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password"
      footerLink={{ href: '/login', text: 'Back to Login' }}
    >
      <div className="space-y-6">
        <FormInput 
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          icon={<FiMail className="text-[var(--color-text-secondary)]" />}
        />
      
        <FormButton 
          type="submit"
          isLoading={isLoading}
        >
          Send Reset Link
        </FormButton>
      </div>
    </AuthForm>
  );
}