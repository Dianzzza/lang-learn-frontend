
'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';

// TypeScript types
interface NotificationSettings {
  emailReminders: boolean;
  pushReminders: boolean;
  weeklyReports: boolean;
  courseUpdates: boolean;
  friendActivity: boolean;
  achievements: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSave: (data: NotificationSettings) => Promise<void>;
  isLoading: boolean;
}

export default function NotificationSettings({ settings, onSave, isLoading }: NotificationSettingsProps) {
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleToggle = (field: keyof NotificationSettings): void => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const toggleOptions = [
    {
      key: 'emailReminders' as const,
      title: 'Przypomnienia email',
      description: 'Otrzymuj przypomnienia o nauce na email',
      icon: '📧'
    },
    {
      key: 'pushReminders' as const,
      title: 'Przypomnienia push',
      description: 'Powiadomienia push o zaplanowanej nauce',
      icon: '📱'
    },
    {
      key: 'weeklyReports' as const,
      title: 'Tygodniowe raporty',
      description: 'Podsumowanie tygodniowego postępu',
      icon: '📊'
    },
    {
      key: 'courseUpdates' as const,
      title: 'Aktualizacje kursów',
      description: 'Powiadomienia o nowych lekcjach i materiałach',
      icon: '📚'
    },
    {
      key: 'friendActivity' as const,
      title: 'Aktywność znajomych',
      description: 'Powiadomienia o postępach znajomych',
      icon: '👥'
    },
    {
      key: 'achievements' as const,
      title: 'Osiągnięcia',
      description: 'Powiadomienia o zdobytych odznakach i rekordach',
      icon: '🏆'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🔔</span>
          Powiadomienia
        </h2>
        <p className={styles.description}>
          Wybierz, jakie powiadomienia chcesz otrzymywać
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.toggleList}>
          {toggleOptions.map((option) => (
            <div key={option.key} className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <div className={styles.toggleIcon}>{option.icon}</div>
                <div className={styles.toggleText}>
                  <div className={styles.toggleTitle}>{option.title}</div>
                  <div className={styles.toggleDescription}>
                    {option.description}
                  </div>
                </div>
              </div>
              
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={formData[option.key]}
                  onChange={() => handleToggle(option.key)}
                  className={styles.toggleInput}
                />
                <div className={styles.toggle}>
                  <div className={styles.toggleSlider}></div>
                </div>
              </label>
            </div>
          ))}
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
                Zapisz ustawienia
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}