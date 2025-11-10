
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardsBrowser.module.css';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // 🔒 PRZYKŁADOWE ZESTAWY FISZEK
  const mockDecks: FlashcardDeck[] = [
    {
      id: 1,
      title: 'Basic English Vocabulary',
      description: 'Essential English words for beginners',
      cardCount: 150,
      studyCount: 1243,
      lastStudied: '2 dni temu',
      difficulty: 'Łatwe',
      category: 'Vocabulary',
      isCreatedByUser: false,
      creator: 'English Academy',
      emoji: '🇬🇧',
      estimatedTime: '15-20 min',
      tags: ['vocabulary', 'beginner', 'english'],
      progress: 67,
      masteredCards: 45,
      reviewingCards: 32,
      learningCards: 28,
      newCards: 45
    },
    {
      id: 2,
      title: 'Present Simple Tenses',
      description: 'Practice present simple forms and usage',
      cardCount: 85,
      studyCount: 892,
      lastStudied: '5 godzin temu',
      difficulty: 'Średnie',
      category: 'Grammar',
      isCreatedByUser: true,
      creator: 'Ty',
      emoji: '⏰',
      estimatedTime: '10-15 min',
      tags: ['grammar', 'present-simple', 'tenses'],
      progress: 34,
      masteredCards: 12,
      reviewingCards: 18,
      learningCards: 25,
      newCards: 30
    },
    {
      id: 3,
      title: 'Business English Phrases',
      description: 'Professional English for workplace',
      cardCount: 220,
      studyCount: 634,
      lastStudied: null,
      difficulty: 'Trudne',
      category: 'Business',
      isCreatedByUser: false,
      creator: 'Business Pro',
      emoji: '💼',
      estimatedTime: '25-30 min',
      tags: ['business', 'professional', 'phrases'],
      progress: 0,
      masteredCards: 0,
      reviewingCards: 0,
      learningCards: 0,
      newCards: 220
    }
  ];

  const categories = ['all', 'Vocabulary', 'Grammar', 'Business', 'Conversation'];
  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  // 🔍 FILTROWANIE
  const filteredDecks = mockDecks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || deck.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || deck.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // 📊 SORTOWANIE
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

  const getDifficultyColor = (difficulty: FlashcardDeck['difficulty']): string => {
    switch (difficulty) {
      case 'Łatwe': return 'var(--secondary-green)';
      case 'Średnie': return 'var(--secondary-amber)';
      case 'Trudne': return 'var(--secondary-red)';
      default: return 'var(--neutral-500)';
    }
  };

  const formatStudyCount = (count: number): string => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* 🎯 HEADER */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🗂️</span>
                Fiszki
              </h1>
              <p className={styles.pageDescription}>
                Wybierz zestaw fiszek do nauki lub utwórz własny
              </p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/flashcards/create" className={styles.createBtn}>
                <span className={styles.createIcon}>➕</span>
                Utwórz zestaw
              </Link>
            </div>
          </div>

          {/* 🔍 SEARCH & FILTERS */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Szukaj zestawów fiszek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Kategoria:</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  {categories.map(cat => (
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
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className={styles.filterSelect}
                >
                  {difficulties.map(diff => (
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

          {/* 📊 RESULTS STATS */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              Znaleziono <strong>{sortedDecks.length}</strong> zestawów
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

          {/* 📚 DECKS GRID */}
          <div className={styles.decksGrid}>
            {sortedDecks.map((deck, index) => (
              <div 
                key={deck.id} 
                className={styles.deckCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* 🎨 DECK HEADER */}
                <div className={styles.deckHeader}>
                  <div className={styles.deckIcon}>
                    {deck.emoji}
                  </div>
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

                {/* 📝 DECK CONTENT */}
                <div className={styles.deckContent}>
                  <h3 className={styles.deckTitle}>
                    {deck.title}
                  </h3>
                  <p className={styles.deckDescription}>
                    {deck.description}
                  </p>

                  {/* 📊 DECK STATS */}
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

                  {/* 🏷️ TAGS */}
                  <div className={styles.deckTags}>
                    {deck.tags.slice(0, 3).map(tag => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 📈 PROGRESS SECTION */}
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
                    
                    {/* 📊 CARD BREAKDOWN */}
                    <div className={styles.cardBreakdown}>
                      <div className={styles.cardStat}>
                        <div className={`${styles.cardDot} ${styles.mastered}`}></div>
                        <span>{deck.masteredCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div className={`${styles.cardDot} ${styles.reviewing}`}></div>
                        <span>{deck.reviewingCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div className={`${styles.cardDot} ${styles.learning}`}></div>
                        <span>{deck.learningCards}</span>
                      </div>
                      <div className={styles.cardStat}>
                        <div className={`${styles.cardDot} ${styles.new}`}></div>
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
                  
                  <Link 
                    href={`/flashcards/${deck.id}/preview`}
                    className={`${styles.actionBtn} ${styles.preview}`}
                  >
                    <span className={styles.actionIcon}>👁️</span>
                    Podgląd
                  </Link>
                  
                  {deck.isCreatedByUser && (
                    <Link 
                      href={`/flashcards/${deck.id}/edit`}
                      className={`${styles.actionBtn} ${styles.edit}`}
                    >
                      <span className={styles.actionIcon}>✏️</span>
                      Edytuj
                    </Link>
                  )}
                </div>

                {/* 🕒 LAST STUDIED */}
                {deck.lastStudied && (
                  <div className={styles.lastStudied}>
                    <span className={styles.lastStudiedIcon}>🕒</span>
                    Ostatnio: {deck.lastStudied}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* ❌ EMPTY STATE */}
          {sortedDecks.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>Brak zestawów</div>
              <div className={styles.emptyDescription}>
                Nie znaleziono zestawów pasujących do Twoich kryteriów
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

          {/* 📊 BOTTOM STATS */}
          <div className={styles.bottomStats}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {mockDecks.reduce((sum, deck) => sum + deck.cardCount, 0)}
              </div>
              <div className={styles.statLabel}>Dostępne karty</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {mockDecks.filter(d => d.isCreatedByUser).length}
              </div>
              <div className={styles.statLabel}>Twoje zestawy</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {mockDecks.filter(d => d.progress > 0).length}
              </div>
              <div className={styles.statLabel}>W trakcie nauki</div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
