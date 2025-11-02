// components/StudyFilters.jsx
'use client';
import { useState } from 'react';
import styles from '../styles/StudyFilters.module.css';

export default function StudyFilters({ 
  activeFilters, 
  onFilterChange, 
  onClearAll, 
  activeFilterCount 
}) {
  const [expandedSections, setExpandedSections] = useState({
    levels: true,
    categories: true,
    types: false,
    status: false,
    difficulty: false,
    duration: false
  });

  const filterSections = {
    levels: {
      title: 'Poziom',
      icon: '🎯',
      options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    categories: {
      title: 'Kategoria',
      icon: '📂',
      options: ['Gramatyka', 'Słownictwo', 'Wymowa', 'Konwersacje', 'Czytanie', 'Pisanie']
    },
    types: {
      title: 'Typ zadań',
      icon: '🎮',
      options: ['Fiszki', 'Quiz', 'Ćwiczenia', 'Testy', 'Gry', 'Dialogi']
    },
    status: {
      title: 'Status',
      icon: '📊',
      options: ['Nowe', 'W trakcie', 'Ukończone', 'Do powtórki', 'Ulubione']
    },
    difficulty: {
      title: 'Trudność',
      icon: '⚡',
      options: ['Łatwe', 'Średnie', 'Trudne']
    },
    duration: {
      title: 'Czas trwania',
      icon: '⏱️',
      options: ['< 5 min', '5-15 min', '15-30 min', '> 30 min']
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Nowe': '#06b6d4',
      'W trakcie': '#f59e0b',
      'Ukończone': '#10b981',
      'Do powtórki': '#8b5cf6',
      'Ulubione': '#ef4444'
    };
    return colors[status] || '#64748b';
  };

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
            title="Wyczyść wszystkie filtry"
          >
            <span className={styles.clearCount}>({activeFilterCount})</span>
            Wyczyść
          </button>
        )}
      </div>

      <div className={styles.filtersContent}>
        {Object.entries(filterSections).map(([key, section]) => (
          <div key={key} className={styles.filterSection}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(key)}
            >
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                {section.title}
                {activeFilters[key].length > 0 && (
                  <span className={styles.activeCount}>
                    ({activeFilters[key].length})
                  </span>
                )}
              </div>
              <span className={`${styles.expandIcon} ${expandedSections[key] ? styles.expanded : ''}`}>
                ▼
              </span>
            </button>

            {expandedSections[key] && (
              <div className={styles.optionsList}>
                {section.options.map((option) => (
                  <label 
                    key={option} 
                    className={`${styles.filterOption} ${activeFilters[key].includes(option) ? styles.active : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters[key].includes(option)}
                      onChange={() => onFilterChange(key, option)}
                      className={styles.checkbox}
                    />
                    <span 
                      className={styles.optionText}
                      style={key === 'status' && activeFilters[key].includes(option) ? 
                        { color: getStatusColor(option) } : {}}
                    >
                      {option}
                    </span>
                    {key === 'levels' && (
                      <span className={styles.levelBadge}>{option}</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick filters */}
      <div className={styles.quickFilters}>
        <h4 className={styles.quickTitle}>Szybkie filtry</h4>
        <div className={styles.quickButtons}>
          <button 
            className={styles.quickBtn}
            onClick={() => onFilterChange('status', 'W trakcie')}
          >
            📖 Kontynuuj naukę
          </button>
          <button 
            className={styles.quickBtn}
            onClick={() => onFilterChange('status', 'Do powtórki')}
          >
            🔄 Do powtórki
          </button>
          <button 
            className={styles.quickBtn}
            onClick={() => onFilterChange('status', 'Ulubione')}
          >
            ❤️ Ulubione
          </button>
        </div>
      </div>
    </div>
  );
}
