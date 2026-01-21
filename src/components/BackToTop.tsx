/**
 * @file BackToTop.tsx
 * @brief Komponent przycisku "Powrót na górę".
 *
 * Wyświetla pływający przycisk, który pozwala użytkownikowi szybko wrócić
 * na początek strony. Przycisk jest ukryty, dopóki użytkownik nie przewinie
 * strony w dół o określoną liczbę pikseli.
 */

'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/BackToTop.module.css';

/**
 * Komponent BackToTop.
 *
 * Monitoruje globalny obiekt `window` pod kątem zdarzenia przewijania (`scroll`).
 *
 * @returns {JSX.Element} Przycisk przewijania lub pusty fragment (jeśli ukryty przez CSS/klasę).
 */
export default function BackToTop() {
  /**
   * Stan określający czy przycisk powinien być widoczny.
   * @default false
   */
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Efekt uboczny rejestrujący nasłuchiwacz zdarzenia `scroll`.
   *
   * Funkcja `toggleVisibility` sprawdza `window.pageYOffset`. Jeśli wartość
   * przekracza 300 pikseli, ustawia `isVisible` na true.
   *
   * @note Efekt zawiera funkcję czyszczącą (`cleanup`), która usuwa nasłuchiwacz
   * przy odmontowaniu komponentu, zapobiegając wyciekom pamięci.
   */
  useEffect(() => {
    const toggleVisibility = (): void => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  /**
   * Funkcja obsługująca kliknięcie przycisku.
   *
   * Wywołuje `window.scrollTo` z opcją `behavior: 'smooth'`,
   * co zapewnia płynną animację przewijania do góry (współrzędna Y = 0).
   */
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Powrót na górę"
    >
      ↑
    </button>
  );
}