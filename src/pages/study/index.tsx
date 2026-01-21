/**
 * @file StudyHub.tsx
 * @brief Centrum nauki (Landing Page sekcji edukacyjnej).
 *
 * Komponent ten pełni rolę "zwrotnicy", pozwalając użytkownikowi wybrać preferowany tryb nauki:
 * 1. **Fiszki:** System powtórek interwałowych (SRS).
 * 2. **Gramatyka:** Lekcje teoretyczne i ćwiczenia.
 * 3. **Quizy:** Testy sprawdzające wiedzę ogólną.
 *
 * Wykorzystuje CSS Variables (`--mode-color`) do dynamicznego stylowania kart
 * w zależności od wybranego trybu (np. Fioletowy dla fiszek, Zielony dla gramatyki).
 */

'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/StudyHub.module.css';

/**
 * Konfiguracja trybu nauki wyświetlanego jako karta.
 */
interface StudyMode {
  id: number;
  title: string;
  description: string;
  icon: string; // Emoji lub URL ikony
  color: string; // Kolor przewodni (używany jako zmienna CSS)
  href: string; // Link docelowy
  badge?: string; // Opcjonalna etykieta (np. "Popularne")
  count: number; // Liczba dostępnych materiałów
  progress: number; // Postęp użytkownika w danej sekcji (%)
}

/**
 * Komponent StudyHub.
 *
 * @returns {JSX.Element} Grid z kartami wyboru trybu nauki.
 */
export default function StudyHub() {
  
  // Definicja dostępnych modułów edukacyjnych
  // W przyszłości te dane (szczególnie progress i count) mogą pochodzić z API
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
          
          {/* Nagłówek sekcji */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>🎓</span>
              Centrum Nauki
            </h1>
            <p className={styles.pageDescription}>
              Wybierz metodę nauki, która najlepiej Ci się sprawdza. Wszystkie sposoby prowadzą do celu!
            </p>
          </div>

          {/* Grid kart trybów nauki */}
          <div
            className={styles.studyModesGrid}
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)', // Wymuszenie 3 kolumn
            }}
          >
            {studyModes.map((mode, index) => (
              <Link
                key={mode.id}
                href={mode.href}
                // Link jako wrapper umożliwia klikalność całej karty
              >
                <div
                  className={styles.studyModeCard}
                  // Przekazanie koloru jako zmiennej CSS i opóźnienie animacji
                  style={{
                    '--mode-color': mode.color,
                    animationDelay: `${index * 0.1}s`,
                  } as React.CSSProperties & { '--mode-color': string }}
                >
                  
                  {/* Badge (np. "Popularne") */}
                  {mode.badge && (
                    <div className={styles.newBadge}>
                      <span className={styles.newIcon}>✨</span>
                      {mode.badge}
                    </div>
                  )}

                  {/* Nagłówek karty z ikoną */}
                  <div className={styles.modeHeader}>
                    <div
                      className={styles.modeIcon}
                      style={{ backgroundColor: mode.color }}
                    >
                      {mode.icon}
                    </div>
                    <div className={styles.modeCount}>{mode.count}+</div>
                  </div>

                  {/* Treść karty */}
                  <div className={styles.modeContent}>
                    <h2 className={styles.modeTitle}>{mode.title}</h2>
                    <p className={styles.modeDescription}>{mode.description}</p>
                  </div>

                  {/* Pasek postępu */}
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
                            backgroundColor: mode.color, // Spójność kolorystyczna
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Przycisk akcji (Call to Action) */}
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