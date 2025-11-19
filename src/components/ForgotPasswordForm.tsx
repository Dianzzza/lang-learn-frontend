'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export default function ForgotPasswordForm({
  onSubmit,
  onBack,
  isLoading,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email jest wymagany');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Nieprawidłowy format email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateEmail()) {
      await onSubmit(email);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <p className={styles.description}>
          Podaj adres email powiązany z Twoim kontem, a wyślemy Ci link do resetowania hasła.
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="reset-email" className={styles.label}>
          Adres email
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            id="reset-email"
            name="email"
            value={email}
            onChange={handleChange}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="Twój adres e-mail"
            disabled={isLoading}
            autoComplete="email"
            autoFocus
          />
          <span className={styles.inputIcon}>📧</span>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !email}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Wysyłanie...
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}>📤</span>
              Wyślij link resetujący
            </>
          )}
        </button>

        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          disabled={isLoading}
        >
          <span className={styles.buttonIcon}>← </span>
          Powrót do logowania
        </button>
      </div>
    </form>
  );
}
