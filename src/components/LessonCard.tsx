
import Link from 'next/link';
import styles from '../styles/LessonCard.module.css';

type LessonStatus = 'completed' | 'inprogress' | 'locked';

interface Lesson {
  id: number;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progress: number;
  status: LessonStatus;
  description?: string;
  duration?: number;
  difficulty?: string;
  thumbnail?: string;
}

interface LessonCardProps {
  lesson: Lesson;
  viewMode?: 'grid' | 'list';
}

export default function LessonCard({ lesson, viewMode = 'grid' }: LessonCardProps) {
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
      href={lesson.status === 'locked' ? '#' : `/lesson/${lesson.id}`}
      className={`${styles.card} ${styles[viewMode]} ${styles[lesson.status]}`}
    >
      {/* Card Before (progress indicator top) */}
      <div 
        className={styles.cardBefore}
        style={{ width: `${lesson.progress}%` }}
      ></div>

      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{lesson.title}</h3>
        <span className={`${styles.levelBadge} ${styles[lesson.level.toLowerCase()]}`}>
          {lesson.level}
        </span>
      </div>

      {/* Progress Section */}
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

      {/* Status Icon */}
      <div className={styles.statusIcon}>
        {getStatusIcon(lesson.status)}
      </div>

      {/* Hover Actions */}
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
