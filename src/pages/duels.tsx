/**
 * @file duels.tsx
 * @brief Strona "Pojedynki" (moduł Multiplayer).
 *
 * Obecnie jest to strona tymczasowa (Stub/Placeholder).
 * W przyszłości będzie zawierać:
 * 1. Lobby do wyszukiwania przeciwników.
 * 2. Tablicę wyników (Leaderboard).
 * 3. Interfejs wyboru trybu pojedynku (Czasowy / Na punkty).
 *
 * Korzysta ze wspólnych stylów `PlaceholderPage.module.css` dla zachowania spójności
 * z innymi nieukończonymi sekcjami.
 */

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
          
          {/* Komponent statusu "W budowie" */}
          <div className={styles.status}>
            <span className={styles.statusIcon}>🚧</span>
            <span className={styles.statusText}>Wkrótce dostępne!</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}