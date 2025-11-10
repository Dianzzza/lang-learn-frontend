// pages/grammar/index.tsx
// HUB GRAMATYCZNY - systematyczna nauka gramatyki

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/GrammarHub.module.css';

interface GrammarTopic {
  id: number;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'tenses' | 'modals' | 'conditionals' | 'passive' | 'reported' | 'articles' | 'prepositions' | 'other';
  lessonsCount: number;
  exercisesCount: number;
  examplesCount: number;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  estimatedTime: string;
  isCompleted: boolean;
  progress: number; // 0-100%
  emoji: string;
  tags: string[];
  prerequisites?: string[];
}

export default function GrammarHub() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  const categories = [
    { value: 'all', label: 'Wszystkie', icon: '📚' },
    { value: 'tenses', label: 'Czasy', icon: '⏰' },
    { value: 'modals', label: 'Czasowniki modalne', icon: '🔧' },
    { value: 'conditionals', label: 'Tryb warunkowy', icon: '🤔' },
    { value: 'passive', label: 'Strona bierna', icon: '🔄' },
    { value: 'reported', label: 'Mowa zależna', icon: '💬' },
    { value: 'articles', label: 'Przedimki', icon: '🔤' },
    { value: 'prepositions', label: 'Przyimki', icon: '📍' },
    { value: 'other', label: 'Inne', icon: '📖' }
  ];

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // 🔒 PRZYKŁADOWE TEMATY GRAMATYCZNE
  const grammarTopics: GrammarTopic[] = [
    {
      id: 1,
      title: 'Present Simple & Present Continuous',
      description: 'Różnice między czasami teraźniejszymi',
      level: 'A2',
      category: 'tenses',
      lessonsCount: 4,
      exercisesCount: 12,
      examplesCount: 25,
      difficulty: 'Łatwe',
      estimatedTime: '45-60 min',
      isCompleted: true,
      progress: 100,
      emoji: '⏰',
      tags: ['present-tenses', 'basic-grammar'],
      prerequisites: []
    },
    {
      id: 2,
      title: 'Modal Verbs: Can, Could, May, Might',
      description: 'Czasowniki modalne wyrażające możliwość',
      level: 'B1',
      category: 'modals',
      lessonsCount: 6,
      exercisesCount: 18,
      examplesCount: 35,
      difficulty: 'Średnie',
      estimatedTime: '60-90 min',
      isCompleted: false,
      progress: 34,
      emoji: '🔧',
      tags: ['modals', 'possibility', 'permission'],
      prerequisites: ['Present Simple & Present Continuous']
    },
    {
      id: 3,
      title: 'Third Conditional',
      description: 'Tryb warunkowy trzeci - sytuacje hipotetyczne z przeszłości',
      level: 'B2',
      category: 'conditionals',
      lessonsCount: 5,
      exercisesCount: 15,
      examplesCount: 30,
      difficulty: 'Trudne',
      estimatedTime: '75-90 min',
      isCompleted: false,
      progress: 0,
      emoji: '🤔',
      tags: ['conditionals', 'advanced-grammar', 'hypothetical'],
      prerequisites: ['Modal Verbs: Can, Could, May, Might']
    }
  ];

  const filteredTopics = grammarTopics.filter(topic => {
    const matchesLevel = selectedLevel === 'all' || topic.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesCompletion = !showOnlyIncomplete || !topic.isCompleted;
    
    return matchesLevel && matchesCategory && matchesCompletion;
  });

  const getLevelColor = (level: GrammarTopic['level']) => {
    const colors = {
      'A1': 'var(--secondary-green)',
      'A2': 'var(--secondary-lime)',
      'B1': 'var(--secondary-amber)',
      'B2': 'var(--secondary-orange)',
      'C1': 'var(--secondary-red)',
      'C2': 'var(--secondary-crimson)'
    };
    return colors[level];
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'var(--secondary-green)';
    if (progress >= 50) return 'var(--secondary-amber)';
    return 'var(--primary-indigo)';
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* 🎯 HEADER */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>📚</span>
              Gramatyka
            </h1>
            <p className={styles.pageDescription}>
              Systematyczna nauka gramatyki od podstaw do zaawansowanego poziomu
            </p>
          </div>

          {/* 📊 PROGRESS OVERVIEW */}
          <div className={styles.progressOverview}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>✅</div>
              <div className={styles.overviewValue}>
                {grammarTopics.filter(t => t.isCompleted).length}
              </div>
              <div className={styles.overviewLabel}>Ukończone tematy</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>🔄</div>
              <div className={styles.overviewValue}>
                {grammarTopics.filter(t => t.progress > 0 && !t.isCompleted).length}
              </div>
              <div className={styles.overviewLabel}>W trakcie</div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewIcon}>🎯</div>
              <div className={styles.overviewValue}>
                {Math.round(grammarTopics.reduce((sum, t) => sum + t.progress, 0) / grammarTopics.length)}%
              </div>
              <div className={styles.overviewLabel}>Ogólny postęp</div>
            </div>
          </div>

          {/* 🔍 FILTERS */}
          <div className={styles.filtersSection}>
            <div className={styles.filterRow}>
              <div className={styles.categoryFilters}>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`${styles.categoryBtn} ${selectedCategory === cat.value ? styles.active : ''}`}
                  >
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.additionalFilters}>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={styles.filterSelect}
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'Wszystkie poziomy' : `Poziom ${level}`}
                  </option>
                ))}
              </select>

              <label className={styles.checkboxFilter}>
                <input
                  type="checkbox"
                  checked={showOnlyIncomplete}
                  onChange={(e) => setShowOnlyIncomplete(e.target.checked)}
                  className={styles.filterCheckbox}
                />
                Tylko nieukończone
              </label>
            </div>
          </div>

          {/* 📚 TOPICS GRID */}
          <div className={styles.topicsGrid}>
            {filteredTopics.map((topic, index) => (
              <div 
                key={topic.id} 
                className={styles.topicCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* 🎨 TOPIC HEADER */}
                <div className={styles.topicHeader}>
                  <div className={styles.topicIcon}>
                    {topic.emoji}
                  </div>
                  <div className={styles.topicMeta}>
                    <div 
                      className={styles.topicLevel}
                      style={{ backgroundColor: getLevelColor(topic.level) }}
                    >
                      {topic.level}
                    </div>
                    {topic.isCompleted && (
                      <div className={styles.completedBadge}>
                        <span className={styles.completedIcon}>✅</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📝 TOPIC CONTENT */}
                <div className={styles.topicContent}>
                  <h3 className={styles.topicTitle}>
                    {topic.title}
                  </h3>
                  <p className={styles.topicDescription}>
                    {topic.description}
                  </p>

                  {/* 📊 TOPIC STATS */}
                  <div className={styles.topicStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>📖</span>
                      <span>{topic.lessonsCount} lekcji</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>✏️</span>
                      <span>{topic.exercisesCount} ćwiczeń</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>💡</span>
                      <span>{topic.examplesCount} przykładów</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statIcon}>⏱️</span>
                      <span>{topic.estimatedTime}</span>
                    </div>
                  </div>

                  {/* 🏗️ PREREQUISITES */}
                  {topic.prerequisites && topic.prerequisites.length > 0 && (
                    <div className={styles.prerequisites}>
                      <div className={styles.prerequisitesLabel}>
                        <span className={styles.prerequisitesIcon}>🏗️</span>
                        Wymagania:
                      </div>
                      <div className={styles.prerequisitesList}>
                        {topic.prerequisites.map(prereq => (
                          <span key={prereq} className={styles.prerequisite}>
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 📈 PROGRESS SECTION */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Postęp:</span>
                    <span 
                      className={styles.progressPercent}
                      style={{ color: getProgressColor(topic.progress) }}
                    >
                      {topic.progress}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${topic.progress}%`,
                        backgroundColor: getProgressColor(topic.progress)
                      }}
                    ></div>
                  </div>
                </div>

                {/* 🎮 TOPIC ACTIONS */}
                <div className={styles.topicActions}>
                  <Link 
                    href={`/grammar/${topic.id}`}
                    className={`${styles.actionBtn} ${styles.study}`}
                  >
                    <span className={styles.actionIcon}>📖</span>
                    {topic.progress > 0 ? 'Kontynuuj' : 'Rozpocznij'}
                  </Link>
                  
                  <Link 
                    href={`/grammar/${topic.id}/exercises`}
                    className={`${styles.actionBtn} ${styles.exercise}`}
                  >
                    <span className={styles.actionIcon}>✏️</span>
                    Ćwiczenia
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
