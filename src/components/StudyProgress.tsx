
'use client';

import { useMemo } from 'react';
import styles from '../styles/StudyProgress.module.css';

interface StudyMaterial {
  id: number;
  title: string;
  status: 'Ukończone' | 'W trakcie' | 'Do powtórki' | 'Zablokowane';
  progress: number;
  level?: string;
  type?: string;
}

interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  toReview: number;
  avgProgress: number;
  completionRate: number;
}

interface StudyProgressProps {
  studyMaterials: StudyMaterial[];
}

export default function StudyProgress({ studyMaterials }: StudyProgressProps) {
  const stats = useMemo((): ProgressStats => {
    const total = studyMaterials.length;
    const completed = studyMaterials.filter(m => m.status === 'Ukończone').length;
    const inProgress = studyMaterials.filter(m => m.status === 'W trakcie').length;
    const toReview = studyMaterials.filter(m => m.status === 'Do powtórki').length;
    
    const avgProgress = total > 0 
      ? Math.round(studyMaterials.reduce((sum, m) => sum + m.progress, 0) / total)
      : 0;
    
    return {
      total,
      completed,
      inProgress,
      toReview,
      avgProgress,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [studyMaterials]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          Twój postęp
        </h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completionRate}%</span>
            <span className={styles.statLabel}>Ukończono</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Wszystkich</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Ukończone</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>W trakcie</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔄</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.toReview}</span>
            <span className={styles.statLabel}>Do powtórki</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.avgProgress}%</span>
            <span className={styles.statLabel}>Średni postęp</span>
          </div>
        </div>
      </div>

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