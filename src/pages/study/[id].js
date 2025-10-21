// pages/lesson/[id].js
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/PlaceholderPage.module.css';

export default function LessonPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout 
      title={`Lekcja ${id} - LangLearn`} 
      description={`Szczegóły lekcji ${id}`}
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>📖</div>
          <h1 className={styles.title}>Lekcja #{id}</h1>
          <p className={styles.description}>
            Tutaj będzie zawartość konkretnej lekcji z interaktywnymi ćwiczeniami.
          </p>
          <p className={styles.comingSoon}>Wkrótce dostępne!</p>
        </div>
      </div>
    </Layout>
  );
}
