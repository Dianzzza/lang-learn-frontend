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
// import { useProfile } from '../hooks/useProfile'; // ❌ Usuwamy to
// import { getUserSettings } from '../lib/api'; // ❌ To też, użyjemy apiRequest bezpośrednio
import { apiRequest } from '../lib/api'; // ✅ Dodajemy nasz helper

// TypeScript types
type SettingsTab = 'account' | 'security' | 'learning' | 'notifications' | 'privacy';

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
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Zastępujemy hook useProfile lokalnym stanem
  const [user, setUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  
  // Jeden wspólny stan ładowania
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // --- NOWA, BEZPIECZNA LOGIKA POBIERANIA DANYCH ---
  useEffect(() => {
    const initSettings = async () => {
      // 1. Sprawdzamy token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 2. Pobieramy usera (/auth/me)
        const userData = await apiRequest<any>('/auth/me', 'GET', undefined, token);
        setUser(userData);

        // 3. Pobieramy ustawienia (lub ustawiamy domyślne, jeśli endpoint nie istnieje)
        try {
            // Próbujemy pobrać ustawienia, jeśli masz taki endpoint
            // const settings = await apiRequest<UserSettings>(`/users/${userData.id}/settings`, 'GET', undefined, token);
            // setUserSettings(settings);
            
            // NA RAZIE: Ustawiamy bezpieczne dane domyślne (Mock), żeby strona działała
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

  // --- KONIEC LOGIKI, DALEJ TYLKO WIDOK ---

  // Stan ładowania
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

  // Zabezpieczenie: jeśli brak usera (błąd auth), pokazujemy ekran błędu zamiast pustej strony
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

  const handleSaveSuccess = () => {
    setSaveMessage('✅ Zmiany zapisane pomyślnie!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountSettings 
            user={user}
            onSuccess={handleSaveSuccess}
          />
        );
      case 'security':
        return (
          <SecuritySettings 
            user={user}
            onSuccess={handleSaveSuccess}
          />
        );
      case 'learning':
        return (
          <LearningSettings 
            userId={user.id}
            settings={userSettings}
            onSuccess={handleSaveSuccess}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings 
            userId={user.id}
            settings={userSettings}
            onSuccess={handleSaveSuccess}
          />
        );
      case 'privacy':
        return (
          <PrivacySettings 
            userId={user.id}
            settings={userSettings}
            onSuccess={handleSaveSuccess}
          />
        );
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

          {/* Save message */}
          {saveMessage && (
            <div className={`${styles.message} ${saveMessage.includes('✅') ? styles.success : styles.error}`}>
              {saveMessage}
            </div>
          )}

          {/* Layout główny - sidebar + content */}
          <div className={styles.settingsLayout}>
            
            {/* Sidebar - navigation */}
            <div className={styles.sidebar}>
              <SettingsSidebar 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Content - active settings section */}
            <div className={styles.content}>
              {/* Usunąłem settingsLoading stąd, bo mamy globalne loading na górze */}
               {renderContent()}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}