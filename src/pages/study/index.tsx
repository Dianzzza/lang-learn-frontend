// pages/study/index.tsx
// GŁÓWNY HUB NAUKI - wszystkie tryby w jednym miejscu

'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/StudyHub.module.css';

interface StudyMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  count: number;
  progress: number;
  isNew?: boolean;
}

export default function StudyHub() {
  const studyModes: StudyMode[] = [
    {
      id: 'flashcards',
      title: 'Fiszki',
      description: 'Nauka słownictwa z systemem inteligentnych powtórzeń',
      icon: '🃏',
      color: 'var(--primary-indigo)',
      href: '/flashcards',
      count: 247,
      progress: 68
    },
    {
      id: 'quizzes',
      title: 'Quizy',
      description: 'Interaktywne quizy sprawdzające Twoją wiedzę',
      icon: '🧠',
      color: 'var(--secondary-green)',
      href: '/quiz',
      count: 45,
      progress: 34
    },
    {
      id: 'tests',
      title: 'Testy',
      description: 'Formalne testy i egzaminy próbne',
      icon: '📝',
      color: 'var(--secondary-amber)',
      href: '/tests',
      count: 12,
      progress: 25
    },
    {
      id: 'grammar',
      title: 'Gramatyka',
      description: 'Systematyczna nauka zasad gramatycznych',
      icon: '📚',
      color: 'var(--secondary-purple)',
      href: '/grammar',
      count: 28,
      progress: 45,
      isNew: true
    }
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>🎓</span>
              Centrum Nauki
            </h1>
            <p className={styles.pageDescription}>
              Wybierz tryb nauki i rozwijaj swoje umiejętności językowe
            </p>
          </div>

          <div className={styles.studyModesGrid}>
            {studyModes.map((mode, index) => (
              <Link 
                key={mode.id}
                href={mode.href}
                className={styles.studyModeCard}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  '--mode-color': mode.color
                } as any}
              >
                {mode.isNew && (
                  <div className={styles.newBadge}>
                    <span className={styles.newIcon}>✨</span>
                    Nowe!
                  </div>
                )}
                
                <div className={styles.modeHeader}>
                  <div className={styles.modeIcon} style={{ backgroundColor: mode.color }}>
                    {mode.icon}
                  </div>
                  <div className={styles.modeCount}>
                    {mode.count}
                  </div>
                </div>
                
                <div className={styles.modeContent}>
                  <h2 className={styles.modeTitle}>
                    {mode.title}
                  </h2>
                  <p className={styles.modeDescription}>
                    {mode.description}
                  </p>
                </div>
                
                <div className={styles.modeProgress}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Postęp:</span>
                    <span className={styles.progressPercent}>{mode.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${mode.progress}%`,
                        backgroundColor: mode.color
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className={styles.modeAction}>
                  <span className={styles.actionText}>Rozpocznij naukę</span>
                  <span className={styles.actionIcon}>→</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
