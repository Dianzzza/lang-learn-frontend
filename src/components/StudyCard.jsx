// components/StudyCard.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/StudyCard.module.css';

export default function StudyCard({ material, viewMode, animationDelay = 0 }) {
  const [isFavorite, setIsFavorite] = useState(material.isFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteToggle = async (e) => {
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

  const getStatusColor = () => {
    switch (material.status) {
      case 'Ukończone': return '#10b981';
      case 'W trakcie': return '#f59e0b';
      case 'Do powtórki': return '#8b5cf6';
      case 'Nowe': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const getDifficultyColor = () => {
    switch (material.difficulty) {
      case 'Łatwe': return '#10b981';
      case 'Średnie': return '#f59e0b';
      case 'Trudne': return '#ef4444';
      default: return '#64748b';
    }
  };

  const formatLastStudied = (date) => {
    if (!date) return 'Nigdy';
    
    const now = new Date();
    const studiedDate = new Date(date);
    const diffDays = Math.floor((now - studiedDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;
    return studiedDate.toLocaleDateString('pl-PL');
  };

  const cardContent = (
    <div 
      className={`${styles.card} ${styles[viewMode]} ${material.isLocked ? styles.locked : ''}`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        '--status-color': getStatusColor()
      }}
    >
      {/* Thumbnail i status */}
      <div className={styles.cardHeader}>
        <div className={styles.thumbnail}>
          <span className={styles.thumbnailIcon}>{material.thumbnail}</span>
          {material.isLocked && (
            <div className={styles.lockOverlay}>
              <span className={styles.lockIcon}>🔒</span>
            </div>
          )}
        </div>
        
        <button 
          className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Główna zawartość */}
      <div className={styles.cardBody}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{material.name}</h3>
          <p className={styles.cardDescription}>{material.description}</p>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.badges}>
            <span className={`${styles.levelBadge} ${styles[material.level.toLowerCase()]}`}>
              {material.level}
            </span>
            <span className={styles.categoryBadge}>
              {material.category}
            </span>
            <span className={styles.typeBadge}>
              {material.type}
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>⭐</span>
              <span className={styles.statValue}>{material.rating}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>👥</span>
              <span className={styles.statValue}>{material.studentsCount}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValue}>{material.duration}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Postęp</span>
            <span className={styles.progressValue}>{material.progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${material.progress}%`,
                backgroundColor: getStatusColor()
              }}
            />
          </div>
          <div className={styles.progressDetails}>
            {material.completedLessons} z {material.totalLessons} lekcji
          </div>
        </div>

        {/* Status i ostatnia aktywność */}
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
            <span className={styles.lastStudiedIcon}>📅</span>
            <span className={styles.lastStudiedText}>
              {formatLastStudied(material.lastStudied)}
            </span>
          </div>
        </div>
      </div>

      {/* Akcje */}
      <div className={styles.cardActions}>
        {!material.isLocked ? (
          <>
            <button className={styles.primaryAction}>
              {material.progress > 0 ? '📖 Kontynuuj' : '🚀 Rozpocznij'}
            </button>
            <button className={styles.secondaryAction} title="Więcej opcji">
              ⋯
            </button>
          </>
        ) : (
          <button className={styles.lockedAction} disabled>
            🔒 Zablokowane
          </button>
        )}
      </div>

      {/* Quick actions overlay (widoczny na hover) */}
      <div className={styles.quickActionsOverlay}>
        <button className={styles.quickAction} title="Dodaj do powtórki">
          🔄
        </button>
        <button className={styles.quickAction} title="Informacje">
          ℹ️
        </button>
        <button className={styles.quickAction} title="Udostępnij">
          📤
        </button>
      </div>
    </div>
  );

  return material.isLocked ? (
    <div className={styles.cardWrapper}>
      {cardContent}
    </div>
  ) : (
    <Link href={`/study/${material.id}`} className={styles.cardWrapper}>
      {cardContent}
    </Link>
  );
}
