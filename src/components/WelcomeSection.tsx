
'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/WelcomeSection.module.css';

interface User {
  username: string;
  points?: number;
  streak_days?: number;
  today_lessons?: number;
  target_lessons?: number;
  // Dodaj inne właściwości user, jeśli są potrzebne
}

interface WelcomeSectionProps {
  user: User;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = (): void => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 12) {
        setCurrentTime('Dzień dobry');
      } else if (hour < 18) {
        setCurrentTime('Dzień dobry');
      } else {
        setCurrentTime('Dobry wieczór');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = user.today_lessons && user.target_lessons 
    ? Math.min((user.today_lessons / user.target_lessons) * 100, 100)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <div className={styles.greeting}>
          <h1 className={styles.welcomeTitle}>
            {currentTime}, {user.username}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Gotowy na kolejną przygodę?
          </p>
        </div>

        {user.streak_days !== undefined && user.streak_days > 0 && (
          <div className={styles.streak}>
            <span className={styles.streakIcon}>🔥</span>
            <span className={styles.streakText}>
              {user.streak_days} dni z rzędu!
            </span>
          </div>
        )}

        {user.today_lessons !== undefined && user.target_lessons !== undefined && (
          <div className={styles.dailyGoal}>
            <div className={styles.goalProgress}>
              <div className={styles.goalHeader}>
                <span className={styles.goalIcon}>🎯</span>
                <span className={styles.goalText}>Dzienny cel</span>
              </div>
              <div className={styles.goalBar}>
                <div 
                  className={styles.goalFill}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className={styles.goalNumbers}>
                {user.today_lessons} / {user.target_lessons} lekcji
              </div>
            </div>
          </div>
        )}

        <button className={styles.startLearningBtn}>
          <span className={styles.btnIcon}>📚</span>
          Rozpocznij naukę
        </button>
      </div>
    </div>
  );
}