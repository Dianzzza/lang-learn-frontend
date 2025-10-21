// components/StudySearch.jsx
'use client';
import { useState, useRef } from 'react';
import styles from '../styles/StudySearch.module.css';

export default function StudySearch({ searchTerm, onSearchChange }) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opcjonalnie: dodatkowa logika po submit
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <div className={`${styles.searchWrapper} ${isFocused ? styles.focused : ''}`}>
        <span className={styles.searchIcon}>🔍</span>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Szukaj materiałów, lekcji, tematów..."
          className={styles.searchInput}
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

      {searchTerm && (
        <div className={styles.searchSuggestions}>
          <div className={styles.suggestionItem}>
            <span className={styles.suggestionIcon}>📚</span>
            Szukaj w: <strong>"{searchTerm}"</strong>
          </div>
        </div>
      )}
    </form>
  );
}
