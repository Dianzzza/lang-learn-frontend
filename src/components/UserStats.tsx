/**
 * @file UserStats.tsx
 * @brief Komponent prezentacyjny wyświetlający siatkę statystyk (KPI) użytkownika.
 *
 * Komponent ten jest generycznym kontenerem na karty statystyk.
 * Nie zawiera logiki biznesowej ani pobierania danych – jedynie renderuje
 * przekazaną listę obiektów w ustandaryzowanym układzie graficznym.
 */

import styles from '../styles/UserStats.module.css';

/**
 * Interfejs pojedynczego punktu statystycznego.
 */
interface Stat {
  /** Etykieta statystyki (np. "Punkty", "Dni z rzędu") */
  title: string;
  /** Główna wartość wyświetlana (np. "1,250", "7") */
  value: string;
  /**
   * Opcjonalny wskaźnik zmiany lub trendu.
   * Np. "+12%", "↑", "Nowy rekord".
   */
  change?: string;
  /** Opcjonalny opis pomocniczy pod etykietą */
  subtitle?: string;
  /** Ikona lub emoji reprezentująca daną statystykę */
  icon: string;
}

/**
 * Właściwości (Props) komponentu UserStats.
 */
interface UserStatsProps {
  /** Tablica statystyk do wyrenderowania */
  stats: Stat[];
}

/**
 * Komponent UserStats.
 *
 * Renderuje sekcję z nagłówkiem oraz gridem kart (Stat Cards).
 * Obsługuje warunkowe renderowanie pól opcjonalnych (`change`, `subtitle`).
 *
 * @param {UserStatsProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Sekcja statystyk.
 */
export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className={styles.container}>
      {/* Nagłówek sekcji */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          Twoje Statystyki
        </h2>
      </div>
      
      {/* Siatka kart (Grid Layout) */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            
            {/* Ikona statystyki (np. w kółku lub jako tło) */}
            <div className={styles.statIcon}>{stat.icon}</div>
            
            <div className={styles.statContent}>
              {/* Główna wartość + opcjonalna zmiana (np. na zielono/czerwono w CSS) */}
              <div className={styles.statValue}>
                {stat.value}
                {stat.change && (
                  <span className={styles.statChange}>
                    {stat.change}
                  </span>
                )}
              </div>
              
              {/* Opis statystyki */}
              <div className={styles.statLabel}>{stat.title}</div>
              
              {/* Dodatkowy opis (np. "Top 5% użytkowników") */}
              {stat.subtitle && (
                <div className={styles.statSubtitle}>{stat.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}