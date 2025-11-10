
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/StudyCard.module.css';

type MaterialStatus = 'Ukończone' | 'W trakcie' | 'Do powtórki' | 'Nowe' | 'Zablokowane';
type MaterialDifficulty = 'Łatwe' | 'Średnie' | 'Trudne';
type ViewMode = 'grid' | 'list';

interface Material {
  id: number;
  title: string;
  description: string;
  status: MaterialStatus;
  progress: number;
  difficulty: MaterialDifficulty;
  level: string;
  type: string;
  estimatedTime: number;
  lastStudied?: string | Date;
  isFavorite: boolean;
  tags?: string[];
  category?: string;
  icon?: string;
}

interface StudyCardProps {
  material: Material;
  viewMode: ViewMode;
  animationDelay?: number;
}

export default function StudyCard({ 
  material, 
  viewMode, 
  animationDelay = 0 
}: StudyCardProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(material.isFavorite);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFavoriteToggle = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Tutaj będzie API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (): string => {
    switch (material.status) {
      case 'Ukończone':
        return '#10b981';
      case 'W trakcie':
        return '#f59e0b';
      case 'Do powtórki':
        return '#8b5cf6';
      case 'Nowe':
        return '#06b6d4';
      default:
        return '#64748b';
    }
  };

  const getDifficultyColor = (): string => {
    switch (material.difficulty) {
      case 'Łatwe':
        return '#10b981';
      case 'Średnie':
        return '#f59e0b';
      case 'Trudne':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

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
      href={`/study/${material.id}`}
      className={styles.cardWrapper}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      <div className={`${styles.card} ${styles[viewMode]} ${
        material.status === 'Zablokowane' ? styles.locked : ''
      }`}>
        
        {/* Quick Actions Overlay - HOVER ACTIONS! */}
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
          >
            📝
          </button>
          <button
            className={styles.quickAction}
            title="Udostępnij"
          >
            🔗
          </button>
        </div>

        {/* Card Header z Thumbnail */}
        <div className={styles.cardHeader}>
          <div className={styles.thumbnail}>
            <span className={styles.thumbnailIcon}>
              {material.icon || '📚'}
            </span>
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

        {/* Card Body */}
        <div className={styles.cardBody}>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{material.title}</h3>
            <p className={styles.cardDescription}>{material.description}</p>
          </div>

          <div className={styles.cardMeta}>
            <div className={styles.badges}>
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

          {/* Progress Section */}
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
                  backgroundColor: getStatusColor()
                }}
              ></div>
            </div>
            <div className={styles.progressDetails}>
              Ostatnio: {formatLastStudied(material.lastStudied)}
            </div>
          </div>
        </div>

        {/* Card Footer */}
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

        {/* Card Actions - PRZYCISKI NA DOLE */}
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
              <button className={styles.secondaryAction} title="Więcej opcji">
                ⋯
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}