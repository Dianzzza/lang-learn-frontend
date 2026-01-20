// src/pages/profile.tsx - UPROSZCZONE (BEZ LICZENIA ZADAŃ)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import { 
  getCurrentUser,
  UserProfile
} from '../lib/api';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. SPRAWDZENIE TOKENA
        const token = localStorage.getItem('token');
        console.log('📋 Token z localStorage:', token ? '✅ Istnieje' : '❌ BRAK!');
        
        if (!token) {
          console.error('❌ BRAK TOKENA!');
          setAuthError(true);
          setLoading(false);
          return;
        }

        // 2. POBIERANIE DANYCH UŻYTKOWNIKA
        console.log('🔄 Pobieranie getCurrentUser z /auth/me...');
        const userData = await getCurrentUser(token);
        console.log('✅ Dane użytkownika pobrane:', userData);
        setUser(userData);

        // 3. USTAWIENIE STATYSTYK - Z BAZY DANYCH
        setStats({
          totalPoints: userData.points || 0,
          currentStreak: userData.streak_days || 0,
          longestStreak: userData.streak_days || 0,
          todayLessons: userData.today_lessons || 0,
          dailyGoal: userData.target_lessons || 5,
        });

        console.log('✅ PROFIL ZAŁADOWANY POMYŚLNIE!');

      } catch (err) {
        console.error("❌ BŁĄD:", err);
        const errorMsg = err instanceof Error ? err.message : 'Nieznany błąd';
        console.error('📌 Wiadomość błędu:', errorMsg);
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

  // --- EKRAN BŁĘDU ---
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
        
        {/* HEADER */}
        <ProfileHeader
          user={{
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            email: user.email,
            avatar: user.avatar || '👤',
            level: user.level || 'A1',
            joinedDate: user.createdAt || new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }}
        />

        {/* BIO UŻYTKOWNIKA */}
        {user.bio && (
          <div style={{ 
             padding: '20px', 
             background: '#fff', 
             borderRadius: '16px', 
             border: '1px solid #f3f4f6',
             marginTop: '24px'
          }}>
             <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>📝 O mnie</h3>
             <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
               {user.bio}
             </p>
          </div>
        )}

        {/* STATYSTYKI */}
        {stats && (
          <div style={{ marginTop: '24px' }}>
            <ProfileStats
              totalPoints={stats.totalPoints}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              todayLessons={stats.todayLessons}
              dailyGoal={stats.dailyGoal}
              totalHours={stats.totalHours}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}