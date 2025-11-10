
'use client';

import { useState } from 'react';
import styles from '../styles/StudyFilters.module.css';

interface ActiveFilters {
  levels: string[];
  categories: string[];
  types: string[];
  status: string[];
  difficulty: string[];
  duration: string[];
}

interface StudyFiltersProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

interface FilterSection {
  key: keyof ActiveFilters;
  title: string;
  icon: string;
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
}

export default function StudyFilters({ 
  activeFilters, 
  onFilterChange, 
  onClearAll, 
  activeFilterCount 
}: StudyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<keyof ActiveFilters, boolean>>({
    levels: true,
    categories: true,
    types: false,
    status: false,
    difficulty: false,
    duration: false
  });

  const toggleSection = (section: keyof ActiveFilters): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
        {filterSections.map((section) => (
          <div key={section.key} className={styles.filterSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.key)}
            >
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.title}
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

        {/* Quick Filters */}
        <div className={styles.quickFilters}>
          <h4 className={styles.quickTitle}>Szybkie filtry</h4>
          <div className={styles.quickButtons}>
            <button 
              className={styles.quickBtn}
              onClick={() => {
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