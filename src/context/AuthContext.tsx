/**
 * @file AuthContext.tsx
 * @brief Globalny kontekst zarządzania stanem autoryzacji (Client-Side Auth).
 *
 * Plik ten odpowiada za:
 * 1. Przechowywanie stanu zalogowanego użytkownika (`user`) w pamięci aplikacji.
 * 2. Persystencję sesji po odświeżeniu strony (odczyt z `localStorage`).
 * 3. Udostępnianie metod `login` i `logout` dla całej aplikacji.
 * 4. Zabezpieczenie dostępu do danych poprzez custom hook `useAuth`.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

/**
 * Definicja struktury danych użytkownika przechowywanej w stanie.
 */
interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * Interfejs opisujący kształt kontekstu (to, co otrzymują komponenty podrzędne).
 */
interface AuthContextType {
  /** Obiekt użytkownika lub null (jeśli niezalogowany) */
  user: User | null;
  /** Funkcja logowania: zapisuje token i przekierowuje */
  login: (token: string, userData: User) => void;
  /** Funkcja wylogowania: czyści dane i przekierowuje */
  logout: () => void;
  /** Flaga informująca, czy trwa inicjalne sprawdzanie sesji */
  isLoading: boolean;
}

/**
 * Utworzenie kontekstu React z wartością początkową `undefined`.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Komponent dostawcy (Provider).
 * Musi otaczać całą aplikację (zazwyczaj w `_app.tsx`), aby autoryzacja działała globalnie.
 *
 * @param {ReactNode} children - Komponenty podrzędne.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // --- STANY ---
  const [user, setUser] = useState<User | null>(null);
  /** * Stan `isLoading` jest kluczowy dla UX: zapobiega "miganiu" formularza logowania
   * zanim sprawdzimy, czy użytkownik ma zapisaną sesję w localStorage.
   */
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  /**
   * Efekt inicjalizacji (uruchamia się tylko raz po montowaniu).
   * Sprawdza `localStorage` w celu przywrócenia sesji użytkownika.
   */
  useEffect(() => {
    const checkAuth = () => {
      // Pobranie danych z pamięci przeglądarki
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Próba odtworzenia obiektu użytkownika
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Fallback: Jeśli dane są uszkodzone, czyścimy je
          console.error("Błąd parsowania użytkownika", e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      // Niezależnie od wyniku, kończymy ładowanie
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Obsługa logowania.
   * Zapisuje dane w pamięci trwałej (localStorage) i aktualizuje stan aplikacji.
   */
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Po zalogowaniu przekieruj na Dashboard (strona główna aplikacji)
    router.push('/');
  };

  /**
   * Obsługa wylogowania.
   * Czyści ślady użytkownika i resetuje stan.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Po wylogowaniu przekieruj na stronę główną (Landing Page)
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook `useAuth`.
 * Ułatwia dostęp do kontekstu i zabezpiecza przed użyciem poza Providerem.
 *
 * @throws {Error} Jeśli hook zostanie użyty poza drzewem komponentów `AuthProvider`.
 * @returns {AuthContextType} Obiekt z danymi użytkownika i funkcjami auth.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};