/**
 * @file ActivityFeed.tsx
 * @brief Komponent wyświetlający strumień aktywności użytkownika.
 *
 * Prezentuje historię działań (lekcje, quizy, osiągnięcia) w formie listy.
 * Obsługuje stan pusty, wyświetlanie danych domyślnych (mock) oraz limitowanie
 * widocznych elementów (np. do paska bocznego).
 */

'use client';

import styles from '../styles/ActivityFeed.module.css';

/**
 * Interfejs reprezentujący pojedynczą aktywność w historii użytkownika.
 */
interface Activity {
  /** Unikalny identyfikator aktywności. */
  id: number;
  /**
   * Typ zdarzenia determinujący ikonę i styl kolorystyczny.
   * Dostępne wartości: 'lesson', 'quiz', 'achievement', 'streak'.
   */
  type: 'lesson' | 'quiz' | 'achievement' | 'streak';
  /** Tytuł aktywności (np. nazwa lekcji). */
  title: string;
  /** Nazwa kursu lub kategorii powiązanej z aktywnością. */
  courseName: string;
  /** Liczba zdobytych punktów. */
  points: number;
  /** Czas trwania aktywności w minutach (opcjonalne). */
  duration?: number;
  /** Dokładność/wynik w procentach (opcjonalne). */
  accuracy?: number;
  /** Sformatowana data lub czas relatywny (np. "9h temu"). */
  date: string;
  /** Opcjonalny nadpisany symbol ikony (emoji lub URL). */
  icon?: string;
}

/**
 * Właściwości (Props) przyjmowane przez komponent ActivityFeed.
 */
interface ActivityFeedProps {
  /**
   * Opcjonalna lista aktywności do wyświetlenia.
   * Jeśli tablica jest pusta lub niezdefiniowana, komponent użyje danych domyślnych.
   */
  activities?: Activity[];
  /**
   * Flaga sterująca ilością wyświetlanych elementów.
   * - `true`: Wyświetla całą listę.
   * - `false`: Wyświetla tylko 3 najnowsze elementy (tryb kompaktowy/widget).
   * @default false
   */
  showAll?: boolean;
}

/**
 * Komponent ActivityFeed.
 *
 * Odpowiada za renderowanie sekcji "Ostatnia Aktywność". Zawiera wewnętrzną logikę
 * formatowania danych (punkty, czas) oraz mapowania typów aktywności na style CSS.
 *
 * @param {ActivityFeedProps} props - Parametry wejściowe komponentu.
 * @returns {JSX.Element} Wyrenderowany komponent listy lub stan pusty ("Empty State").
 */
export default function ActivityFeed({ activities: activitiesInput, showAll = false }: ActivityFeedProps) {
  
  // 🔒 BEZPIECZNE dane - krótkie, mierzące się w oknie
  /**
   * Domyślny zestaw danych (mock), używany gdy nie przekazano żadnych aktywności.
   * Służy do celów demonstracyjnych lub jako placeholder.
   */
  const defaultActivities: Activity[] = [
    {
      id: 1,
      type: 'lesson',
      title: 'Lesson 10: Greetings Practice',
      courseName: 'Podstawy - Powitania',
      points: 45,
      duration: 12,
      accuracy: 92,
      date: '9h temu',
      icon: '📖'
    },
    {
      id: 2,
      type: 'quiz',
      title: 'Quiz: Present Simple',
      courseName: 'Present Simple',
      points: 78,
      duration: 8,
      accuracy: 85,
      date: '16h temu',
      icon: '❓'
    }
  ];

  // ✅ ZAWSZE mamy poprawne dane
  /**
   * Ostateczna lista aktywności do przetworzenia.
   * Wybiera pomiędzy danymi wejściowymi a domyślnymi.
   */
  const activities: Activity[] = Array.isArray(activitiesInput) && activitiesInput.length > 0
    ? activitiesInput
    : defaultActivities;

  // 🎯 Tylko 3 najnowsze dla sidebar
  /**
   * Lista przefiltrowana do widoku.
   * Jeśli `showAll` jest false, przycina listę do 3 elementów.
   */
  const displayActivities = showAll ? activities : activities.slice(0, 3);

  /**
   * Zwraca ikonę (emoji) na podstawie typu aktywności.
   * @param {Activity} activity - Obiekt aktywności.
   * @returns {string} Emoji reprezentujące aktywność.
   */
  const getActivityIcon = (activity: Activity): string => {
    if (activity.icon) return activity.icon;
    switch (activity.type) {
      case 'lesson': return '📖';
      case 'quiz': return '❓';
      case 'achievement': return '🏆';
      case 'streak': return '🔥';
      default: return '📚';
    }
  };

  /**
   * Mapuje typ aktywności na nazwę klasy CSS koloru.
   * @param {Activity} activity - Obiekt aktywności.
   * @returns {string} Nazwa klasy (np. 'blue', 'green').
   */
  const getActivityIconClass = (activity: Activity): string => {
    switch (activity.type) {
      case 'lesson': return 'blue';
      case 'quiz': return 'green';
      case 'achievement': return 'orange';
      case 'streak': return 'purple';
      default: return 'blue';
    }
  };

  /**
   * Formatuje liczbę punktów, dodając znak plusa dla wartości dodatnich.
   * @param {number | undefined} points - Liczba punktów.
   */
  const formatPoints = (points: number | undefined): string => {
    if (!points || points === 0) return '+0';
    return points > 0 ? `+${points}` : `${points}`;
  };

  /** Formatuje czas trwania (dodaje sufiks 'min'). */
  const formatDuration = (duration: number | undefined): string => {
    if (!duration) return '';
    return `${duration} min`;
  };

  /** Formatuje dokładność (dodaje znak %). */
  const formatAccuracy = (accuracy: number | undefined): string => {
    if (!accuracy) return '';
    return `${accuracy}%`;
  };

  // --- RENDEROWANIE STANU PUSTEGO ---
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.titleIcon}>⚡</span>
            Ostatnia Aktywność
          </h3>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyTitle}>Brak aktywności</div>
          <div className={styles.emptyDescription}>
            Rozpocznij naukę, aby zobaczyć swój postęp
          </div>
          <a href="/study" className={styles.startBtn}>
            <span className={styles.startIcon}>🚀</span>
            Zacznij naukę
          </a>
        </div>
      </div>
    );
  }

  // --- RENDEROWANIE LISTY ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>⚡</span>
          Ostatnia Aktywność
        </h3>
        {/* Link "Zobacz wszystko" pojawia się tylko, gdy ukrywamy część elementów */}
        {activities.length > 3 && !showAll && (
          <a href="/profile/activity" className={styles.viewAllBtn}>
            Zobacz wszystko →
          </a>
        )}
      </div>

      <div className={styles.activityList}>
        {displayActivities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={styles.activityItem}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.activityContent}>
              
              {/* 🎨 IKONA - compact */}
              <div className={`${styles.activityIcon} ${styles[getActivityIconClass(activity)]}`}>
                {getActivityIcon(activity)}
              </div>

              {/* 📝 GŁÓWNE INFO - compact */}
              <div className={styles.activityDetails}>
                <div className={styles.activityTitle}>
                  {activity.title}
                </div>
                <div className={styles.activityMeta}>
                  <span className={styles.courseName}>
                    {activity.courseName}
                  </span>
                  <span className={styles.activityDate}>
                    {activity.date}
                  </span>
                </div>
              </div>

              {/* 📊 STATYSTYKI - compact, vertical */}
              <div className={styles.activityStats}>
                <div className={styles.points}>
                  {formatPoints(activity.points)}
                  <span className={styles.pointsLabel}>pkt</span>
                </div>
                {activity.duration && (
                  <div className={styles.duration}>
                    {formatDuration(activity.duration)}
                  </div>
                )}
                {activity.accuracy && (
                  <div className={styles.accuracy}>
                    {formatAccuracy(activity.accuracy)} ✓
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* 👀 FOOTER - compact */}
      {activities.length > displayActivities.length && (
        <div className={styles.footer}>
          <a href="/profile/activity" className={styles.viewMoreBtn}>
            <span className={styles.viewMoreIcon}>👀</span>
            Zobacz więcej ({activities.length - displayActivities.length})
          </a>
        </div>
      )}
    </div>
  );
}