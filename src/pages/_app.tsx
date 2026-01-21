/**
 * @file _app.tsx
 * @brief Główny komponent aplikacji (Root Component).
 *
 * Plik ten jest specjalnym plikiem Next.js, który inicjalizuje każdą stronę.
 * Został tutaj zaimplementowany mechanizm "Global Auth Guard":
 * 1. Aplikacja jest owinięta w `AuthProvider`, aby stan logowania był dostępny wszędzie.
 * 2. Komponent `AuthGuard` decyduje, co wyświetlić:
 * - Spinner (gdy trwa sprawdzanie sesji).
 * - Landing Page (dla niezalogowanych).
 * - Właściwą aplikację (dla zalogowanych lub na stronach publicznych).
 */

import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LandingPage from '../components/LandingPage';
import '../styles/globals.css';

/**
 * Komponent "Strażnik" (Wrapper).
 * Odpowiada za ochronę tras i warunkowe renderowanie widoku gościa vs użytkownika.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Lista ścieżek, które są dostępne bez logowania (tzw. Whitelist)
  const publicRoutes = ['/reset-password', '/privacy-policy']; 
  
  // 1. Stan Ładowania: Sprawdzamy token w localStorage
  if (isLoading) {
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        fontFamily: 'sans-serif'
      }}>
         {/* Tutaj w przyszłości wstawimy ładny Spinner z CSS Modules */}
         Ładowanie aplikacji...
      </div>
    ); 
  }

  // 2. Sprawdzenie trasy publicznej
  // Używamy `typeof window`, aby uniknąć błędów podczas renderowania po stronie serwera (SSR)
  const isPublicRoute = typeof window !== 'undefined' && 
    publicRoutes.some(path => window.location.pathname.startsWith(path));

  // 3. Logika Decyzyjna:
  // JEŚLI: Użytkownik nie jest zalogowany I nie jest to strona publiczna (np. reset hasła)
  // TO: Pokaż stronę sprzedażową (Landing Page) zamiast Dashboardu.
  if (!user && !isPublicRoute) {
    return <LandingPage />;
  }

  // 4. Renderowanie Właściwej Treści:
  // Użytkownik jest zalogowany LUB jest na dozwolonej stronie publicznej.
  return <>{children}</>;
}

/**
 * Główna funkcja App.
 *
 * @param {AppProps} props - Props dostarczane przez Next.js (komponent strony i jej propsy).
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    // Dostawca kontekstu autoryzacji obejmuje całą aplikację
    <AuthProvider>
      {/* Strażnik pilnuje dostępu do wnętrza */}
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}