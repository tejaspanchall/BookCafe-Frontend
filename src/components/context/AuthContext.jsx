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

  const updateAuthState = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let parsedUser = null;

    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }

    const currentToken = token || storedToken;
    const currentUser = user || parsedUser;

    setAuthState({
      isAuthenticated: !!currentToken && !!currentUser,
      isTeacher: currentUser?.role === 'teacher' || false
    });

    if (!token && storedToken) setToken(storedToken);
    if (!user && parsedUser) setUser(parsedUser);
  }, [token, user]);

  useEffect(() => {
    updateAuthState();
  }, [token, user, updateAuthState]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user during initialization:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      updateAuthState();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthState({ isAuthenticated: false, isTeacher: false });
    router.push('/login');
    return true;
  }, [router]);

  const isAuthenticated = useCallback(() => {
    const currentToken = token || localStorage.getItem('token');
    const currentUser = user || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })();
    return !!currentToken && !!currentUser;
  }, [token, user]);

  const isTeacher = useCallback(() => {
    const currentUser = user || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })();
    return currentUser?.role === 'teacher';
  }, [user]);

  const value = {
    token: token || localStorage.getItem('token'),
    user: user || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })(),
    login,
    logout,
    isAuthenticated,
    isTeacher,
    authState,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};