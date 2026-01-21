/**
 * @file SecuritySettings.tsx
 * @brief Komponent zarządzania bezpieczeństwem konta (zmiana hasła).
 *
 * Umożliwia użytkownikowi zmianę hasła z uwzględnieniem weryfikacji aktualnego hasła.
 * Zawiera wbudowany miernik siły hasła (Password Strength Meter) oraz wizualne wskaźniki bezpieczeństwa.
 */

'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { changePassword } from '../lib/api';

/**
 * Interfejs podstawowych danych użytkownika.
 */
interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * Właściwości komponentu SecuritySettings.
 */
interface SecuritySettingsProps {
  user: User | null;
  /** Callback wywoływany po pomyślnej zmianie hasła */
  onSuccess?: () => void;
}

/**
 * Komponent SecuritySettings.
 *
 * Obsługuje formularz zmiany hasła. Kluczowe funkcje:
 * 1. Obliczanie siły hasła w czasie rzeczywistym (regex).
 * 2. Walidacja zgodności haseł (nowe vs potwierdzenie).
 * 3. Zabezpieczenie przed użyciem starego hasła jako nowego.
 *
 * @param {SecuritySettingsProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Panel ustawień bezpieczeństwa.
 */
export default function SecuritySettings({ user, onSuccess }: SecuritySettingsProps) {
  // --- STANY UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- STANY FORMULARZA ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- STANY WALIDACJI I UX ---
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  /** Steruje widocznością znaków w inputach (type="text" vs "password") */
  const [showPasswords, setShowPasswords] = useState(false);

  /**
   * Ocenia siłę hasła na podstawie długości i znaków specjalnych.
   *
   * Reguły:
   * - Weak: < 6 znaków.
   * - Medium: < 10 znaków.
   * - Strong: > 10 znaków ORAZ zawiera Wielką literę, Cyfrę i Znak specjalny.
   *
   * @param {string} pwd - Hasło do oceny.
   * @returns {'weak' | 'medium' | 'strong'} Poziom siły hasła.
   */
  const calculatePasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) return 'strong';
    return 'medium';
  };

  /**
   * Obsługa wpisywania nowego hasła.
   * Aktualizuje stan hasła oraz natychmiast przelicza jego siłę.
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  /**
   * Obsługa wysyłki formularza.
   * Przeprowadza szereg walidacji po stronie klienta przed wysłaniem zapytania do API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // 1. Sprawdzenie wypełnienia pól
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Wszystkie pola są wymagane');
      return;
    }

    // 2. Logika biznesowa: Nowe hasło musi być inne niż stare
    if (currentPassword === newPassword) {
      setError('Nowe hasło nie może być takie samo jak stare');
      return;
    }

    // 3. Walidacja minimalnej długości
    if (newPassword.length < 6) {
      setError('Nowe hasło musi mieć co najmniej 6 znaków');
      return;
    }

    // 4. Sprawdzenie zgodności powtórzonego hasła
    if (newPassword !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }

      // Wywołanie API zmiany hasła
      await changePassword(token, currentPassword, newPassword);

      setSuccess(true);
      // Reset formularza po sukcesie
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength('weak');

      if (onSuccess) {
        onSuccess();
      }

      // Ukryj komunikat sukcesu po 3 sekundach
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /** Helper zwracający kolor paska siły hasła */
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ff6b6b';    // Czerwony
      case 'medium': return '#ffd93d';  // Żółty
      case 'strong': return '#51cf66';  // Zielony
      default: return '#ddd';
    }
  };

  /** Helper zwracający tekstową etykietę siły hasła */
  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 'weak': return 'Słabe';
      case 'medium': return 'Średnie';
      case 'strong': return 'Silne';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Bezpieczeństwo</h2>
        <p>Zmień hasło i zarządzaj bezpieczeństwem konta</p>
      </div>

      {/* Informacja o wylogowaniu sesji */}
      <div 
        className={styles.infoBox}
        style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}
      >
        <p style={{ margin: 0, color: '#0369a1' }}>
          <strong>ℹ️ Informacja:</strong> Zmiana hasła wyloguje Cię ze wszystkich innych urządzeń.
          Będziesz musiał się ponownie zalogować.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Pole: Bieżące hasło */}
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            Bieżące hasło
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="currentPassword"
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Wpisz swoje bieżące hasło"
              className={styles.input}
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Pole: Nowe hasło */}
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Nowe hasło
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="newPassword"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={handlePasswordChange}
              placeholder="Wpisz nowe hasło"
              className={styles.input}
              autoComplete="new-password"
            />
          </div>

          {/* Wizualizacja siły hasła (Pasek postępu) */}
          {newPassword && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  height: '6px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '6px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    backgroundColor: getPasswordStrengthColor(),
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <small style={{ color: getPasswordStrengthColor() }}>
                Siła hasła: <strong>{getPasswordStrengthLabel()}</strong>
              </small>
            </div>
          )}

          <small className={styles.hint}>
            Minimum 6 znaków. Dla silnego hasła: mieszaj duże litery, cyfry i znaki specjalne.
          </small>
        </div>

        {/* Pole: Potwierdź hasło */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Potwierdzenie hasła
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz nowe hasło"
              className={styles.input}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Checkbox: Pokaż hasła */}
        <div className={styles.checkboxGroup}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Pokaż hasła</span>
          </label>
        </div>

        {/* Przycisk Submit */}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading || !newPassword || newPassword !== confirmPassword}
            className={styles.submitBtn}
          >
            {loading ? '⏳ Zmiana hasła...' : '🔒 Zmień hasło'}
          </button>
        </div>
      </form>

      {/* Box z poradami bezpieczeństwa */}
      <div 
        className={styles.tipsBox}
        style={{
          backgroundColor: '#fff9e6',
          border: '1px solid #ffe680',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#b8860b' }}>🛡️ Wskazówki bezpieczeństwa:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#8b6914' }}>
          <li>Nigdy nie udostępniaj swojego hasła nikomu</li>
          <li>Używaj unikalnego hasła dla każdego konta</li>
          <li>Zmień hasło co najmniej raz na 3 miesiące</li>
          <li>Nie używaj informacji osobistych w haśle</li>
          <li>Użyj kombinacji liter, liczb i znaków specjalnych</li>
        </ul>
      </div>
    </div>
  );
}