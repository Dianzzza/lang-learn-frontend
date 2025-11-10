
import styles from '../styles/UserStats.module.css';

interface Stat {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: string;
}

interface UserStatsProps {
  stats: Stat[];
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📊</span>
          Twoje Statystyki
        </h2>
      </div>
      
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {stat.value}
                {stat.change && (
                  <span className={styles.statChange}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div className={styles.statLabel}>{stat.title}</div>
              {stat.subtitle && (
                <div className={styles.statSubtitle}>{stat.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}