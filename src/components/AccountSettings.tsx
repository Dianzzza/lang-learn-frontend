'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { updateUserProfile } from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
}

interface AccountSettingsProps {
  user: User | null;
  onSuccess?: () => void;
}

export default function AccountSettings({ user, onSuccess }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formy
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('👤');

  // Dostępne awatary do wyboru
  const availableAvatars = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🎓', '📚', '🚀', '💡', '🌟', '⭐'];

  // Załaduj dane użytkownika
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '👤');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }

      await updateUserProfile(token, {
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
      });

      setSuccess(true);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Ustawienia Konta</h2>
        <p>Edytuj swoje informacje profilowe</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Email (read-only) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className={styles.inputDisabled}
            placeholder="Email"
          />
          <small className={styles.hint}>Email nie może być zmieniony</small>
        </div>

        {/* Nazwa wyświetlana */}
        <div className={styles.formGroup}>
          <label htmlFor="displayName" className={styles.label}>
            Nazwa wyświetlana
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Np. Zbyszek"
            maxLength={50}
            className={styles.input}
          />
          <small className={styles.hint}>Maksymalnie 50 znaków</small>
        </div>

        {/* Bio */}
        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Napisz coś o sobie..."
            maxLength={200}
            rows={4}
            className={styles.textarea}
          />
          <small className={styles.hint}>
            {bio.length}/200 znaków
          </small>
        </div>

        {/* Avatar Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Awatar</label>
          <div className={styles.avatarGrid}>
            {availableAvatars.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`${styles.avatarOption} ${avatar === av ? styles.selected : ''}`}
                title={`Wybierz ${av}`}
              >
                <span className={styles.avatarEmoji}>{av}</span>
              </button>
            ))}
          </div>
          <small className={styles.hint}>Wybrany: {avatar}</small>
        </div>

        {/* Komunikaty */}
        {error && (
          <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c33' }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#3c3' }}>
            ✅ Ustawienia zaktualizowane pomyślnie!
          </div>
        )}

        {/* Przycisk Submit */}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? '⏳ Zapisywanie...' : '💾 Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  );
}
