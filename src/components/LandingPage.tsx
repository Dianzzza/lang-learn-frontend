import { useState } from 'react';
import styles from '../styles/LandingPage.module.css';
import AuthModal from './AuthModal';

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className={styles.container}>
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
            <button className={styles.ctaBtn} onClick={() => openAuth('register')}>
              Rozpocznij naukę za darmo 🚀
            </button>
          </div>
        </div>
        
        {/* Prosta wizualizacja z CSS zamiast obrazka */}
        <div className={styles.visuals}>
            <div className={styles.cardPreview}>
                📚 1500+ Lekcji
            </div>
            <div className={`${styles.cardPreview} ${styles.card2}`}>
                🔥 Tryb Rywalizacji
            </div>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}