'use client';

import StudyCard from './StudyCard';
import styles from '../styles/StudyContent.module.css';

// DODANE TYPESCRIPT TYPES
interface Material {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  difficulty: string;
  level: string;
  type: string;
  estimatedTime: number;
  lastStudied: string | null;
  isFavorite: boolean;
  tags: string[];
  icon: string;
}

interface StudyContentProps {
  materials: Material[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  searchTerm: string;
  activeFilterCount: number;
}

export default function StudyContent({ materials, viewMode, isLoading, searchTerm, activeFilterCount }: StudyContentProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Ładowanie materiałów...</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}></div>
          <h3 className={styles.emptyTitle}>
            {searchTerm || activeFilterCount > 0 ? 'Nie znaleziono materiałów' : 'Brak dostępnych materiałów'}
          </h3>
          <p className={styles.emptyDescription}>
            {searchTerm || activeFilterCount > 0 ? 
              `Spróbuj zmienić kryteria wyszukiwania lub wyczyścić filtry.` : 
              'Dodaj nowe materiały do nauki lub skontaktuj się z administratorem.'
            }
          </p>
          {(searchTerm || activeFilterCount > 0) && (
            <div className={styles.searchSummary}>
              {searchTerm && (
                <div className={styles.searchInfo}>
                  Szukane hasło: <strong>{searchTerm}</strong>
                </div>
              )}
              {activeFilterCount > 0 && (
                <div className={styles.filterInfo}>
                  Aktywne filtry: <strong>{activeFilterCount}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <div className={styles.resultsCount}>
          <span className={styles.countNumber}>{materials.length}</span>
          <span className={styles.countText}>
            {materials.length === 1 ? 'materiał' : 
             materials.length < 5 ? 'materiały' : 'materiałów'}
          </span>
          {(searchTerm || activeFilterCount > 0) && (
            <span className={styles.filteredText}>
              (przefiltrowane)
            </span>
          )}
        </div>

        <div className={styles.quickActions}>
          <button className={styles.quickAction} title="Oznacz wszystkie jako ulubione">
            💝 Dodaj do ulubionych
          </button>
          <button className={styles.quickAction} title="Eksportuj listę">
            📤 Eksportuj
          </button>
        </div>
      </div>

      {/* Materials List */}
      <div className={styles.materialsContent}>
        <div className={`${styles.materialsList} ${styles[viewMode]}`}>
          {materials.map((material, index) => (
            <StudyCard
              key={material.id}
              material={material}
              viewMode={viewMode}
              animationDelay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
