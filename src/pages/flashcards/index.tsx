'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardsBrowser.module.css';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/router';

interface Category {
  id: number;
  name: string;
}

interface DeckStats {
  totalCards: number;
  uniqueUsers: number;
}

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
  masteredCards: number;
  reviewingCards: number;
  learningCards: number;
  newCards: number;
}

export default function FlashcardsBrowser() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const [categories, setCategories] = useState<Category[]>([]);
  const [deckStats, setDeckStats] = useState<Record<number, DeckStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Wczytaj kategorie z backendu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // 1. Pobieramy token z przeglądarki
        const token = localStorage.getItem('token');
        
        // Jeśli nie ma tokenu, to po prostu przerywamy (nie wyświetlamy brzydkiego błędu)
        if (!token) {
           console.log("Użytkownik niezalogowany");
           setLoading(false);
           return;
        }

        // 2. Przekazujemy token do funkcji apiRequest (to ta kluczowa zmiana)
        // apiRequest(url, metoda, body, token)
        const data = await apiRequest<Category[]>('/categories', 'GET', undefined, token);
        
        setCategories(data);
      } catch (err: any) {
        console.error("Błąd pobierania kategorii:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  // Wczytaj statystyki kart i użytkowników dla każdej kategorii
  useEffect(() => {
    const loadStats = async () => {
      if (categories.length === 0) return;

      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

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
            // jeśli dla danej kategorii się nie uda, pomijamy ją
          }
        }

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

  // Zamieniamy kategorie na „decki”
  const decks: FlashcardDeck[] = categories.map((cat) => {
    const stats = deckStats[cat.id];
    return {
      id: cat.id,
      title: cat.name,
      description: `Fiszki z kategorii: ${cat.name}`,
      cardCount: stats ? stats.totalCards : 0,
      studyCount: stats ? stats.uniqueUsers : 0,
      lastStudied: null,
      difficulty: 'Łatwe',
      category: cat.name,
      isCreatedByUser: false,
      creator: 'System',
      emoji: '📚',
      estimatedTime: '5-10 min', // zostawiamy stały opis czasu
      tags: [cat.name.toLowerCase()],
      progress: 0,
      masteredCards: 0,
      reviewingCards: 0,
      learningCards: 0,
      newCards: 0,
    };
  });

  const categoryFilterOptions = ['all', ...categories.map((c) => c.name)];
  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  // FILTROWANIE
  const filteredDecks = decks.filter((deck) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      deck.title.toLowerCase().includes(q) ||
      deck.description.toLowerCase().includes(q) ||
      deck.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'all' || deck.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      deck.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // SORTOWANIE
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.studyCount - a.studyCount;
      case 'newest':
        return b.id - a.id;
      case 'progress':
        return b.progress - a.progress;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (
    difficulty: FlashcardDeck['difficulty']
  ): string => {
    switch (difficulty) {
      case 'Łatwe':
        return 'var(--secondary-green)';
      case 'Średnie':
        return 'var(--secondary-amber)';
      case 'Trudne':
        return 'var(--secondary-red)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const formatStudyCount = (count: number): string => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  const handleResetDeck = async (categoryId: number) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;
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
      alert(
        'Zestaw został zresetowany. Wszystkie fiszki będą traktowane jako nowe.'
      );
    } catch (e: any) {
      console.error('Błąd resetowania zestawu:', e);
      alert(e?.message ?? 'Nie udało się zresetować zestawu.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>
                Ładowanie kategorii...
              </div>
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

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          {/* HEADER */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🗂️</span>
                Fiszki
              </h1>
              <p className={styles.pageDescription}>
                Wybierz kategorię fiszek do nauki lub utwórz własny
                zestaw
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link
                href="/flashcards/create"
                className={styles.createBtn}
              >
                <span className={styles.createIcon}>➕</span>
                Moje fiszki
              </Link>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
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
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Kategoria:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value)
                  }
                  className={styles.filterSelect}
                >
                  {categoryFilterOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Wszystkie' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Poziom:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) =>
                    setSelectedDifficulty(e.target.value)
                  }
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
                  <option value="alphabetical">
                    Alfabetycznie
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* RESULTS STATS */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              Znaleziono <strong>{sortedDecks.length}</strong>{' '}
              kategorii
            </div>
          </div>

          {/* DECKS GRID */}
          <div className={styles.decksGrid}>
            {sortedDecks.map((deck, index) => (
              <div
                key={deck.id}
                className={styles.deckCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* DECK HEADER */}
                <div className={styles.deckHeader}>
                  <div className={styles.deckIcon}>{deck.emoji}</div>
                  <div className={styles.deckMeta}>
                    <div className={styles.deckCreator}>
                      {deck.isCreatedByUser
                        ? '👤 Twój zestaw'
                        : `👥 ${deck.creator}`}
                    </div>
                    <div
                      className={styles.deckDifficulty}
                      style={{
                        color: getDifficultyColor(deck.difficulty),
                      }}
                    >
                      {deck.difficulty}
                    </div>
                  </div>
                </div>

                {/* DECK CONTENT */}
                <div className={styles.deckContent}>
                  <h3 className={styles.deckTitle}>{deck.title}</h3>
                  <p className={styles.deckDescription}>
                    {deck.description}
                  </p>

                  {/* DECK STATS */}
                  <div className={styles.deckStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>🃏</span>
                      <span className={styles.statText}>
                        {deck.cardCount} kart
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>👥</span>
                      <span className={styles.statText}>
                        {formatStudyCount(deck.studyCount)} użytkowników
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>⏱️</span>
                      <span className={styles.statText}>
                        {deck.estimatedTime}
                      </span>
                    </div>
                  </div>

                  {/* TAGS */}
                  <div className={styles.deckTags}>
                    {deck.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PROGRESS SECTION */}
                {deck.progress > 0 && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>
                        Postęp:
                      </span>
                      <span className={styles.progressPercent}>
                        {deck.progress}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${deck.progress}%` }}
                      ></div>
                    </div>

                    <div className={styles.cardBreakdown}>
                      <div className={styles.cardStat}>
                        <div
                          className={`${styles.cardDot} ${styles.mastered}`}
                        ></div>
                        <span>{deck.masteredCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div
                          className={`${styles.cardDot} ${styles.reviewing}`}
                        ></div>
                        <span>{deck.reviewingCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div
                          className={`${styles.cardDot} ${styles.learning}`}
                        ></div>
                        <span>{deck.learningCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div
                          className={`${styles.cardDot} ${styles.new}`}
                        ></div>
                        <span>{deck.newCards}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎮 DECK ACTIONS */}
                <div className={styles.deckActions}>
                  <Link
                    href={`/flashcards/${deck.id}/study`}
                    className={`${styles.actionBtn} ${styles.study}`}
                  >
                    <span className={styles.actionIcon}>🧠</span>
                    {deck.progress > 0 ? 'Kontynuuj' : 'Rozpocznij'}
                  </Link>

                  {/* Podgląd na razie wyłączony */}

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
        </div>
      </div>
    </Layout>
  );
}
