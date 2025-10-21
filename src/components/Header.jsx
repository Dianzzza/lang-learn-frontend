// components/Header.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

export default function Header({ user, onAuthOpen, onLogout, currentPath }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Nauka', href: '/study', icon: '📚' },
    { name: 'Testy', href: '/tests', icon: '📝' },
    { name: 'Pojedynki', href: '/duels', icon: '⚔️' },
    { name: 'Ranking', href: '/ranking', icon: '🏆' }
  ];

  const isActivePath = (href) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const handleNavClick = (href, e) => {
    e.preventDefault();
    closeMenu();
    router.push(href);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>LangLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navigationItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`${styles.navLink} ${isActivePath(item.href) ? styles.active : ''}`}
                onClick={(e) => handleNavClick(item.href, e)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name}
                {isActivePath(item.href) && (
                  <span className={styles.activeIndicator}></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile & User Section */}
          <div className={styles.rightSection}>
            {/* Hamburger Button */}
            <button 
              className={styles.hamburger} 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className={styles.userProfileWrapper}>
                <Link href="/profile" className={styles.userProfile}>
                  <img 
                    src="/api/placeholder/32/32" 
                    alt={user.username || 'User'} 
                    className={styles.avatar}
                  />
                  <span className={styles.username}>{user.username}</span>
                </Link>
                <button 
                  className={styles.logoutBtn} 
                  onClick={onLogout}
                  title="Wyloguj"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button 
                className={styles.loginButton}
                onClick={onAuthOpen}
              >
                <span className={styles.loginIcon}>🔑</span>
                <span className={styles.loginText}>Zaloguj</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={closeMenu}>
            <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
              {navigationItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`${styles.mobileNavLink} ${isActivePath(item.href) ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(item.href, e)}
                >
                  <span className={styles.mobileNavIcon}>{item.icon}</span>
                  {item.name}
                  {isActivePath(item.href) && (
                    <span className={styles.mobileActiveIndicator}>●</span>
                  )}
                </Link>
              ))}
              
              {!user && (
                <button 
                  className={styles.mobileLoginButton}
                  onClick={() => {
                    onAuthOpen();
                    closeMenu();
                  }}
                >
                  <span className={styles.mobileNavIcon}>🔑</span>
                  Zaloguj się
                </button>
              )}

              {user && (
                <Link 
                  href="/profile"
                  className={`${styles.mobileNavLink} ${currentPath === '/profile' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick('/profile', e)}
                >
                  <span className={styles.mobileNavIcon}>👤</span>
                  Profil
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
