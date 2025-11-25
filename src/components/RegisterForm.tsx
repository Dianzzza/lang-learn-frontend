
'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';
import { apiRequest } from '../lib/api';

interface UserData {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface RegisterFormProps {
  onSuccess: (userData: UserData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function RegisterForm({ onSuccess, isLoading, setIsLoading }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
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
    
    if (!formData.username) {
      newErrors.username = 'Nazwa użytkownika jest wymagana';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Nazwa użytkownika musi mieć co najmniej 3 znaki';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Nazwa może zawierać tylko litery, cyfry i _';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    
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
        const response = await apiRequest<{ message: string; userId: number }>('api/auth/register', 'POST', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // Backend zwraca message + userId, więc pobieramy je stąd
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
      {errors.general && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {errors.general}
        </div>
      )}

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