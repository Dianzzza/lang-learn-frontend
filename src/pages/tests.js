// pages/tests.js
import Layout from '../components/Layout';
import styles from '../styles/PlaceholderPage.module.css';

export default function TestsPage() {
  return (
    <Layout 
      title="Testy - LangLearn" 
      description="Testy i quizy do sprawdzenia wiedzy"
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>📝</div>
          <h1 className={styles.title}>Testy</h1>
          <p className={styles.description}>
            Sprawdź swoją wiedzę za pomocą interaktywnych testów i quizów.
          </p>
          <p className={styles.comingSoon}>Wkrótce dostępne!</p>
        </div>
      </div>
    </Layout>
  );
}
