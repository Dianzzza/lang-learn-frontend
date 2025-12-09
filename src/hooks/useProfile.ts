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


interface UseProfileReturn {
  user: User | null;
  stats: UserStats | null;
  activeCourses: Course[];
  recentActivity: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}


export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz token z localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;  // ← Jeśli brak tokena, nie rób nic
      }

      // Pobierz profil użytkownika
      const userData = await getUserProfile(token);
      if (!userData) throw new Error('Nie udało się załadować profilu');
      setUser(userData);

      // Pobierz statystyki
      try {
        const statsData = await getUserStats(userData.id, token);
        setStats(statsData);
      } catch (err) {
        console.warn('Stats fetch error:', err);
      }

      // Pobierz aktywne kursy
      try {
        const coursesData = await getUserCourses(userData.id, token);
        setActiveCourses(coursesData || []);
      } catch (err) {
        console.warn('Courses fetch error:', err);
      }

      // Pobierz ostatnią aktywność
      try {
        const activityData = await getUserActivity(userData.id, token);
        setRecentActivity(activityData || []);
      } catch (err) {
        console.warn('Activity fetch error:', err);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);  // ← Uruchamia się raz na starcie

  return {
    user,
    stats,
    activeCourses,
    recentActivity,
    loading,
    error,
    refetch: fetchProfileData,
  };
}
