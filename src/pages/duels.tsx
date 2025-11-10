
import Layout from '../components/Layout';
import styles from '../styles/PlaceholderPage.module.css';

export default function DuelsPage() {
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>⚔️</div>
          <h1 className={styles.title}>Pojedynki</h1>
          <p className={styles.description}>
            Zmierz się z innymi uczniami w ekscytujących pojedynkach językowych.
          </p>
          <div className={styles.status}>
            <span className={styles.statusIcon}>🚧</span>
            <span className={styles.statusText}>Wkrótce dostępne!</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}