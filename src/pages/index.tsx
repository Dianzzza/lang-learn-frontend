/**
 * @file index.tsx
 * @brief Strona główna (Dashboard) zalogowanego użytkownika.
 *
 * Jest to centrum dowodzenia aplikacją. Komponent ten:
 * 1. Agreguje dane z dwóch źródeł API:
 * - `/auth/me`: Dane profilowe, punkty, streak, cel dzienny.
 * - `/categories`: Lista dostępnych lekcji wraz z OBLICZONYM postępem (backend-side calculation).
 * 2. Przekazuje te dane do komponentów prezentacyjnych:
 * - `WelcomeSection`: Hero banner z powitaniem.
 * - `UserStats`: Widgety statystyk (KPI).
 * - `LessonsList`: Lista kategorii do nauki (Pasek boczny).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LessonsList from '../components/LessonsList';
import WelcomeSection from '../components/WelcomeSection';
import UserStats from '../components/UserStats';
import styles from '../styles/Home.module.css';
import { apiRequest } from '../lib/api';

/**
 * Interfejs kategorii rozszerzony o pole postępu.
 * To pole `progress` jest teraz obliczane przez backend na podstawie liczby opanowanych fiszek.
 */
interface CategoryWithProgress {
  id: number;
  name: string;
  progress: number; // Wartość 0-100 zwracana przez API
  totalCards: number;
}

/**
 * Dane użytkownika potrzebne do sekcji Hero i Statystyk.
 */
interface UserDashboardData {
  username: string;
  points: number;
  global_rank: number;
  total_users: number;
  streak_days: number;
  today_lessons: number;
  target_lessons: number;
  level: number;
}

/** Struktura danych dla pojedynczego kafelka statystyk */
interface Stat {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: string;
}

export default function Home() {
  const router = useRouter();
  
  // --- STANY ---
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserDashboardData | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  /**
   * Efekt inicjalizacji danych.
   * Pobiera równolegle (lub sekwencyjnie) dane użytkownika i strukturę kursu.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Bezpiecznik: Jeśli brak tokena, Layout/AuthGuard i tak przekieruje,
        // ale tutaj przerywamy pobieranie, by uniknąć błędów 401.
        if (!token) {
          setLoading(false);
          return;
        }

        // 1. Pobranie danych Użytkownika (Hero Section + Stats)
        const userResponse = await apiRequest<UserDashboardData>('/auth/me', 'GET', null, token);
        setUserData(userResponse);

        // 2. Pobranie Kategorii z RZECZYWISTYM POSTĘPEM
        // Endpoint `/categories` w backendzie sprawdza tabelę UserFlashcardProgress
        // i zwraca procent ukończenia dla każdej kategorii.
        const categoriesResponse = await apiRequest<CategoryWithProgress[]>('/categories', 'GET', null, token);
        
        // Mapowanie danych z API na format wymagany przez komponent LessonsList
        const formattedLessons = categoriesResponse.map(cat => ({
          id: cat.id,
          title: cat.name,
          level: 'A1', // Placeholder: W przyszłości można to pobierać z bazy
          progress: cat.progress, // <-- Kluczowe: Prawdziwy procent z backendu
          status: cat.progress === 100 ? 'completed' : 'inprogress'
        }));
        
        setLessons(formattedLessons);

      } catch (error) {
        console.error("Błąd dashboardu:", error);
        // Opcjonalnie: obsługa wylogowania przy błędzie 401
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Przygotowanie danych dla widgetów statystyk (UserStats)
  const stats: Stat[] = [
    {
      title: 'Twój Poziom',
      value: `Lvl ${userData?.level || 1}`,
      subtitle: 'Początkujący',
      icon: '⭐'
    },
    {
      title: 'Punkty Razem',
      value: `${userData?.points || 0}`,
      subtitle: 'pkt',
      icon: '🏆'
    },
    {
      title: 'Dni z rzędu',
      value: `${userData?.streak_days || 0} dzień`,
      subtitle: 'świetnie Ci idzie!',
      icon: '🔥'
    },
    {
      title: 'Dzisiejszy cel',
      value: `${userData?.today_lessons || 0}/${userData?.target_lessons || 5}`,
      subtitle: 'ukończonych aktywności',
      icon: '🎯'
    }
  ];

  // Renderowanie stanu ładowania (można zastąpić Skeleton Loaderem)
  if (loading) return <Layout><div>Ładowanie...</div></Layout>;

  return (
    <Layout>
      <div className={styles.app}>
        <main className={styles.main}>
          <div className={styles.container}>
            
            {/* LEWA KOLUMNA: Nawigacja po lekcjach */}
            <div className={styles.sidebar}>
              <LessonsList lessons={lessons} />
            </div>
            
            {/* ŚRODKOWA KOLUMNA: Hero Section */}
            <div className={styles.welcomeSection}>
              {userData && <WelcomeSection user={userData} />}
            </div>
            
            {/* PRAWA KOLUMNA: KPI i Statystyki */}
            <div className={styles.statsSection}>
              <UserStats stats={stats} />
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
}