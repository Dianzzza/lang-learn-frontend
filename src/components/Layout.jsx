// components/Layout.jsx
'use client';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import AuthModal from './AuthModal';
import PageTransition from './PageTransition';
import BackToTop from './BackToTop';
import styles from '../styles/Layout.module.css';

export default function Layout({ children, title = 'LangLearn', description = 'Aplikacja do nauki języka angielskiego' }) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Loading state dla transitions między stronami
  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);
    const handleRouteChangeError = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    // Redirect do strony głównej po wylogowaniu
    if (router.pathname !== '/') {
      router.push('/');
    }
  };

  const getBreadcrumbs = () => {
    const pathSegments = router.pathname.split('/').filter(segment => segment !== '');
    
    const breadcrumbs = [
      { label: 'Strona główna', href: '/', icon: '🏠' }
    ];

    const routes = {
      'study': { label: 'Nauka', icon: '📚' },
      'tests': { label: 'Testy', icon: '📝' },
      'duels': { label: 'Pojedynki', icon: '⚔️' },
      'ranking': { label: 'Ranking', icon: '🏆' },
      'profile': { label: 'Profil', icon: '👤' },
      'lesson': { label: 'Lekcja', icon: '📖' }
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (routes[segment]) {
        breadcrumbs.push({
          label: routes[segment].label,
          href: currentPath,
          icon: routes[segment].icon,
          isLast: index === pathSegments.length - 1
        });
      } else if (segment !== '[id]') {
        // Dla dynamicznych route'ów typu /lesson/123
        breadcrumbs.push({
          label: `#${segment}`,
          href: currentPath,
          icon: '📄',
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.app}>
        <Header 
          user={user}
          onAuthOpen={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          currentPath={router.pathname}
        />

        {/* Breadcrumbs */}
        {router.pathname !== '/' && (
          <nav className={styles.breadcrumbs}>
            <div className={styles.breadcrumbsContainer}>
              {getBreadcrumbs().map((crumb, index) => (
                <span key={crumb.href} className={styles.breadcrumbItem}>
                  {index > 0 && <span className={styles.breadcrumbSeparator}>→</span>}
                  <a 
                    href={crumb.href}
                    className={`${styles.breadcrumbLink} ${crumb.isLast ? styles.current : ''}`}
                    onClick={(e) => {
                      if (!crumb.isLast) {
                        e.preventDefault();
                        router.push(crumb.href);
                      }
                    }}
                  >
                    <span className={styles.breadcrumbIcon}>{crumb.icon}</span>
                    {crumb.label}
                  </a>
                </span>
              ))}
            </div>
          </nav>
        )}

        <main className={styles.main}>
          <PageTransition isLoading={isLoading}>
            {children}
          </PageTransition>
        </main>

        <BackToTop />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </>
  );
}
