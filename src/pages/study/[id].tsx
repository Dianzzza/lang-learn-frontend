/**
 * @file [id].tsx
 * @brief Strona dynamiczna pojedynczej lekcji (Dynamic Route).
 *
 * Plik obsługuje ścieżkę `/study/:id` (np. /study/12, /study/introduction).
 *
 * Główne zadania tego komponentu:
 * 1. **Routing:** Odczytuje parametr `query.id` z URL za pomocą hooka `useRouter`.
 * 2. **Walidacja:** Normalizuje parametr `id` (zabezpieczenie przed tablicą stringów).
 * 3. **Prezentacja:** Wyświetla kontener lekcji (obecnie Placeholder "W budowie").
 *
 * Docelowo w tym miejscu nastąpi pobranie danych lekcji (fetch) i renderowanie
 * interaktywnych komponentów edukacyjnych.
 */

import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
// Uwaga: Ten plik CSS (PlaceholderPage.module.css) będzie musiał zostać utworzony w następnym kroku
import styles from '../../styles/PlaceholderPage.module.css';

export default function LessonPage() {
  const router = useRouter();
  const { id } = router.query;

  // Type Guard: Next.js router.query.id może być stringiem, tablicą lub undefined.
  // Upewniamy się, że pracujemy na pojedynczym stringu.
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
          
          {/* Status "W budowie" */}
          <div className={styles.status}>
            <span className={styles.statusIcon}>🚧</span>
            <span className={styles.statusText}>Wkrótce dostępne!</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}