'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { apiRequest } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  points?: number;
  streak_days?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Sprawdzaj token przy mountingu
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Pobierz profil użytkownika z backendu
      loadUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 📥 Załaduj profil użytkownika z backendu (zawiera avatar)
  const loadUserProfile = async (authToken: string) => {
    try {
      console.log('📥 Ładowanie profilu użytkownika...');
      const userData = await apiRequest<User>(
        '/auth/me',
        'GET',
        undefined,
        authToken
      );
      console.log('✅ Profil załadowany:', userData);
      setUser(userData);
    } catch (err) {
      console.error('❌ Błąd ładowania profilu:', err);
      // Jeśli token jest nieprawidłowy, wyloguj
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{
        token: string;
      }>('/auth/login', 'POST', { email, password });

      setToken(response.token);
      localStorage.setItem('token', response.token);

      // 🔑 Załaduj profil z avatarem zaraz po logowaniu
      await loadUserProfile(response.token);

      router.push('/study');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);
      await apiRequest('/auth/register', 'POST', {
        username,
        email,
        password,
      });

      // Po rejestracji, zaloguj automatycznie
      await login(email, password);
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}