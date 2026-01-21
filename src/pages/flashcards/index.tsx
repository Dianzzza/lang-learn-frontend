/**
 * @file FlashcardsBrowser.tsx
 * @brief Główny widok przeglądarki zestawów fiszek (Katalog).
 *
 * Komponent ten odpowiada za:
 * 1. Pobranie listy dostępnych kategorii (tali) z API.
 * 2. Pobranie statystyk dla każdej kategorii (liczba kart, użytkowników) w oddzielnym przebiegu.
 * 3. Łączenie tych danych w obiekty `FlashcardDeck` prezentowane użytkownikowi.
 * 4. Obsługę filtrowania (wyszukiwanie, trudność) i sortowania po stronie klienta.
 * 5. Zarządzanie akcjami globalnymi zestawu (Start nauki, Reset postępu).
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardsBrowser.module.css';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/router';

/**
 * Podstawowa struktura kategorii z bazy danych.
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Statystyki pobierane z endpointu `/flashcards/stats`.
 */
interface DeckStats {
  totalCards: number;
  uniqueUsers: number;
}

/**
 * Rozszerzony interfejs zestawu (Deck), używany przez UI.
 * Łączy dane kategorii ze statystykami i metadanymi wizualnymi.
 */
interface FlashcardDeck {
  id: number;
  title: string;
  description: string;
  cardCount: number;
  studyCount: number;
  lastStudied: string | null;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  category: string;
  isCreatedByUser: boolean;
  creator: string;
  emoji: string;
  estimatedTime: string;
  tags: string[];
  progress: number; // 0-100%
  // Szczegółowe liczniki kart (Mastered/Review/Learning/New)
  masteredCards: number;
  reviewingCards: number;
  learningCards: number;
  newCards: number;
}

/**
 * Komponent FlashcardsBrowser.
 *
 * @returns {JSX.Element} Siatka dostępnych zestawów fiszek z filtrami.
 */
export default function FlashcardsBrowser() {
  const router = useRouter();
  
  // --- STANY UI I FILTRÓW ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // --- STANY DANYCH ---
  const [categories, setCategories] = useState<Category[]>([]);
  // Mapa przechowująca statystyki dla każdego ID kategorii
  const [deckStats, setDeckStats] = useState<Record<number, DeckStats>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Efekt 1: Pobranie listy kategorii.
   * Jest to pierwszy krok inicjalizacji widoku.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Pobranie tokena manualnie, ponieważ jesteśmy wewnątrz useEffect
        const token = localStorage.getItem('token');
        
        // Graceful exit dla niezalogowanych (pusty widok zamiast błędu)
        if (!token) {
           console.log("Użytkownik niezalogowany");
           setLoading(false);
           return;
        }

        const data = await apiRequest<Category[]>('/categories', 'GET', undefined, token);
        setCategories(data);
      } catch (err: any) {
        console.error("Błąd pobierania kategorii:", err);
        setError("Nie udało się załadować kategorii.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  /**
   * Efekt 2: Pobranie statystyk (Dopiero gdy mamy kategorie).
   * Wykonuje serię zapytań dla każdej kategorii, aby wzbogacić widok o liczniki.
   * UWAGA: Obecna implementacja wykonuje zapytania sekwencyjnie (loop).
   */
  useEffect(() => {
    const loadStats = async () => {
      if (categories.length === 0) return;

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const statsEntries: [number, DeckStats][] = [];

        for (const cat of categories) {
          try {
            const stats = await apiRequest<DeckStats>(
              `/flashcards/stats?categoryId=${cat.id}`,
              'GET',
              undefined,
              token || undefined
            );
            statsEntries.push([cat.id, stats]);
          } catch {
            // Ignorujemy błędy pojedynczych statystyk, aby nie blokować całego widoku
          }
        }

        // Konwersja tablicy krotek na mapę obiektów dla szybkiego dostępu O(1)
        const statsMap: Record<number, DeckStats> = {};
        for (const [id, stats] of statsEntries) {
          statsMap[id] = stats;
        }
        setDeckStats(statsMap);
      } catch (e) {
        console.error('Błąd ładowania statystyk fiszek:', e);
      }
    };

    loadStats();
  }, [categories]);

  /**
   * Transformacja danych: Category + Stats -> FlashcardDeck (Model UI).
   * Tworzy ostateczną strukturę danych do wyświetlenia.
   */
  const decks: FlashcardDeck[] = categories.map((cat) => {
    const stats = deckStats[cat.id];
    return {
      id: cat.id,
      title: cat.name,
      description: `Fiszki z kategorii: ${cat.name}`,
      cardCount: stats ? stats.totalCards : 0,
      studyCount: stats ? stats.uniqueUsers : 0,
      lastStudied: null,
      difficulty: 'Łatwe', // Placeholder (backend mógłby zwracać trudność)
      category: cat.name,
      isCreatedByUser: false,
      creator: 'System',
      emoji: '📚',
      estimatedTime: '5-10 min',
      tags: [cat.name.toLowerCase()],
      progress: 0, // Placeholder
      masteredCards: 0,
      reviewingCards: 0,
      learningCards: 0,
      newCards: 0,
    };
  });

  const categoryFilterOptions = ['all', ...categories.map((c) => c.name)];
  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  // --- LOGIKA FILTROWANIA (Client-Side) ---
  const filteredDecks = decks.filter((deck) => {
    const q = searchQuery.toLowerCase();
    
    // Wyszukiwanie pełnotekstowe (Tytuł, Opis, Tagi)
    const matchesSearch =
      deck.title.toLowerCase().includes(q) ||
      deck.description.toLowerCase().includes(q) ||
      deck.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || deck.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || deck.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // --- LOGIKA SORTOWANIA (Client-Side) ---
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.studyCount - a.studyCount;
      case 'newest': return b.id - a.id;
      case 'progress': return b.progress - a.progress;
      case 'alphabetical': return a.title.localeCompare(b.title);
      default: return 0;
    }
  });

  /**
   * Helper mapujący poziom trudności na zmienną CSS (kolor).
   */
  const getDifficultyColor = (difficulty: FlashcardDeck['difficulty']): string => {
    switch (difficulty) {
      case 'Łatwe': return 'var(--secondary-green)';
      case 'Średnie': return 'var(--secondary-amber)';
      case 'Trudne': return 'var(--secondary-red)';
      default: return 'var(--neutral-500)';
    }
  };

  /** Helper formatujący duże liczby (np. 1200 -> 1k). */
  const formatStudyCount = (count: number): string => {
    if (count >= 1000) return `${Math.floor(count / 1000)}k`;
    return count.toString();
  };

  /**
   * Obsługa resetowania postępu w danym zestawie.
   * Wymaga potwierdzenia (confirm) i wysyła żądanie POST do API.
   */
  const handleResetDeck = async (categoryId: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Musisz być zalogowany.');
      return;
    }
    if (!confirm('Na pewno zresetować ten zestaw?')) return;

    try {
      await apiRequest(
        '/flashcards/reset',
        'POST',
        { categoryId },
        token
      );
      alert('Zestaw został zresetowany. Wszystkie fiszki będą traktowane jako nowe.');
      // Opcjonalnie: Tutaj można dodać refetch danych
    } catch (e: any) {
      console.error('Błąd resetowania zestawu:', e);
      alert(e?.message ?? 'Nie udało się zresetować zestawu.');
    }
  };

  // --- RENDERY STANÓW ŁADOWANIA I BŁĘDÓW ---
  if (loading) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>Ładowanie kategorii...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>Błąd: {error}</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- GŁÓWNY RENDER ---
  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* HEADER SEKCJI */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🗂️</span>
                Fiszki
              </h1>
              <p className={styles.pageDescription}>
                Wybierz kategorię fiszek do nauki lub utwórz własny zestaw
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/flashcards/create" className={styles.createBtn}>
                <span className={styles.createIcon}>➕</span>
                Moje fiszki
              </Link>
            </div>
          </div>

          {/* PASEK WYSZUKIWANIA I FILTRÓW */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Szukaj kategorii / zestawów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filters}>
              {/* Selektor Kategorii */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Kategoria:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  {categoryFilterOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Wszystkie' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* ... pozostałe filtry (Trudność, Sortowanie) ... */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Poziom:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className={styles.filterSelect}
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff === 'all' ? 'Wszystkie' : diff}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sortuj:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="popular">Popularne</option>
                  <option value="newest">Najnowsze</option>
                  <option value="progress">Postęp</option>
                  <option value="alphabetical">Alfabetycznie</option>
                </select>
              </div>
            </div>
          </div>

          {/* NAGŁÓWEK WYNIKÓW */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              Znaleziono <strong>{sortedDecks.length}</strong> kategorii
            </div>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${styles.active}`}>
                <span>📋</span>
              </button>
              <button className={styles.viewBtn}>
                <span>📱</span>
              </button>
            </div>
          </div>

          {/* GRID ZESTAWÓW (DECKS) */}
          <div className={styles.decksGrid}>
            {sortedDecks.map((deck, index) => (
              <div
                key={deck.id}
                className={styles.deckCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* DECK HEADER: Ikona i Metadane */}
                <div className={styles.deckHeader}>
                  <div className={styles.deckIcon}>{deck.emoji}</div>
                  <div className={styles.deckMeta}>
                    <div className={styles.deckCreator}>
                      {deck.isCreatedByUser ? '👤 Twój zestaw' : `👥 ${deck.creator}`}
                    </div>
                    <div
                      className={styles.deckDifficulty}
                      style={{ color: getDifficultyColor(deck.difficulty) }}
                    >
                      {deck.difficulty}
                    </div>
                  </div>
                </div>

                {/* DECK CONTENT: Tytuł, Opis, Statystyki */}
                <div className={styles.deckContent}>
                  <h3 className={styles.deckTitle}>{deck.title}</h3>
                  <p className={styles.deckDescription}>{deck.description}</p>

                  <div className={styles.deckStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>🃏</span>
                      <span className={styles.statText}>{deck.cardCount} kart</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>👥</span>
                      <span className={styles.statText}>{formatStudyCount(deck.studyCount)} użytkowników</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>⏱️</span>
                      <span className={styles.statText}>{deck.estimatedTime}</span>
                    </div>
                  </div>

                  <div className={styles.deckTags}>
                    {deck.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* PROGRESS BAR (opcjonalny, jeśli progress > 0) */}
                {deck.progress > 0 && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Postęp:</span>
                      <span className={styles.progressPercent}>{deck.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${deck.progress}%` }}
                      ></div>
                    </div>
                    {/* Wizualizacja podziału kart (Mastered/Learning/etc.) */}
                    <div className={styles.cardBreakdown}>
                      {/* ... (Dots for breakdown) ... */}
                    </div>
                  </div>
                )}

                {/* AKCJE (Start, Reset) */}
                <div className={styles.deckActions}>
                  <Link
                    href={`/flashcards/${deck.id}/study`}
                    className={`${styles.actionBtn} ${styles.study}`}
                  >
                    <span className={styles.actionIcon}>🧠</span>
                    {deck.progress > 0 ? 'Kontynuuj' : 'Rozpocznij'}
                  </Link>

                  <button
                    className={`${styles.actionBtn} ${styles.edit}`}
                    onClick={() => handleResetDeck(deck.id)}
                  >
                    <span className={styles.actionIcon}>♻️</span>
                    Resetuj
                  </button>
                </div>

                {deck.lastStudied && (
                  <div className={styles.lastStudied}>
                    <span className={styles.lastStudiedIcon}>🕒</span>
                    Ostatnio: {deck.lastStudied}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {sortedDecks.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>Brak kategorii</div>
              <div className={styles.emptyDescription}>
                Nie znaleziono kategorii pasujących do Twoich kryteriów
              </div>
              <button
                className={styles.clearFiltersBtn}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Wyczyść filtry
              </button>
            </div>
          )}

          {/* PODSUMOWANIE NA DOLE */}
          <div className={styles.bottomStats}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{decks.length}</div>
              <div className={styles.statLabel}>Kategorie fiszek</div>
            </div>
            {/* ... Pozostałe statystyki ... */}
          </div>

        </div>
      </div>
    </Layout>
  );
}