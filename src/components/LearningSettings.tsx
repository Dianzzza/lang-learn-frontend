/**
 * @file LearningSettings.tsx
 * @brief Komponent konfiguracji celów edukacyjnych użytkownika.
 *
 * Pozwala użytkownikowi zdefiniować preferencje dotyczące tempa nauki (cel dzienny w minutach)
 * oraz poziomu trudności materiałów. Zawiera również sekcję symulacji, która pokazuje,
 * ile czasu użytkownik poświęci na naukę w skali tygodnia/miesiąca/roku przy obecnych ustawieniach.
 */

'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { updateUserSettings } from '../lib/api';

/**
 * Interfejs reprezentujący pełny obiekt ustawień użytkownika z bazy danych.
 */
interface UserSettings {
  id: number;
  userId: number;
  /** Dzienny cel nauki wyrażony w minutach */
  dailyGoal: number;
  /** Poziom trudności ('Easy', 'Medium', 'Hard') */
  difficulty: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  profilePublic: boolean;
  showStats: boolean;
}

/**
 * Props przyjmowane przez komponent LearningSettings.
 */
interface LearningSettingsProps {
  /** ID użytkownika, którego ustawienia są edytowane */
  userId: number;
  /** Aktualne ustawienia pobrane z API (lub null, jeśli ładowanie trwa) */
  settings: UserSettings | null;
  /** Callback wywoływany po pomyślnym zapisaniu zmian */
  onSuccess?: () => void;
}

/**
 * Komponent formularza ustawień nauki.
 *
 * @param {LearningSettingsProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany formularz z suwakami i przyciskami wyboru.
 */
export default function LearningSettings({ userId, settings, onSuccess }: LearningSettingsProps) {
  // --- STANY UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- STANY FORMULARZA ---
  /** Stan suwaka celu dziennego (w minutach) */
  const [dailyGoal, setDailyGoal] = useState(15);
  /** Stan wybranego poziomu trudności */
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  /**
   * Efekt synchronizujący stan lokalny formularza z danymi wejściowymi (props).
   * Uruchamia się po załadowaniu danych użytkownika (`settings`).
   */
  useEffect(() => {
    if (settings) {
      setDailyGoal(settings.dailyGoal || 15);
      // Rzutowanie typu string z bazy na konkretny Union Type
      setDifficulty((settings.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium');
    }
  }, [settings]);

  /**
   * Obsługa zapisu ustawień.
   *
   * 1. Pobiera token autoryzacyjny.
   * 2. Wysyła żądanie PUT do API przez `updateUserSettings`.
   * 3. Obsługuje stany ładowania, sukcesu i błędu.
   *
   * @param {React.FormEvent} e - Zdarzenie submit formularza.
   */
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

      await updateUserSettings(userId, token, {
        dailyGoal,
        difficulty,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Ukryj komunikat sukcesu po 3 sekundach (dla lepszego UX)
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
        <h2>Ustawienia Nauki</h2>
        <p>Dostosuj swoje cele i preferencje nauki</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Cel dzienny - Suwak (Range Input) */}
        <div className={styles.formGroup}>
          <label htmlFor="dailyGoal" className={styles.label}>
            🎯 Cel dzienny (minuty)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              id="dailyGoal"
              type="range"
              min="5"
              max="120"
              step="5"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value))}
              className={styles.rangeInput}
              style={{ flex: 1 }}
            />
            {/* Wyświetlacz wartości suwaka */}
            <div
              style={{
                backgroundColor: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '8px',
                padding: '12px 20px',
                minWidth: '80px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#2196f3',
                fontSize: '18px'
              }}
            >
              {dailyGoal} min
            </div>
          </div>
          {/* Dynamiczna podpowiedź zależna od wartości */}
          <small className={styles.hint}>
            {dailyGoal < 15 && '⚠️ Mniej niż zalecane (15 min)'}
            {dailyGoal >= 15 && dailyGoal < 30 && '✅ Dobry początek'}
            {dailyGoal >= 30 && dailyGoal < 60 && '🌟 Wspaniały cel!'}
            {dailyGoal >= 60 && '🔥 Wow! Jesteś zaangażowany!'}
          </small>
        </div>

        {/* Poziom trudności - Custom Radio Buttons */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            📊 Poziom trudności
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: difficulty === level ? '2px solid #2196f3' : '1px solid #ddd',
                  backgroundColor: difficulty === level ? '#e3f2fd' : '#fff',
                  cursor: 'pointer',
                  fontWeight: difficulty === level ? '600' : '400',
                  color: difficulty === level ? '#2196f3' : '#666',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {level === 'Easy' && '😊'}
                  {level === 'Medium' && '😐'}
                  {level === 'Hard' && '💪'}
                </div>
                <div>{level === 'Easy' ? 'Łatwy' : level === 'Medium' ? 'Średni' : 'Trudny'}</div>
              </button>
            ))}
          </div>
          <small className={styles.hint}>
            {difficulty === 'Easy' && 'Idealne dla początkujących. Wolniejsze tempo, więcej czasu na zrozumienie.'}
            {difficulty === 'Medium' && 'Idealnie zbilansowane. Dobra miks wyzwania i nauki.'}
            {difficulty === 'Hard' && 'Dla doświadczonych. Szybkie tempo, zaawansowane materiały.'}
          </small>
        </div>

        {/* Informacyjny box - Wskazówka dydaktyczna */}
        <div 
          className={styles.infoBox}
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}
        >
          <p style={{ margin: 0, color: '#0369a1' }}>
            <strong>💡 Wskazówka:</strong> Konsekwencja jest ważniejsza niż ilość. 
            Nawet 10 minut dziennie daje lepsze wyniki niż 2 godziny raz w tygodniu.
          </p>
        </div>

        {/* Statystyka / Prognoza czasu nauki */}
        <div
          style={{
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
            📈 Na podstawie Twojego celu:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
            <li>Dziennie: <strong>{dailyGoal} minut</strong></li>
            <li>Tygodniowo: <strong>{(dailyGoal * 7).toLocaleString()} minut</strong> (~{Math.round(dailyGoal * 7 / 60)} godzin)</li>
            <li>Miesięcznie: <strong>~{Math.round(dailyGoal * 30 / 60)} godzin</strong></li>
            <li>Rocznie: <strong>~{Math.round(dailyGoal * 365 / 60)} godzin</strong></li>
          </ul>
        </div>

        {/* Komunikaty Feedbackowe */}
        {error && (
          <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c33' }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#3c3' }}>
            ✅ Ustawienia nauki zapisane pomyślnie!
          </div>
        )}

        {/* Przycisk Submit */}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? '⏳ Zapisywanie...' : '💾 Zapisz ustawienia'}
          </button>
        </div>
      </form>

      {/* Sekcja Rekomendacji */}
      <div 
        style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffe0b2',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#e65100' }}>🎯 Rekomendacje:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#bf360c' }}>
          <li><strong>Dla początkujących:</strong> 15-20 minut dziennie na poziomie Easy</li>
          <li><strong>Dla średnio zaawansowanych:</strong> 20-30 minut dziennie na poziomie Medium</li>
          <li><strong>Dla zaawansowanych:</strong> 30+ minut dziennie na poziomie Hard</li>
          <li><strong>Najlepiej:</strong> Uczysz się zawsze o tej samej porze dnia</li>
        </ul>
      </div>
    </div>
  );
}