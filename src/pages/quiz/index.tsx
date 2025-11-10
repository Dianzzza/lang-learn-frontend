// pages/quiz/index.tsx
// PRZEGLĄDARKA QUIZÓW - różne rodzaje quizów do nauki

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/QuizBrowser.module.css';

interface Quiz {
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

export default function QuizBrowser() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const quizTypes = [
    { value: 'all', label: 'Wszystkie', icon: '🎯' },
    { value: 'vocabulary', label: 'Słownictwo', icon: '📚' },
    { value: 'grammar', label: 'Gramatyka', icon: '📝' },
    { value: 'listening', label: 'Słuchanie', icon: '🎧' },
    { value: 'reading', label: 'Czytanie', icon: '📖' },
    { value: 'mixed', label: 'Mieszane', icon: '🎲' }
  ];

  const difficulties = ['all', 'Łatwe', 'Średnie', 'Trudne'];

  // 🔒 PRZYKŁADOWE QUIZY
  const mockQuizzes: Quiz[] = [
    {
      id: 1,
      title: 'Present Simple vs Present Continuous',
      description: 'Test your knowledge of present tenses',
      type: 'grammar',
      difficulty: 'Średnie',
      questionsCount: 15,
      timeLimit: 10,
      completions: 1847,
      averageScore: 78,
      category: 'Tenses',
      tags: ['present-simple', 'present-continuous', 'tenses'],
      emoji: '⏰',
      hasTimer: true,
      hasHints: true,
      questionTypes: ['Multiple Choice', 'Gap Fill', 'Sentence Transform'],
      estimatedTime: '8-12 min',
      lastAttempt: '2 dni temu',
      bestScore: 87,
      attempts: 3
    },
    {
      id: 2,
      title: 'Business English Vocabulary',
      description: 'Professional vocabulary for workplace',
      type: 'vocabulary',
      difficulty: 'Trudne',
      questionsCount: 20,
      timeLimit: 15,
      completions: 923,
      averageScore: 65,
      category: 'Business',
      tags: ['business', 'professional', 'workplace'],
      emoji: '💼',
      hasTimer: true,
      hasHints: false,
      questionTypes: ['Multiple Choice', 'Matching', 'Definition'],
      estimatedTime: '12-18 min',
      attempts: 0
    },
    {
      id: 3,
      title: 'Daily Conversations Quiz',
      description: 'Common phrases for everyday situations',
      type: 'listening',
      difficulty: 'Łatwe',
      questionsCount: 12,
      timeLimit: 8,
      completions: 2156,
      averageScore: 83,
      category: 'Conversation',
      tags: ['daily', 'conversation', 'listening'],
      emoji: '🗣️',
      hasTimer: false,
      hasHints: true,
      questionTypes: ['Audio Multiple Choice', 'Listen & Choose'],
      estimatedTime: '6-10 min',
      lastAttempt: '1 tydzień temu',
      bestScore: 92,
      attempts: 5
    }
  ];

  // 🔍 FILTROWANIE
  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || quiz.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

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
          
          {/* 🎯 HEADER */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>
                <span className={styles.titleIcon}>🧠</span>
                Quizy
              </h1>
              <p className={styles.pageDescription}>
                Sprawdź swoją wiedzę z różnych obszarów języka angielskiego
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
              {quizTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`${styles.typeBtn} ${selectedType === type.value ? styles.active : ''}`}
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
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff === 'all' ? 'Wszystkie' : diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🎲 QUIZZES GRID */}
          <div className={styles.quizzesGrid}>
            {filteredQuizzes.map((quiz, index) => (
              <div 
                key={quiz.id} 
                className={styles.quizCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* 🎨 QUIZ HEADER */}
                <div className={styles.quizHeader}>
                  <div className={styles.quizIcon}>
                    {quiz.emoji}
                  </div>
                  <div className={styles.quizMeta}>
                    <div className={styles.quizType}>
                      {quizTypes.find(t => t.value === quiz.type)?.label}
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
                  <h3 className={styles.quizTitle}>
                    {quiz.title}
                  </h3>
                  <p className={styles.quizDescription}>
                    {quiz.description}
                  </p>

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
                      {quiz.questionTypes.map(type => (
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

                {/* 📈 PERSONAL PROGRESS */}
                {quiz.attempts > 0 && (
                  <div className={styles.personalProgress}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Twój postęp:</span>
                      <span className={styles.bestScore}>Najlepszy: {quiz.bestScore}%</span>
                    </div>
                    <div className={styles.progressInfo}>
                      <span>Podejść: {quiz.attempts}</span>
                      <span>Ostatnio: {quiz.lastAttempt}</span>
                    </div>
                  </div>
                )}

                {/* 🎮 QUIZ ACTIONS */}
                <div className={styles.quizActions}>
                  <Link 
                    href={`/quiz/${quiz.id}`}
                    className={`${styles.actionBtn} ${styles.start}`}
                  >
                    <span className={styles.actionIcon}>🚀</span>
                    {quiz.attempts > 0 ? 'Spróbuj ponownie' : 'Rozpocznij quiz'}
                  </Link>
                  
                  <Link 
                    href={`/quiz/${quiz.id}/preview`}
                    className={`${styles.actionBtn} ${styles.preview}`}
                  >
                    <span className={styles.actionIcon}>👁️</span>
                    Podgląd
                  </Link>
                </div>

              </div>
            ))}
          </div>

          {/* ❌ EMPTY STATE */}
          {filteredQuizzes.length === 0 && (
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
