/**
 * @file ProfileStats.tsx
 * @brief Komponent panelu statystyk użytkownika (Dashboard).
 *
 * Wyświetla kluczowe metryki: punkty, dni z rzędu (streak), postęp dzienny oraz
 * interaktywny wykres słupkowy aktywności z ostatniego tygodnia.
 * Komponent jest odporny na brak danych (posiada wbudowane wartości domyślne/mock).
 */

'use client';

import styles from '../styles/ProfileStats.module.css';

/**
 * Struktura danych dla pojedynczego dnia w wykresie tygodniowym.
 */
interface WeeklyData {
  /** Skrócona nazwa dnia (np. 'Pon', 'Wt') */
  day: string;
  /** Liczba ukończonych lekcji */
  lessons: number;
  /** Czas nauki w minutach */
  minutes: number;
}

/**
 * Właściwości (Props) komponentu ProfileStats.
 * Wszystkie pola są opcjonalne, ponieważ komponent posiada "sztywne" wartości domyślne
 * (fallback), co zapobiega błędom renderowania przy braku danych z API.
 */
interface ProfileStatsProps {
  /** Całkowita liczba punktów */
  totalPoints?: number;
  /** Aktualna seria dni nauki */
  currentStreak?: number;
  /** Rekord serii dni nauki */
  longestStreak?: number;
  /** Dzienny cel (liczba lekcji) */
  dailyGoal?: number;
  /** Liczba lekcji wykonanych dzisiaj */
  todayLessons?: number;
  /** Łączny czas nauki w godzinach */
  totalHours?: number;
  /** Liczba aktywnych kursów */
  activeCourses?: number;
  /** Dane do wykresu tygodniowego */
  weeklyData?: WeeklyData[];
  /** Poziom użytkownika */
  level?: number;
  /** Pozycja w rankingu (np. "#156") */
  rank?: string;
}

/**
 * Komponent ProfileStats.
 *
 * @param {ProfileStatsProps} props - Dane statystyczne.
 * @returns {JSX.Element} Grid z kartami statystyk i wykresem.
 */
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

  // 📊 DOMYŚLNE dane tygodniowe - używane jako placeholder (mock), jeśli API nie zwróci danych
  const defaultWeeklyData: WeeklyData[] = [
    { day: 'Pon', lessons: 3, minutes: 45 },
    { day: 'Wt', lessons: 5, minutes: 62 },
    { day: 'Śr', lessons: 7, minutes: 89 },
    { day: 'Czw', lessons: 2, minutes: 28 },
    { day: 'Pt', lessons: 4, minutes: 51 },
    { day: 'Sob', lessons: 1, minutes: 15 },
    { day: 'Nie', lessons: 0, minutes: 0 },
  ];

  // ✅ ZAWSZE mamy poprawne dane - wybieramy przekazane lub domyślne
  const weeklyData: WeeklyData[] = Array.isArray(weeklyDataInput) && weeklyDataInput.length > 0
    ? weeklyDataInput
    : defaultWeeklyData;

  // Zabezpieczenie przed dzieleniem przez zero
  const safeDailyGoal = Math.max(dailyGoal || 1, 1);
  // Obliczenie procentu realizacji celu (max 100%)
  const goalProgress = Math.min((todayLessons / safeDailyGoal) * 100, 100);

  // 🔒 LOGIKA WYKRESU
  
  // Znalezienie maksymalnej wartości w tygodniu do normalizacji wysokości słupków
  const lessonsArray = weeklyData.map(d => Number(d?.lessons || 0));
  const maxLessons = Math.max(...lessonsArray, 1);

  /**
   * Oblicza relatywną wysokość słupka w procentach.
   * Minimalna wysokość to 4%, aby słupek był zawsze widoczny (nawet przy małych wartościach).
   */
  const getBarHeight = (lessons: number): number => {
    return Math.max((Number(lessons || 0) / maxLessons) * 100, 4);
  };

  /**
   * Określa klasę koloru słupka na podstawie realizacji celu dziennego.
   * - `low`: Poniżej 50% celu.
   * - `medium`: Pomiędzy 50% a 100% celu.
   * - `high`: Cel osiągnięty (100%+).
   */
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
        
        {/* 💎 Points Card */}
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

        {/* 🔥 Streak Card */}
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

        {/* 🎯 Daily Goal Card */}
        <div className={`${styles.statCard} ${styles.dailyGoal}`}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {todayLessons}/{safeDailyGoal}
            </div>
            <div className={styles.statLabel}>Dzisiejszy cel</div>
            {/* Pasek postępu celu dziennego */}
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* ⏱️ Total Hours Card */}
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

        {/* 📈 Tygodniowy postęp - Wykres słupkowy */}
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
                  {/* Etykieta dnia */}
                  <div className={styles.dayLabel}>
                    {day.day}
                  </div>
                  
                  {/* Słupek wykresu */}
                  <div className={styles.dayBar}>
                    <div 
                      className={`${styles.dayBarFill} ${styles[getBarColor(day.lessons)]}`}
                      style={{ 
                        height: `${getBarHeight(day.lessons)}%`
                      }}
                    ></div>
                  </div>
                  
                  {/* Wartość liczbowa pod słupkiem */}
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