'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import UserCourses from '../components/UserCourses';
import ActivityFeed from '../components/ActivityFeed';
// import styles from '../styles/Profile.module.css'; // Odkomentuj jeśli masz plik CSS
import { useProfile } from '../hooks/useProfile';

export default function ProfilePage() {
  const router = useRouter();
  
  // Używamy naszego custom hooka do pobrania danych
  const {
    user,
    stats,
    activeCourses,
    recentActivity,
    loading,
    error,
    refetch,
  } = useProfile();

  useEffect(() => {
    // Logika przekierowania w przypadku braku autoryzacji
    if (!loading) {
      if (error || !user) {
        console.log('Redirecting to login due to error or missing user');
        // Jeśli błąd sugeruje problem z tokenem, czyścimy go
        if (error) localStorage.removeItem('token');
        router.push('/auth/login');
      }
    }
  }, [loading, user, error, router]);

  // Stan ładowania
  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Ładowanie profilu...</p>
        </div>
      </Layout>
    );
  }

  // Zabezpieczenie przed renderowaniem jeśli brak usera (czekamy na redirect z useEffect)
  if (error || !user) {
    return null; 
  }

  return (
    <Layout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Nagłówek profilu */}
        <ProfileHeader
          user={{
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username, // Fallback do username
            email: user.email, // ✅ Tutaj przekazujemy prawidłowy email z bazy!
            avatar: user.avatar || '👤',
            bio: user.bio || '',
            level: user.level || 'A1',
            joinedDate: user.joinedDate || new Date().toISOString(),
            lastActive: user.lastActive || new Date().toISOString(),
          }}
        />

        {/* Główna siatka layoutu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          
          {/* LEWA KOLUMNA: Statystyki i Kursy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Statystyki */}
            {stats && (
              <ProfileStats
                totalPoints={stats.totalPoints}
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                todayLessons={stats.todayLessons}
                dailyGoal={stats.dailyGoal}
                totalHours={stats.totalHours}
                activeCourses={stats.activeCourses}
              />
            )}

            {/* Aktywne Kursy */}
            {activeCourses.length > 0 ? (
              <UserCourses courses={activeCourses} />
            ) : (
              // Placeholder gdy brak kursów
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📚</div>
                <p style={{ marginBottom: '15px', color: '#666' }}>Nie masz jeszcze aktywnych kursów.</p>
                <button
                  onClick={() => router.push('/study')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4f46e5', // Indigo-600
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Przeglądaj kursy
                </button>
              </div>
            )}
          </div>

          {/* PRAWA KOLUMNA: Aktywność */}
          <div>
            {recentActivity.length > 0 ? (
              <ActivityFeed activities={recentActivity} />
            ) : (
              // Placeholder gdy brak aktywności
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <p style={{ marginBottom: '15px', color: '#666' }}>Brak ostatniej aktywności.</p>
                <button
                  onClick={() => router.push('/study')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Zacznij naukę
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Przycisk odświeżania (opcjonalny) */}
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <button
            onClick={refetch}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#6b7280', // Gray-500
              border: '1px solid #d1d5db', // Gray-300
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <span>🔄</span> Odśwież dane
          </button>
        </div>
        
      </div>
    </Layout>
  );
}
