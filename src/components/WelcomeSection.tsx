/**
 * @file WelcomeSection.tsx
 * @brief Sekcja powitalna (Hero) na Dashboardzie użytkownika.
 *
 * Komponent ten jest pierwszym elementem, jaki widzi zalogowany użytkownik.
 * Jego celem jest:
 * 1. Personalizowane powitanie (budowanie relacji).
 * 2. Prezentacja kluczowych metryk grywalizacji (Streak, Dzienny cel).
 * 3. Główne wezwanie do działania (CTA) - rozpoczęcie nauki.
 */

import { useRouter } from 'next/router';
import styles from '../styles/WelcomeSection.module.css';

/**
 * Interfejs danych użytkownika wymaganych do wyświetlenia sekcji powitalnej.
 */
interface User {
  /** Nazwa wyświetlana użytkownika */
  username: string;
  /** Liczba dni nieprzerwanej nauki (Streak) */
  streak_days: number;
  /** Liczba lekcji ukończonych dzisiaj */
  today_lessons: number;
  /** Dzienny cel lekcji ustawiony przez użytkownika */
  target_lessons: number;
}

/**
 * Właściwości komponentu WelcomeSection.
 */
interface WelcomeSectionProps {
  user: User;
}

/**
 * Komponent WelcomeSection.
 *
 * @param {WelcomeSectionProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Karta powitalna z paskiem postępu i przyciskiem startu.
 */
export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const router = useRouter();

  /**
   * Obsługa przycisku "Rozpocznij naukę".
   * Przekierowuje użytkownika do głównego widoku wyboru materiałów (/study),
   * zamiast bezpośrednio do losowej lekcji, dając mu kontrolę nad ścieżką nauki.
   */
  const handleStartLearning = () => {
    router.push('/study'); 
  };

  /**
   * Oblicza procent realizacji dziennego celu.
   * Używa `Math.min(..., 100)`, aby pasek postępu wizualnie nie przekroczył 100%
   * (nawet jeśli użytkownik zrobił więcej lekcji niż zakładał cel - tzw. overachievement).
   */
  const progressPercentage = Math.min(
    Math.round((user.today_lessons / user.target_lessons) * 100),
    100
  );

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        
        {/* Sekcja Powitania */}
        <div className={styles.greeting}>
          <h1 className={styles.welcomeTitle}>
            Dzień dobry, {user.username}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Gotowy na kolejną przygodę?
          </p>
        </div>

        {/* Sekcja Streak (Dni z rzędu) */}
        <div className={styles.streak}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakText}>
            {/* Prosta logiczna odmiana słowa "dzień" */}
            {user.streak_days} {user.streak_days === 1 ? 'dzień' : 'dni'} z rzędu!
          </span>
        </div>

        {/* Sekcja Dziennego Celu */}
        <div className={styles.dailyGoal}>
          <div className={styles.goalHeader}>
            <span className={styles.goalIcon}>🎯</span>
            <span className={styles.goalText}>Dzienny cel</span>
          </div>
          
          <div className={styles.goalProgress}>
            {/* Pasek postępu */}
            <div className={styles.goalBar}>
              <div 
                className={styles.goalFill} 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {/* Liczbowe przedstawienie postępu */}
            <div className={styles.goalNumbers}>
              {user.today_lessons} / {user.target_lessons} lekcji
            </div>
          </div>
        </div>

        {/* Przycisk CTA (Call to Action) */}
        <button onClick={handleStartLearning} className={styles.startLearningBtn}>
          <span className={styles.btnIcon}>📚</span>
          Rozpocznij naukę
        </button>
      </div>
    </div>
  );
}