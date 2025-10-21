// components/AuthModal.jsx
'use client';
import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import styles from '../styles/AuthModal.module.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsLoading(false);
  };

  const handleForgotPasswordSubmit = async (email) => {
    setIsLoading(true);
    // Tutaj będzie API call do backendu
    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetEmail(email);
      setMode('reset-sent');
    } catch (error) {
      console.error('Error sending reset email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    // Tutaj będzie logika po udanym logowaniu
    console.log('Login successful:', userData);
    onClose();
  };

  const handleRegisterSuccess = (userData) => {
    // Tutaj będzie logika po udanej rejestracji
    console.log('Registration successful:', userData);
    onClose();
  };

  if (!isOpen) return null;

  const getTitle = () => {
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Zamknij"
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
              <h3>Link został wysłany!</h3>
              <p>
                Sprawdź swoją skrzynkę email <strong>{resetEmail}</strong>. 
                Kliknij w link, aby zresetować hasło.
              </p>
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
              onSuccess={() => switchMode('login')}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
