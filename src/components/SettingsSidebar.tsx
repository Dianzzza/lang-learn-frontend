
'use client';

import styles from '../styles/SettingsSidebar.module.css';

// TypeScript types
type SettingsTab = 'account' | 'security' | 'learning' | 'notifications' | 'privacy';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

interface NavItem {
  id: SettingsTab;
  label: string;
  icon: string;
  description: string;
}

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'account',
      label: 'Profil',
      icon: '👤',
      description: 'Podstawowe informacje o koncie'
    },
    {
      id: 'security', 
      label: 'Bezpieczeństwo',
      icon: '🔒',
      description: 'Hasło i dostęp do konta'
    },
    {
      id: 'learning',
      label: 'Preferencje nauki',
      icon: '🎯',
      description: 'Cele i przypomnienia'
    },
    {
      id: 'notifications',
      label: 'Powiadomienia',
      icon: '🔔',
      description: 'Email i push notifications'
    },
    {
      id: 'privacy',
      label: 'Prywatność',
      icon: '🛡️',
      description: 'Widoczność i dane osobowe'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Ustawienia</h3>
        <p className={styles.subtitle}>
          Zarządzaj swoim kontem
        </p>
      </div>

      <nav className={styles.navigation}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            title={item.description}
          >
            <div className={styles.navIcon}>
              {item.icon}
            </div>
            <div className={styles.navContent}>
              <div className={styles.navLabel}>
                {item.label}
              </div>
              <div className={styles.navDescription}>
                {item.description}
              </div>
            </div>
            <div className={styles.navArrow}>
              →
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}