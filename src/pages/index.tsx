// frontend/src/pages/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LessonsList from '../components/LessonsList';
import WelcomeSection from '../components/WelcomeSection';
import UserStats from '../components/UserStats';
import styles from '../styles/Home.module.css';
import { apiRequest } from '../lib/api';

// Zaktualizowany interfejs kategorii
interface CategoryWithProgress {
  id: number;
  name: string;
  progress: number; // Teraz backend to zwraca!
  totalCards: number;
}

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

interface Stat {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserDashboardData | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // 1. Pobieramy usera
        const userResponse = await apiRequest<UserDashboardData>('/auth/me', 'GET', null, token);
        setUserData(userResponse);

        // 2. Pobieramy kategorie z NOWYM POLICZONYM POSTĘPEM
        // Ważne: teraz przekazujemy token, bo backend tego wymaga do liczenia
        const categoriesResponse = await apiRequest<CategoryWithProgress[]>('/categories', 'GET', null, token);
        
        const formattedLessons = categoriesResponse.map(cat => ({
          id: cat.id,
          title: cat.name,
          level: 'A1', // Możemy to kiedyś brać z bazy
          progress: cat.progress, // <-- TUTAJ WPADANĄ PRAWDZIWE PROCENTY (np. 85%)
          status: cat.progress === 100 ? 'completed' : 'inprogress'
        }));
        
        setLessons(formattedLessons);

      } catch (error) {
        console.error("Błąd dashboardu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) return <Layout><div>Ładowanie...</div></Layout>;

  return (
    <Layout>
      <div className={styles.app}>
        <main className={styles.main}>
          <div className={styles.container}>
            
            {/* LEWA KOLUMNA - Lista Lekcji (Teraz z prawdziwym progresem!) */}
            <div className={styles.sidebar}>
              <LessonsList lessons={lessons} />
            </div>
            
            {/* ŚRODEK - Powitanie */}
            <div className={styles.welcomeSection}>
              {userData && <WelcomeSection user={userData} />}
            </div>
            
            {/* PRAWA KOLUMNA - Statystyki */}
            <div className={styles.statsSection}>
              <UserStats stats={stats} />
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
}