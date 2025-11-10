
import Link from 'next/link';
import styles from '../styles/LessonsList.module.css';

interface Lesson {
  id: number;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progress: number;
  status: 'completed' | 'inprogress' | 'locked';
}

interface LessonsListProps {
  lessons: Lesson[];
}

export default function LessonsList({ lessons }: LessonsListProps) {
  const getStatusIcon = (status: Lesson['status']): string => {
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

  const getStatusText = (status: Lesson['status']): string => {
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📚</span>
          Dostępne Lekcje
        </h2>
      </div>
      
      <div className={styles.lessonsList}>
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            className={`${styles.lessonCard} ${styles[lesson.status]}`}
          >
            <div className={styles.lessonHeader}>
              <h3 className={styles.lessonTitle}>{lesson.title}</h3>
              <span className={`${styles.levelBadge} ${styles[lesson.level.toLowerCase()]}`}>
                {lesson.level}
              </span>
            </div>
            
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
            
            <div className={styles.statusIcon}>
              {getStatusIcon(lesson.status)}
            </div>
          </Link>
        ))}
        
        <button className={styles.addFlashcardBtn}>
          <span className={styles.addIcon}>+</span>
          Dodaj własną fiszkę
        </button>
      </div>
    </div>
  );
}