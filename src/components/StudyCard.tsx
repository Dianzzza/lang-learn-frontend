/**
 * @file StudyCard.tsx
 * @brief Karta materiału edukacyjnego (Lekcja/Kurs).
 *
 * Komponent ten jest podstawową jednostką widoku w katalogu materiałów ("Nauka").
 * Obsługuje dwa tryby wyświetlania (Grid/List) oraz wizualizuje kluczowe metryki:
 * postęp, poziom trudności, status (np. zablokowane) oraz czas ostatniej aktywności.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/StudyCard.module.css';

/**
 * Dostępne statusy materiału wpływające na kolorystykę i dostępność.
 */
type MaterialStatus = 'Ukończone' | 'W trakcie' | 'Do powtórki' | 'Nowe' | 'Zablokowane';

/**
 * Poziomy trudności materiału.
 */
type MaterialDifficulty = 'Łatwe' | 'Średnie' | 'Trudne';

/**
 * Tryb wyświetlania karty.
 * - `grid`: Kafelki (np. 3 w rzędzie).
 * - `list`: Pozioma lista (np. na urządzeniach mobilnych lub w widoku szczegółowym).
 */
type ViewMode = 'grid' | 'list';

/**
 * Interfejs danych materiału edukacyjnego.
 */
interface Material {
  id: number;
  title: string;
  description: string;
  status: MaterialStatus;
  progress: number;
  difficulty: MaterialDifficulty;
  /** Poziom językowy (np. A1, B2) */
  level: string;
  /** Typ materiału (np. "Gramatyka", "Słownictwo") */
  type: string;
  /** Szacowany czas ukończenia w minutach */
  estimatedTime: number;
  lastStudied?: string | Date;
  isFavorite: boolean;
  tags?: string[];
  category?: string;
  /** Emoji lub URL ikony */
  icon?: string;
}

/**
 * Właściwości (Props) komponentu StudyCard.
 */
interface StudyCardProps {
  material: Material;
  viewMode: ViewMode;
  /**
   * Opóźnienie animacji wejścia w milisekundach.
   * Używane do stworzenia efektu kaskadowego ładowania listy (staggered animation).
   * @default 0
   */
  animationDelay?: number;
}

/**
 * Komponent StudyCard.
 *
 * @param {StudyCardProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Interaktywna karta materiału.
 */
export default function StudyCard({ 
  material, 
  viewMode, 
  animationDelay = 0 
}: StudyCardProps) {
  
  // --- STANY ---
  /** Lokalny stan ulubionych (pozwala na natychmiastową reakcję UI przed potwierdzeniem z API) */
  const [isFavorite, setIsFavorite] = useState<boolean>(material.isFavorite);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Obsługa kliknięcia w przycisk "Ulubione".
   * Wykonuje `e.preventDefault()`, aby nie uruchomić nawigacji (Link) rodzica.
   */
  const handleFavoriteToggle = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault(); // Zapobiegamy przejściu do strony lekcji
    setIsLoading(true);
    
    try {
      // Symulacja opóźnienia API
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mapuje status materiału na kolor HEX.
   */
  const getStatusColor = (): string => {
    switch (material.status) {
      case 'Ukończone': return '#10b981'; // Zielony
      case 'W trakcie': return '#f59e0b'; // Pomarańczowy
      case 'Do powtórki': return '#8b5cf6'; // Fioletowy
      case 'Nowe': return '#06b6d4'; // Cyjan
      default: return '#64748b'; // Szary
    }
  };

  /**
   * Mapuje poziom trudności na kolor HEX (sygnalizacja świetlna).
   */
  const getDifficultyColor = (): string => {
    switch (material.difficulty) {
      case 'Łatwe': return '#10b981';
      case 'Średnie': return '#f59e0b';
      case 'Trudne': return '#ef4444';
      default: return '#64748b';
    }
  };

  /**
   * Formatuje datę ostatniej nauki do formatu relatywnego ("X dni temu").
   * Jest to bardziej przyjazne dla użytkownika niż surowa data.
   *
   * @param {string | Date} date - Data do sformatowania.
   * @returns {string} Sformatowany ciąg znaków.
   */
  const formatLastStudied = (date?: string | Date): string => {
    if (!date) return 'Nigdy';
    
    const now = new Date();
    const studiedDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - studiedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;
    
    return studiedDate.toLocaleDateString('pl-PL');
  };

  return (
    <Link
      // Jeśli zablokowane, link nie powinien nigdzie prowadzić (lub prowadzić do modala z informacją)
      // W tym przykładzie nawigujemy normalnie, ale UI pokazuje kłódkę.
      href={`/study/${material.id}`}
      className={styles.cardWrapper}
      style={{
        animationDelay: `${animationDelay}ms` // Obsługa staggered animation
      }}
    >
      <div className={`${styles.card} ${styles[viewMode]} ${
        material.status === 'Zablokowane' ? styles.locked : ''
      }`}>
        
        {/* Quick Actions Overlay - Widoczne tylko przy Hover */}
        <div className={styles.quickActionsOverlay}>
          <button
            className={styles.quickAction}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            {isLoading ? '⏳' : (isFavorite ? '❤️' : '🤍')}
          </button>
          <button
            className={styles.quickAction}
            title="Dodaj do fiszek"
            onClick={(e) => e.preventDefault()} // Zapobiegamy nawigacji
          >
            📝
          </button>
          <button
            className={styles.quickAction}
            title="Udostępnij"
            onClick={(e) => e.preventDefault()}
          >
            🔗
          </button>
        </div>

        {/* Card Header: Ikona/Miniatura + Status Ulubione */}
        <div className={styles.cardHeader}>
          <div className={styles.thumbnail}>
            <span className={styles.thumbnailIcon}>
              {material.icon || '📚'}
            </span>
            {/* Nakładka kłódki dla materiałów zablokowanych */}
            {material.status === 'Zablokowane' && (
              <div className={styles.lockOverlay}>
                <span className={styles.lockIcon}>🔒</span>
              </div>
            )}
          </div>
          <button
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : (isFavorite ? '❤️' : '🤍')}
          </button>
        </div>

        {/* Card Body: Tytuł, Opis, Badges */}
        <div className={styles.cardBody}>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{material.title}</h3>
            <p className={styles.cardDescription}>{material.description}</p>
          </div>

          <div className={styles.cardMeta}>
            <div className={styles.badges}>
              {/* Odznaka poziomu językowego */}
              <span className={`${styles.levelBadge} ${styles[material.level.toLowerCase()]}`}>
                {material.level}
              </span>
              {material.category && (
                <span className={styles.categoryBadge}>
                  {material.category}
                </span>
              )}
              <span className={styles.typeBadge}>
                {material.type}
              </span>
            </div>

            {/* Statystyki: Czas i Trudność */}
            <div className={styles.stats}>
              <span className={styles.stat}>
                <span className={styles.statIcon}>⏱️</span>
                <span className={styles.statValue}>{material.estimatedTime}</span>
                min
              </span>
              <span className={styles.stat}>
                <span className={styles.statIcon}>📊</span>
                <span className={styles.statValue} style={{ color: getDifficultyColor() }}>
                  {material.difficulty}
                </span>
              </span>
            </div>
          </div>

          {/* Progress Section: Pasek postępu */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Postęp:</span>
              <span className={styles.progressValue}>{material.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${material.progress}%`,
                  backgroundColor: getStatusColor() // Dynamiczny kolor paska
                }}
              ></div>
            </div>
            <div className={styles.progressDetails}>
              Ostatnio: {formatLastStudied(material.lastStudied)}
            </div>
          </div>
        </div>

        {/* Card Footer: Status tekstowy i data */}
        <div className={styles.cardFooter}>
          <div className={styles.statusSection}>
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor() }}
            >
              {material.status}
            </span>
            <span 
              className={styles.difficultyBadge}
              style={{ color: getDifficultyColor() }}
            >
              {material.difficulty}
            </span>
          </div>
          
          <div className={styles.lastStudied}>
            <span className={styles.lastStudiedIcon}>🕒</span>
            {formatLastStudied(material.lastStudied)}
          </div>
        </div>

        {/* Card Actions: Przyciski akcji (Kontynuuj/Powtórz) */}
        <div className={styles.cardActions}>
          {material.status === 'Zablokowane' ? (
            <button className={styles.lockedAction} disabled>
              🔒 Zablokowane
            </button>
          ) : (
            <>
              <button className={styles.primaryAction}>
                {material.status === 'Ukończone' ? '🔄 Powtórz' : '▶️ Kontynuuj'}
              </button>
              <button 
                className={styles.secondaryAction} 
                title="Więcej opcji"
                onClick={(e) => e.preventDefault()}
              >
                ⋯
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}