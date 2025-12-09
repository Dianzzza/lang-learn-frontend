// src/pages/study/index.tsx
'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/StudyHub.module.css';

interface StudyMode {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  badge?: string;
  count: number;
  progress: number;
}

export default function StudyHub() {
  // 🎯 3 GŁÓWNE TRYBY NAUKI
  const studyModes: StudyMode[] = [
    {
      id: 1,
      title: 'Fiszki',
      description: 'Nauka za pomocą fiszek - szybka i efektywna metoda zapamiętywania',
      icon: '🗂️',
      color: 'var(--primary-indigo)',
      href: '/flashcards',
      badge: 'Popularne',
      count: 120,
      progress: 67
    },
    {
      id: 2,
      title: 'Gramatyka',
      description: 'Poznaj zasady gramatyki angielskiej z interaktywnymi lekcjami',
      icon: '📖',
      color: 'var(--secondary-green)',
      href: '/grammar',
      badge: 'Nowe',
      count: 85,
      progress: 34
    },
    {
      id: 3,
      title: 'Quiz',
      description: 'Testuj swoją wiedzę z angielskiego w formie interaktywnego quizu',
      icon: '❓',
      color: 'var(--primary-cyan)',
      href: '/quiz',
      count: 500,
      progress: 42
    }
  ];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          {/* 🎯 PAGE HEADER */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>🎓</span>
              Centrum Nauki
            </h1>
            <p className={styles.pageDescription}>
              Wybierz metodę nauki, która najlepiej Ci się sprawdza. Wszystkie sposoby prowadzą do celu!
            </p>
          </div>

          {/* 🎮 STUDY MODES GRID */}
          <div
            className={styles.studyModesGrid}
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {studyModes.map((mode, index) => (
              <Link
                key={mode.id}
                href={mode.href}
              >
                <div
                  className={styles.studyModeCard}
                  style={{
                    '--mode-color': mode.color,
                    animationDelay: `${index * 0.1}s`,
                  } as React.CSSProperties & { '--mode-color': string }}
                >
                  {/* 🏷️ BADGE */}
                  {mode.badge && (
                    <div className={styles.newBadge}>
                      <span className={styles.newIcon}>✨</span>
                      {mode.badge}
                    </div>
                  )}

                  {/* 🎨 MODE HEADER */}
                  <div className={styles.modeHeader}>
                    <div
                      className={styles.modeIcon}
                      style={{ backgroundColor: mode.color }}
                    >
                      {mode.icon}
                    </div>
                    <div className={styles.modeCount}>{mode.count}+</div>
                  </div>

                  {/* 📝 MODE CONTENT */}
                  <div className={styles.modeContent}>
                    <h2 className={styles.modeTitle}>{mode.title}</h2>
                    <p className={styles.modeDescription}>{mode.description}</p>
                  </div>

                  {/* 📈 MODE PROGRESS */}
                  {mode.progress > 0 && (
                    <div className={styles.modeProgress}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Twój postęp</span>
                        <span className={styles.progressPercent}>{mode.progress}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${mode.progress}%`,
                            backgroundColor: mode.color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 🎮 MODE ACTION */}
                  <div
                    className={styles.modeAction}
                    style={{
                      '--mode-color': mode.color,
                    } as React.CSSProperties & { '--mode-color': string }}
                  >
                    <span className={styles.actionText}>Rozpocznij</span>
                    <span className={styles.actionIcon}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}