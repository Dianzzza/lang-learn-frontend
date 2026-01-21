/**
 * @file settings.tsx
 * @brief Strona ustawień użytkownika (Panel konfiguracyjny).
 *
 * Komponent ten implementuje architekturę "Master-Detail":
 * 1. Lewa kolumna: Menu nawigacyjne (`SettingsSidebar`).
 * 2. Prawa kolumna: Dynamicznie renderowana treść (Konto, Bezpieczeństwo, Powiadomienia).
 *
 * Logika danych opiera się na pobraniu obiektu `user` z API autoryzacji
 * oraz obiektu `settings` z API ustawień (z fallbackiem do danych lokalnych w przypadku braku endpointu).
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SettingsSidebar from '../components/SettingsSidebar';
import AccountSettings from '../components/AccountSettings';
import SecuritySettings from '../components/SecuritySettings';
import LearningSettings from '../components/LearningSettings';
import NotificationSettings from '../components/NotificationSettings';
import PrivacySettings from '../components/PrivacySettings';
import styles from '../styles/Settings.module.css';
import { apiRequest } from '../lib/api';

/** Typy zakładek dostępnych w panelu */
type SettingsTab = 'account' | 'security' | 'learning' | 'notifications' | 'privacy';

/** Model ustawień użytkownika (zgodny z bazą danych) */
interface UserSettings {
  id: number;
  userId: number;
  dailyGoal: number;
  difficulty: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  profilePublic: boolean;
  showStats: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  
  // --- STANY UI ---
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saveMessage, setSaveMessage] = useState<string>(''); // Feedback dla użytkownika (Toast)
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // --- STANY DANYCH ---
  const [user, setUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  /**
   * Efekt inicjalizacji: Pobiera dane użytkownika i jego ustawienia.
   */
  useEffect(() => {
    const initSettings = async () => {
      // 1. Weryfikacja tokena (Client-side Auth Guard)
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 2. Pobranie danych podstawowych użytkownika
        const userData = await apiRequest<any>('/auth/me', 'GET', undefined, token);
        setUser(userData);

        // 3. Pobranie ustawień szczegółowych
        try {
            // W przyszłości odkomentować właściwe wywołanie API:
            // const settings = await apiRequest<UserSettings>(`/users/${userData.id}/settings`, 'GET', undefined, token);
            // setUserSettings(settings);
            
            // TYMCZASOWO: Mock Data (Fallback)
            // Umożliwia pracę nad UI nawet bez gotowego endpointu backendowego.
            setUserSettings({
                id: 1,
                userId: userData.id,
                dailyGoal: 5,
                difficulty: 'Normal',
                notificationsEnabled: true,
                emailNotifications: false,
                profilePublic: true,
                showStats: true
            });
        } catch (settingsErr) {
            console.warn("Nie udało się pobrać szczegółowych ustawień, używam domyślnych.");
        }

      } catch (err) {
        console.error("Błąd ładowania ustawień:", err);
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };

    initSettings();
  }, []);

  // --- RENDERY STANÓW ---

  // 1. Ładowanie
  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Ładowanie ustawień...</p>
        </div>
      </Layout>
    );
  }

  // 2. Błąd Autoryzacji (Fallback zamiast redirecta, dla lepszego UX)
  if (authError || !user) {
    return (
        <Layout>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>🔒 Wymagane logowanie</h2>
            <p>Twoja sesja wygasła. Zaloguj się ponownie.</p>
            <button 
                onClick={() => router.push('/auth/login')}
                style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}
            >
                Przejdź do logowania
            </button>
          </div>
        </Layout>
    );
  }

  /**
   * Wyświetla komunikat sukcesu przez 3 sekundy.
   */
  const handleSaveSuccess = () => {
    setSaveMessage('✅ Zmiany zapisane pomyślnie!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  /**
   * Router wewnętrzny - zwraca odpowiedni komponent w zależności od wybranej zakładki.
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings user={user} onSuccess={handleSaveSuccess} />;
      case 'security':
        return <SecuritySettings user={user} onSuccess={handleSaveSuccess} />;
      case 'learning':
        return <LearningSettings userId={user.id} settings={userSettings} onSuccess={handleSaveSuccess} />;
      case 'notifications':
        return <NotificationSettings userId={user.id} settings={userSettings} onSuccess={handleSaveSuccess} />;
      case 'privacy':
        return <PrivacySettings userId={user.id} settings={userSettings} onSuccess={handleSaveSuccess} />;
      default:
        return null;
    }
  };

  return (
    <Layout title="Ustawienia - LangLearn" description="Zarządzaj swoim kontem i preferencjami">
      <div className={styles.settingsPage}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>⚙️</span>
              Ustawienia
            </h1>
            <p className={styles.pageDescription}>
              Zarządzaj swoim kontem i preferencjami nauki
            </p>
          </div>

          {/* Toast message (Sukces/Błąd zapisu) */}
          {saveMessage && (
            <div className={`${styles.message} ${saveMessage.includes('✅') ? styles.success : styles.error}`}>
              {saveMessage}
            </div>
          )}

          {/* Główny Grid: Sidebar + Content */}
          <div className={styles.settingsLayout}>
            
            <div className={styles.sidebar}>
              <SettingsSidebar 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div className={styles.content}>
               {renderContent()}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}