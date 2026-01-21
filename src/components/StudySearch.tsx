/**
 * @file StudySearch.tsx
 * @brief Komponent paska wyszukiwania materiałów edukacyjnych.
 *
 * Jest to komponent kontrolowany (Controlled Component), który deleguje
 * zarządzanie stanem wartości wpisanej do komponentu nadrzędnego.
 * Zawiera również przyciski "szybkich filtrów", które automatycznie uzupełniają pole wyszukiwania.
 */

'use client';

import { useState, useRef } from 'react';
import styles from '../styles/StudySearch.module.css';

/**
 * Właściwości (Props) przyjmowane przez komponent StudySearch.
 */
interface StudySearchProps {
  /** Aktualna wartość wpisana w polu wyszukiwania (zarządzana przez rodzica) */
  searchTerm: string;
  /**
   * Funkcja zwrotna wywoływana przy każdej zmianie wartości inputa
   * lub po kliknięciu w szybki filtr.
   * @param term - Nowa fraza wyszukiwania.
   */
  onSearchChange: (term: string) => void;
}

/**
 * Komponent StudySearch.
 *
 * @param {StudySearchProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Pasek wyszukiwania z ikoną, przyciskiem czyszczenia i tagami.
 */
export default function StudySearch({ searchTerm, onSearchChange }: StudySearchProps) {
  // --- STANY WEWNĘTRZNE ---
  /** Stan określający, czy input jest aktualnie aktywny (dla stylów CSS) */
  const [isFocused, setIsFocused] = useState<boolean>(false);
  
  /**
   * Referencja do elementu DOM inputa.
   * Używana do programowego przywracania fokusu po kliknięciu przycisku "Wyczyść".
   */
  const inputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERY ---

  /**
   * Czyści pole wyszukiwania i przywraca kursor do inputa.
   * Zapewnia to płynność użytkowania (użytkownik nie musi klikać ponownie, by pisać).
   */
  const handleClear = (): void => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  /**
   * Obsługa zatwierdzenia formularza (np. Enter).
   * Obecnie tylko zapobiega przeładowaniu strony, ale może być rozszerzona
   * o natychmiastowe wymuszenie wyszukiwania lub logikę analityczną.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Opcjonalnie: Logika analityczna lub wymuszenie API call
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        {/* Wrapper stylizowany warunkowo na podstawie stanu isFocused */}
        <div className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''}`}>
          <div className={styles.searchIcon}>
            🔍
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Szukaj materiałów, kategorii, poziomów..."
            className={styles.searchInput}
            autoComplete="off"
          />
          
          {/* Przycisk czyszczenia widoczny tylko, gdy wpisano tekst */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              title="Wyczyść wyszukiwanie"
            >
              ✕
            </button>
          )}
        </div>

        {/* Feedback wizualny - co dokładnie jest wyszukiwane */}
        {searchTerm && (
          <div className={styles.searchInfo}>
            <span className={styles.searchCount}>
              Szukasz: <strong>{searchTerm}</strong>
            </span>
          </div>
        )}
      </form>

      {/* Szybkie filtry (Quick Filters) - działają jako skróty klawiszowe */}
      <div className={styles.quickFilters}>
        <button 
          className={styles.quickFilterBtn}
          onClick={() => onSearchChange('A1')}
          title="Pokaż materiały A1"
        >
          A1
        </button>
        <button 
          className={styles.quickFilterBtn}
          onClick={() => onSearchChange('gramatyka')}
          title="Szukaj gramatyki"
        >
          📝 Gramatyka
        </button>
        <button 
          className={styles.quickFilterBtn}
          onClick={() => onSearchChange('słownictwo')}
          title="Szukaj słownictwa"
        >
          📚 Słownictwo
        </button>
        <button 
          className={styles.quickFilterBtn}
          onClick={() => onSearchChange('konwersacje')}
          title="Szukaj konwersacji"
        >
          💬 Konwersacje
        </button>
      </div>
    </div>
  );
}