// src/components/WelcomeSection.tsx
import { useRouter } from 'next/router';
import styles from '../styles/WelcomeSection.module.css';

interface User {
  username: string;
  streak_days: number;
  today_lessons: number;
  target_lessons: number;
}

interface WelcomeSectionProps {
  user: User;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const router = useRouter();
  const handleStartLearning = () => {
    router.push('/study'); 
  };

  const progressPercentage = Math.min(
    Math.round((user.today_lessons / user.target_lessons) * 100),
    100
  );

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <div className={styles.greeting}>
          <h1 className={styles.welcomeTitle}>
            Dzień dobry, {user.username}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Gotowy na kolejną przygodę?
          </p>
        </div>

        <div className={styles.streak}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakText}>
            {user.streak_days} {user.streak_days === 1 ? 'dzień' : 'dni'} z rzędu!
          </span>
        </div>

        <div className={styles.dailyGoal}>
          <div className={styles.goalHeader}>
            <span className={styles.goalIcon}>🎯</span>
            <span className={styles.goalText}>Dzienny cel</span>
          </div>
          
          <div className={styles.goalProgress}>
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

        <button onClick={handleStartLearning} className={styles.startLearningBtn}>
          <span className={styles.btnIcon}>📚</span>
          Rozpocznij naukę
        </button>
      </div>
    </div>
  );
}