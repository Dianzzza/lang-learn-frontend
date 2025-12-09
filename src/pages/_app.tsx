// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LandingPage from '../components/LandingPage';
import '../styles/globals.css';

// Komponent "Strażnik"
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Lista stron dostępnych bez logowania
  const publicRoutes = ['/reset-password']; 
  
  if (isLoading) {
    // Tutaj możesz dać ładny spinner ładowania
    return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            Ładowanie aplikacji...
        </div>
    ); 
  }

  // Sprawdź czy aktualny adres jest publiczny
  const isPublicRoute = typeof window !== 'undefined' && 
    publicRoutes.some(path => window.location.pathname.startsWith(path));

  // JEŚLI: Nie ma usera I nie jest to publiczna strona -> Pokaż LandingPage
  if (!user && !isPublicRoute) {
    return <LandingPage />;
  }

  // JEŚLI: User jest zalogowany LUB strona jest publiczna -> Pokaż właściwą treść
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}