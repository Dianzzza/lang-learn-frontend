// pages/quiz/index.tsx
// PRZEGLĄDARKA QUIZÓW - teraz z backendu (kategorie quizów)

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/QuizBrowser.module.css';
import { apiRequest } from '@/lib/api';

interface Quiz {
  id: number; // teraz to categoryId
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'mixed';
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  questionsCount: number;
  timeLimit: number; // minuty
  completions: number;
  averageScore: number;
  category: string;
  tags: string[];
  emoji: string;
  hasTimer: boolean;
  hasHints: boolean;
  questionTypes: string[];
  estimatedTime: string;
  lastAttempt?: string;
  bestScore?: number;
  attempts: number;
}

interface QuizCategoryDto {
  id: number;
  name: string;
  questionsCount: number;
}

export default function QuizBrowser() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState<QuizCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const quizTypes = [
    { value: 'all', label: 'Wszystkie', icon: '🎯' },
    { value: 'vocabulary', label: 'Słownictwo', icon: '📚' },
    { value: 'grammar', label: 'Gramatyka', icon: '📝' },
    { value: 'listening', label: 'Słuchanie', icon: '🎧' },
    { value: 'reading', label: 'Czytanie', icon: '📖' },
    { value: 'mixed', label: 'Mieszane', icon: '🎲' },
  ];

  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest<QuizCategoryDto[]>('/quizzes/categories', 'GET');
        setCategories(data);
      } catch (e) {
        console.error('Błąd ładowania kategorii quizów:', e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Mapujemy kategorie -> kafelki quizów (wizualnie jak wcześniej)
  const quizzes: Quiz[] = useMemo(() => {
    const emojiByName: Record<string, string> = {
      Fruits: '🍎',
      Animals: '🐶',
      Home: '🏠',
    };

    return categories.map((c) => ({
      id: c.id,
      title: c.name,
      description: `Uzupełnij brakujące słowo w zdaniu (podane po polsku).`,
      type: 'vocabulary',
      difficulty: 'Średnie', // realna trudność wybierana w sesji
      questionsCount: c.questionsCount,
      timeLimit: 10,
      completions: 0,
      averageScore: 0,
      category: c.name,
      tags: [c.name.toLowerCase()],
      emoji: emojiByName[c.name] || '🧠',
      hasTimer: false,
      hasHints: true,
      questionTypes: ['Multiple Choice'],
      estimatedTime: '5-10 min',
      attempts: 0,
    }));
  }, [categories]);

  // 🔍 FILTROWANIE
  const filteredQuizzes = quizzes.filter((quiz) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      quiz.title.toLowerCase().includes(q) ||
      quiz.description.toLowerCase().includes(q) ||
      quiz.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesType = selectedType === 'all' || quiz.type === selectedType;
    const matchesDifficulty =
      selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: Quiz['difficulty']) => {
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

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          {/* 🎯 HEADER */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🧠</span>
                Quizy
              </h1>
              <p className={styles.pageDescription}>
                Uzupełnij brakujące słowo (wybór A/B/C/D) na podstawie podpowiedzi po polsku
              </p>
            </div>
          </div>

          {/* 🔍 SEARCH & FILTERS */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Szukaj quizów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* 🏷️ TYPE FILTERS */}
            <div className={styles.typeFilters}>
              {quizTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`${styles.typeBtn} ${
                    selectedType === type.value ? styles.active : ''
                  }`}
                >
                  <span className={styles.typeIcon}>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>

            {/* 📊 DIFFICULTY FILTER */}
            <div className={styles.difficultyFilter}>
              <label className={styles.filterLabel}>Poziom trudności:</label>
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
          </div>

          {/* 🎲 QUIZZES GRID */}
          {loading ? (
            <div className={styles.quizzesGrid}>
              <div className={styles.quizCard}>
                <div className={styles.quizContent}>
                  <h3 className={styles.quizTitle}>Ładowanie...</h3>
                  <p className={styles.quizDescription}>Pobieranie kategorii quizów</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.quizzesGrid}>
              {filteredQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className={styles.quizCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 🎨 QUIZ HEADER */}
                  <div className={styles.quizHeader}>
                    <div className={styles.quizIcon}>{quiz.emoji}</div>
                    <div className={styles.quizMeta}>
                      <div className={styles.quizType}>
                        {quizTypes.find((t) => t.value === quiz.type)?.label}
                      </div>
                      <div
                        className={styles.quizDifficulty}
                        style={{ color: getDifficultyColor(quiz.difficulty) }}
                      >
                        {quiz.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* 📝 QUIZ CONTENT */}
                  <div className={styles.quizContent}>
                    <h3 className={styles.quizTitle}>{quiz.title}</h3>
                    <p className={styles.quizDescription}>{quiz.description}</p>

                    {/* 📊 QUIZ STATS */}
                    <div className={styles.quizStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>❓</span>
                        <span>{quiz.questionsCount} pytań</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>⏱️</span>
                        <span>{quiz.estimatedTime}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>👥</span>
                        <span>{quiz.completions} ukończeń</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>📊</span>
                        <span>Śr. wynik: {quiz.averageScore}%</span>
                      </div>
                    </div>

                    {/* 🎮 QUESTION TYPES */}
                    <div className={styles.questionTypes}>
                      <div className={styles.questionTypesLabel}>Rodzaje pytań:</div>
                      <div className={styles.questionTypesList}>
                        {quiz.questionTypes.map((type) => (
                          <span key={type} className={styles.questionType}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 🏷️ FEATURES */}
                    <div className={styles.quizFeatures}>
                      {quiz.hasTimer && <span className={styles.feature}>⏱️ Timer</span>}
                      {quiz.hasHints && <span className={styles.feature}>💡 Podpowiedzi</span>}
                    </div>
                  </div>

                  {/* 🎮 QUIZ ACTIONS */}
                  <div className={styles.quizActions}>
                    <Link
                      href={`/quiz/${quiz.id}`}
                      className={`${styles.actionBtn} ${styles.start}`}
                    >
                      <span className={styles.actionIcon}>🚀</span>
                      Rozpocznij
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ❌ EMPTY STATE */}
          {!loading && filteredQuizzes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>Brak quizów</div>
              <div className={styles.emptyDescription}>
                Nie znaleziono quizów pasujących do Twoich kryteriów
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
