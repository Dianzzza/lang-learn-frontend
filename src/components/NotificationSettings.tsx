/**
 * @file NotificationSettings.tsx
 * @brief Komponent zarządzania ustawieniami powiadomień użytkownika.
 *
 * Umożliwia włączanie i wyłączanie powiadomień push (na urządzeniu) oraz
 * powiadomień e-mail. Zmiany są zapisywane w bazie danych poprzez API.
 */

'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SettingsForm.module.css';
import { updateUserSettings } from '../lib/api';

/**
 * Interfejs reprezentujący pełny zestaw ustawień użytkownika.
 * Zawiera pola dotyczące celów nauki, widoczności profilu oraz powiadomień.
 */
interface UserSettings {
  id: number;
  userId: number;
  dailyGoal: number;
  difficulty: string;
  /** Flaga globalna dla powiadomień push/systemowych */
  notificationsEnabled: boolean;
  /** Flaga dla powiadomień marketingowych i raportów e-mail */
  emailNotifications: boolean;
  profilePublic: boolean;
  showStats: boolean;
}

/**
 * Właściwości (Props) przyjmowane przez komponent NotificationSettings.
 */
interface NotificationSettingsProps {
  /** ID użytkownika, którego ustawienia są modyfikowane */
  userId: number;
  /** Aktualny obiekt ustawień pobrany z serwera (lub null przed załadowaniem) */
  settings: UserSettings | null;
  /** Callback wywoływany po pomyślnym zapisaniu zmian w bazie */
  onSuccess?: () => void;
}

/**
 * Komponent NotificationSettings.
 *
 * Renderuje interfejs z przełącznikami (toggle switches) dla poszczególnych typów powiadomień.
 * Obsługuje asynchroniczną aktualizację ustawień i wyświetla komunikaty zwrotne (sukces/błąd).
 *
 * @param {NotificationSettingsProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany panel ustawień powiadomień.
 */
export default function NotificationSettings({ userId, settings, onSuccess }: NotificationSettingsProps) {
  // --- STANY UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- STANY FORMULARZA ---
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  /**
   * Efekt synchronizujący stan lokalny z danymi wejściowymi (props).
   * Ustawia domyślnie `true` w przypadku braku wartości w bazie (`null`/`undefined`).
   */
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setEmailNotifications(settings.emailNotifications ?? true);
    }
  }, [settings]);

  /**
   * Obsługuje zmianę stanu przełącznika (toggle).
   *
   * Funkcja oblicza nową wartość dla wybranego pola, wysyła żądanie aktualizacji do API,
   * a następnie aktualizuje stan lokalny interfejsu.
   *
   * @param {('notifications' | 'email')} field - Typ powiadomienia do przełączenia.
   */
  const handleToggle = async (field: 'notifications' | 'email') => {
    // Obliczamy nową wartość na podstawie aktualnego stanu
    const newNotifications = field === 'notifications' ? !notificationsEnabled : notificationsEnabled;
    const newEmail = field === 'email' ? !emailNotifications : emailNotifications;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Brak tokena autoryzacji');
      }

      // Wywołanie API z nowym zestawem ustawień
      await updateUserSettings(userId, token, {
        notificationsEnabled: newNotifications,
        emailNotifications: newEmail,
      });

      // Aktualizacja stanu lokalnego po sukcesie API
      if (field === 'notifications') {
        setNotificationsEnabled(newNotifications);
      } else {
        setEmailNotifications(newEmail);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Automatyczne ukrycie komunikatu sukcesu po 3 sekundach
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
        <h2>Powiadomienia</h2>
        <p>Zarządzaj powiadomieniami i alertami</p>
      </div>

      {/* Informacyjny box */}
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
          <strong>ℹ️ Informacja:</strong> Powiadomienia pomagają Ci być spójna i pamiętać o celach nauki.
          Możesz je w każdej chwili włączyć lub wyłączyć.
        </p>
      </div>

      {/* Sekcja: Powiadomienia push */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            🔔 Powiadomienia na urządzeniu
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Otrzymuj przypomnienia o nauce bezpośrednio na ekran
          </p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => handleToggle('notifications')}
            disabled={loading}
          />
          <span className={styles.toggleSwitch} />
        </label>
      </div>

      {/* Sekcja: Powiadomienia e-mail */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            📧 Powiadomienia e-mail
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Otrzymuj raporty tygodniowe i aktualizacje e-mailem
          </p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => handleToggle('email')}
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
          ✅ Ustawienia powiadomień zmienione!
        </div>
      )}

      {/* Sekcja szczegółów (Dynamiczna lista korzyści) */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
          📋 Co otrzymasz:
        </h3>
        
        {/* Lista dla powiadomień Push */}
        {notificationsEnabled && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0369a1' }}>
              🔔 Powiadomienia na urządzeniu:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
              <li>Przypomnienie o codziennej nauce</li>
              <li>Gratulacje za ukończenie lekcji</li>
              <li>Osiągnięcia i odznaki</li>
              <li>Powiadomienia o nowych kursach</li>
            </ul>
          </div>
        )}

        {/* Lista dla powiadomień E-mail */}
        {emailNotifications && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0369a1' }}>
              📧 Powiadomienia e-mail:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
              <li>Cotygodniowy raport postępu</li>
              <li>Podsumowanie nauki z ostatniego tygodnia</li>
              <li>Artykuły i wskazówki do nauki</li>
              <li>Oferty specjalne i aktualizacje</li>
            </ul>
          </div>
        )}

        {/* Stan, gdy wszystko wyłączone */}
        {!notificationsEnabled && !emailNotifications && (
          <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
            ℹ️ Wszystkie powiadomienia są wyłączone. Nie będziesz otrzymywać żadnych alertów.
          </p>
        )}
      </div>

      {/* Zalecenia */}
      <div 
        style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffe0b2',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#e65100' }}>💡 Zalecenia:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#bf360c', fontSize: '13px' }}>
          <li><strong>Włącz powiadomienia:</strong> Pomogą Ci być konsekwentnym w nauce</li>
          <li><strong>Otrzymuj raporty e-mail:</strong> Dobrze zobaczyć swój postęp</li>
          <li><strong>Ustaw czas:</strong> Powiadomienia będą wysyłane o najlepszym dla Ciebie czasu</li>
          <li><strong>Wyrażanie:</strong> Możesz zawsze zmienić ustawienia w każdej chwili</li>
        </ul>
      </div>
    </div>
  );
}