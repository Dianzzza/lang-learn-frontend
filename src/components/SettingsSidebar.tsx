/**
 * @file SettingsSidebar.tsx
 * @brief Komponent paska bocznego nawigacji w panelu ustawień.
 *
 * Wyświetla listę dostępnych sekcji konfiguracyjnych (np. Profil, Bezpieczeństwo).
 * Działa jako komponent kontrolowany (stateless) - stan aktywnej zakładki
 * jest zarządzany przez komponent nadrzędny (np. stronę Settings).
 */

'use client';

import styles from '../styles/SettingsSidebar.module.css';

/**
 * Typ unii (Union Type) określający dozwolone identyfikatory zakładek.
 * Zapewnia ścisłe typowanie przy przełączaniu widoków.
 */
type SettingsTab = 'account' | 'security' | 'learning' | 'notifications' | 'privacy';

/**
 * Właściwości (Props) przyjmowane przez komponent SettingsSidebar.
 */
interface SettingsSidebarProps {
  /** Aktualnie wybrana zakładka */
  activeTab: SettingsTab;
  /** Funkcja zmieniająca aktywną zakładkę w stanie rodzica */
  onTabChange: (tab: SettingsTab) => void;
}

/**
 * Wewnętrzny interfejs opisujący strukturę pojedynczego elementu menu.
 */
interface NavItem {
  id: SettingsTab;
  label: string;
  icon: string;
  description: string;
}

/**
 * Komponent SettingsSidebar.
 *
 * Renderuje pionowe menu nawigacyjne. Wykorzystuje tablicę konfiguracyjną `navItems`
 * do generowania przycisków, co ułatwia skalowanie i utrzymanie kodu.
 *
 * @param {SettingsSidebarProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Panel boczny z nawigacją.
 */
export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  
  /**
   * Konfiguracja elementów menu.
   * Dodanie nowej sekcji wymaga jedynie dopisania obiektu do tej tablicy
   * oraz rozszerzenia typu `SettingsTab`.
   */
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
      {/* Nagłówek sekcji nawigacji */}
      <div className={styles.header}>
        <h3 className={styles.title}>Ustawienia</h3>
        <p className={styles.subtitle}>
          Zarządzaj swoim kontem
        </p>
      </div>

      {/* Lista nawigacyjna */}
      <nav className={styles.navigation}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            // Warunkowe nadawanie klasy .active dla wybranego elementu
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            title={item.description}
            type="button"
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