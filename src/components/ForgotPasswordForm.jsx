// components/ForgotPasswordForm.jsx
'use client';
import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';

export default function ForgotPasswordForm({ onSubmit, onBack, isLoading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateEmail()) {
      onSubmit(email);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>🔐</span>
        <p>
          Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="resetEmail" className={styles.label}>
          Adres email
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            id="resetEmail"
            name="resetEmail"
            value={email}
            onChange={handleChange}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="[translate:your.email@example.com]"
            disabled={isLoading}
            autoFocus
          />
          <span className={styles.inputIcon}>📧</span>
        </div>
        {error && (
          <span className={styles.fieldError}>{error}</span>
        )}
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onBack}
          disabled={isLoading}
        >
          ← Powrót
        </button>
        
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
              Wyślij link
            </>
          )}
        </button>
      </div>
    </form>
  );
}
