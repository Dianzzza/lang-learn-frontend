/**
 * @file LandingPage.tsx
 * @brief Komponent strony startowej (Landing Page) dla użytkowników niezalogowanych.
 *
 * Jest to strona, którą widzi użytkownik odwiedzający domenę główną (root),
 * jeśli nie posiada aktywnej sesji. Pełni funkcję marketingową i nawigacyjną,
 * kierując do procesów logowania lub rejestracji.
 */

import { useState } from 'react';
import styles from '../styles/LandingPage.module.css';
import AuthModal from './AuthModal';

/**
 * Komponent LandingPage.
 *
 * Wyświetla główną stronę marketingową aplikacji "LangLearn".
 * Zawiera sekcję Hero, przyciski nawigacyjne (CTA) oraz obsługuje
 * otwieranie modala autoryzacji (Logowanie/Rejestracja).
 *
 * @returns {JSX.Element} Wyrenderowana strona startowa.
 */
export default function LandingPage() {
  /**
   * Stan określający, czy modal autoryzacji jest widoczny.
   * @default false
   */
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  /**
   * Stan określający początkowy tryb modala ('login' lub 'register').
   * Pozwala otworzyć modal na odpowiedniej zakładce w zależności od klikniętego przycisku.
   * @default 'login'
   */
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  /**
   * Funkcja pomocnicza otwierająca modal w zadanym trybie.
   *
   * @param {('login' | 'register')} mode - Tryb, w którym ma się otworzyć modal.
   */
  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Pasek nawigacyjny */}
      <nav className={styles.nav}>
        <div className={styles.logo}>🌟 LangLearn</div>
        <div className={styles.navButtons}>
            <button className={styles.loginBtn} onClick={() => openAuth('login')}>
            Zaloguj się
            </button>
            <button className={styles.registerBtn} onClick={() => openAuth('register')}>
            Rejestracja
            </button>
        </div>
      </nav>

      {/* Sekcja Hero (główna treść marketingowa) */}
      <main className={styles.hero}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Naucz się języka <span className={styles.highlight}>szybciej</span> i efektywniej.
          </h1>
          <p className={styles.description}>
            Dołącz do społeczności LangLearn. Rozwiązuj interaktywne quizy, 
            rywalizuj ze znajomymi w pojedynkach i śledź swoje postępy każdego dnia.
          </p>
          <div className={styles.buttons}>
            {/* Główny przycisk CTA (Call To Action) */}
            <button className={styles.ctaBtn} onClick={() => openAuth('register')}>
              Rozpocznij naukę za darmo 🚀
            </button>
          </div>
        </div>
        
        {/* Prosta wizualizacja z CSS zamiast obrazka (Mockup funkcjonalności) */}
        <div className={styles.visuals}>
            <div className={styles.cardPreview}>
                📚 1500+ Lekcji
            </div>
            <div className={`${styles.cardPreview} ${styles.card2}`}>
                🔥 Tryb Rywalizacji
            </div>
        </div>
      </main>

      {/* Modal autoryzacji (domyślnie ukryty, kontrolowany przez props `isOpen`) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}