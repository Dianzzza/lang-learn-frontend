/**
 * @file ProfileHeader.tsx
 * @brief Komponent nagłówka profilu użytkownika.
 *
 * Wyświetla kluczowe informacje o użytkowniku na górze strony profilowej.
 * Zawiera awatar, dane osobowe, biogram z opcją rozwijania oraz przyciski akcji (edycja, udostępnianie).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/ProfileHeader.module.css';

/**
 * Interfejs reprezentujący pełne dane profilowe użytkownika.
 */
interface User {
  /** Unikalny identyfikator użytkownika */
  id: number;
  /** Nazwa użytkownika (login) */
  username: string;
  /** Nazwa wyświetlana (imię/ksywka) */
  displayName: string;
  /** Adres e-mail (zazwyczaj ukrywany lub tylko do odczytu) */
  email: string;
  /** Awatar (emoji lub URL do obrazka) */
  avatar: string;
  /** Krótki opis profilu (biogram) */
  bio?: string;
  /** Poziom użytkownika (np. "Level 5", "Mistrz") */
  level: string;
  /** Data dołączenia w formacie ISO */
  joinedDate: string;
  /** Data ostatniej aktywności */
  lastActive: string;
}

/**
 * Właściwości (Props) przyjmowane przez komponent ProfileHeader.
 */
interface ProfileHeaderProps {
  /** Obiekt użytkownika, którego profil jest wyświetlany */
  user: User;
}

/**
 * Komponent ProfileHeader.
 *
 * @param {ProfileHeaderProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Sekcja nagłówkowa profilu.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
  /**
   * Stan sterujący zwijaniem/rozwijaniem długiego biogramu.
   * @default false (zwinięty)
   */
  const [showFullBio, setShowFullBio] = useState<boolean>(false);

  /**
   * Formatuje datę dołączenia do czytelnego formatu (np. "styczeń 2023").
   * Używa lokalizacji 'pl-PL'.
   */
  const formatJoinDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pl-PL', {
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Obsługuje udostępnianie profilu.
   *
   * Wykorzystuje **Web Share API** (`navigator.share`) na urządzeniach mobilnych
   * i kompatybilnych przeglądarkach. Jeśli API nie jest wspierane (lub operacja się nie uda),
   * stosuje **fallback** w postaci skopiowania linku do schowka (`navigator.clipboard`).
   */
  const handleShare = async (): Promise<void> => {
    try {
      // Próba użycia natywnego menu udostępniania
      await navigator.share({
        title: `Profil ${user.displayName}`,
        text: `Zobacz profil ${user.displayName} w LangLearn!`,
        url: `/profile/${user.username}`
      });
    } catch (error) {
      // Fallback: Jeśli Web Share API nie jest dostępne lub użytkownik anulował,
      // kopiujemy URL do schowka.
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
            
            {/* Sekcja Bio z logiką "Pokaż więcej" */}
            {user.bio && (
              <div className={styles.bio}>
                <p className={styles.bioText}>
                  {/* Wyświetl pełny tekst LUB przycięty do 120 znaków */}
                  {showFullBio || user.bio.length <= 120 
                    ? user.bio 
                    : `${user.bio.substring(0, 120)}...`
                  }
                  
                  {/* Przycisk przełączania widoczności, tylko jeśli tekst jest długi */}
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

        {/* Quick Actions - Przyciski akcji */}
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