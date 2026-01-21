/**
 * @file PageTransition.tsx
 * @brief Komponent obsługujący animacje przejść między stronami.
 *
 * Komponent ten działa jako wrapper dla głównej zawartości strony.
 * W zależności od stanu `isLoading` wyświetla ekran ładowania (spinner)
 * lub właściwą treść z efektem płynnego pojawiania się (fade-in).
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import styles from '../styles/PageTransition.module.css';

/**
 * Właściwości (Props) przyjmowane przez komponent PageTransition.
 */
interface PageTransitionProps {
  /**
   * Zawartość strony (podstrony), która ma zostać wyświetlona.
   */
  children: ReactNode;
  
  /**
   * Flaga sterująca stanem ładowania.
   * - `true`: Wyświetla overlay z animacją ładowania.
   * - `false`: Wyświetla `children`.
   */
  isLoading: boolean;
}

/**
 * Komponent PageTransition.
 *
 * Zarządza widocznością treści poprzez klasy CSS. Używa `setTimeout`
 * do opóźnienia pojawienia się treści, co zapewnia płynność animacji CSS
 * po zdemontowaniu ekranu ładowania.
 *
 * @param {PageTransitionProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Kontener z obsługą stanów ładowania.
 */
export default function PageTransition({ children, isLoading }: PageTransitionProps) {
  /**
   * Stan sterujący klasą CSS odpowiedzialną za krycie (opacity).
   * @default true
   */
  const [isVisible, setIsVisible] = useState<boolean>(true);

  /**
   * Efekt uboczny reagujący na zmiany flagi `isLoading`.
   *
   * Logika przejścia:
   * 1. Jeśli trwa ładowanie -> ukryj treść (`isVisible = false`).
   * 2. Jeśli ładowanie zakończone -> odczekaj 100ms i pokaż treść (`isVisible = true`).
   * Opóźnienie pozwala przeglądarce na przerysowanie DOM przed nałożeniem klasy `visible`,
   * co gwarantuje zadziałanie transition CSS.
   */
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
      {isLoading ? (
        // --- EKRAN ŁADOWANIA ---
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}>
            <div className={styles.loaderSpinner}></div>
            <p className={styles.loadingText}>Ładowanie...</p>
          </div>
        </div>
      ) : (
        // --- WŁAŚCIWA TREŚĆ ---
        <div className={`${styles.content} ${isVisible ? styles.visible : styles.hidden}`}>
          {children}
        </div>
      )}
    </div>
  );
}