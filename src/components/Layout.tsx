
'use client';

import { useRouter } from 'next/router';
import { useState, useEffect, ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from './Header';
import AuthModal from './AuthModal';
import PageTransition from './PageTransition';
import BackToTop from './BackToTop';
import styles from '../styles/Layout.module.css';

interface User {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  icon: string;
  isLast?: boolean;
}

interface Route {
  label: string;
  icon: string;
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent' | 'reset-password';

export default function Layout({ 
  children, 
  title = 'LangLearn', 
  description = 'Aplikacja do nauki języka angielskiego' 
}: LayoutProps) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Loading state dla transitions między stronami
  useEffect(() => {
    const handleRouteChangeStart = (): void => setIsLoading(true);
    const handleRouteChangeComplete = (): void => setIsLoading(false);
    const handleRouteChangeError = (): void => setIsLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const handleAuthOpen = (mode: AuthMode = 'login'): void => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = (): void => {
    setUser(null);
    // Redirect do strony głównej po wylogowaniu
    if (router.pathname !== '/') {
      router.push('/');
    }
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = router.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Strona główna', href: '/', icon: '🏠' }
    ];

    const routes: Record<string, Route> = {
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

  const breadcrumbs = getBreadcrumbs();

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
          onAuthOpen={handleAuthOpen}
          onLogout={handleLogout}
          currentPath={router.pathname}
        />

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <nav className={styles.breadcrumbs}>
            <div className={styles.breadcrumbsContainer}>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className={styles.breadcrumbItem}>
                  {index > 0 && (
                    <span className={styles.breadcrumbSeparator}>
                      →
                    </span>
                  )}
                  <Link 
                    href={breadcrumb.href}
                    className={`${styles.breadcrumbLink} ${
                      breadcrumb.isLast ? styles.current : ''
                    }`}
                  >
                    <span className={styles.breadcrumbIcon}>
                      {breadcrumb.icon}
                    </span>
                    {breadcrumb.label}
                  </Link>
                </div>
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

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    </>
  );
}