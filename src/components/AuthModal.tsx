/**
 * @file AuthModal.tsx
 * @brief Komponent modala obsługujący pełny proces uwierzytelniania.
 *
 * Plik ten zawiera główny kontener (wrapper) dla formularzy autoryzacyjnych.
 * Zarządza on stanem wyświetlania (Login vs Register vs Forgot Password)
 * oraz logiką interfejsu (zamykanie na ESC, blokada scrollowania tła).
 */

'use client';

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import styles from '../styles/AuthModal.module.css';

// import API helpera
import { apiRequest } from '../lib/api';

/**
 * Interfejs reprezentujący dane użytkownika zwracane przez API
 * po pomyślnym zalogowaniu lub rejestracji.
 */
interface UserData {
  /** Unikalny identyfikator użytkownika w bazie danych */
  id: number;
  /** Nazwa użytkownika (login) */
  username: string;
  /** Adres e-mail użytkownika */
  email: string;
  /** Aktualna liczba punktów (opcjonalne) */
  points?: number;
  /** Liczba dni nauki z rzędu (opcjonalne) */
  streak_days?: number;
}

/**
 * Typ wyliczeniowy określający aktualny widok wewnątrz modala.
 *
 * - `login`: Formularz logowania.
 * - `register`: Formularz rejestracji.
 * - `forgot-password`: Formularz prośby o reset hasła.
 * - `reset-sent`: Widok potwierdzenia wysłania maila.
 * - `reset-password`: Formularz ustawiania nowego hasła.
 */
type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent' | 'reset-password';

/**
 * Właściwości (Props) przyjmowane przez komponent AuthModal.
 */
interface AuthModalProps {
  /** Flaga sterująca widocznością modala */
  isOpen: boolean;
  /** Funkcja wywoływana przy żądaniu zamknięcia modala (np. klik w tło, ESC) */
  onClose: () => void;
  /**
   * Początkowy tryb formularza po otwarciu.
   * @default 'login'
   */
  initialMode?: AuthMode;
}

/**
 * Główny komponent modala autoryzacji.
 *
 * Renderuje odpowiedni pod-komponent (formularz) w zależności od stanu `mode`.
 * Obsługuje również globalne zdarzenia UI, takie jak blokowanie przewijania strony (`body scroll lock`).
 *
 * @param {AuthModalProps} props - Właściwości komponentu.
 * @returns {JSX.Element | null} Wyrenderowany modal lub `null`, jeśli `isOpen` jest false.
 */
export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  // --- STANY ---
  const [mode, setMode] = useState<AuthMode>(initialMode);
  /** Przechowuje email do wyświetlenia w komunikacie sukcesu resetowania hasła */
  const [resetEmail, setResetEmail] = useState('');
  /** Globalny stan ładowania dla operacji asynchronicznych w modalu */
  const [isLoading, setIsLoading] = useState(false);

  // --- EFEKTY UBOCZNE ---

  /**
   * @brief Blokuje przewijanie strony (`document.body`), gdy modal jest otwarty.
   * Przywraca domyślny styl po zamknięciu modala.
   */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  /**
   * @brief Obsługa zamykania modala klawiszem ESC.
   * Dodaje nasłuchiwacz zdarzeń `keydown` przy otwarciu i usuwa go przy zamknięciu.
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // --- HANDLERY ---

  /**
   * Obsługuje kliknięcie w tło (overlay).
   * Zamyka modal tylko wtedy, gdy kliknięto bezpośrednio w overlay, a nie w jego zawartość.
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  /**
   * Zmienia aktualnie wyświetlany formularz.
   * Czyści stan ładowania przy każdej zmianie widoku.
   * @param {AuthMode} newMode - Nowy tryb do ustawienia.
   */
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setIsLoading(false);
  };

  // =====================
  // API Handlers
  // =====================

  /**
   * Obsługuje proces wysyłania prośby o reset hasła.
   *
   * 1. Ustawia stan ładowania.
   * 2. Wysyła żądanie do API `/auth/request-password-reset`.
   * 3. W przypadku sukcesu przełącza widok na `reset-sent`.
   * 4. W przypadku błędu wyświetla alert.
   *
   * @param {string} email - Adres email podany przez użytkownika.
   */
  const handleForgotPasswordSubmit = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      // prawdziwe wywołanie backendu
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

  /** Callback wywoływany po sukcesie w komponencie LoginForm */
  const handleLoginSuccess = (userData: UserData) => {
    console.log('Login successful:', userData);
    onClose();
  };

  /** Callback wywoływany po sukcesie w komponencie RegisterForm */
  const handleRegisterSuccess = (userData: UserData) => {
    console.log('Registration successful:', userData);
    onClose();
  };

  // Jeśli modal jest zamknięty, nie renderujemy nic
  if (!isOpen) return null;

  /**
   * Pomocnicza funkcja zwracająca tytuł modala w zależności od trybu.
   */
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

          {/* Wyświetlaj zakładki tylko dla ekranów logowania/rejestracji */}
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