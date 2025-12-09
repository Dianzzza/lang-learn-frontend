
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/ProfileHeader.module.css';

// TypeScript types
interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  level: string;
  joinedDate: string;
  lastActive: string;
}

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showFullBio, setShowFullBio] = useState<boolean>(false);

  const formatJoinDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pl-PL', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async (): Promise<void> => {
    try {
      await navigator.share({
        title: `Profil ${user.displayName}`,
        text: `Zobacz profil ${user.displayName} w LangLearn!`,
        url: `/profile/${user.username}`
      });
    } catch (error) {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/profile/${user.username}`);
      alert('Link skopiowany do schowka!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContent}>
        
        {/* Avatar i podstawowe info */}
        <div className={styles.userInfo}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {user.avatar}
              </div>
              <div className={styles.levelBadge}>
                {user.level}
              </div>
            </div>
          </div>
          
          <div className={styles.userDetails}>
            <h1 className={styles.displayName}>
              {user.displayName}
            </h1>
            <p className={styles.username}>
              {user.email}
            </p>
            
            {user.bio && (
              <div className={styles.bio}>
                <p className={styles.bioText}>
                  {showFullBio || user.bio.length <= 120 
                    ? user.bio 
                    : `${user.bio.substring(0, 120)}...`
                  }
                  {user.bio.length > 120 && (
                    <button 
                      className={styles.bioToggle}
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? 'Pokaż mniej' : 'Pokaż więcej'}
                    </button>
                  )}
                </p>
              </div>
            )}
            
            <div className={styles.userMeta}>
              <span className={styles.joinDate}>
                <span className={styles.metaIcon}>📅</span>
                Dołączył w {formatJoinDate(user.joinedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actions}>
          <Link href="/settings" className={styles.actionBtn}>
            <span className={styles.actionIcon}>✏️</span>
            Edytuj profil
          </Link>
          
          <button 
            onClick={handleShare}
            className={`${styles.actionBtn} ${styles.secondary}`}
          >
            <span className={styles.actionIcon}>📤</span>
            Udostępnij
          </button>
          
          <Link href="/settings?tab=learning" className={`${styles.actionBtn} ${styles.secondary}`}>
            <span className={styles.actionIcon}>🎯</span>
            Ustaw cel
          </Link>
        </div>

      </div>
    </div>
  );
}
  