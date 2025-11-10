
import { useState } from 'react';
import Layout from '../components/Layout';
import SettingsSidebar from '../components/SettingsSidebar';
import AccountSettings from '../components/AccountSettings';
import SecuritySettings from '../components/SecuritySettings';
import LearningSettings from '../components/LearningSettings';
import NotificationSettings from '../components/NotificationSettings';
import PrivacySettings from '../components/PrivacySettings';
import styles from '../styles/Settings.module.css';

// TypeScript types
type SettingsTab = 'account' | 'security' | 'learning' | 'notifications' | 'privacy';

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
}

interface LearningPreferences {
  dailyGoal: number;
  weeklyGoal: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  reminderTime: string;
  enableReminders: boolean;
  enableWeeklyReports: boolean;
}

interface NotificationSettings {
  emailReminders: boolean;
  pushReminders: boolean;
  weeklyReports: boolean;
  courseUpdates: boolean;
  friendActivity: boolean;
  achievements: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showActivity: boolean;
  allowFriendRequests: boolean;
  emailNewsletters: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Przykładowe dane użytkownika
  const [user, setUser] = useState<User>({
    id: 1,
    username: 'anna_learns',
    displayName: 'Anna Kowalska',
    email: 'anna@example.com',
    avatar: '👩‍🎓',
    bio: 'Uczę się angielskiego od 6 miesięcy. Cel: poziom B2 do końca roku!',
    joinedDate: '2025-05-15'
  });

  const [learningPrefs, setLearningPrefs] = useState<LearningPreferences>({
    dailyGoal: 5,
    weeklyGoal: 30,
    difficultyLevel: 'medium',
    reminderTime: '19:00',
    enableReminders: true,
    enableWeeklyReports: true
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailReminders: true,
    pushReminders: true,
    weeklyReports: true,
    courseUpdates: true,
    friendActivity: false,
    achievements: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showProgress: true,
    showActivity: true,
    allowFriendRequests: true,
    emailNewsletters: false
  });

  const handleSave = async (data: any, section: string): Promise<void> => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      // Tutaj byłoby API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage(`✅ ${section} zostało zapisane!`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(`❌ Błąd podczas zapisywania ${section}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountSettings 
            user={user} 
            onSave={(data) => handleSave(data, 'konta')}
            isLoading={isLoading}
          />
        );
      case 'security':
        return (
          <SecuritySettings 
            user={user}
            onSave={(data) => handleSave(data, 'bezpieczeństwa')}
            isLoading={isLoading}
          />
        );
      case 'learning':
        return (
          <LearningSettings 
            preferences={learningPrefs}
            onSave={(data) => handleSave(data, 'preferencji nauki')}
            isLoading={isLoading}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings 
            settings={notifications}
            onSave={(data) => handleSave(data, 'powiadomień')}
            isLoading={isLoading}
          />
        );
      case 'privacy':
        return (
          <PrivacySettings 
            settings={privacy}
            onSave={(data) => handleSave(data, 'prywatności')}
            isLoading={isLoading}
            onExportData={() => console.log('Export data')}
            onDeleteAccount={() => console.log('Delete account')}
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
              {renderContent()}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}