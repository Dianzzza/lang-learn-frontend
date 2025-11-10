
'use client';

import { useState, useRef } from 'react';
import styles from '../styles/StudySearch.module.css';

// DODANE TYPESCRIPT TYPES
interface StudySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function StudySearch({ searchTerm, onSearchChange }: StudySearchProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = (): void => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Opcjonalnie: dodatkowa logika po submit
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
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

        {/* Search suggestions or recent searches could be here */}
        {searchTerm && (
          <div className={styles.searchInfo}>
            <span className={styles.searchCount}>
              Szukasz: <strong>{searchTerm}</strong>
            </span>
          </div>
        )}
      </form>

      {/* Quick filters */}
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
