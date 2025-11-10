
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/PlaceholderPage.module.css';

export default function LessonPage() {
  const router = useRouter();
  const { id } = router.query;

  // Type guard for id parameter
  const lessonId = Array.isArray(id) ? id[0] : id;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>📖</div>
          <h1 className={styles.title}>
            Lekcja #{lessonId}
          </h1>
          <p className={styles.description}>
            Tutaj będzie zawartość konkretnej lekcji z interaktywnymi ćwiczeniami.
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