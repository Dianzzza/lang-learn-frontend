// src/pages/profile.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import UserCourses from '../components/UserCourses';
import ActivityFeed from '../components/ActivityFeed';
import { apiRequest } from '../lib/api';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false); // Prosta flaga błędu

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Pobieramy dane użytkownika
        const userData = await apiRequest<any>('/auth/me', 'GET', undefined, token);
        setUser(userData);

        // Ustawiamy statystyki (z bezpiecznymi wartościami domyślnymi)
        setStats({
          totalPoints: userData.points || 0,
          currentStreak: userData.streak_days || 1,
          longestStreak: userData.streak_days || 1,
          todayLessons: userData.today_lessons || 0,
          dailyGoal: 5,
          totalHours: 0, // Placeholder
          activeCourses: [] // Placeholder
        });

      } catch (err) {
        console.error("Błąd pobierania profilu:", err);
        // Jeśli błąd sugeruje brak autoryzacji, pokazujemy ekran logowania
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

  // --- EKRAN BRAKU AUTORYZACJI (Zamiast brzydkiego błędu) ---
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

  // --- GŁÓWNY WIDOK PROFILU ---
  return (
    <Layout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <ProfileHeader
          user={{
            id: user.id,
            username: user.username,
            displayName: user.username,
            email: user.email,
            avatar: user.avatar || '👤',
            bio: 'Użytkownik LangLearn',
            level: user.level || 'A1',
            joinedDate: user.createdAt || new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          
          {/* LEWA KOLUMNA */}
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
             
             {/* Placeholder Kursów */}
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

          {/* PRAWA KOLUMNA */}
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