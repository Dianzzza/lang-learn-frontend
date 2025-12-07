'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { changePassword } from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface SecuritySettingsProps {
  user: User | null;
  onSuccess?: () => void;
}

export default function SecuritySettings({ user, onSuccess }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formy
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Walidacja
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [showPasswords, setShowPasswords] = useState(false);

  // Oblicz siłę hasła
  const calculatePasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) return 'strong';
    return 'medium';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Walidacja
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Wszystkie pola są wymagane');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Nowe hasło nie może być takie samo jak stare');
      return;
    }

    if (newPassword.length < 6) {
      setError('Nowe hasło musi mieć co najmniej 6 znaków');
      return;
    }

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

      await changePassword(token, currentPassword, newPassword);

      setSuccess(true);
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

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return '#ff6b6b';
      case 'medium':
        return '#ffd93d';
      case 'strong':
        return '#51cf66';
      default:
        return '#ddd';
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Słabe';
      case 'medium':
        return 'Średnie';
      case 'strong':
        return 'Silne';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Bezpieczeństwo</h2>
        <p>Zmień hasło i zarządzaj bezpieczeństwem konta</p>
      </div>

      {/* Informacja o koncie */}
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

      {/* Formularz zmiany hasła */}
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Bieżące hasło */}
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

        {/* Nowe hasło */}
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

          {/* Siła hasła */}
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

        {/* Potwierdzenie hasła */}
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

        {/* Pokaż hasła */}
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

        {/* Walidacja - potwierdzenie pasuje */}
        {newPassword && confirmPassword && (
          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              backgroundColor: newPassword === confirmPassword ? '#efe' : '#fee',
              border: `1px solid ${newPassword === confirmPassword ? '#3c3' : '#fcc'}`,
              color: newPassword === confirmPassword ? '#3c3' : '#c33',
              fontSize: '14px'
            }}
          >
            {newPassword === confirmPassword ? '✅ Hasła są identyczne' : '❌ Hasła się różnią'}
          </div>
        )}

        {/* Komunikaty */}
        {error && (
          <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c33' }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#3c3' }}>
            ✅ Hasło zmienione pomyślnie!
          </div>
        )}

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

      {/* Wskazówki bezpieczeństwa */}
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
