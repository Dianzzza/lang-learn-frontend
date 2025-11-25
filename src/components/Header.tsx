// frontend/src/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';
import { useAuth } from '../context/AuthContext'; // <--- 1. Importujemy kontekst

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

// Uprościliśmy propsy, bo user i logout bierzemy z kontekstu
interface HeaderProps {
  onAuthOpen: (mode?: 'login' | 'register') => void;
  currentPath: string;
}

export default function Header({ onAuthOpen, currentPath }: HeaderProps) {
  const { user, logout } = useAuth(); // <--- 2. Wyciągamy usera i funkcję logout
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    closeMenu();
    logout(); // To automatycznie przeniesie Cię na Landing Page (zdefiniowane w AuthContext)
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Nauka', href: '/study', icon: '📚' },
    { name: 'Testy', href: '/tests', icon: '📝' },
    { name: 'Pojedynki', href: '/duels', icon: '⚔️' },
    { name: 'Ranking', href: '/ranking', icon: '🏆' }
  ];

  const isActivePath = (href: string): boolean => {
    if (!currentPath) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  };

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

          {/* Right Section */}
          <div className={styles.rightSection}>
            {user ? (
              // WIDOK DLA ZALOGOWANEGO
              <div className={styles.userProfileWrapper}>
                <Link href="/profile" className={styles.userProfile} onClick={closeMenu}>
                  {/* Generujemy avatar z inicjałów, jeśli user nie ma własnego */}
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
              // WIDOK DLA NIEZALOGOWANEGO (Teoretycznie rzadko widoczny, bo chroni nas LandingPage, ale warto mieć)
              <button
                className={styles.loginButton}
                onClick={() => onAuthOpen('login')}
              >
                <span className={styles.loginIcon}>🔓</span>
                <span className={styles.loginText}>Zaloguj się</span>
              </button>
            )}

            {/* Hamburger Menu (Mobile) */}
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

      {/* Mobile Menu */}
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