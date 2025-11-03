// components/RegisterForm.jsx
'use client';
import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';

export default function RegisterForm({ onSuccess, isLoading, setIsLoading }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Tutaj będzie API call do backendu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData = {
        id: 2,
        username: formData.username,
        email: formData.email
      };
      
      onSuccess(userData);
    } catch (error) {
      setErrors({ general: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' });
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
            placeholder="Wprowadź nazwę użytkownika"
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
            placeholder="Stwórz bezpieczne hasło"
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
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
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className={styles.fieldError}>{errors.confirmPassword}</span>
        )}
      </div>

      <div className={styles.termsCheckbox}>
        <input type="checkbox" id="terms" required disabled={isLoading} />
        <label htmlFor="terms">
          Akceptuję <a href="#" className={styles.link}>regulamin</a> i <a href="#" className={styles.link}>politykę prywatności</a>
        </label>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Tworzenie konta...
          </>
        ) : (
          <>
            <span className={styles.buttonIcon}>✨</span>
            Stwórz konto
          </>
        )}
      </button>
    </form>
  );
}
