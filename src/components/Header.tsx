
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

interface User {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

interface HeaderProps {
  user: User | null;
  onAuthOpen: (mode?: string) => void;
  onLogout: () => void;
  currentPath: string;
}

export default function Header({ user, onAuthOpen, onLogout, currentPath }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Nauka', href: '/study', icon: '📚' },
    { name: 'Testy', href: '/tests', icon: '📝' },
    { name: 'Pojedynki', href: '/duels', icon: '⚔️' },
    { name: 'Ranking', href: '/ranking', icon: '🏆' }
  ];

  // NAPRAWIONY - dodany null/undefined check
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
              <div className={styles.userProfileWrapper}>
                <Link href="/profile" className={styles.userProfile} onClick={closeMenu}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=32`}
                    alt={user.username}
                    className={styles.avatar}
                  />
                  <span className={styles.username}>{user.username}</span>
                </Link>
                <button
                  className={styles.logoutBtn}
                  onClick={onLogout}
                  title="Wyloguj się"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button
                className={styles.loginButton}
                onClick={() => onAuthOpen('login')}
              >
                <span className={styles.loginIcon}>🔓</span>
                <span className={styles.loginText}>Zaloguj się</span>
              </button>
            )}

            {/* Hamburger Menu */}
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
            
            {!user && (
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