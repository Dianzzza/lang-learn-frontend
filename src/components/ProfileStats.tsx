
'use client';

import styles from '../styles/ProfileStats.module.css';

interface WeeklyData {
  day: string;
  lessons: number;
  minutes: number;
}

interface ProfileStatsProps {
  totalPoints?: number;
  currentStreak?: number;
  longestStreak?: number;
  dailyGoal?: number;
  todayLessons?: number;
  totalHours?: number;
  activeCourses?: number;
  weeklyData?: WeeklyData[];
  level?: number;
  rank?: string;
}

export default function ProfileStats(props: ProfileStatsProps) {
  // 🔒 BEZPIECZNE wartości domyślne - zapobiega undefined errors
  const {
    totalPoints = 2847,
    currentStreak = 7,
    longestStreak = 23,
    dailyGoal = 5,
    todayLessons = 2,
    totalHours = 4.5,
    activeCourses = 4,
    weeklyData: weeklyDataInput,
    level = 156,
    rank = '#156',
  } = props;

  // 📊 DOMYŚLNE dane tygodniowe - jeśli brak danych
  const defaultWeeklyData: WeeklyData[] = [
    { day: 'Pon', lessons: 3, minutes: 45 },
    { day: 'Wt', lessons: 5, minutes: 62 },
    { day: 'Śr', lessons: 7, minutes: 89 },
    { day: 'Czw', lessons: 2, minutes: 28 },
    { day: 'Pt', lessons: 4, minutes: 51 },
    { day: 'Sob', lessons: 1, minutes: 15 },
    { day: 'Nie', lessons: 0, minutes: 0 },
  ];

  // ✅ ZAWSZE mamy poprawne dane - albo przekazane, albo domyślne
  const weeklyData: WeeklyData[] = Array.isArray(weeklyDataInput) && weeklyDataInput.length > 0
    ? weeklyDataInput
    : defaultWeeklyData;

  const safeDailyGoal = Math.max(dailyGoal || 1, 1);
  const goalProgress = Math.min((todayLessons / safeDailyGoal) * 100, 100);

  // 🔒 BEZPIECZNE obliczenia - nie może być undefined
  const lessonsArray = weeklyData.map(d => Number(d?.lessons || 0));
  const maxLessons = Math.max(...lessonsArray, 1);

  const getBarHeight = (lessons: number): number => {
    return Math.max((Number(lessons || 0) / maxLessons) * 100, 4);
  };

  const getBarColor = (lessons: number): string => {
    const l = Number(lessons || 0);
    if (l === 0) return 'low';
    if (l < safeDailyGoal * 0.5) return 'low';
    if (l < safeDailyGoal) return 'medium';
    if (l >= safeDailyGoal) return 'high';
    return 'medium';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          Twoje Statystyki
        </h3>
      </div>

      <div className={styles.statsGrid}>
        
        {/* 💎 Points */}
        <div className={`${styles.statCard} ${styles.points}`}>
          <div className={styles.statIcon}>💎</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {totalPoints.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Punkty</div>
            <div className={styles.statExtra}>
              {rank} • Top 99%
            </div>
          </div>
        </div>

        {/* 🔥 Streak */}
        <div className={`${styles.statCard} ${styles.streak}`}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{currentStreak}</div>
            <div className={styles.statLabel}>Dni z rzędu</div>
            <div className={styles.statExtra}>
              Rekord: {longestStreak} dni
            </div>
          </div>
        </div>

        {/* 🎯 Daily Goal */}
        <div className={`${styles.statCard} ${styles.dailyGoal}`}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {todayLessons}/{safeDailyGoal}
            </div>
            <div className={styles.statLabel}>Dzisiejszy cel</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* ⏱️ Total Hours */}
        <div className={`${styles.statCard} ${styles.hours}`}>
          <div className={styles.statIcon}>⏱️</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{totalHours}h</div>
            <div className={styles.statLabel}>Ten tydzień</div>
            <div className={styles.statExtra}>
              Łącznie: {Math.round(totalHours * 4.3)}h
            </div>
          </div>
        </div>

        {/* 📈 NAPRAWIONY Tygodniowy postęp - lepszy layout */}
        <div className={`${styles.statCard} ${styles.overallProgress}`}>
          <div className={styles.statContent}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div className={styles.statIcon} style={{ fontSize: '1.5rem' }}>
                📈
              </div>
              <div>
                <div className={styles.statLabel} style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  Tygodniowy postęp
                </div>
                <div className={styles.statExtra}>
                  Łącznie: {weeklyData.reduce((sum, day) => sum + (day.lessons || 0), 0)} lekcji
                </div>
              </div>
            </div>
            
            <div className={styles.weeklyChart}>
              {weeklyData.map((day, index) => (
                <div key={index} className={styles.dayColumn}>
                  <div className={styles.dayLabel}>
                    {day.day}
                  </div>
                  <div className={styles.dayBar}>
                    <div 
                      className={`${styles.dayBarFill} ${styles[getBarColor(day.lessons)]}`}
                      style={{ 
                        height: `${getBarHeight(day.lessons)}%`
                      }}
                    ></div>
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--neutral-500)',
                    fontWeight: '500',
                    marginTop: '0.25rem'
                  }}>
                    {day.lessons > 0 ? `${day.lessons}` : '0'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}