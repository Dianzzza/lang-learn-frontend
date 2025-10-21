// components/PageTransition.jsx
'use client';
import { useEffect, useState } from 'react';
import styles from '../styles/PageTransition.module.css';

export default function PageTransition({ children, isLoading }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(false);
    } else {
      // Małe opóźnienie dla smooth transition
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}>
            <div className={styles.loaderSpinner}></div>
            <p className={styles.loadingText}>Ładowanie...</p>
          </div>
        </div>
      )}
      
      <div className={`${styles.content} ${isVisible ? styles.visible : styles.hidden}`}>
        {children}
      </div>
    </div>
  );
}
