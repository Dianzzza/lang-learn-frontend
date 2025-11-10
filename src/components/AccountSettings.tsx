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

interface AccountSettingsProps {
  user: User;
  onSave: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export default function AccountSettings({ user, onSave, isLoading }: AccountSettingsProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName?.trim()) {
      newErrors.displayName = 'Nazwa wyświetlana jest wymagana';
    }
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Nazwa użytkownika jest wymagana';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = 'Nazwa może zawierać tylko litery, cyfry i _ (3-20 znaków)';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (formData.bio && formData.bio.length > 250) {
      newErrors.bio = 'Bio może mieć maksymalnie 250 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof User, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleAvatarChange = (newAvatar: string): void => {
    handleInputChange('avatar', newAvatar);
  };

  const availableAvatars = [
    '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬',
    '🦉', '🐧', '🐻', '🦊', '🐱', '🐶', '🦁', '🐯',
    '😊', '😎', '🤓', '😇', '🥳', '🤗', '🙂', '😋'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>👤</span>
          Informacje o koncie
        </h2>
        <p className={styles.description}>
          Zarządzaj podstawowymi informacjami o swoim profilu
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Avatar Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Avatar</span>
            <span className={styles.labelOptional}>Wybierz swój avatar</span>
          </label>
          
          <div className={styles.currentAvatar}>
            <div className={styles.avatarPreview}>
              {formData.avatar}
            </div>
            <div className={styles.avatarInfo}>
              <div className={styles.avatarLabel}>Aktualny avatar</div>
              <div className={styles.avatarHint}>Kliknij na nowy avatar aby zmienić</div>
            </div>
          </div>
          
          <div className={styles.avatarGrid}>
            {availableAvatars.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => handleAvatarChange(avatar)}
                className={`${styles.avatarOption} ${formData.avatar === avatar ? styles.selected : ''}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Display Name */}
        <div className={styles.formGroup}>
          <label htmlFor="displayName" className={styles.label}>
            <span className={styles.labelText}>Nazwa wyświetlana</span>
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="displayName"
            value={formData.displayName || ''}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className={`${styles.input} ${errors.displayName ? styles.error : ''}`}
            placeholder="Twoja nazwa wyświetlana"
            maxLength={50}
          />
          {errors.displayName && (
            <div className={styles.errorMessage}>{errors.displayName}</div>
          )}
        </div>

        {/* Username */}
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            <span className={styles.labelText}>Nazwa użytkownika</span>
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWithPrefix}>
            <span className={styles.inputPrefix}>@</span>
            <input
              type="text"
              id="username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
              className={`${styles.input} ${styles.withPrefix} ${errors.username ? styles.error : ''}`}
              placeholder="nazwa_uzytkownika"
              maxLength={20}
            />
          </div>
          {errors.username && (
            <div className={styles.errorMessage}>{errors.username}</div>
          )}
          <div className={styles.hint}>
            Tylko litery, cyfry i podkreślnik. 3-20 znaków.
          </div>
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            <span className={styles.labelText}>Adres email</span>
            <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            placeholder="twoj@email.com"
          />
          {errors.email && (
            <div className={styles.errorMessage}>{errors.email}</div>
          )}
        </div>

        {/* Bio */}
        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>
            <span className={styles.labelText}>Bio</span>
            <span className={styles.labelOptional}>Opcjonalnie</span>
          </label>
          <textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={`${styles.textarea} ${errors.bio ? styles.error : ''}`}
            placeholder="Opowiedz coś o sobie i swoich celach nauki..."
            rows={4}
            maxLength={250}
          />
          <div className={styles.charCount}>
            {(formData.bio || '').length}/250
          </div>
          {errors.bio && (
            <div className={styles.errorMessage}>{errors.bio}</div>
          )}
        </div>

        {/* Submit */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={!hasChanges || isLoading}
            className={`${styles.saveBtn} ${!hasChanges ? styles.disabled : ''}`}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Zapisywanie...
              </>
            ) : (
              <>
                <span className={styles.saveIcon}>💾</span>
                Zapisz zmiany
              </>
            )}
          </button>
          
          {hasChanges && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  displayName: user.displayName,
                  username: user.username,
                  email: user.email,
                  avatar: user.avatar,
                  bio: user.bio || ''
                });
                setHasChanges(false);
                setErrors({});
              }}
              className={styles.cancelBtn}
            >
              Anuluj
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
