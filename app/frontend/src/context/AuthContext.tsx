import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { profileApi } from '../components/profile/api';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar_url?: string;
  profileImage?: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!token;

  // Fetch user profile on app load if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        try {
          const profile = await profileApi.getProfile();
          setUser({
            id: profile.user_id || profile.id,
            name: profile.name || '',
            email: profile.email || '',
            username: profile.username || '',
            avatar_url: profile.avatar_url || '',
            profileImage: profile.avatar_url || ''
          });
        } catch {
          setUser(null);
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 