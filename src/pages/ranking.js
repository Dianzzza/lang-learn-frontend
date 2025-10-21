// pages/ranking.js
import Layout from '../components/Layout';
import styles from '../styles/PlaceholderPage.module.css';

export default function RankingPage() {
  return (
    <Layout 
      title="Ranking - LangLearn" 
      description="Zobacz ranking najlepszych uczniów"
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>🏆</div>
          <h1 className={styles.title}>Ranking</h1>
          <p className={styles.description}>
            Sprawdź swoją pozycję wśród najlepszych uczniów platformy.
          </p>
          <p className={styles.comingSoon}>Wkrótce dostępne!</p>
        </div>
      </div>
    </Layout>
  );
}
