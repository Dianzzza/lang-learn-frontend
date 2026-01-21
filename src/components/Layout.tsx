/**
 * @file Layout.tsx
 * @brief Główny szablon (wrapper) aplikacji Next.js.
 *
 * Komponent ten stanowi ramę dla wszystkich podstron aplikacji. Odpowiada za:
 * 1. Spójną strukturę (Header, Main, Footer/Modale).
 * 2. Zarządzanie metadanymi SEO (znacznik <Head>).
 * 3. Dynamiczne generowanie nawigacji okruszkowej (Breadcrumbs).
 * 4. Obsługę animacji ładowania podczas zmiany tras routingu.
 * 5. Globalną obsługę modala autoryzacji.
 */

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

/**
 * Interfejs reprezentujący dane użytkownika w kontekście Layoutu.
 */
interface User {
  id: number;
  username: string;
  email: string;
  points?: number;
  streak_days?: number;
}

/**
 * @interface BreadcrumbItem
 * @brief Definicja pojedynczego elementu ścieżki nawigacyjnej ("okruszka").
 */
interface BreadcrumbItem {
  /** Etykieta wyświetlana użytkownikowi */
  label: string;
  /** Adres URL, do którego prowadzi link */
  href: string;
  /** Ikona reprezentująca dany segment */
  icon: string;
  /** Flaga oznaczająca, czy jest to ostatni element (bieżąca strona) */
  isLast?: boolean;
}

/**
 * Pomocniczy interfejs do mapowania ścieżek URL na czytelne nazwy i ikony.
 */
interface Route {
  label: string;
  icon: string;
}

/**
 * Właściwości przyjmowane przez komponent Layout.
 */
interface LayoutProps {
  /** Treść podstrony (children) renderowana wewnątrz tagu <main> */
  children: ReactNode;
  /** Tytuł strony wyświetlany na karcie przeglądarki */
  title?: string;
  /** Opis strony dla meta tagu description (SEO) */
  description?: string;
}

/**
 * Typy akcji autoryzacyjnych dostępnych w modalu.
 */
type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent' | 'reset-password';

/**
 * Komponent Layout.
 *
 * @param {LayoutProps} props - Właściwości konfiguracyjne layoutu.
 * @returns {JSX.Element} Główna struktura strony HTML.
 */
export default function Layout({ 
  children, 
  title = 'LangLearn', 
  description = 'Aplikacja do nauki języka angielskiego' 
}: LayoutProps) {
  const router = useRouter();
  
  // --- STANY ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  /** Stan sterujący wyświetlaniem indikatora ładowania strony (PageTransition) */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /** Lokalny stan użytkownika (może być zastąpiony przez AuthContext w przyszłości) */
  const [user, setUser] = useState<User | null>(null);

  // --- EFEKTY UBOCZNE ---

  /**
   * Nasłuchiwanie zdarzeń routera Next.js w celu obsługi animacji przejść.
   * Ustawia `isLoading` na true w momencie rozpoczęcia zmiany trasy,
   * a na false po zakończeniu lub wystąpieniu błędu.
   */
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

  // --- HANDLERY ---

  /** Otwiera modal autoryzacji w zadanym trybie. */
  const handleAuthOpen = (mode: AuthMode = 'login'): void => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  /** * Obsługa wylogowania użytkownika.
   * Czyści stan użytkownika i przekierowuje na stronę główną, jeśli użytkownik nie jest na niej.
   */
  const handleLogout = (): void => {
    setUser(null);
    // Redirect do strony głównej po wylogowaniu
    if (router.pathname !== '/') {
      router.push('/');
    }
  };

  /**
   * Generuje tablicę okruszków (breadcrumbs) na podstawie aktualnej ścieżki URL.
   *
   * Algorytm:
   * 1. Rozbija ścieżkę (path) na segmenty.
   * 2. Mapuje znane segmenty (zdefiniowane w obiekcie `routes`) na etykiety i ikony.
   * 3. Obsługuje segmenty dynamiczne (parametryzowane), wyświetlając je z prefiksem `#`.
   * 4. Buduje ścieżkę narastająco (`currentPath`).
   *
   * @returns {BreadcrumbItem[]} Lista elementów nawigacyjnych.
   */
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = router.pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Strona główna', href: '/', icon: '🏠' }
    ];

    // Mapa znanych ścieżek
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
        // Znaleziono zdefiniowaną trasę
        breadcrumbs.push({
          label: routes[segment].label,
          href: currentPath,
          icon: routes[segment].icon,
          isLast: index === pathSegments.length - 1
        });
      } else if (segment !== '[id]') {
        // Dla dynamicznych route'ów typu /lesson/123, gdzie segment to ID
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
        {/* Nagłówek aplikacji */}
        <Header
          user={user} // Uwaga: user może pochodzić z props lub Contextu w pełnej implementacji
          onAuthOpen={handleAuthOpen}
          onLogout={handleLogout}
          currentPath={router.pathname} // Do podświetlania aktywnego linku
        />

        {/* Dynamiczne Breadcrumbs - renderowane tylko gdy nie jesteśmy na stronie głównej */}
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

        {/* Główna zawartość strony z animacją przejścia */}
        <main className={styles.main}>
          <PageTransition isLoading={isLoading}>
            {children}
          </PageTransition>
        </main>

        <BackToTop />

        {/* Globalny modal autoryzacji dostępny z poziomu całego layoutu */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    </>
  );
}