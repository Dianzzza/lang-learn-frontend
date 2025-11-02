// components/WelcomeSection.jsx
'use client';
import { useState, useEffect } from 'react';
import styles from '../styles/WelcomeSection.module.css';

export default function WelcomeSection({ user }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 12) setCurrentTime('Dzień dobry');
      else if (hour < 18) setCurrentTime('Dzień dobry');
      else setCurrentTime('Dobry wieczór');
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

        <div className={styles.dailyGoal}>
          <div className={styles.goalProgress}>
            <div className={styles.goalHeader}>
              <span className={styles.goalIcon}>🎯</span>
              <span className={styles.goalText}>Dzisiejszy cel</span>
            </div>
            <div className={styles.goalBar}>
              <div 
                className={styles.goalFill}
                style={{ width: `${(user.today_lessons / user.target_lessons) * 100}%` }}
              ></div>
            </div>
            <span className={styles.goalNumbers}>
              {user.today_lessons}/{user.target_lessons} lekcji
            </span>
          </div>
        </div>

        <div className={styles.streak}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakText}>
            <strong>{user.streak_days}</strong> dni z rzędu
          </span>
        </div>

        <button className={styles.startLearningBtn}>
          <span className={styles.btnIcon}>🚀</span>
          Rozpocznij naukę
        </button>
      </div>
    </div>
  );
}
