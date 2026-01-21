/**
 * @file StudyPage.tsx
 * @brief Główny widok katalogu materiałów edukacyjnych (Strona "Nauka").
 *
 * Komponent ten pełni rolę "Smart Component" (Kontrolera). Odpowiada za:
 * 1. Przechowywanie stanu surowych danych (obecnie Mock Data).
 * 2. Zarządzanie stanem filtrów, wyszukiwania i sortowania.
 * 3. Logikę przetwarzania danych w czasie rzeczywistym (useEffect).
 * 4. Przekazywanie przetworzonych danych do komponentów prezentacyjnych (Search, Filters, Content).
 */

'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import StudyFilters from './StudyFilters';
import StudySearch from './StudySearch';
import StudyContent from './StudyContent'; // Uwaga: W poprzednim kroku StudyContent przyjmował listę, tutaj jest mapowany pojedynczo.
import StudyProgress from './StudyProgress';
import styles from '@/styles/StudyPage.module.css';

/**
 * Interfejs reprezentujący pełny model danych materiału edukacyjnego.
 */
interface StudyMaterial {
  id: number;
  name: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  type: string;
  status: string;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  duration: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastStudied: string | null;
  rating: number;
  studentsCount: number;
  isLocked: boolean;
  isFavorite: boolean;
  thumbnail: string;
}

/**
 * Interfejs stanu filtrów. Każdy klucz to kategoria filtra,
 * a wartość to tablica wybranych opcji (multiselect).
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
 * Główny komponent strony StudyPage.
 */
export default function StudyPage(): JSX.Element {
  // --- STANY ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Stan przechowujący aktywne filtry dla każdej kategorii
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    levels: [],
    categories: [],
    types: [],
    status: [],
    difficulty: [],
    duration: []
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'level' | 'recent'>('name');
  
  // Stan przechowujący wynikową listę materiałów po filtracji
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- DANE (MOCK) ---
  // W przyszłości te dane będą pobierane z API w useEffect lub getServerSideProps
  const studyMaterials: StudyMaterial[] = [
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
    // ... (reszta danych mockowych)
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
    },
    {
      id: 3,
      name: 'Kolory i kształty',
      description: 'Podstawowe słownictwo dotyczące kolorów i kształtów',
      level: 'A1',
      category: 'Słownictwo',
      type: 'Fiszki',
      status: 'Nowe',
      difficulty: 'Łatwe',
      duration: '< 5 min',
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      lastStudied: null,
      rating: 4.7,
      studentsCount: 890,
      isLocked: false,
      isFavorite: false,
      thumbnail: '🎨'
    },
    {
      id: 4,
      name: 'Past Continuous',
      description: 'Czas przeszły ciągły - zastosowanie i budowa',
      level: 'A2',
      category: 'Gramatyka',
      type: 'Quiz',
      status: 'W trakcie',
      difficulty: 'Średnie',
      duration: '15-30 min',
      progress: 45,
      totalLessons: 10,
      completedLessons: 4,
      lastStudied: '2025-10-19',
      rating: 4.6,
      studentsCount: 750,
      isLocked: false,
      isFavorite: true,
      thumbnail: '⏰'
    },
    {
      id: 5,
      name: 'Phrasal Verbs - Business',
      description: 'Czasowniki frazowe w kontekście biznesowym',
      level: 'B1',
      category: 'Słownictwo',
      type: 'Testy',
      status: 'Do powtórki',
      difficulty: 'Trudne',
      duration: '> 30 min',
      progress: 78,
      totalLessons: 15,
      completedLessons: 12,
      lastStudied: '2025-10-15',
      rating: 4.5,
      studentsCount: 420,
      isLocked: false,
      isFavorite: false,
      thumbnail: '💼'
    },
    {
      id: 6,
      name: 'Advanced Conversations',
      description: 'Zaawansowane rozmowy na różne tematy',
      level: 'C1',
      category: 'Konwersacje',
      type: 'Dialogi',
      status: 'Nowe',
      difficulty: 'Trudne',
      duration: '> 30 min',
      progress: 0,
      totalLessons: 20,
      completedLessons: 0,
      lastStudied: null,
      rating: 4.9,
      studentsCount: 180,
      isLocked: true,
      isFavorite: false,
      thumbnail: '🗣️'
    }
  ];

  // --- LOGIKA FILTROWANIA I SORTOWANIA ---
  /**
   * Efekt uboczny, który uruchamia się przy każdej zmianie:
   * - searchTerm (wyszukiwanie)
   * - activeFilters (filtry boczne)
   * - sortBy (kolejność)
   * * Tworzy nową tablicę `filtered`, przepuszczając ją przez kolejne "sita" warunków.
   */
  useEffect(() => {
    let filtered = [...studyMaterials];

    // 1. Wyszukiwanie tekstowe (Nazwa lub Opis)
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filtry kategorialne (Multiselect - OR wewnątrz kategorii, AND pomiędzy kategoriami)
    
    // Poziom
    if (activeFilters.levels.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.levels.includes(material.level)
      );
    }

    // Kategoria
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.categories.includes(material.category)
      );
    }

    // Typ
    if (activeFilters.types.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.types.includes(material.type)
      );
    }

    // Status
    if (activeFilters.status.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.status.includes(material.status)
      );
    }

    // Trudność
    if (activeFilters.difficulty.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.difficulty.includes(material.difficulty)
      );
    }

    // Czas trwania
    if (activeFilters.duration.length > 0) {
      filtered = filtered.filter(material =>
        activeFilters.duration.includes(material.duration)
      );
    }

    // 3. Sortowanie wyników
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress; // Malejąco
        case 'level':
          // Definicja kolejności poziomów CEFR
          const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
        case 'recent':
          // Sortowanie po dacie (z obsługą null)
          if (!a.lastStudied && !b.lastStudied) return 0;
          if (!a.lastStudied) return 1;
          if (!b.lastStudied) return -1;
          return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
        default:
          return 0;
      }
    });

    setFilteredMaterials(filtered);
  }, [searchTerm, activeFilters, sortBy]);

  // --- HANDLERY ---

  /**
   * Obsługuje zmianę stanu konkretnego filtra.
   * Działa na zasadzie toggle (dodaj jeśli nie ma, usuń jeśli jest).
   */
  const handleFilterChange = (filterType: keyof ActiveFilters, value: string): void => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value) // Usuń
        : [...prev[filterType], value] // Dodaj
    }));
  };

  /** Resetuje wszystkie filtry i wyszukiwarkę. */
  const clearAllFilters = (): void => {
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

  /** Oblicza łączną liczbę aktywnych filtrów (do wyświetlenia na przycisku). */
  const activeFilterCount: number = Object.values(activeFilters).reduce(
    (count, filters) => count + filters.length,
    0
  );

  return (
    <>
      <Head>
        <title>Nauka - Lang Learn</title>
        <meta name="description" content="Wybierz materiały i kontynuuj swoją naukę" />
      </Head>

      <Header />

      <main className={styles.studyPage}>
        <div className={styles.container}>
          {/* Sekcja Hero / Header */}
          <div className={styles.header}>
            <h1>📚 Nauka</h1>
            <p>Wybierz materiały i kontynuuj swoją naukę</p>
          </div>

          {/* Komponent wyszukiwania */}
          <StudySearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className={styles.mainContent}>
            {/* Panel boczny z filtrami */}
            <aside className={styles.sidebar}>
              <StudyFilters
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAllFilters} // Poprawiono nazwę propa (zgodnie z interfejsem StudyFilters)
                activeFilterCount={activeFilterCount}
              />
            </aside>

            {/* Główna sekcja z wynikami */}
            <section className={styles.content}>
              {/* Pasek narzędziowy: Widok i Sortowanie */}
              <div className={styles.controls}>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Widok siatki"
                  >
                    ⊞
                  </button>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Widok listy"
                  >
                    ☰
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'level' | 'recent')}
                  className={styles.sortSelect}
                >
                  <option value="name">Sortuj: Nazwa</option>
                  <option value="progress">Sortuj: Postęp</option>
                  <option value="level">Sortuj: Poziom</option>
                  <option value="recent">Sortuj: Ostatnio</option>
                </select>
              </div>

              {/* Lista wyników */}
              <div className={`${styles.materialsContainer} ${styles[viewMode]}`}>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    // Renderowanie pojedynczego materiału.
                    // Uwaga: Jeśli StudyContent jest listą, tutaj powinniśmy użyć StudyCard,
                    // lub przekazać całą tablicę do StudyContent raz.
                    // Zakładam, że w tym kontekście StudyContent działa jako wrapper na kartę.
                    <StudyContent key={material.id} materials={[material]} viewMode={viewMode} isLoading={false} searchTerm={""} activeFilterCount={0} />
                  ))
                ) : (
                  // Stan pusty wewnątrz kontenera wyników
                  <div className={styles.emptyState}>
                    <p>Brak materiałów pasujących do Twoich kryteriów</p>
                    <button onClick={clearAllFilters} className={styles.clearBtn}>
                      Wyczyść filtry
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sekcja podsumowania postępu (widoczna tylko gdy są wyniki) */}
          {filteredMaterials.length > 0 && (
            <StudyProgress materials={filteredMaterials} />
          )}
        </div>
      </main>
    </>
  );
}