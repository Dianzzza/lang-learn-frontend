// frontend/src/components/LessonsList.tsx
import styles from '../styles/LessonsList.module.css';

interface Lesson {
  id: number;
  title: string;
  level: string;
  progress: number;
  status: 'locked' | 'inprogress' | 'completed';
}

interface LessonsListProps {
  lessons: Lesson[];
}

export default function LessonsList({ lessons }: LessonsListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>📚</div>
        <h2 className={styles.title}>Dostępne Lekcje</h2>
      </div>

      <div className={styles.list}>
        {lessons.map((lesson) => (
          // Używamy zwykłego div zamiast Link lub button, żeby wyłączyć klikanie
          <div key={lesson.id} className={styles.lessonCard}>
            <div className={styles.cardHeader}>
              <span className={styles.lessonTitle}>{lesson.title}</span>
              <span className={`${styles.levelBadge} ${styles[lesson.level.toLowerCase()]}`}>
                {lesson.level}
              </span>
            </div>

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

        {lessons.length === 0 && (
          <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Brak dostępnych lekcji.
          </div>
        )}
      </div>
    </div>
  );
}