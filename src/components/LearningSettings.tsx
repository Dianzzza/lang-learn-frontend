
'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';

// TypeScript types
interface LearningPreferences {
  dailyGoal: number;
  weeklyGoal: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  reminderTime: string;
  enableReminders: boolean;
  enableWeeklyReports: boolean;
}

interface LearningSettingsProps {
  preferences: LearningPreferences;
  onSave: (data: LearningPreferences) => Promise<void>;
  isLoading: boolean;
}

export default function LearningSettings({ preferences, onSave, isLoading }: LearningSettingsProps) {
  const [formData, setFormData] = useState<LearningPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleInputChange = (field: keyof LearningPreferences, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving learning preferences:', error);
    }
  };

  const getDifficultyLabel = (level: LearningPreferences['difficultyLevel']): string => {
    switch (level) {
      case 'easy': return 'Łatwy - więcej powtórek, wolniejsze tempo';
      case 'medium': return 'Średni - zbalansowane podejście'; 
      case 'hard': return 'Trudny - szybkie tempo, mniej wskazówek';
    }
  };

  const getGoalDescription = (goal: number): string => {
    if (goal <= 2) return 'Spokojne tempo - idealne na początek';
    if (goal <= 5) return 'Umiarkowane tempo - dobry balans';
    if (goal <= 10) return 'Intensywne tempo - dla zmotywowanych';
    return 'Bardzo intensywne - dla ekspertów';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🎯</span>
          Preferencje nauki
        </h2>
        <p className={styles.description}>
          Dostosuj swoje cele i sposób nauki
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Dzienny cel */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📅</span>
              Cel dzienny: {formData.dailyGoal} {formData.dailyGoal === 1 ? 'lekcja' : 'lekcje'}
            </h3>
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="range"
              min="1"
              max="15"
              value={formData.dailyGoal}
              onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.hint}>
              {getGoalDescription(formData.dailyGoal)}
            </div>
          </div>
        </div>

        {/* Poziom trudności */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚡</span>
              Poziom trudności
            </h3>
          </div>
          
          <div className={styles.formGroup}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <label
                key={level}
                className={`${styles.toggleItem} ${formData.difficultyLevel === level ? styles.selected : ''}`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={formData.difficultyLevel === level}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  className={styles.radioInput}
                />
                <div className={styles.toggleInfo}>
                  <div className={styles.toggleIcon}>
                    {level === 'easy' ? '🟢' : level === 'medium' ? '🟡' : '🔴'}
                  </div>
                  <div className={styles.toggleText}>
                    <div className={styles.toggleTitle}>
                      {level === 'easy' ? 'Łatwy' : level === 'medium' ? 'Średni' : 'Trudny'}
                    </div>
                    <div className={styles.toggleDescription}>
                      {getDifficultyLabel(level)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Przypomnienia */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🔔</span>
              Przypomnienia
            </h3>
          </div>
          
          <div className={styles.toggleList}>
            
            {/* Enable reminders */}
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleIcon}>⏰</span>
                <div className={styles.toggleText}>
                  <div className={styles.toggleTitle}>Przypominaj o nauce codziennie</div>
                  <div className={styles.toggleDescription}>Otrzymuj powiadomienia o planowanej nauce</div>
                </div>
              </div>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={formData.enableReminders}
                  onChange={(e) => handleInputChange('enableReminders', e.target.checked)}
                  className={styles.toggleInput}
                />
                <div className={styles.toggle}>
                  <div className={styles.toggleSlider}></div>
                </div>
              </label>
            </div>

            {/* Reminder time */}
            {formData.enableReminders && (
              <div className={styles.formGroup}>
                <label htmlFor="reminderTime" className={styles.label}>
                  <span className={styles.labelText}>Godzina przypomnienia</span>
                </label>
                <input
                  type="time"
                  id="reminderTime"
                  value={formData.reminderTime}
                  onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                  className={styles.timeInput}
                />
              </div>
            )}

            {/* Weekly reports */}
            <div className={styles.toggleItem}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleIcon}>📊</span>
                <div className={styles.toggleText}>
                  <div className={styles.toggleTitle}>Tygodniowe podsumowania</div>
                  <div className={styles.toggleDescription}>Otrzymuj raport postępów co tydzień</div>
                </div>
              </div>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={formData.enableWeeklyReports}
                  onChange={(e) => handleInputChange('enableWeeklyReports', e.target.checked)}
                  className={styles.toggleInput}
                />
                <div className={styles.toggle}>
                  <div className={styles.toggleSlider}></div>
                </div>
              </label>
            </div>

          </div>
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
                Zapisz preferencje
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}