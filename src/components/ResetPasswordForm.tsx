/**
 * @file ResetPasswordForm.tsx
 * @brief Komponent formularza ustawiania nowego hasła (ostatni etap odzyskiwania dostępu).
 *
 * Komponent ten jest renderowany po kliknięciu przez użytkownika w link resetujący otrzymany w e-mailu.
 * Jego zadaniem jest:
 * 1. Pobranie tokenu weryfikacyjnego z parametrów URL (`?token=...`).
 * 2. Walidacja siły nowego hasła.
 * 3. Wysłanie nowego hasła wraz z tokenem do API w celu finalizacji zmiany.
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../styles/AuthForms.module.css';
import { apiRequest } from '../lib/api';

/**
 * Interfejs danych użytkownika zwracanych po pomyślnym resetowaniu (opcjonalnie loguje użytkownika).
 */
interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

/**
 * Stan formularza - przechowuje nowe hasło i jego powtórzenie.
 */
interface FormData {
  password: string;
  confirmPassword: string;
}

/**
 * Błędy walidacji formularza.
 */
interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Właściwości komponentu ResetPasswordForm.
 */
interface ResetPasswordFormProps {
  /** Callback wywoływany po pomyślnej zmianie hasła (np. automatyczne logowanie lub przekierowanie). */
  onSuccess: (userData: UserData) => void;
  /** Flaga blokująca formularz podczas wysyłki danych. */
  isLoading: boolean;
  /** Funkcja sterująca stanem ładowania. */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Komponent ResetPasswordForm.
 *
 * @param {ResetPasswordFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Formularz zmiany hasła.
 */
export default function ResetPasswordForm({
  onSuccess,
  isLoading,
  setIsLoading,
}: ResetPasswordFormProps) {
  // --- STANY ---
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Toggle widoczności haseł
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Komunikat sukcesu wyświetlany przed przekierowaniem
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Hook Next.js do obsługi Query Parameters.
   * Kluczowy element: pobiera token z URL (np. lang-learn.com/reset-password?token=XYZ).
   */
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); 

  /**
   * Obsługa zmian w inputach.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Czyści błędy w trakcie pisania
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (successMessage) setSuccessMessage('');
  };

  /**
   * Walidacja formularza przed wysyłką.
   * Sprawdza siłę hasła, zgodność obu pól oraz obecność tokenu w URL.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Walidacja siły hasła (Regex: mała, duża litera, cyfra, min 8 znaków)
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
    }

    // 2. Sprawdzenie zgodności haseł
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdź hasło';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła się nie zgadzają';
    }

    // 3. Sprawdzenie obecności tokenu (Critical Security Check)
    if (!token) {
      newErrors.general = 'Brak tokenu resetującego. Spróbuj ponownie z linku resetowego.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Obsługa wysłania formularza.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Wysłanie tokenu i nowego hasła do backendu
      const response = await apiRequest<{ message: string; user?: UserData }>(
        '/auth/reset-password',
        'POST',
        {
          token, // Token z URL jest niezbędny do autoryzacji tej operacji
          password: formData.password,
        }
      );

      setSuccessMessage(response.message || 'Hasło zostało pomyślnie zmienione.');
      
      // Jeśli backend zwraca od razu usera (auto-login), wywołujemy onSuccess
      if (response.user) onSuccess(response.user);
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors({
        general:
          (err as Error).message || 'Nie udało się zresetować hasła. Spróbuj ponownie później.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <p className={styles.description}>
          Utwórz nowe, silne hasło dla swojego konta.
        </p>
      </div>

      {/* Globalne błędy (np. wygasły token) */}
      {errors.general && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {errors.general}
        </div>
      )}

      {/* Komunikat sukcesu */}
      {successMessage && (
        <div className={styles.successMessage}>
          <span className={styles.successIcon}>✅</span>
          {successMessage}
        </div>
      )}

      {/* Pole: Nowe Hasło */}
      <div className={styles.formGroup}>
        <label htmlFor="new-password" className={styles.label}>
          Nowe hasło
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="new-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Utwórz silne hasło"
            disabled={isLoading}
            autoComplete="new-password"
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
        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        
        {/* Wskazówka dotycząca bezpieczeństwa hasła */}
        <div className={styles.passwordHint}>
          <small className={styles.hint}>
            Hasło powinno mieć co najmniej 8 znaków i zawierać małą literę, dużą literę oraz cyfrę.
          </small>
        </div>
      </div>

      {/* Pole: Potwierdź Hasło */}
      <div className={styles.formGroup}>
        <label htmlFor="confirm-new-password" className={styles.label}>
          Potwierdź nowe hasło
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirm-new-password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="Powtórz nowe hasło"
            disabled={isLoading}
            autoComplete="new-password"
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

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Resetowanie...
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>🔒</span>
            Zresetuj hasło
          </>
        )}
      </button>
    </form>
  );
}