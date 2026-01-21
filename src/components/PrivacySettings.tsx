/**
 * @file PrivacySettings.tsx
 * @brief Komponent zarządzania ustawieniami prywatności profilu.
 *
 * Umożliwia użytkownikowi decydowanie o widoczności jego profilu oraz statystyk nauki
 * dla innych użytkowników platformy. Zawiera interaktywną tabelę (macierz),
 * która wizualizuje skutki wybranych ustawień.
 */

'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { updateUserSettings } from '../lib/api';

/**
 * Interfejs reprezentujący pełny zestaw ustawień użytkownika.
 */
interface UserSettings {
  id: number;
  userId: number;
  dailyGoal: number;
  difficulty: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  /** Czy profil jest widoczny publicznie (np. w rankingach) */
  profilePublic: boolean;
  /** Czy szczegółowe statystyki są widoczne dla odwiedzających profil */
  showStats: boolean;
}

/**
 * Właściwości (Props) przyjmowane przez komponent PrivacySettings.
 */
interface PrivacySettingsProps {
  /** ID użytkownika */
  userId: number;
  /** Aktualne ustawienia (lub null przed załadowaniem) */
  settings: UserSettings | null;
  /** Callback po pomyślnym zapisie */
  onSuccess?: () => void;
}

/**
 * Komponent PrivacySettings.
 *
 * Obsługuje dwa główne przełączniki:
 * 1. `profilePublic`: Globalna widoczność profilu.
 * 2. `showStats`: Widoczność szczegółów postępu.
 *
 * Komponent zawiera również tabelę "Co inne osoby mogą zobaczyć", która
 * reaguje na zmiany stanu w czasie rzeczywistym.
 *
 * @param {PrivacySettingsProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Panel ustawień prywatności.
 */
export default function PrivacySettings({ userId, settings, onSuccess }: PrivacySettingsProps) {
  // --- STANY UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- STANY FORMULARZA ---
  const [profilePublic, setProfilePublic] = useState(true);
  const [showStats, setShowStats] = useState(true);

  /**
   * Efekt synchronizujący stan lokalny z danymi z API.
   * Używa operatora nullish coalescing (`??`), aby domyślnie ustawić `true`
   * w przypadku braku danych (polityka "open by default").
   */
  useEffect(() => {
    if (settings) {
      setProfilePublic(settings.profilePublic ?? true);
      setShowStats(settings.showStats ?? true);
    }
  }, [settings]);

  /**
   * Obsługa przełączania ustawień prywatności.
   *
   * @param {('profile' | 'stats')} field - Określa, który przełącznik został kliknięty.
   */
  const handleToggle = async (field: 'profile' | 'stats') => {
    // Obliczenie nowych wartości
    const newProfilePublic = field === 'profile' ? !profilePublic : profilePublic;
    const newShowStats = field === 'stats' ? !showStats : showStats;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }

      // Wysłanie aktualizacji do API
      await updateUserSettings(userId, token, {
        profilePublic: newProfilePublic,
        showStats: newShowStats,
      });

      // Aktualizacja stanu lokalnego tylko po sukcesie API
      if (field === 'profile') {
        setProfilePublic(newProfilePublic);
      } else {
        setShowStats(newShowStats);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Auto-ukrywanie komunikatu sukcesu
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
        <h2>Prywatność</h2>
        <p>Kontroluj widoczność Twojego profilu i danych</p>
      </div>

      {/* Box informacyjny */}
      <div 
        style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}
      >
        <p style={{ margin: 0, color: '#0369a1' }}>
          <strong>ℹ️ Informacja:</strong> Te ustawienia kontrolują, kto może zobaczyć Twój profil i postęp w nauce.
        </p>
      </div>

      {/* Sekcja: Widoczność Profilu */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            👁️ Profil publiczny
          </h3>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
            Pozwól innym użytkownikom widzieć Twój profil
          </p>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {profilePublic ? (
              <span>✅ Profil jest <strong>publiczny</strong> - wszyscy mogą go zobaczyć</span>
            ) : (
              <span>🔒 Profil jest <strong>prywatny</strong> - tylko Ty możesz go zobaczyć</span>
            )}
          </div>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={profilePublic}
            onChange={() => handleToggle('profile')}
            disabled={loading}
          />
          <span className={styles.toggleSwitch} />
        </label>
      </div>

      {/* Sekcja: Wyświetlanie statystyk */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            📊 Wyświetlaj statystyki
          </h3>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
            Pozwól innym zobaczyć Twoje postępy i osiągnięcia
          </p>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {showStats ? (
              <span>✅ Statystyki są <strong>widoczne</strong> - inni mogą zobaczyć Twoje osiągnięcia</span>
            ) : (
              <span>🔒 Statystyki są <strong>ukryte</strong> - tylko Ty widzisz swoje dane</span>
            )}
          </div>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showStats}
            onChange={() => handleToggle('stats')}
            disabled={loading}
          />
          <span className={styles.toggleSwitch} />
        </label>
      </div>

      {/* Komunikaty Feedbackowe */}
      {error && (
        <div className={styles.alert} style={{ backgroundColor: '#fee', color: '#c33', marginBottom: '16px' }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className={styles.alert} style={{ backgroundColor: '#efe', color: '#3c3', marginBottom: '16px' }}>
          ✅ Ustawienia prywatności zmienione!
        </div>
      )}

      {/* Macierz widoczności (Truth Table) - pokazuje co dokładnie jest widoczne */}
      <div
        style={{
          backgroundColor: '#fafafa',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          📋 Co inne osoby mogą zobaczyć:
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: '600' }}>Element</th>
              <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: '600' }}>Widoczny?</th>
            </tr>
          </thead>
          <tbody>
            {/* Podstawowe dane zależą tylko od profilePublic */}
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Nazwa wyświetlana</td>
              <td style={{ textAlign: 'center', color: profilePublic ? '#3c3' : '#999' }}>
                {profilePublic ? '✅' : '❌'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Bio / Opis</td>
              <td style={{ textAlign: 'center', color: profilePublic ? '#3c3' : '#999' }}>
                {profilePublic ? '✅' : '❌'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Awatar</td>
              <td style={{ textAlign: 'center', color: profilePublic ? '#3c3' : '#999' }}>
                {profilePublic ? '✅' : '❌'}
              </td>
            </tr>
            {/* Szczegółowe dane wymagają OBU zgód: profilePublic AND showStats */}
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Punkty i rankingi</td>
              <td style={{ textAlign: 'center', color: profilePublic && showStats ? '#3c3' : '#999' }}>
                {profilePublic && showStats ? '✅' : '❌'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Postęp w kursach</td>
              <td style={{ textAlign: 'center', color: profilePublic && showStats ? '#3c3' : '#999' }}>
                {profilePublic && showStats ? '✅' : '❌'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: '#666' }}>Osiągnięcia</td>
              <td style={{ textAlign: 'center', color: profilePublic && showStats ? '#3c3' : '#999' }}>
                {profilePublic && showStats ? '✅' : '❌'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Zalecenia i Wyjaśnienia */}
      <div 
        style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffe0b2',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#e65100' }}>💡 Zalecenia:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#bf360c', fontSize: '13px' }}>
          <li><strong>Profil publiczny:</strong> Pozwala innym inspirować się Twoim postępem</li>
          <li><strong>Wyświetlaj statystyki:</strong> Motywuje i pokazuje Twoją zaangażowanie</li>
          <li><strong>Zmień ustawienia w dowolnym momencie:</strong> Bez ograniczeń</li>
          <li><strong>Email nigdy nie jest publiczny:</strong> Twój email widzi tylko Ty i administratorzy</li>
        </ul>
      </div>
    </div>
  );
}