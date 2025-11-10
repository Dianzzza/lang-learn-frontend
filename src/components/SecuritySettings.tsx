// components/SecuritySettings.tsx
// BEZPIECZEŃSTWO - zmiana hasła, email (bez 2FA)
// UŻYWA WSPÓLNEGO SettingsForm.module.css

'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';

// TypeScript types
interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailData {
  newEmail: string;
  password: string;
}

interface SecuritySettingsProps {
  user: User;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function SecuritySettings({ user, onSave, isLoading }: SecuritySettingsProps) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailData, setEmailData] = useState<EmailData>({
    newEmail: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (password.length < 6) return { strength: 0, label: 'Bardzo słabe', color: 'var(--secondary-red)' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    switch (score) {
      case 0:
      case 1: return { strength: 20, label: 'Słabe', color: 'var(--secondary-red)' };
      case 2: return { strength: 40, label: 'Przeciętne', color: 'var(--secondary-amber)' };
      case 3: return { strength: 60, label: 'Dobre', color: 'var(--secondary-amber)' };
      case 4: return { strength: 80, label: 'Silne', color: 'var(--secondary-green)' };
      case 5: return { strength: 100, label: 'Bardzo silne', color: 'var(--secondary-green)' };
      default: return { strength: 0, label: 'Bardzo słabe', color: 'var(--secondary-red)' };
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Aktualne hasło jest wymagane';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nowe hasło jest wymagane';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Hasło musi mieć przynajmniej 8 znaków';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła muszą być identyczne';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'Nowe hasło musi różnić się od aktualnego';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      await onSave({
        action: 'changePassword',
        ...passwordData
      });
      
      // Clear form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({ submit: 'Błąd podczas zmiany hasła' });
    }
  };

  const togglePasswordVisibility = (field: string): void => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🔒</span>
          Bezpieczeństwo
        </h2>
        <p className={styles.description}>
          Zarządzaj dostępem do swojego konta
        </p>
      </div>

      <div className={styles.sectionsContainer}>
        
        {/* Zmiana hasła */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🔑</span>
              Zmiana hasła
            </h3>
            <p className={styles.sectionDescription}>
              Ustaw nowe, bezpieczne hasło do swojego konta
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>
                <span className={styles.labelText}>Aktualne hasło</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={`${styles.input} ${errors.currentPassword ? styles.error : ''}`}
                  placeholder="Wpisz aktualne hasło"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className={styles.passwordToggle}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.currentPassword && (
                <div className={styles.errorMessage}>{errors.currentPassword}</div>
              )}
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                <span className={styles.labelText}>Nowe hasło</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`${styles.input} ${errors.newPassword ? styles.error : ''}`}
                  placeholder="Wpisz nowe hasło"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className={styles.passwordToggle}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <div className={styles.errorMessage}>{errors.newPassword}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                <span className={styles.labelText}>Potwierdź hasło</span>
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                  placeholder="Powtórz nowe hasło"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className={styles.passwordToggle}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className={styles.errorMessage}>{errors.confirmPassword}</div>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                className={styles.submitBtn}
              >
                {isLoading ? 'Zmienianie...' : 'Zmień hasło'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
