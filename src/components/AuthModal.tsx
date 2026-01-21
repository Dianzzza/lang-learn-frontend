'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import styles from '../styles/AuthModal.module.css';

import { apiRequest } from '../lib/api';

interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent' | 'reset-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);


  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setIsLoading(false);
  };

  // =====================
  // API Handlers
  // =====================

  const handleForgotPasswordSubmit = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiRequest('/auth/request-password-reset', 'POST', { email });
      setResetEmail(email);
      setMode('reset-sent');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        alert(error.message);
      } else {
        alert('Wystąpił nieznany błąd.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: UserData) => {
    console.log('Login successful:', userData);
    onClose();
  };

  const handleRegisterSuccess = (userData: UserData) => {
    console.log('Registration successful:', userData);
    onClose();
  };

  if (!isOpen) return null;

  const getTitle = (): string => {
    switch (mode) {
      case 'login': return 'Zaloguj się';
      case 'register': return 'Załóż konto';
      case 'forgot-password': return 'Resetuj hasło';
      case 'reset-sent': return 'Sprawdź email';
      case 'reset-password': return 'Nowe hasło';
      default: return 'Autoryzacja';
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Zamknij modal"
        >
          ×
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>{getTitle()}</h2>

          {(mode === 'login' || mode === 'register') && (
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === 'login' ? styles.active : ''}`}
                onClick={() => switchMode('login')}
              >
                Logowanie
              </button>
              <button
                className={`${styles.modeTab} ${mode === 'register' ? styles.active : ''}`}
                onClick={() => switchMode('register')}
              >
                Rejestracja
              </button>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {mode === 'login' && (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onForgotPassword={() => switchMode('forgot-password')}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {mode === 'register' && (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onSubmit={handleForgotPasswordSubmit}
              onBack={() => switchMode('login')}
              isLoading={isLoading}
            />
          )}

          {mode === 'reset-sent' && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>📧</div>
              <h3>Sprawdź swoją skrzynkę email</h3>
              <p>
                Wysłaliśmy link do resetowania hasła na adres{' '}
                <strong>{resetEmail}</strong>.
              </p>
              <p>Kliknij w link, aby zresetować hasło.</p>
              <button
                className={styles.backButton}
                onClick={() => switchMode('login')}
              >
                Powrót do logowania
              </button>
            </div>
          )}

          {mode === 'reset-password' && (
            <ResetPasswordForm
              onSuccess={handleLoginSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
