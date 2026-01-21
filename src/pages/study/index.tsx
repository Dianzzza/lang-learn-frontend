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
    },
    {
      id: 2,
      title: 'Gramatyka',
      description: 'Poznaj zasady gramatyki angielskiej z interaktywnymi lekcjami',
      icon: '📖',
      color: 'var(--secondary-green)',
      href: '/grammar',
      badge: 'Nowe',
    },
    {
      id: 3,
      title: 'Quiz',
      description: 'Testuj swoją wiedzę z angielskiego w formie interaktywnego quizu',
      icon: '❓',
      color: 'var(--primary-cyan)',
      href: '/quiz',
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
                  </div>

                  {/* 📝 MODE CONTENT */}
                  <div className={styles.modeContent}>
                    <h2 className={styles.modeTitle}>{mode.title}</h2>
                    <p className={styles.modeDescription}>{mode.description}</p>
                  </div>

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