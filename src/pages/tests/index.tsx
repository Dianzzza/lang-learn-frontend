// pages/tests/index.tsx
// TESTY (wybór kategorii do testu – dane z bazy)

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/TestBrowser.module.css';

type CategoryDTO = {
  id: number;
  name: string;
};

interface LanguageTestCard {
  id: number; // categoryId
  title: string;
  description: string;
  type: 'placement' | 'achievement' | 'diagnostic' | 'proficiency' | 'mock-exam';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Mixed';
  duration: number;
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

const API_BASE = 'http://localhost:4000';

const pickEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('fruit')) return '🍎';
  if (n.includes('animal')) return '🐾';
  if (n.includes('home') || n.includes('house')) return '🏠';
  return '📝';
};

export default function TestBrowser() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testTypes = [
    { value: 'all', label: 'Wszystkie', icon: '📋' },
    { value: 'placement', label: 'Test poziomujący', icon: '📏' },
    { value: 'achievement', label: 'Test osiągnięć', icon: '🎯' },
    { value: 'diagnostic', label: 'Test diagnostyczny', icon: '🔍' },
    { value: 'proficiency', label: 'Test biegłości', icon: '🏆' },
    { value: 'mock-exam', label: 'Egzamin próbny', icon: '📝' },
  ];

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mixed'];

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 👇 TUTAJ JEST ZMIANA (Dodanie Tokena)
    const token = localStorage.getItem('token'); 
    
    // Jeśli nie ma tokena, backend zwróci 401, więc możemy od razu przerwać lub próbować
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_BASE}/api/categories`, { headers }) // 👈 Przekazujemy nagłówki
      .then(async (r) => {
        const data = await r.json().catch(() => []);
        if (!r.ok) throw new Error(data?.error || 'Nie udało się pobrać kategorii (401)');
        return data;
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e?.message || e));
        setLoading(false);
      });
  }, []);

  // --- RESZTA KODU BEZ ZMIAN ---
  
  const testsFromDb: LanguageTestCard[] = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      title: `Test: ${c.name}`,
      description: `Uzupełnij lukę w zdaniu i wpisz słowo po angielsku (podpowiedź po polsku).`,
      type: 'achievement',
      level: 'Mixed',
      duration: 5,
      sectionsCount: 1,
      questionsCount: 10,
      skills: ['use-of-english'],
      passingScore: 0,
      attempts: 0,
      averageScore: 0,
      completions: 0,
      isOfficial: false,
      difficulty: 'Średnie',
      emoji: pickEmoji(c.name),
    }));
  }, [categories]);

  const filteredTests = testsFromDb.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || test.type === selectedType;
    const matchesLevel = selectedLevel === 'all' || test.level === selectedLevel;

    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>📝</span>
              Testy
            </h1>
            <p className={styles.pageDescription}>
              Testy polegają na wpisywaniu odpowiedzi (bez wyboru z listy).
            </p>
          </div>

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
                {testTypes.map((type) => (
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
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'Wszystkie poziomy' : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && <p className={styles.pageDescription}>Ładowanie kategorii...</p>}
          {error && <p className={styles.pageDescription}>Błąd: {error}</p>}

          <div className={styles.testsGrid}>
            {filteredTests.map((test, index) => (
              <div
                key={test.id}
                className={styles.testCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.testHeader}>
                  <div className={styles.testIcon}>{test.emoji}</div>
                  <div className={styles.testMeta}>
                    {test.isOfficial && (
                      <div className={styles.officialBadge}>
                        <span className={styles.officialIcon}>✅</span>
                        Oficjalny
                      </div>
                    )}
                    <div className={styles.testLevel}>{test.level}</div>
                  </div>
                </div>

                <div className={styles.testContent}>
                  <h3 className={styles.testTitle}>{test.title}</h3>
                  <p className={styles.testDescription}>{test.description}</p>

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

                  <div className={styles.skillsTested}>
                    <div className={styles.skillsLabel}>Testowane umiejętności:</div>
                    <div className={styles.skillsList}>
                      {test.skills.map((skill) => (
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

                <div className={styles.testActions}>
                  <Link href={`/tests/${test.id}`} className={`${styles.actionBtn} ${styles.start}`}>
                    <span className={styles.actionIcon}>🚀</span>
                    Rozpocznij test
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {!loading && !error && filteredTests.length === 0 && (
            <p className={styles.pageDescription}>Brak testów pasujących do filtrów.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}