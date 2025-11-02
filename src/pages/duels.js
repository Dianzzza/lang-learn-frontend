// pages/duels.js
import Layout from '../components/Layout';
import styles from '../styles/PlaceholderPage.module.css';

export default function DuelsPage() {
  return (
    <Layout 
      title="Pojedynki - LangLearn" 
      description="Rywalizuj z innymi użytkownikami"
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.icon}>⚔️</div>
          <h1 className={styles.title}>Pojedynki</h1>
          <p className={styles.description}>
            Zmierz się z innymi uczniami w ekscytujących pojedynkach językowych.
          </p>
          <p className={styles.comingSoon}>Wkrótce dostępne!</p>
        </div>
      </div>
    </Layout>
  );
}
