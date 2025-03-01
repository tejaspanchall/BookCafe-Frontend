'use client';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState({ isAuthenticated: false, isTeacher: false });

  useEffect(() => {
    setAuthState({
      isAuthenticated: !!token,
      isTeacher: user?.role === 'teacher' || false
    });
  }, [token, user]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BACKEND}/auth/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
    return true;
  }, [router]);

  const isAuthenticated = useCallback(() => !!token, [token]);
  const isTeacher = useCallback(() => user?.role === 'teacher', [user]);

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isTeacher,
      authState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};