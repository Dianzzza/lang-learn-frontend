/**
 * @file UserCourses.tsx
 * @brief Komponent wyświetlający listę kursów użytkownika (Widget Dashboardu).
 *
 * Komponent ten pełni dwie funkcje w zależności od propsa `showAll`:
 * 1. Widget na Dashboardzie: Pokazuje maksymalnie 4 aktywne kursy.
 * 2. Pełna lista: Wyświetla wszystkie dostępne kursy.
 *
 * Zawiera wbudowane dane przykładowe (mock data), co zapobiega błędom renderowania
 * w przypadku braku połączenia z API lub pustych propsów.
 */

'use client';

import styles from '../styles/UserCourses.module.css';

/**
 * Interfejs reprezentujący pojedynczy kurs.
 * Zawiera dane postępu, metadane wizualne (emoji, kolor) oraz poziom trudności.
 */
interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  /** Postęp w procentach (0-100) */
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  category: string;
  /** Ikona kursu (zazwyczaj emoji) */
  emoji: string;
  /** Nazwa klasy koloru dla tła ikony */
  color: string;
  /** Flaga określająca, czy kurs jest aktualnie realizowany */
  isActive: boolean;
}

/**
 * Właściwości (Props) komponentu UserCourses.
 */
interface UserCoursesProps {
  /** Lista kursów (opcjonalna - w przypadku braku użyte zostaną dane domyślne) */
  courses?: Course[];
  /** * Flaga sterująca widokiem.
   * - `false` (domyślnie): Pokazuje max 4 kursy (widok Dashboard).
   * - `true`: Pokazuje wszystkie aktywne kursy.
   */
  showAll?: boolean;
}

/**
 * Komponent UserCourses.
 *
 * @param {UserCoursesProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Grid z kartami kursów lub stan pusty.
 */
export default function UserCourses({ courses: coursesInput, showAll = false }: UserCoursesProps) {
  
  // 🔒 BEZPIECZNE DANE (Safe Defaults)
  // Zapobiega błędom "undefined" i pozwala na podgląd komponentu bez backendu.
  const defaultCourses: Course[] = [
    {
      id: 1,
      title: 'Podstawy - Powitania',
      description: 'Naucz się podstawowych powitań',
      level: 'A1',
      progress: 83,
      totalLessons: 12,
      completedLessons: 10,
      estimatedTime: '5-15 min',
      difficulty: 'Łatwe',
      category: 'Dialogi',
      emoji: '👋',
      color: 'blue',
      isActive: true
    },
    {
      id: 2,
      title: 'Present Simple',
      description: 'Czas teraźniejszy prosty',
      level: 'A2',
      progress: 47,
      totalLessons: 15,
      completedLessons: 7,
      estimatedTime: '10-20 min',
      difficulty: 'Średnie',
      category: 'Gramatyka',
      emoji: '📝',
      color: 'green',
      isActive: true
    }
  ];

  // ✅ Logika wyboru danych: Props > Default
  const courses: Course[] = Array.isArray(coursesInput) && coursesInput.length > 0
    ? coursesInput
    : defaultCourses;

  // 🎯 FILTROWANIE I LIMITOWANIE
  // 1. Wybierz tylko aktywne kursy.
  // 2. Jeśli nie showAll, przytnij listę do 4 elementów.
  const activeCourses = courses.filter(course => course.isActive);
  const displayCourses = showAll ? activeCourses : activeCourses.slice(0, 4);

  // --- HELPERY UI ---

  const getCourseIcon = (course: Course): string => {
    return course.emoji || '📚';
  };

  const getCourseColorClass = (course: Course): string => {
    return course.color || 'blue';
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress || 0)}%`;
  };

  /**
   * Mapuje poziom trudności na zmienne CSS (Design Tokens).
   */
  const getDifficultyColor = (difficulty: Course['difficulty']): string => {
    switch (difficulty) {
      case 'Łatwe': return 'var(--secondary-green)';
      case 'Średnie': return 'var(--secondary-amber)';
      case 'Trudne': return 'var(--secondary-red)';
      default: return 'var(--neutral-500)';
    }
  };

  // --- STAN PUSTY (EMPTY STATE) ---
  // Wyświetlany, gdy użytkownik nie ma żadnych aktywnych kursów.
  if (!courses || courses.length === 0 || activeCourses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              <span className={styles.titleIcon}>📚</span>
              Twoje Kursy
              <span className={styles.count}>(0)</span>
            </h3>
          </div>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <div className={styles.emptyTitle}>Brak aktywnych kursów</div>
          <div className={styles.emptyDescription}>
            Rozpocznij pierwszy kurs, aby śledzić swój postęp
          </div>
          <a href="/courses" className={styles.startBtn}>
            <span className={styles.startIcon}>🚀</span>
            Przeglądaj kursy
          </a>
        </div>
      </div>
    );
  }

  // --- GŁÓWNY WIDOK ---
  return (
    <div className={styles.container}>
      {/* Nagłówek sekcji z licznikiem */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            <span className={styles.titleIcon}>📚</span>
            Twoje Kursy
            <span className={styles.count}>({activeCourses.length})</span>
          </h3>
        </div>
        {/* Przycisk "Wszystkie kursy" widoczny tylko gdy jest ich więcej niż wyświetlamy */}
        <div className={styles.headerActions}>
          {!showAll && activeCourses.length > 4 && (
            <a href="/courses" className={styles.viewAllBtn}>
              Wszystkie kursy →
            </a>
          )}
        </div>
      </div>

      {/* Grid kart kursów */}
      <div className={styles.coursesGrid}>
        {displayCourses.map((course, index) => (
          <div 
            key={course.id}
            className={styles.courseCard}
            // Staggered animation: każda karta pojawia się z lekkim opóźnieniem
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            
            {/* Header karty: Ikona i Poziom */}
            <div className={styles.courseHeader}>
              <div className={`${styles.courseIcon} ${styles[getCourseColorClass(course)]}`}>
                {getCourseIcon(course)}
              </div>
              <div className={styles.courseLevel}>
                {course.level}
              </div>
            </div>

            {/* Treść karty: Tytuł i Opis */}
            <div className={styles.courseContent}>
              <h4 className={styles.courseTitle}>
                {course.title}
              </h4>
              <p className={styles.courseDescription}>
                {course.description}
              </p>
              
              {/* Pasek Postępu */}
              <div className={styles.courseProgress}>
                <div className={styles.progressInfo}>
                  <span className={styles.progressText}>
                    {course.completedLessons}/{course.totalLessons} lekcji
                  </span>
                  <span className={styles.progressPercent}>
                    {formatProgress(course.progress)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Stopka karty: Czas i Trudność */}
            <div className={styles.courseFooter}>
              <div className={styles.courseMeta}>
                <div className={styles.courseTime}>
                  <span className={styles.timeIcon}>⏱️</span>
                  {course.estimatedTime}
                </div>
                <div className={styles.courseDifficulty}>
                  <span 
                    className={styles.difficultyBadge}
                    style={{ color: getDifficultyColor(course.difficulty) }}
                  >
                    {course.difficulty}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Footer sekcji (alternatywny link do wszystkich kursów na mobile) */}
      {!showAll && activeCourses.length > displayCourses.length && (
        <div className={styles.footer}>
          <a href="/courses" className={styles.viewMoreBtn}>
            <span className={styles.viewMoreIcon}>👀</span>
            Zobacz więcej ({activeCourses.length - displayCourses.length})
          </a>
        </div>
      )}
    </div>
  );
}