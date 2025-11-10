
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
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  onSuccess: (userData: UserData) => void;
  onForgotPassword: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function LoginForm({ 
  onSuccess, 
  onForgotPassword, 
  isLoading, 
  setIsLoading 
}: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Wyczyść błąd po zmianie wartości
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Tutaj będzie API call do backendu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Symulacja odpowiedzi
      const userData: UserData = {
        id: 1,
        username: 'Anna',
        email: formData.email
      };
      
      onSuccess(userData);
    } catch (error) {
      setErrors({ general: 'Nieprawidłowy email lub hasło' });
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