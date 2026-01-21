/**
 * @file LoginForm.tsx
 * @brief Komponent formularza logowania.
 *
 * Obsługuje wprowadzanie danych uwierzytelniających (email/hasło), walidację lokalną
 * oraz komunikację z API w celu uzyskania tokena JWT. Integruje się z `AuthContext`
 * w celu ustanowienia sesji użytkownika.
 */

'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext'; // <--- Integracja z kontekstem

/**
 * Interfejs reprezentujący dane zalogowanego użytkownika otrzymane z API.
 */
interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

/**
 * Interfejs stanu wewnętrznego formularza.
 */
interface FormData {
  email: string;
  password: string;
}

/**
 * Interfejs błędów walidacji.
 * `general` służy do wyświetlania błędów API (np. "Nieprawidłowe hasło").
 */
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Właściwości (Props) przekazywane do komponentu LoginForm.
 */
interface LoginFormProps {
  /** Callback wywoływany po pomyślnym zalogowaniu (np. zamknięcie modala). */
  onSuccess: (userData: UserData) => void;
  /** Funkcja przełączająca widok na formularz resetowania hasła. */
  onForgotPassword: () => void;
  /** Flaga blokująca formularz podczas trwania zapytania API. */
  isLoading: boolean;
  /** Funkcja ustawiająca stan ładowania w komponencie nadrzędnym (Modal). */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Komponent LoginForm.
 *
 * Zarządza procesem logowania. Wykorzystuje hook `useAuth` do zaktualizowania
 * globalnego stanu aplikacji po otrzymaniu poprawnego tokena.
 *
 * @param {LoginFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany formularz logowania.
 */
export default function LoginForm({ 
  onSuccess, 
  onForgotPassword, 
  isLoading, 
  setIsLoading 
}: LoginFormProps) {
  
  /** Pobranie funkcji login z kontekstu autoryzacji. */
  const { login } = useAuth();

  // --- STANY ---
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /**
   * Obsługa zmiany wartości w polach input.
   * Aktualizuje stan `formData` i czyści błąd walidacji dla edytowanego pola.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Wyczyść błąd po zmianie wartości (UX)
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Walidacja formularza po stronie klienta.
   * Sprawdza format emaila (regex) oraz długość hasła.
   *
   * @returns {boolean} True, jeśli formularz jest poprawny.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Obsługa wysłania formularza.
   *
   * 1. Waliduje dane wejściowe.
   * 2. Wysyła żądanie POST do `/auth/login`.
   * 3. W przypadku sukcesu:
   * - Aktualizuje globalny kontekst (`login()`).
   * - Wywołuje callback `onSuccess`.
   * 4. W przypadku błędu: ustawia odpowiedni komunikat w `errors.general`.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: UserData }>('/auth/login', 'POST', {
        email: formData.email,
        password: formData.password,
      });

      if (response.token) {
        // Zapisz token w localStorage i zaktualizuj stan aplikacji (Context)
        login(response.token, response.user);
        onSuccess(response.user);
      } else {
        setErrors({ general: 'Nieprawidłowa odpowiedź serwera' });
      }
    } catch (error) {
      console.error('Login error:', error);
      // Wyświetl błąd zwrócony przez API lub ogólny komunikat
      setErrors({ general: (error as Error).message || 'Nieprawidłowy email lub hasło' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Wyświetlanie ogólnych błędów (np. z API) */}
      {errors.general && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {errors.general}
        </div>
      )}

      {/* Pole Email */}
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Adres email
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="Twój adres e-mail (example@xyz.com)"
            disabled={isLoading}
          />
          <span className={styles.inputIcon}>📧</span>
        </div>
        {errors.email && (
          <span className={styles.fieldError}>{errors.email}</span>
        )}
      </div>

      {/* Pole Hasło */}
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Hasło
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Wprowadź swoje hasło"
            disabled={isLoading}
          />
          {/* Przełącznik widoczności hasła */}
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && (
          <span className={styles.fieldError}>{errors.password}</span>
        )}
      </div>

      <button
        type="button"
        className={styles.forgotPassword}
        onClick={onForgotPassword}
        disabled={isLoading}
      >
        Zapomniałeś hasła?
      </button>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Logowanie...
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>🔓</span>
            Zaloguj się
          </>
        )}
      </button>
    </form>
  );
}