// components/UserStats.jsx
import styles from '../styles/UserStats.module.css';

export default function UserStats({ user, stats }) {
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
              <h3 className={styles.statValue}>{stat.value}</h3>
              <p className={styles.statTitle}>{stat.title}</p>
              {stat.subtitle && (
                <span className={styles.statSubtitle}>{stat.subtitle}</span>
              )}
              {stat.change && (
                <span className={styles.statChange}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.achievements}>
        <h3 className={styles.achievementsTitle}>Ostatnie osiągnięcia</h3>
        <div className={styles.achievementsList}>
          <div className={styles.achievement}>🏆 Pierwsza seria 7 dni!</div>
          <div className={styles.achievement}>⭐ 100 punktów w tygodniu</div>
          <div className={styles.achievement}>📚 Ukończona lekcja A1</div>
        </div>
      </div>
    </div>
  );
}
