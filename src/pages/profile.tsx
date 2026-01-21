/**
 * @file profile.tsx
 * @brief Strona profilu użytkownika (Personal Dashboard).
 *
 * Wyświetla szczegółowe informacje o użytkowniku, statystyki postępów oraz historię aktywności.
 * Komponent ten:
 * 1. Weryfikuje token JWT przy wejściu.
 * 2. Pobiera dane użytkownika z `/auth/me`.
 * 3. Renderuje sekcje: Nagłówek profilu, Statystyki (KPI), Lista kursów (Placeholder), Aktywność (Placeholder).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import UserCourses from '../components/UserCourses'; // Nieużywany import (do przyszłego wykorzystania)
import ActivityFeed from '../components/ActivityFeed'; // Nieużywany import
import { apiRequest } from '../lib/api';

export default function ProfilePage() {
  const router = useRouter();

  // --- STANY ---
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Flaga błędu autoryzacji (np. wygasły token)
  const [authError, setAuthError] = useState(false); 

  /**
   * Efekt pobierania danych profilowych.
   */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      // Szybkie wyjście, jeśli brak tokena w przeglądarce
      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Pobranie danych użytkownika
        const userData = await apiRequest<any>('/auth/me', 'GET', undefined, token);
        setUser(userData);

        // 2. Przygotowanie obiektu statystyk
        // W przyszłości te dane mogą pochodzić z osobnego endpointu `/stats`
        setStats({
          totalPoints: userData.points || 0,
          currentStreak: userData.streak_days || 1,
          longestStreak: userData.streak_days || 1, // Placeholder
          todayLessons: userData.today_lessons || 0,
          dailyGoal: 5, // Hardcoded goal
          totalHours: 0, // Placeholder
          activeCourses: [] // Placeholder
        });

      } catch (err) {
        console.error("Błąd pobierania profilu:", err);
        // Błąd API (np. 401 Unauthorized) traktujemy jako błąd autoryzacji
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- EKRAN ŁADOWANIA ---
  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <h2>⏳ Ładowanie profilu...</h2>
        </div>
      </Layout>
    );
  }

  // --- EKRAN BŁĘDU AUTORYZACJI ---
  // Wyświetlany zamiast przekierowania, aby dać użytkownikowi informację zwrotną
  if (authError || !user) {
    return (
      <Layout>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          maxWidth: '500px', 
          margin: '0 auto' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ marginBottom: '10px' }}>Sesja wygasła</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            Twoja sesja wygasła lub nie jesteś zalogowany. Zaloguj się ponownie, aby zobaczyć profil.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            style={{ 
              padding: '12px 24px', 
              background: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600', 
              fontSize: '16px'
            }}
          >
            Przejdź do logowania
          </button>
        </div>
      </Layout>
    );
  }

  // --- GŁÓWNY WIDOK ---
  return (
    <Layout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Nagłówek profilu z awatarem i podstawowymi danymi */}
        <ProfileHeader
          user={{
            id: user.id,
            username: user.username,
            displayName: user.username, // Fallback do username
            email: user.email,
            avatar: user.avatar || '👤',
            bio: 'Użytkownik LangLearn',
            level: user.level || 'A1',
            joinedDate: user.createdAt || new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }}
        />

        {/* Grid layout dla treści profilu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          
          {/* LEWA KOLUMNA: Statystyki i Kursy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {stats && (
              <ProfileStats
                totalPoints={stats.totalPoints}
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                todayLessons={stats.todayLessons}
                dailyGoal={stats.dailyGoal}
                totalHours={stats.totalHours}
                activeCourses={stats.activeCourses || 0}
              />
            )}
              
             {/* Sekcja Kursów (Placeholder) */}
             <div style={{ 
                padding: '30px', 
                background: '#fff', 
                borderRadius: '16px', 
                border: '1px solid #f3f4f6',
                textAlign: 'center'
             }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📚</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Twoje Kursy</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>Nie zapisałeś się jeszcze na żaden kurs.</p>
                <button 
                  onClick={() => router.push('/study')}
                  style={{
                    marginTop: '15px',
                    color: '#4f46e5',
                    background: 'none',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Przeglądaj katalog →
                </button>
             </div>
          </div>

          {/* PRAWA KOLUMNA: Aktywność (Placeholder) */}
          <div>
             <div style={{ 
                padding: '30px', 
                background: '#fff', 
                borderRadius: '16px', 
                border: '1px solid #f3f4f6',
                textAlign: 'center'
             }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Ostatnia aktywność</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>Tutaj pojawi się historia Twojej nauki.</p>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}