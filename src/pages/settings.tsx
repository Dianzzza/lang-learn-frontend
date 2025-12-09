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
import { useProfile } from '../hooks/useProfile';
import { getUserSettings } from '../lib/api';

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
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Pobierz dane profilu z bazy
  const { user, loading, error } = useProfile();

  // Pobierz ustawienia użytkownika
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        setSettingsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const settings = await getUserSettings(user.id, token);
        setUserSettings(settings);
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Redirect jeśli brak autoryzacji
  useEffect(() => {
    if (!loading && (error || !user)) {
      router.push('/auth/login');
    }
  }, [loading, user, error, router]);

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

  // Zabezpieczenie przed renderowaniem bez usera
  if (error || !user) {
    return null;
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
              {settingsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                  <p>Ładowanie ustawień...</p>
                </div>
              ) : (
                renderContent()
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
