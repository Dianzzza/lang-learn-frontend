/**
 * @file RegisterForm.tsx
 * @brief Komponent formularza rejestracji nowego użytkownika.
 *
 * Obsługuje wprowadzanie danych, walidację po stronie klienta (Client-Side Validation)
 * oraz komunikację z API w celu utworzenia konta.
 */

'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';
import { apiRequest } from '../lib/api';

/**
 * Interfejs reprezentujący dane nowo utworzonego użytkownika.
 */
interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

/**
 * Wewnętrzny stan formularza przechowujący wpisane wartości.
 */
interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Struktura błędów walidacji.
 * Klucze odpowiadają polom formularza, a `general` przechowuje błędy z API.
 */
interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Właściwości (Props) przyjmowane przez komponent RegisterForm.
 */
interface RegisterFormProps {
  /** Callback wywoływany po pomyślnej rejestracji. */
  onSuccess: (userData: UserData) => void;
  /** Flaga blokująca formularz podczas trwania zapytania API. */
  isLoading: boolean;
  /** Funkcja ustawiająca stan ładowania w komponencie nadrzędnym. */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Komponent RegisterForm.
 *
 * Implementuje pełny przepływ rejestracji:
 * 1. Zbieranie danych (inputy kontrolowane).
 * 2. Walidacja (regex dla hasła, format emaila, unikalność znaków w loginie).
 * 3. Wysłanie żądania do backendu.
 *
 * @param {RegisterFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany formularz rejestracji.
 */
export default function RegisterForm({ onSuccess, isLoading, setIsLoading }: RegisterFormProps) {
  
  // --- STANY ---
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Stany widoczności haseł (toggle 'oczka')
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  /**
   * Obsługa zmiany wartości w polach formularza.
   * Automatycznie czyści błędy walidacji dla edytowanego pola.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Główna funkcja walidująca formularz.
   *
   * Sprawdza:
   * - Username: min. 3 znaki, tylko alfanumeryczne i `_`.
   * - Email: poprawność formatu.
   * - Password: min. 8 znaków, mała litera, duża litera, cyfra.
   * - ConfirmPassword: zgodność z hasłem.
   *
   * @returns {boolean} True, jeśli formularz jest poprawny.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Walidacja nazwy użytkownika
    if (!formData.username) {
      newErrors.username = 'Nazwa użytkownika jest wymagana';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nazwa użytkownika musi mieć co najmniej 3 znaki';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Nazwa może zawierać tylko litery, cyfry i _';
    }
    
    // Walidacja emaila
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    
    // Walidacja siły hasła
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
    }
    
    // Walidacja powtórzenia hasła
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdź hasło';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła się nie zgadzają';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Obsługa wysłania formularza.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Zdarzenie submit.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (!validateForm()) return;
      
      setIsLoading(true);
      try {
        // Wysłanie danych do API
        const response = await apiRequest<{ message: string; userId: number }>('/auth/register', 'POST', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // Konstrukcja obiektu użytkownika na podstawie odpowiedzi i danych formularza
        // (Backend przy rejestracji zwraca tylko ID i komunikat, resztę bierzemy z inputów)
        const userData: UserData = {
          id: response.userId,
          username: formData.username,
          email: formData.email,
        };

        onSuccess(userData);
      } catch (error) {
        console.error('Register error:', error);
        setErrors({
          general:
            (error as Error).message ||
            'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.',
        });
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Globalny komunikat błędu (np. z API) */}
      {errors.general && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {errors.general}
        </div>
      )}

      {/* Pole Nazwa Użytkownika */}
      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.label}>
          Nazwa użytkownika
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
            placeholder="Twoja nazwa użytkownika"
            disabled={isLoading}
          />
          <span className={styles.inputIcon}>👤</span>
        </div>
        {errors.username && (
          <span className={styles.fieldError}>{errors.username}</span>
        )}
      </div>

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
            placeholder="Twój adres e-mail"
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
            placeholder="Utwórz silne hasło"
            disabled={isLoading}
          />
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

      {/* Pole Potwierdź Hasło */}
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Potwierdź hasło
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="Powtórz hasło"
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className={styles.fieldError}>{errors.confirmPassword}</span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Rejestracja...
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>✨</span>
            Załóż konto
          </>
        )}
      </button>
    </form>
  );
}