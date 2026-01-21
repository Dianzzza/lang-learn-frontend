/**
 * @file StudyProgress.tsx
 * @brief Komponent wizualizujący ogólny postęp użytkownika w nauce.
 *
 * Wyświetla panel statystyk (Dashboard), który agreguje dane z listy materiałów.
 * Oblicza wskaźniki takie jak: procent ukończenia, liczba materiałów w trakcie,
 * średni postęp oraz elementy wymagające powtórki.
 */

'use client';

import { useMemo } from 'react';
import styles from '../styles/StudyProgress.module.css';

/**
 * Interfejs pojedynczego materiału edukacyjnego.
 * Zawiera dane niezbędne do kategoryzacji postępu (status, wartość %).
 */
interface StudyMaterial {
  id: number;
  title: string;
  /** Status materiału determinujący jego kategorię w statystykach */
  status: 'Ukończone' | 'W trakcie' | 'Do powtórki' | 'Zablokowane';
  /** Postęp liczbowy (0-100) */
  progress: number;
  level?: string;
  type?: string;
}

/**
 * Interfejs obliczonych statystyk (Agregat).
 * Te dane nie pochodzą bezpośrednio z bazy, lecz są wyliczane na froncie.
 */
interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  toReview: number;
  /** Średnia arytmetyczna postępu wszystkich materiałów */
  avgProgress: number;
  /** Procent materiałów o statusie "Ukończone" względem całości */
  completionRate: number;
}

/**
 * Właściwości (Props) komponentu StudyProgress.
 */
interface StudyProgressProps {
  /** Lista materiałów do przeanalizowania */
  studyMaterials: StudyMaterial[];
}

/**
 * Komponent StudyProgress.
 *
 * @param {StudyProgressProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Panel ze statystykami i paskiem postępu.
 */
export default function StudyProgress({ studyMaterials }: StudyProgressProps) {
  
  /**
   * Oblicza statystyki na podstawie listy materiałów.
   * Używa `useMemo`, aby uniknąć kosztownych przeliczeń przy każdym renderowaniu,
   * chyba że zmieni się tablica `studyMaterials`.
   */
  const stats = useMemo((): ProgressStats => {
    const total = studyMaterials.length;
    
    // Filtrowanie według statusów
    const completed = studyMaterials.filter(m => m.status === 'Ukończone').length;
    const inProgress = studyMaterials.filter(m => m.status === 'W trakcie').length;
    const toReview = studyMaterials.filter(m => m.status === 'Do powtórki').length;
    
    // Obliczanie średniego postępu (zabezpieczenie przed dzieleniem przez 0)
    const avgProgress = total > 0 
      ? Math.round(studyMaterials.reduce((sum, m) => sum + m.progress, 0) / total)
      : 0;
    
    return {
      total,
      completed,
      inProgress,
      toReview,
      avgProgress,
      // Obliczanie wskaźnika ukończenia (Completion Rate)
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [studyMaterials]);

  return (
    <div className={styles.container}>
      {/* Nagłówek sekcji */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          Twój postęp
        </h2>
      </div>

      {/* Grid z kafelkami statystyk */}
      <div className={styles.statsGrid}>
        
        {/* Karta: Wskaźnik ukończenia */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completionRate}%</span>
            <span className={styles.statLabel}>Ukończono</span>
          </div>
        </div>

        {/* Karta: Liczba wszystkich materiałów */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Wszystkich</span>
          </div>
        </div>

        {/* Karta: Liczba ukończonych */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Ukończone</span>
          </div>
        </div>

        {/* Karta: W trakcie */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>W trakcie</span>
          </div>
        </div>

        {/* Karta: Do powtórki */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔄</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.toReview}</span>
            <span className={styles.statLabel}>Do powtórki</span>
          </div>
        </div>

        {/* Karta: Średni postęp */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.avgProgress}%</span>
            <span className={styles.statLabel}>Średni postęp</span>
          </div>
        </div>
      </div>

      {/* Sekcja wizualna: Główny pasek postępu */}
      <div className={styles.progressOverview}>
        <h3 className={styles.overviewTitle}>Ogólny postęp</h3>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <span className={styles.progressPercent}>{stats.completionRate}%</span>
        </div>
      </div>

      {/* Szybkie akcje (wyświetlane tylko, gdy są jakiekolwiek dane) */}
      {stats.total > 0 && (
        <div className={styles.quickActions}>
          <h3 className={styles.actionsTitle}>Szybkie akcje</h3>
          <div className={styles.actionButtons}>
            <button className={styles.actionBtn}>
              <span className={styles.actionIcon}>🎯</span>
              Kontynuuj naukę
            </button>
            <button className={styles.actionBtn}>
              <span className={styles.actionIcon}>🔄</span>
              Powtórz materiały
            </button>
            <button className={styles.actionBtn}>
              <span className={styles.actionIcon}>📊</span>
              Zobacz szczegóły
            </button>
          </div>
        </div>
      )}
    </div>
  );
}