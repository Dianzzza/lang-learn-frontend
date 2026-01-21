/**
 * @file LessonsList.tsx
 * @brief Komponent wyświetlający listę lekcji w formie statycznej (Dashboard).
 *
 * Komponent ten służy do szybkiego podglądu dostępnych lekcji i postępów.
 * W przeciwieństwie do komponentu `LessonCard`, elementy tej listy nie są interaktywne
 * (nie prowadzą do strony lekcji), co czyni go odpowiednim np. do widgetów podsumowujących.
 */

import styles from '../styles/LessonsList.module.css';

/**
 * Interfejs definiujący strukturę pojedynczej lekcji w liście.
 */
interface Lesson {
  /** Unikalny identyfikator lekcji */
  id: number;
  /** Tytuł lekcji */
  title: string;
  /** Poziom zaawansowania (np. 'A1', 'B2'), używany do stylowania odznaki */
  level: string;
  /** Wartość postępu w procentach (0-100) */
  progress: number;
  /** Status lekcji (używany do warunkowego renderowania ikon/stylów) */
  status: 'locked' | 'inprogress' | 'completed';
}

/**
 * Właściwości (Props) przyjmowane przez komponent LessonsList.
 */
interface LessonsListProps {
  /** Tablica obiektów lekcji do wyświetlenia */
  lessons: Lesson[];
}

/**
 * Komponent LessonsList.
 *
 * Renderuje kontener z nagłówkiem oraz iteruje po przekazanej liście lekcji.
 * Obsługuje stan pusty (gdy tablica `lessons` jest pusta).
 *
 * @param {LessonsListProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowana lista lekcji.
 */
export default function LessonsList({ lessons }: LessonsListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>📚</div>
        <h2 className={styles.title}>Dostępne Lekcje</h2>
      </div>

      <div className={styles.list}>
        {lessons.map((lesson) => (
          // Używamy zwykłego div zamiast Link lub button, żeby wyłączyć klikanie (widok Read-Only)
          <div key={lesson.id} className={styles.lessonCard}>
            
            {/* Nagłówek elementu listy: Tytuł + Poziom */}
            <div className={styles.cardHeader}>
              <span className={styles.lessonTitle}>{lesson.title}</span>
              {/* Dynamiczna klasa stylu na podstawie poziomu (np. styles.a1) */}
              <span className={`${styles.levelBadge} ${styles[lesson.level.toLowerCase()]}`}>
                {lesson.level}
              </span>
            </div>

            {/* Wizualizacja postępu: Pasek + Tekst */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${lesson.progress}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{lesson.progress}%</span>
            </div>
            
          </div>
        ))}

        {/* Obsługa stanu pustego */}
        {lessons.length === 0 && (
          <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Brak dostępnych lekcji.
          </div>
        )}
      </div>
    </div>
  );
}