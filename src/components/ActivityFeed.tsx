
'use client';

import styles from '../styles/ActivityFeed.module.css';

interface Activity {
  id: number;
  type: 'lesson' | 'quiz' | 'achievement' | 'streak';
  title: string;
  courseName: string;
  points: number;
  duration?: number;
  accuracy?: number;
  date: string;
  icon?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  showAll?: boolean;
}

export default function ActivityFeed({ activities: activitiesInput, showAll = false }: ActivityFeedProps) {
  
  // 🔒 BEZPIECZNE dane - krótkie, mierzące się w oknie
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
  const activities: Activity[] = Array.isArray(activitiesInput) && activitiesInput.length > 0
    ? activitiesInput
    : defaultActivities;

  // 🎯 Tylko 3 najnowsze dla sidebar
  const displayActivities = showAll ? activities : activities.slice(0, 3);

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

  const getActivityIconClass = (activity: Activity): string => {
    switch (activity.type) {
      case 'lesson': return 'blue';
      case 'quiz': return 'green';
      case 'achievement': return 'orange';
      case 'streak': return 'purple';
      default: return 'blue';
    }
  };

  const formatPoints = (points: number | undefined): string => {
    if (!points || points === 0) return '+0';
    return points > 0 ? `+${points}` : `${points}`;
  };

  const formatDuration = (duration: number | undefined): string => {
    if (!duration) return '';
    return `${duration} min`;
  };

  const formatAccuracy = (accuracy: number | undefined): string => {
    if (!accuracy) return '';
    return `${accuracy}%`;
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>⚡</span>
          Ostatnia Aktywność
        </h3>
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