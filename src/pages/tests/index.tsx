// pages/tests/index.tsx
// FORMALNE TESTY - jak egzaminy Cambridge

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/TestBrowser.module.css';

interface LanguageTest {
  id: number;
  title: string;
  description: string;
  type: 'placement' | 'achievement' | 'diagnostic' | 'proficiency' | 'mock-exam';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Mixed';
  duration: number; // minuty
  sectionsCount: number;
  questionsCount: number;
  skills: ('reading' | 'writing' | 'listening' | 'speaking' | 'use-of-english')[];
  passingScore: number;
  attempts: number;
  lastAttempt?: string;
  bestScore?: number;
  averageScore: number;
  completions: number;
  certification?: string;
  isOfficial: boolean;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  emoji: string;
}

export default function TestBrowser() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const testTypes = [
    { value: 'all', label: 'Wszystkie', icon: '📋' },
    { value: 'placement', label: 'Test poziomujący', icon: '📏' },
    { value: 'achievement', label: 'Test osiągnięć', icon: '🎯' },
    { value: 'diagnostic', label: 'Test diagnostyczny', icon: '🔍' },
    { value: 'proficiency', label: 'Test biegłości', icon: '🏆' },
    { value: 'mock-exam', label: 'Egzamin próbny', icon: '📝' }
  ];

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mixed'];

  // 🔒 PRZYKŁADOWE TESTY
  const mockTests: LanguageTest[] = [
    {
      id: 1,
      title: 'Cambridge B2 First Mock Exam',
      description: 'Pełny egzamin próbny FCE z wszystkimi sekcjami',
      type: 'mock-exam',
      level: 'B2',
      duration: 180, // 3 godziny
      sectionsCount: 4,
      questionsCount: 85,
      skills: ['reading', 'writing', 'listening', 'use-of-english'],
      passingScore: 60,
      attempts: 0,
      averageScore: 72,
      completions: 1247,
      certification: 'Cambridge Assessment English',
      isOfficial: true,
      difficulty: 'Trudne',
      emoji: '🎓'
    },
    {
      id: 2,
      title: 'General English Placement Test',
      description: 'Określ swój poziom znajomości języka angielskiego',
      type: 'placement',
      level: 'Mixed',
      duration: 45,
      sectionsCount: 3,
      questionsCount: 50,
      skills: ['reading', 'listening', 'use-of-english'],
      passingScore: 0,
      attempts: 1,
      lastAttempt: '1 miesiąc temu',
      bestScore: 76,
      averageScore: 68,
      completions: 3421,
      isOfficial: false,
      difficulty: 'Średnie',
      emoji: '📏'
    },
    {
      id: 3,
      title: 'IELTS Academic Practice Test',
      description: 'Przygotowanie do egzaminu IELTS Academic',
      type: 'proficiency',
      level: 'C1',
      duration: 165, // 2h 45min
      sectionsCount: 4,
      questionsCount: 70,
      skills: ['reading', 'writing', 'listening', 'speaking'],
      passingScore: 65,
      attempts: 0,
      averageScore: 79,
      completions: 892,
      certification: 'IELTS Official',
      isOfficial: true,
      difficulty: 'Trudne',
      emoji: '🌍'
    }
  ];

  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || test.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || test.level === selectedLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* 🎯 HEADER */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>📝</span>
              Testy
            </h1>
            <p className={styles.pageDescription}>
              Formalne testy i egzaminy próbne do oceny Twoich umiejętności
            </p>
          </div>

          {/* 🔍 FILTERS */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Szukaj testów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterRow}>
              <div className={styles.typeFilters}>
                {testTypes.map(type => (
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

              <div className={styles.levelFilter}>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className={styles.levelSelect}
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'Wszystkie poziomy' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 📝 TESTS GRID */}
          <div className={styles.testsGrid}>
            {filteredTests.map((test, index) => (
              <div 
                key={test.id} 
                className={styles.testCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* 🎨 TEST HEADER */}
                <div className={styles.testHeader}>
                  <div className={styles.testIcon}>
                    {test.emoji}
                  </div>
                  <div className={styles.testMeta}>
                    {test.isOfficial && (
                      <div className={styles.officialBadge}>
                        <span className={styles.officialIcon}>✅</span>
                        Oficjalny
                      </div>
                    )}
                    <div className={styles.testLevel}>
                      {test.level}
                    </div>
                  </div>
                </div>

                {/* 📝 TEST CONTENT */}
                <div className={styles.testContent}>
                  <h3 className={styles.testTitle}>
                    {test.title}
                  </h3>
                  <p className={styles.testDescription}>
                    {test.description}
                  </p>

                  {/* 📊 TEST SPECS */}
                  <div className={styles.testSpecs}>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>⏱️</span>
                      <span>{test.duration} min</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>❓</span>
                      <span>{test.questionsCount} pytań</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>📑</span>
                      <span>{test.sectionsCount} sekcji</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>🎯</span>
                      <span>Min: {test.passingScore}%</span>
                    </div>
                  </div>

                  {/* 🎯 SKILLS TESTED */}
                  <div className={styles.skillsTested}>
                    <div className={styles.skillsLabel}>Testowane umiejętności:</div>
                    <div className={styles.skillsList}>
                      {test.skills.map(skill => (
                        <span key={skill} className={styles.skillBadge}>
                          {skill === 'reading' && '📖 Reading'}
                          {skill === 'writing' && '✍️ Writing'}
                          {skill === 'listening' && '🎧 Listening'}
                          {skill === 'speaking' && '🗣️ Speaking'}
                          {skill === 'use-of-english' && '📝 Use of English'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {test.certification && (
                    <div className={styles.certification}>
                      <span className={styles.certIcon}>🏆</span>
                      {test.certification}
                    </div>
                  )}
                </div>

                {/* 📈 PERSONAL RESULTS */}
                {test.attempts > 0 && (
                  <div className={styles.personalResults}>
                    <div className={styles.resultsHeader}>
                      <span>Twoje wyniki:</span>
                      <span className={styles.bestResult}>
                        Najlepszy: {test.bestScore}%
                      </span>
                    </div>
                    <div className={styles.resultsInfo}>
                      <span>Podejść: {test.attempts}</span>
                      <span>Ostatnio: {test.lastAttempt}</span>
                    </div>
                  </div>
                )}

                {/* 🎮 TEST ACTIONS */}
                <div className={styles.testActions}>
                  <Link 
                    href={`/tests/${test.id}`}
                    className={`${styles.actionBtn} ${styles.start}`}
                  >
                    <span className={styles.actionIcon}>🚀</span>
                    {test.attempts > 0 ? 'Powtórz test' : 'Rozpocznij test'}
                  </Link>
                  
                  <Link 
                    href={`/tests/${test.id}/info`}
                    className={`${styles.actionBtn} ${styles.info}`}
                  >
                    <span className={styles.actionIcon}>ℹ️</span>
                    Informacje
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
