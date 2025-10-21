// pages/study.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StudyFilters from '../components/StudyFilters';
import StudySearch from '../components/StudySearch';
import StudyContent from '../components/StudyContent';
import StudyProgress from '../components/StudyProgress';
import styles from '../styles/StudyPage.module.css';

export default function StudyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    levels: [],
    categories: [],
    types: [],
    status: [],
    difficulty: [],
    duration: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Przykładowe dane materiałów
  const studyMaterials = [
    {
      id: 1,
      name: 'Podstawy - Powitania',
      description: 'Naucz się podstawowych zwrotów grzecznościowych',
      level: 'A1',
      category: 'Konwersacje',
      type: 'Dialogi',
      status: 'W trakcie',
      difficulty: 'Łatwe',
      duration: '5-15 min',
      progress: 85,
      totalLessons: 12,
      completedLessons: 10,
      lastStudied: '2025-10-20',
      rating: 4.8,
      studentsCount: 1250,
      isLocked: false,
      isFavorite: true,
      thumbnail: '👋'
    },
    {
      id: 2,
      name: 'Present Simple',
      description: 'Podstawy czasu teraźniejszego prostego',
      level: 'A1',
      category: 'Gramatyka',
      type: 'Ćwiczenia',
      status: 'Ukończone',
      difficulty: 'Łatwe',
      duration: '15-30 min',
      progress: 100,
      totalLessons: 8,
      completedLessons: 8,
      lastStudied: '2025-10-18',
      rating: 4.9,
      studentsCount: 2100,
      isLocked: false,
      isFavorite: false,
      thumbnail: '📝'
    }
    // Więcej materiałów...
  ];

  // Filtrowanie materiałów
  useEffect(() => {
    let filtered = [...studyMaterials];

    // Tutaj ta sama logika filtrowania co wcześniej...
    
    setFilteredMaterials(filtered);
  }, [searchTerm, activeFilters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      levels: [],
      categories: [],
      types: [],
      status: [],
      difficulty: [],
      duration: []
    });
    setSearchTerm('');
  };

  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, filters) => count + filters.length, 0
  );

  return (
    <Layout 
      title="Nauka - LangLearn" 
      description="Materiały do nauki języka angielskiego"
    >
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header sekcji */}
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>📚</span>
                Nauka
              </h1>
              <p className={styles.pageSubtitle}>
                Wybierz materiały i kontynuuj swoją naukę
              </p>
            </div>
            
            <StudyProgress studyMaterials={studyMaterials} />
          </div>

          {/* Pasek wyszukiwania i kontrolki */}
          <div className={styles.controlsSection}>
            <StudySearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
            <div className={styles.viewControls}>
              <div className={styles.sortControls}>
                <label htmlFor="sortBy">Sortuj:</label>
                <select 
                  id="sortBy"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="name">Nazwa A-Z</option>
                  <option value="progress">Postęp</option>
                  <option value="level">Poziom</option>
                  <option value="recent">Ostatnio studiowane</option>
                </select>
              </div>
              
              <div className={styles.viewModeToggle}>
                <button
                  className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Widok siatki"
                >
                  ⊞
                </button>
                <button
                  className={`${styles.viewModeBtn} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Widok listy"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Layout główny */}
          <div className={styles.studyLayout}>
            {/* Panel filtrów */}
            <div className={styles.filtersPanel}>
              <StudyFilters
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAllFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Główna zawartość */}
            <div className={styles.contentPanel}>
              <StudyContent
                materials={filteredMaterials}
                viewMode={viewMode}
                isLoading={isLoading}
                searchTerm={searchTerm}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
