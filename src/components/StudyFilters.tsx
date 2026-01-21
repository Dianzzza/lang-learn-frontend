/**
 * @file StudyFilters.tsx
 * @brief Komponent panelu bocznego z filtrami materiałów edukacyjnych.
 *
 * Umożliwia filtrowanie listy materiałów według wielu kryteriów (poziom, kategoria, typ itp.).
 * Obsługuje zwijane sekcje (akordeon) oraz "szybkie filtry" (presety).
 * Komponent jest "sterowany" (controlled component) - stan filtrów znajduje się w komponencie nadrzędnym.
 */

'use client';

import { useState } from 'react';
import styles from '../styles/StudyFilters.module.css';

/**
 * Interfejs definiujący strukturę stanu aktywnych filtrów.
 * Klucze odpowiadają sekcjom, a wartości to tablice wybranych opcji.
 */
interface ActiveFilters {
  levels: string[];
  categories: string[];
  types: string[];
  status: string[];
  difficulty: string[];
  duration: string[];
}

/**
 * Właściwości (Props) przyjmowane przez komponent StudyFilters.
 */
interface StudyFiltersProps {
  /** Obiekt zawierający aktualnie wybrane filtry */
  activeFilters: ActiveFilters;
  /**
   * Callback wywoływany przy zmianie pojedynczego filtra (checkbox).
   * @param filterType - Klucz sekcji (np. 'levels').
   * @param value - Wybrana wartość (np. 'A1').
   */
  onFilterChange: (filterType: keyof ActiveFilters, value: string) => void;
  /** Callback do zresetowania wszystkich filtrów */
  onClearAll: () => void;
  /** Liczba aktywnych filtrów (do wyświetlenia na przycisku czyszczenia) */
  activeFilterCount: number;
}

/**
 * Konfiguracja pojedynczej sekcji filtrów.
 * Używana do generowania UI w pętli.
 */
interface FilterSection {
  key: keyof ActiveFilters;
  title: string;
  icon: string;
  options: Array<{
    value: string;
    label: string;
    /** Liczba dostępnych materiałów w danej kategorii (opcjonalne) */
    count?: number;
  }>;
}

/**
 * Komponent StudyFilters.
 *
 * @param {StudyFiltersProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Panel filtrów z akordeonem.
 */
export default function StudyFilters({ 
  activeFilters, 
  onFilterChange, 
  onClearAll, 
  activeFilterCount 
}: StudyFiltersProps) {
  
  /**
   * Stan lokalny zarządzający widocznością (zwinięciem/rozwinięciem) poszczególnych sekcji.
   * Domyślnie rozwinięte są 'levels' i 'categories'.
   */
  const [expandedSections, setExpandedSections] = useState<Record<keyof ActiveFilters, boolean>>({
    levels: true,
    categories: true,
    types: false,
    status: false,
    difficulty: false,
    duration: false
  });

  /**
   * Przełącza widoczność danej sekcji filtrów.
   */
  const toggleSection = (section: keyof ActiveFilters): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  /**
   * Statyczna konfiguracja filtrów.
   * W przyszłości dane te (szczególnie `count`) mogą pochodzić z API.
   */
  const filterSections: FilterSection[] = [
    {
      key: 'levels',
      title: 'Poziom',
      icon: '🎯',
      options: [
        { value: 'A1', label: 'A1', count: 12 },
        { value: 'A2', label: 'A2', count: 8 },
        { value: 'B1', label: 'B1', count: 15 },
        { value: 'B2', label: 'B2', count: 6 },
        { value: 'C1', label: 'C1', count: 3 },
        { value: 'C2', label: 'C2', count: 1 }
      ]
    },
    {
      key: 'categories',
      title: 'Kategoria',
      icon: '📂',
      options: [
        { value: 'Gramatyka', label: 'Gramatyka', count: 18 },
        { value: 'Słownictwo', label: 'Słownictwo', count: 15 },
        { value: 'Konwersacje', label: 'Konwersacje', count: 12 },
        { value: 'Wymowa', label: 'Wymowa', count: 8 }
      ]
    },
    {
      key: 'types',
      title: 'Typ',
      icon: '📝',
      options: [
        { value: 'Lekcje', label: 'Lekcje', count: 25 },
        { value: 'Ćwiczenia', label: 'Ćwiczenia', count: 18 },
        { value: 'Dialogi', label: 'Dialogi', count: 10 },
        { value: 'Testy', label: 'Testy', count: 5 }
      ]
    },
    {
      key: 'status',
      title: 'Status',
      icon: '✅',
      options: [
        { value: 'Ukończone', label: 'Ukończone', count: 12 },
        { value: 'W trakcie', label: 'W trakcie', count: 8 },
        { value: 'Do powtórki', label: 'Do powtórki', count: 5 },
        { value: 'Nowe', label: 'Nowe', count: 20 }
      ]
    },
    {
      key: 'difficulty',
      title: 'Trudność',
      icon: '⭐',
      options: [
        { value: 'Łatwe', label: 'Łatwe', count: 20 },
        { value: 'Średnie', label: 'Średnie', count: 15 },
        { value: 'Trudne', label: 'Trudne', count: 8 }
      ]
    },
    {
      key: 'duration',
      title: 'Czas trwania',
      icon: '⏱️',
      options: [
        { value: '5-15 min', label: '5-15 min', count: 18 },
        { value: '15-30 min', label: '15-30 min', count: 12 },
        { value: '30+ min', label: '30+ min', count: 5 }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      {/* Nagłówek panelu z przyciskiem czyszczenia */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>🔍</span>
          Filtry
        </h3>
        {activeFilterCount > 0 && (
          <button
            className={styles.clearAllBtn}
            onClick={onClearAll}
          >
            <span className={styles.clearCount}>{activeFilterCount}</span>
            Wyczyść
          </button>
        )}
      </div>

      <div className={styles.filtersContent}>
        {/* Renderowanie sekcji filtrów na podstawie konfiguracji */}
        {filterSections.map((section) => (
          <div key={section.key} className={styles.filterSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.key)}
            >
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.title}
                {/* Licznik aktywnych filtrów w danej sekcji */}
                {activeFilters[section.key].length > 0 && (
                  <span className={styles.activeCount}>
                    {activeFilters[section.key].length}
                  </span>
                )}
              </div>
              <span className={`${styles.expandIcon} ${
                expandedSections[section.key] ? styles.expanded : ''
              }`}>
                ▼
              </span>
            </button>

            {/* Rozwijana lista opcji (Checkboxy) */}
            {expandedSections[section.key] && (
              <div className={styles.optionsList}>
                {section.options.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.filterOption} ${
                      activeFilters[section.key].includes(option.value) ? styles.active : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={activeFilters[section.key].includes(option.value)}
                      onChange={() => onFilterChange(section.key, option.value)}
                    />
                    <span className={styles.optionText}>{option.label}</span>
                    {option.count && (
                      <span className={styles.optionCount}>({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Sekcja Szybkich Filtrów (Presets) */}
        <div className={styles.quickFilters}>
          <h4 className={styles.quickTitle}>Szybkie filtry</h4>
          <div className={styles.quickButtons}>
            <button 
              className={styles.quickBtn}
              onClick={() => {
                // Logika: Czyścimy wszystko, a potem ustawiamy jeden konkretny filtr
                onClearAll();
                onFilterChange('status', 'W trakcie');
              }}
            >
              🔥 Kontynuuj naukę
            </button>
            <button 
              className={styles.quickBtn}
              onClick={() => {
                onClearAll();
                onFilterChange('status', 'Do powtórki');
              }}
            >
              🔄 Do powtórki
            </button>
            <button 
              className={styles.quickBtn}
              onClick={() => {
                onClearAll();
                onFilterChange('status', 'Nowe');
              }}
            >
              ✨ Nowe materiały
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}