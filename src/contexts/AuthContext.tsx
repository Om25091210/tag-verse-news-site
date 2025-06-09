
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      setIsAdminLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with username:', username);
      
      // Check credentials against admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      console.log('Query result:', data, error);

      if (error) {
        console.error('Database error:', error);
        return false;
      }

      if (!data) {
        console.log('No user found with username:', username);
        return false;
      }

      // Simple password check (in production, use proper password hashing)
      if (password === 'tiger@1234') {
        localStorage.setItem('admin_session', JSON.stringify(data));
        setIsAdminLoggedIn(true);
        console.log('Login successful');
        return true;
      } else {
        console.log('Invalid password');
        return false;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_session');
    setIsAdminLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAdminLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
