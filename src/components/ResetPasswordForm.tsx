
'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';

interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface ResetPasswordFormProps {
  onSuccess: (userData: UserData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function ResetPasswordForm({ onSuccess, isLoading, setIsLoading }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, dużą literę i cyfrę';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdź hasło';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła się nie zgadzają';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Tutaj będzie API call do backendu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Symulacja odpowiedzi z nowymi danymi użytkownika
      const userData: UserData = {
        id: 1,
        username: 'User',
        email: 'user@example.com'
      };
      
      onSuccess(userData);
    } catch (error) {
      setErrors({ general: 'Wystąpił błąd podczas resetowania hasła' });
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

      {errors.general && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {errors.general}
        </div>
      )}

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
        {errors.password && (
          <span className={styles.fieldError}>{errors.password}</span>
        )}
        <div className={styles.passwordHint}>
          <small className={styles.hint}>
            Hasło powinno mieć co najmniej 8 znaków i zawierać małą literę, dużą literę oraz cyfrę.
          </small>
        </div>
      </div>

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

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
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