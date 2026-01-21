/**
 * @file useProfile.ts
 * @brief Custom Hook do zarządzania danymi profilu użytkownika.
 *
 * Hook ten agreguje dane z wielu punktów końcowych API (Profil, Statystyki, Kursy, Aktywność)
 * w jeden spójny stan. Implementuje logikę "Graceful Degradation" - błąd w pobieraniu
 * danych drugorzędnych (np. statystyk) nie blokuje wyświetlania danych głównych (użytkownika).
 */

import { useEffect, useState } from 'react';
import {
  User,
  UserStats,
  Course,
  Activity,
  getUserProfile,
  getUserStats,
  getUserCourses,
  getUserActivity,
} from '../lib/api';

/**
 * Interfejs obiektu zwracanego przez hook useProfile.
 */
interface UseProfileReturn {
  /** Główne dane użytkownika (lub null, jeśli nie załadowano) */
  user: User | null;
  /** Statystyki użytkownika (punkty, streak) */
  stats: UserStats | null;
  /** Lista aktywnych kursów */
  activeCourses: Course[];
  /** Historia ostatniej aktywności */
  recentActivity: Activity[];
  /** Flaga ładowania (true podczas pobierania danych) */
  loading: boolean;
  /** Komunikat błędu (jeśli wystąpił błąd krytyczny) */
  error: string | null;
  /** Funkcja pozwalająca ręcznie odświeżyć dane (np. po edycji profilu) */
  refetch: () => Promise<void>;
}

/**
 * Custom Hook useProfile.
 *
 * Automatycznie pobiera dane po zamontowaniu komponentu.
 * Wymaga obecności tokena w `localStorage`.
 *
 * @returns {UseProfileReturn} Stan profilu i funkcje pomocnicze.
 */
export function useProfile(): UseProfileReturn {
  // --- STANY DANYCH ---
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  
  // --- STANY UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Główna funkcja asynchroniczna pobierająca dane.
   * Wykonuje serię zapytań do API.
   */
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Weryfikacja autoryzacji
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;  // Brak tokena = brak danych, ale nie jest to błąd API (np. stan wylogowania)
      }

      // 2. Pobranie danych KRYTYCZNYCH (Profil Użytkownika)
      // Jeśli to się nie uda, przerywamy cały proces (throw error).
      const userData = await getUserProfile(token);
      if (!userData) throw new Error('Nie udało się załadować profilu');
      setUser(userData);

      // 3. Pobranie danych DRUGORZĘDNYCH (Statystyki, Kursy, Aktywność)
      // Używamy bloków try-catch dla każdego zapytania osobno, aby błąd w jednym
      // (np. błąd serwera statystyk) nie wyczyścił całego profilu.
      
      // Statystyki
      try {
        const statsData = await getUserStats(userData.id, token);
        setStats(statsData);
      } catch (err) {
        console.warn('Stats fetch error:', err);
        // Nie ustawiamy globalnego błędu, użytkownik zobaczy profil bez statystyk
      }

      // Aktywne kursy
      try {
        const coursesData = await getUserCourses(userData.id, token);
        setActiveCourses(coursesData || []);
      } catch (err) {
        console.warn('Courses fetch error:', err);
      }

      // Ostatnia aktywność
      try {
        const activityData = await getUserActivity(userData.id, token);
        setRecentActivity(activityData || []);
      } catch (err) {
        console.warn('Activity fetch error:', err);
      }

    } catch (err) {
      // Obsługa błędu krytycznego (np. brak sieci, błąd autoryzacji przy pobieraniu usera)
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efekt uruchamiający pobieranie danych przy montowaniu komponentu.
   */
  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    user,
    stats,
    activeCourses,
    recentActivity,
    loading,
    error,
    refetch: fetchProfileData, // Eksportujemy funkcję, aby umożliwić "Pull to Refresh"
  };
}