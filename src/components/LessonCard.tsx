/**
 * @file LessonCard.tsx
 * @brief Komponent prezentacyjny pojedynczej lekcji.
 *
 * Wyświetla podstawowe informacje o lekcji (tytuł, poziom, postęp) w formie klikalnej karty.
 * Obsługuje dwa tryby wyświetlania: siatkę (grid) i listę.
 * Blokuje nawigację, jeśli lekcja ma status "locked".
 */

import Link from 'next/link';
import styles from '../styles/LessonCard.module.css';

/**
 * Typ wyliczeniowy określający stan dostępu/ukończenia lekcji.
 * - `completed`: Lekcja ukończona (100% lub zaliczona).
 * - `inprogress`: Lekcja rozpoczęta, ale nieukończona.
 * - `locked`: Lekcja zablokowana (np. wymagane ukończenie poprzedniej).
 */
type LessonStatus = 'completed' | 'inprogress' | 'locked';

/**
 * Interfejs danych lekcji.
 */
interface Lesson {
  /** Unikalny identyfikator lekcji w bazie danych */
  id: number;
  /** Tytuł lekcji */
  title: string;
  /** Poziom zaawansowania (CEFR) */
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** Postęp użytkownika w procentach (0-100) */
  progress: number;
  /** Aktualny status lekcji */
  status: LessonStatus;
  /** Opcjonalny opis tekstowy */
  description?: string;
  /** Szacowany czas trwania w minutach */
  duration?: number;
  /** Słowny opis trudności (np. "Łatwy") */
  difficulty?: string;
  /** URL do obrazka wyróżniającego */
  thumbnail?: string;
}

/**
 * Właściwości (Props) komponentu LessonCard.
 */
interface LessonCardProps {
  /** Obiekt zawierający dane lekcji */
  lesson: Lesson;
  /**
   * Tryb wyświetlania karty.
   * - `grid`: Widok kafelkowy (domyślny).
   * - `list`: Widok poziomy (wiersz).
   * @default 'grid'
   */
  viewMode?: 'grid' | 'list';
}

/**
 * Komponent LessonCard.
 *
 * @param {LessonCardProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Klikalny element `Link` stylizowany jako karta.
 */
export default function LessonCard({ lesson, viewMode = 'grid' }: LessonCardProps) {
  
  /**
   * Pomocnicza funkcja mapująca status na ikonę (emoji).
   */
  const getStatusIcon = (status: LessonStatus): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'inprogress':
        return '📚';
      case 'locked':
        return '🔒';
      default:
        return '📖';
    }
  };

  /**
   * Pomocnicza funkcja mapująca status na tekst (np. do tooltipów lub aria-label).
   */
  const getStatusText = (status: LessonStatus): string => {
    switch (status) {
      case 'completed':
        return 'Ukończona';
      case 'inprogress':
        return 'W trakcie';
      case 'locked':
        return 'Zablokowana';
      default:
        return 'Dostępna';
    }
  };

  return (
    <Link
      // Jeśli lekcja jest zablokowana, link prowadzi do kotwicy '#' (nieaktywny)
      href={lesson.status === 'locked' ? '#' : `/lesson/${lesson.id}`}
      className={`${styles.card} ${styles[viewMode]} ${styles[lesson.status]}`}
    >
      {/* Pasek postępu na górze karty (stylizowany przez ::before/div) */}
      <div 
        className={styles.cardBefore}
        style={{ width: `${lesson.progress}%` }}
      ></div>

      {/* Nagłówek karty z tytułem i odznaką poziomu */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{lesson.title}</h3>
        {/* Klasa poziomu (np. styles.a1) odpowiada za kolor badge'a */}
        <span className={`${styles.levelBadge} ${styles[lesson.level.toLowerCase()]}`}>
          {lesson.level}
        </span>
      </div>

      {/* Sekcja wizualizacji postępu */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${lesson.progress}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>
          {lesson.progress}%
        </span>
      </div>

      {/* Ikona statusu w rogu */}
      <div className={styles.statusIcon}>
        {getStatusIcon(lesson.status)}
      </div>

      {/* Przyciski akcji pojawiające się po najechaniu (Hover) */}
      <div className={styles.hoverActions}>
        <button className={styles.actionBtn} title="Dodaj do ulubionych">
          🤍
        </button>
        <button className={styles.actionBtn} title="Więcej informacji">
          ℹ️
        </button>
      </div>
    </Link>
  );
}