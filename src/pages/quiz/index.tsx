/**
 * @file QuizBrowser.tsx
 * @brief Przeglądarka kategorii quizów (Katalog).
 *
 * Komponent ten pełni rolę punktu wejścia do modułu Quizów.
 *
 * Kluczowe mechanizmy:
 * 1. **Pobieranie danych:** Pobiera listę kategorii (`/quizzes/categories`) z backendu.
 * 2. **Transformacja danych (Adapter):** W hooku `useMemo` następuje wzbogacenie surowych danych
 * z API (tylko ID i nazwa) o dane prezentacyjne (emoji, opisy, tagi) na potrzeby UI.
 * 3. **Filtrowanie:** Obsługa wyszukiwania i filtrowania po stronie klienta.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/QuizBrowser.module.css';
import { apiRequest } from '@/lib/api';

/**
 * Rozbudowany model Quizu na potrzeby interfejsu użytkownika.
 * Łączy dane z backendu (ID, nazwa) z danymi wizualnymi (emoji, kolory).
 */
interface Quiz {
  /** W tym kontekście ID quizu to ID kategorii z bazy danych */
  id: number;
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

/**
 * Prosty obiekt transferu danych (DTO) przychodzący z endpointu `/quizzes/categories`.
 */
interface QuizCategoryDto {
  id: number;
  name: string;
  questionsCount: number;
}

/**
 * Komponent QuizBrowser.
 *
 * @returns {JSX.Element} Siatka kafelków z kategoriami quizów.
 */
export default function QuizBrowser() {
  // --- STANY FILTRÓW ---
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- STANY DANYCH ---
  const [categories, setCategories] = useState<QuizCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Definicje statyczne dla filtrów
  const quizTypes = [
    { value: 'all', label: 'Wszystkie', icon: '🎯' },
    { value: 'vocabulary', label: 'Słownictwo', icon: '📚' },
    { value: 'grammar', label: 'Gramatyka', icon: '📝' },
    { value: 'listening', label: 'Słuchanie', icon: '🎧' },
    { value: 'reading', label: 'Czytanie', icon: '📖' },
    { value: 'mixed', label: 'Mieszane', icon: '🎲' },
  ];

  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  /**
   * Efekt inicjalizacji: Pobranie kategorii z API.
   */
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

  /**
   * Transformacja danych (Adapter Pattern).
   * Mapuje proste DTO kategorii na bogate obiekty `Quiz` wymagane przez UI.
   * Dodaje "szuczne" dane (mock data) tam, gdzie backend ich jeszcze nie dostarcza (np. emoji).
   */
  const quizzes: Quiz[] = useMemo(() => {
    const emojiByName: Record<string, string> = {
      Fruits: '🍎',
      Animals: '🐶',
      Home: '🏠',
      // Fallback emoji
    };

    return categories.map((c) => ({
      id: c.id,
      title: c.name,
      description: `Uzupełnij brakujące słowo w zdaniu (podane po polsku).`,
      type: 'vocabulary', // Domyślnie zakładamy, że to quizy słówkowe
      difficulty: 'Średnie', // Poziom trudności wybiera się dopiero po wejściu w quiz
      questionsCount: c.questionsCount,
      timeLimit: 10,
      completions: 0, // Placeholder
      averageScore: 0, // Placeholder
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

  // --- LOGIKA FILTROWANIA (Client-Side) ---
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

  /** Helper do kolorowania badge'y trudności. */
  const getDifficultyColor = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'Łatwe': return 'var(--secondary-green)';
      case 'Średnie': return 'var(--secondary-amber)';
      case 'Trudne': return 'var(--secondary-red)';
      default: return 'var(--neutral-500)';
    }
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* HEADER SEKCJI */}
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

          {/* PASEK WYSZUKIWANIA I FILTRÓW */}
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

            {/* Filtry Typu (Ikony) */}
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

            {/* Filtr Trudności */}
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

          {/* GRID WYNIKÓW */}
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
                  {/* Nagłówek Karty */}
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

                  {/* Treść Karty */}
                  <div className={styles.quizContent}>
                    <h3 className={styles.quizTitle}>{quiz.title}</h3>
                    <p className={styles.quizDescription}>{quiz.description}</p>

                    {/* Statystyki Quizu */}
                    <div className={styles.quizStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>❓</span>
                        <span>{quiz.questionsCount} pytań</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>⏱️</span>
                        <span>{quiz.estimatedTime}</span>
                      </div>
                      {/* Placeholdery na przyszłe statystyki */}
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>👥</span>
                        <span>{quiz.completions} ukończeń</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statIcon}>📊</span>
                        <span>Śr. wynik: {quiz.averageScore}%</span>
                      </div>
                    </div>

                    {/* Cechy Quizu (Tagi) */}
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

                    <div className={styles.quizFeatures}>
                      {quiz.hasTimer && <span className={styles.feature}>⏱️ Timer</span>}
                      {quiz.hasHints && <span className={styles.feature}>💡 Podpowiedzi</span>}
                    </div>
                  </div>

                  {/* Przycisk Akcji */}
                  <div className={styles.quizActions}>
                    <Link
                      // Przekazujemy ID kategorii do strony sesji quizowej
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

          {/* STAN PUSTY */}
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