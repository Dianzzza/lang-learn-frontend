
'use client';

import styles from '../styles/UserCourses.module.css';

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  category: string;
  emoji: string;
  color: string;
  isActive: boolean;
}

interface UserCoursesProps {
  courses?: Course[];
  showAll?: boolean;
}

export default function UserCourses({ courses: coursesInput, showAll = false }: UserCoursesProps) {
  
  // 🔒 BEZPIECZNE dane - jeśli brak, użyj przykładowych
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

  // ✅ ZAWSZE mamy poprawne dane
  const courses: Course[] = Array.isArray(coursesInput) && coursesInput.length > 0
    ? coursesInput
    : defaultCourses;

  // 🎯 Filtruj aktywne kursy i ograniczenia wyświetlania
  const activeCourses = courses.filter(course => course.isActive);
  const displayCourses = showAll ? activeCourses : activeCourses.slice(0, 4);

  const getCourseIcon = (course: Course): string => {
    return course.emoji || '📚';
  };

  const getCourseColorClass = (course: Course): string => {
    return course.color || 'blue';
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress || 0)}%`;
  };

  const getDifficultyColor = (difficulty: Course['difficulty']): string => {
    switch (difficulty) {
      case 'Łatwe': return 'var(--secondary-green)';
      case 'Średnie': return 'var(--secondary-amber)';
      case 'Trudne': return 'var(--secondary-red)';
      default: return 'var(--neutral-500)';
    }
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            <span className={styles.titleIcon}>📚</span>
            Twoje Kursy
            <span className={styles.count}>({activeCourses.length})</span>
          </h3>
        </div>
        <div className={styles.headerActions}>
          {!showAll && activeCourses.length > 4 && (
            <a href="/courses" className={styles.viewAllBtn}>
              Wszystkie kursy →
            </a>
          )}
        </div>
      </div>

      <div className={styles.coursesGrid}>
        {displayCourses.map((course, index) => (
          <div 
            key={course.id}
            className={styles.courseCard}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            
            {/* 🎨 HEADER kursu */}
            <div className={styles.courseHeader}>
              <div className={`${styles.courseIcon} ${styles[getCourseColorClass(course)]}`}>
                {getCourseIcon(course)}
              </div>
              <div className={styles.courseLevel}>
                {course.level}
              </div>
            </div>

            {/* 📝 CONTENT kursu */}
            <div className={styles.courseContent}>
              <h4 className={styles.courseTitle}>
                {course.title}
              </h4>
              <p className={styles.courseDescription}>
                {course.description}
              </p>
              
              {/* 📊 PROGRESS */}
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

            {/* 🏷️ FOOTER kursu */}
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

      {/* 👀 FOOTER - jeśli więcej kursów */}
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