// components/LessonsList.jsx
import Link from 'next/link';
import styles from '../styles/LessonsList.module.css';

export default function LessonsList({ lessons }) {
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
              <span className={styles.progressText}>{lesson.progress}%</span>
            </div>

            <div className={styles.statusIcon}>
              {lesson.status === 'completed' && '✅'}
              {lesson.status === 'in_progress' && '📖'}
              {lesson.status === 'locked' && '🔒'}
            </div>
          </Link>
        ))}
      </div>

      <button className={styles.addFlashcardBtn}>
        <span className={styles.addIcon}>➕</span>
        Dodaj własną fiszkę
      </button>
    </div>
  );
}
