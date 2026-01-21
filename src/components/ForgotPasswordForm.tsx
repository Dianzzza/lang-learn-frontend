/**
 * @file ForgotPasswordForm.tsx
 * @brief Komponent formularza odzyskiwania hasła.
 *
 * Wyświetla pole tekstowe na adres e-mail oraz przyciski akcji.
 * Obsługuje walidację formatu e-maila po stronie klienta przed wysłaniem żądania.
 */

'use client';

import { useState } from 'react';
import styles from '../styles/AuthForms.module.css';

/**
 * Właściwości (Props) przekazywane do komponentu ForgotPasswordForm.
 */
interface ForgotPasswordFormProps {
  /**
   * Asynchroniczna funkcja wywoływana po zatwierdzeniu formularza.
   * Przyjmuje zwalidowany adres email jako argument.
   * @param email - Adres email wprowadzony przez użytkownika.
   */
  onSubmit: (email: string) => Promise<void>;

  /**
   * Funkcja wywoływana po kliknięciu przycisku "Powrót".
   * Zazwyczaj przełącza widok z powrotem na ekran logowania.
   */
  onBack: () => void;

  /**
   * Flaga określająca, czy trwa wysyłanie żądania.
   * Blokuje interakcję z formularzem i wyświetla spinner ładowania.
   */
  isLoading: boolean;
}

/**
 * Komponent formularza "Zapomniałem hasła".
 *
 * Pozwala użytkownikowi wprowadzić adres e-mail w celu otrzymania linku resetującego hasło.
 * Zawiera lokalny stan do obsługi inputu oraz komunikatów o błędach walidacji.
 *
 * @param {ForgotPasswordFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany formularz.
 */
export default function ForgotPasswordForm({
  onSubmit,
  onBack,
  isLoading,
}: ForgotPasswordFormProps) {
  // --- STANY ---
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  /**
   * Obsługa zmiany wartości w polu email.
   * Czyści komunikat błędu w momencie, gdy użytkownik zaczyna pisać (UX).
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Zdarzenie zmiany inputu.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  /**
   * Waliduje poprawność wprowadzonego adresu email.
   *
   * Sprawdza:
   * 1. Czy pole nie jest puste.
   * 2. Czy format zgadza się z wyrażeniem regularnym (prosty regex `\S+@\S+\.\S+`).
   *
   * @returns {boolean} `true` jeśli email jest poprawny, w przeciwnym razie `false`.
   */
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

  /**
   * Obsługa wysłania formularza.
   *
   * Zapobiega domyślnemu przeładowaniu strony, uruchamia walidację
   * i jeśli jest poprawna, wywołuje funkcję `onSubmit` z propsów.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Zdarzenie submit formularza.
   */
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

      {/* Wyświetlanie błędów walidacji */}
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