// components/StudyProgress.jsx
'use client';
import { useMemo } from 'react';
import styles from '../styles/StudyProgress.module.css';

export default function StudyProgress({ studyMaterials }) {
  const stats = useMemo(() => {
    const total = studyMaterials.length;
    const completed = studyMaterials.filter(m => m.status === 'Ukończone').length;
    const inProgress = studyMaterials.filter(m => m.status === 'W trakcie').length;
    const toReview = studyMaterials.filter(m => m.status === 'Do powtórki').length;
    const avgProgress = Math.round(
      studyMaterials.reduce((sum, m) => sum + m.progress, 0) / total
    );
    
    return {
      total,
      completed,
      inProgress,
      toReview,
      avgProgress,
      completionRate: Math.round((completed / total) * 100)
    };
  }, [studyMaterials]);

  return (
    <div className={styles.container}>
      <div className={styles.progressCards}>
        <div className={styles.progressCard}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <span className={styles.cardValue}>{stats.avgProgress}%</span>
            <span className={styles.cardLabel}>Średni postęp</span>
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.cardIcon}>✅</div>
          <div className={styles.cardContent}>
            <span className={styles.cardValue}>{stats.completed}</span>
            <span className={styles.cardLabel}>Ukończone</span>
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.cardIcon}>📖</div>
          <div className={styles.cardContent}>
            <span className={styles.cardValue}>{stats.inProgress}</span>
            <span className={styles.cardLabel}>W trakcie</span>
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.cardIcon}>🔄</div>
          <div className={styles.cardContent}>
            <span className={styles.cardValue}>{stats.toReview}</span>
            <span className={styles.cardLabel}>Do powtórki</span>
          </div>
        </div>
      </div>

      <div className={styles.overallProgress}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Ogólny postęp</span>
          <span className={styles.progressPercentage}>{stats.completionRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <div className={styles.progressDetails}>
          {stats.completed} z {stats.total} materiałów ukończone
        </div>
      </div>
    </div>
  );
}
