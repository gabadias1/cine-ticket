import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cineTicketUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('cineTicketUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.login(email, password);
      const userData = response.user;
      
      setUser(userData);
      localStorage.setItem('cineTicketUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.register(name, email, password);
      const userData = response.user;
      
      setUser(userData);
      localStorage.setItem('cineTicketUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cineTicketUser');
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
