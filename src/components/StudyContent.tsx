/**
 * @file StudyContent.tsx
 * @brief Główny kontener wyświetlający listę materiałów edukacyjnych.
 *
 * Komponent ten odpowiada za prezentację danych w zależności od ich stanu:
 * 1. Ładowanie (Spinner).
 * 2. Brak wyników (Pusty stan z kontekstem wyszukiwania/filtrów).
 * 3. Lista wyników (Grid lub Lista kart).
 */

'use client';

import StudyCard from './StudyCard';
import styles from '../styles/StudyContent.module.css';

/**
 * Interfejs reprezentujący pojedynczy materiał edukacyjny.
 * Zawiera wszystkie dane potrzebne do wyrenderowania karty `StudyCard`.
 */
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

/**
 * Właściwości (Props) komponentu StudyContent.
 */
interface StudyContentProps {
  /** Lista materiałów do wyświetlenia */
  materials: Material[];
  /** Tryb wyświetlania: siatka (kafelki) lub lista */
  viewMode: 'grid' | 'list';
  /** Flaga sterująca widocznością spinnera ładowania */
  isLoading: boolean;
  /** Aktualnie wpisana fraza wyszukiwania (używana w Empty State) */
  searchTerm: string;
  /** Liczba aktywnych filtrów (używana w Empty State) */
  activeFilterCount: number;
}

/**
 * Komponent StudyContent.
 *
 * @param {StudyContentProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Odpowiedni widok w zależności od stanu danych.
 */
export default function StudyContent({ materials, viewMode, isLoading, searchTerm, activeFilterCount }: StudyContentProps) {
  
  // --- STAN 1: ŁADOWANIE ---
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

  // --- STAN 2: BRAK WYNIKÓW (EMPTY STATE) ---
  if (materials.length === 0) {
    // Sprawdzamy, czy brak wyników wynika z filtrów/wyszukiwania, czy po prostu baza jest pusta
    const isFiltered = searchTerm || activeFilterCount > 0;

    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}></div>
          <h3 className={styles.emptyTitle}>
            {isFiltered ? 'Nie znaleziono materiałów' : 'Brak dostępnych materiałów'}
          </h3>
          <p className={styles.emptyDescription}>
            {isFiltered ? 
              `Spróbuj zmienić kryteria wyszukiwania lub wyczyścić filtry.` : 
              'Dodaj nowe materiały do nauki lub skontaktuj się z administratorem.'
            }
          </p>
          
          {/* Wyświetlenie podsumowania, dlaczego lista jest pusta (tylko przy filtrowaniu) */}
          {isFiltered && (
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

  // --- STAN 3: LISTA MATERIAŁÓW (CONTENT) ---
  return (
    <div className={styles.container}>
      {/* Nagłówek wyników z licznikiem */}
      <div className={styles.resultsHeader}>
        <div className={styles.resultsCount}>
          <span className={styles.countNumber}>{materials.length}</span>
          <span className={styles.countText}>
            {/* Prosta odmiana przez przypadki dla języka polskiego */}
            {materials.length === 1 ? 'materiał' : 
             materials.length < 5 ? 'materiały' : 'materiałów'}
          </span>
          {(searchTerm || activeFilterCount > 0) && (
            <span className={styles.filteredText}>
              (przefiltrowane)
            </span>
          )}
        </div>

        {/* Przyciski szybkich akcji dla całej listy */}
        <div className={styles.quickActions}>
          <button className={styles.quickAction} title="Oznacz wszystkie jako ulubione">
            💝 Dodaj do ulubionych
          </button>
          <button className={styles.quickAction} title="Eksportuj listę">
            📤 Eksportuj
          </button>
        </div>
      </div>

      {/* Grid/Lista kart */}
      <div className={styles.materialsContent}>
        <div className={`${styles.materialsList} ${styles[viewMode]}`}>
          {materials.map((material, index) => (
            <StudyCard
              key={material.id}
              material={material}
              viewMode={viewMode}
              // Opóźnienie dla animacji kaskadowej (Staggered Animation)
              // Każda kolejna karta pojawia się 100ms później
              animationDelay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}