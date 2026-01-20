// src/pages/ranking.tsx - BEZ FILTRÓW + AVATARY Z BAZY (JAK PROFIL)

import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

// Typy
type User = {
  id: number;
  name: string;
  points: number;
  level: string;
  avatar: string;
  status: string;
};

type BackendUser = {
  id: number;
  username: string;
  points: number;
  level: number;
  avatar: string;
};

const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
type SortKey = 'points' | 'level' | 'name';

export default function RankingPage() {
  const [rankingData, setRankingData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortAsc, setSortAsc] = useState(false);

  // Pobieranie danych
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<BackendUser[]>('/ranking', 'GET');

        console.log('📊 Dane rankingu:', data);

        const formattedUsers: User[] = data.map(u => ({
          id: u.id,
          name: u.username,
          points: u.points,
          level: allLevels[Math.min(u.level - 1, 5)] || 'A1',
          avatar: u.avatar || '👤',
          status: u.points > 0 ? "Aktywny" : "Nowy"
        }));

        console.log('✅ Sformatowani użytkownicy:', formattedUsers);
        setRankingData(formattedUsers);
      } catch (error) {
        console.error("Błąd rankingu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const sortedRanking = [...rankingData].sort((a, b) => {
    if (sortKey === 'points') return sortAsc ? a.points - b.points : b.points - a.points;
    if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortKey === 'level') return sortAsc ? allLevels.indexOf(a.level) - allLevels.indexOf(b.level) : allLevels.indexOf(b.level) - allLevels.indexOf(a.level);
    return 0;
  });

  return (
    <Layout title="Ranking - LangLearn">
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            🏆 Ranking użytkowników
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Najlepsi uczniowie LangLearn
          </p>
        </div>

        {/* SORTOWANIE */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <select 
            value={sortKey} 
            onChange={e => setSortKey(e.target.value as SortKey)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              background: '#fff'
            }}
          >
            <option value="points">Sortuj wg punktów</option>
            <option value="level">Sortuj wg poziomu</option>
            <option value="name">Sortuj wg nazwy</option>
          </select>
          
          <button 
            onClick={() => setSortAsc(a => !a)}
            style={{
              padding: '10px 16px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4338ca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4f46e5';
            }}
          >
            {sortAsc ? '↑ Rosnąco' : '↓ Malejąco'}
          </button>
        </div>

        {/* RANKING LIST */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {loading ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '14px' }}>⏳ Ładowanie rankingu...</p>
            </div>
          ) : sortedRanking.length > 0 ? (
            sortedRanking.map((user, idx) => (
              <div
                key={user.id}
                style={{
                  padding: '16px',
                  background: idx === 0 ? '#fef3c7' : idx === 1 ? '#e5e7eb' : idx === 2 ? '#fed7aa' : '#fff',
                  borderRadius: '12px',
                  border: '1px solid ' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#d1d5db' : idx === 2 ? '#fdba74' : '#e5e7eb'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* RANKING MEDAL */}
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: idx === 0 ? '#f59e0b' : idx === 1 ? '#6b7280' : idx === 2 ? '#92400e' : '#9ca3af',
                  minWidth: '32px',
                  textAlign: 'center'
                }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                </div>

                {/* AVATAR - POBRANY Z BAZY (JAK NA PROFILU) */}
                <div style={{
                  fontSize: '32px',
                  minWidth: '40px',
                  textAlign: 'center',
                  height: '40px',
                  lineHeight: '40px'
                }}>
                  {user.avatar}
                </div>

                {/* USER INFO */}
                <div style={{
                  flex: 1
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      background: '#e0e7ff',
                      color: '#4f46e5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {user.level}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {user.status === 'Aktywny' ? '🟢' : '⚪'} {user.status}
                    </span>
                  </div>
                </div>

                {/* PUNKTY */}
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#4f46e5'
                  }}>
                    {user.points}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af'
                  }}>
                    punktów
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '14px' }}>Brak użytkowników.</p>
            </div>
          )}
        </div>

        {/* STATYSTYKA */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            📊 Łącznie {rankingData.length} użytkowników
          </p>
        </div>
      </div>
    </Layout>
  );
}