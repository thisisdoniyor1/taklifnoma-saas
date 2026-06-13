import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = (data) => {
    setUser(data.user);
    localStorage.setItem('taklifnoma_user', JSON.stringify(data.user));
    localStorage.setItem('taklifnoma_token', data.token);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('taklifnoma_user');
    const token = localStorage.getItem('taklifnoma_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, adminLoginAttempt = false) => {
    try {
      const data = await db.login(email, password, adminLoginAttempt);

      if (adminLoginAttempt && !data.user?.isAdmin) {
        throw new Error('Incorrect password');
      }

      applySession(data);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      await db.signup(email, password, displayName);
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
    <AuthContext.Provider value={{ user, login, signup, logout, loading, applySession }}>
      {children}
    </AuthContext.Provider>
  );
};
