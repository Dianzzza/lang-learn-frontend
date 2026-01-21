/**
 * @file Header.tsx
 * @brief Główny komponent nagłówka aplikacji (Navbar).
 *
 * Komponent ten jest wyświetlany na górze każdej strony. Odpowiada za:
 * 1. Nawigację główną (desktop i mobile).
 * 2. Wyświetlanie stanu zalogowania (Profil + Wyloguj vs Przycisk logowania).
 * 3. Obsługę menu hamburgerowego na urządzeniach mobilnych.
 * 4. Integrację z kontekstem autoryzacji (`AuthContext`).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext'; // <--- 1. Importujemy kontekst

/**
 * Struktura pojedynczego elementu nawigacyjnego w menu.
 */
interface NavigationItem {
  /** Wyświetlana nazwa linku */
  name: string;
  /** Ścieżka docelowa (URL) */
  href: string;
  /** Ikona (emoji lub komponent) */
  icon: string;
}

/**
 * Właściwości (Props) przyjmowane przez komponent Header.
 */
interface HeaderProps {
  /**
   * Funkcja otwierająca modal autoryzacji.
   * @param mode - Tryb otwarcia ('login' lub 'register').
   */
  onAuthOpen: (mode?: 'login' | 'register') => void;
  /** Aktualna ścieżka URL (potrzebna do podświetlania aktywnego linku) */
  currentPath: string;
}

/**
 * Komponent Header.
 *
 * Wykorzystuje `useAuth` do pobrania danych użytkownika. Jeśli użytkownik jest zalogowany,
 * wyświetla jego awatar i przycisk wylogowania. W przeciwnym razie pokazuje przycisk "Zaloguj się".
 *
 * @param {HeaderProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Wyrenderowany nagłówek.
 */
export default function Header({ onAuthOpen, currentPath }: HeaderProps) {
  /**
   * Pobranie danych usera i funkcji wylogowania z globalnego kontekstu.
   */
  const { user, logout } = useAuth();
  
  /** Stan sterujący widocznością menu mobilnego (hamburger). */
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  const router = useRouter();

  /** Przełącza widoczność menu mobilnego. */
  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  /** Zamyka menu mobilne (np. po kliknięciu w link). */
  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  /**
   * Obsługa wylogowania.
   * Zamyka menu i wywołuje funkcję `logout` z kontekstu (która przekierowuje na Landing Page).
   */
  const handleLogoutClick = () => {
    closeMenu();
    logout(); 
  };

  /** Definicja linków nawigacyjnych dostępnych w aplikacji. */
  const navigationItems: NavigationItem[] = [
    { name: 'Nauka', href: '/study', icon: '📚' },
    { name: 'Testy', href: '/tests', icon: '📝' },
    { name: 'Pojedynki', href: '/duels', icon: '⚔️' },
    { name: 'Ranking', href: '/ranking', icon: '🏆' }
  ];

  /**
   * Sprawdza, czy dana ścieżka jest aktualnie aktywna.
   * Obsługuje również ścieżki zagnieżdżone (np. `/study/lesson/1` podświetli `/study`).
   *
   * @param href - Ścieżka linku do sprawdzenia.
   * @returns {boolean} True, jeśli użytkownik znajduje się w tej sekcji.
   */
  const isActivePath = (href: string): boolean => {
    if (!currentPath) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  /**
   * Obsługa nawigacji SPA (Single Page Application).
   * Zapobiega przeładowaniu strony, zamyka menu mobilne i zmienia ścieżkę routera.
   */
  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    closeMenu();
    router.push(href);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoIcon}>🌟</span>
            <span className={styles.logoText}>LangLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${
                  isActivePath(item.href) ? styles.active : ''
                }`}
                onClick={(e) => handleNavClick(item.href, e)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Section (User Profile / Login Button) */}
          <div className={styles.rightSection}>
            {user ? (
              // WIDOK DLA ZALOGOWANEGO
              <div className={styles.userProfileWrapper}>
                <Link href="/profile" className={styles.userProfile} onClick={closeMenu}>
                  {/* Generujemy avatar z inicjałów przy użyciu zewnętrznego API (ui-avatars.com).
                      Jest to fallback dla użytkowników bez własnego zdjęcia.
                  */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=32`}
                    alt={user.username}
                    className={styles.avatar}
                  />
                  <span className={styles.username}>{user.username}</span>
                </Link>
                
                <button
                  className={styles.logoutBtn}
                  onClick={handleLogoutClick}
                  title="Wyloguj się"
                >
                  🚪
                </button>
              </div>
            ) : (
              // WIDOK DLA NIEZALOGOWANEGO
              <button
                className={styles.loginButton}
                onClick={() => onAuthOpen('login')}
              >
                <span className={styles.loginIcon}>🔓</span>
                <span className={styles.loginText}>Zaloguj się</span>
              </button>
            )}

            {/* Hamburger Menu Trigger (Mobile) */}
            <button
              className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuOverlay} onClick={closeMenu}></div>
          <div className={styles.mobileMenuContent}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${
                  isActivePath(item.href) ? styles.active : ''
                }`}
                onClick={(e) => handleNavClick(item.href, e)}
              >
                <span className={styles.mobileNavIcon}>{item.icon}</span>
                <span className={styles.mobileNavText}>{item.name}</span>
              </Link>
            ))}
            
            <div className={styles.mobileMenuDivider}></div>

            {/* Mobile Auth Actions */}
            {user ? (
               <button
               className={styles.mobileLoginButton}
               onClick={handleLogoutClick}
             >
               <span className={styles.mobileLoginIcon}>🚪</span>
               <span className={styles.mobileLoginText}>Wyloguj się</span>
             </button>
            ) : (
              <button
                className={styles.mobileLoginButton}
                onClick={() => {
                  closeMenu();
                  onAuthOpen('login');
                }}
              >
                <span className={styles.mobileLoginIcon}>🔓</span>
                <span className={styles.mobileLoginText}>Zaloguj się</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}