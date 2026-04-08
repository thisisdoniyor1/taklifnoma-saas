import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('taklifnoma_user');
    const token = localStorage.getItem('taklifnoma_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TEMPORARY BYPASS FOR ADMIN
    if (email === 'admin@admin.com' && password === 'admin') {
      const mockUser = { id: 999, email: 'admin@admin.com', isAdmin: true };
      setUser(mockUser);
      localStorage.setItem('taklifnoma_user', JSON.stringify(mockUser));
      localStorage.setItem('taklifnoma_token', 'mock-admin-token');
      return { success: true };
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setUser(data.user);
      localStorage.setItem('taklifnoma_user', JSON.stringify(data.user));
      localStorage.setItem('taklifnoma_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taklifnoma_user');
    localStorage.removeItem('taklifnoma_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
