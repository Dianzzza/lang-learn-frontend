// src/pages/ranking.tsx

import Layout from '../components/Layout';
import styles from '../styles/RankingPage.module.css';
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

// Typy
type User = {
  id: number;
  name: string;
  points: number;
  level: string;
  progress: number;
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
  const [selectedLevels, setSelectedLevels] = useState<string[]>(allLevels);
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortAsc, setSortAsc] = useState(false);

  // Pobieranie danych
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<BackendUser[]>('/ranking', 'GET');

        const maxPoints = data.length > 0 ? Math.max(...data.map(u => u.points)) : 1;

        const formattedUsers: User[] = data.map(u => ({
          id: u.id,
          name: u.username,
          points: u.points,
          level: allLevels[Math.min(u.level - 1, 5)] || 'A1',
          progress: Math.round((u.points / maxPoints) * 100),
          avatar: u.avatar,
          status: u.points > 0 ? "Aktywny" : "Nowy"
        }));

        setRankingData(formattedUsers);
      } catch (error) {
        console.error("Błąd rankingu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const toggleLevel = (level: string) => {
    setSelectedLevels(levels =>
      levels.includes(level) ? levels.filter(l => l !== level) : [...levels, level]
    );
  };

  const selectAllLevels = () => setSelectedLevels(allLevels);
  const clearAllLevels = () => setSelectedLevels([]);

  const filteredRanking = rankingData.filter(user => selectedLevels.includes(user.level));
  
  const sortedRanking = [...filteredRanking].sort((a, b) => {
    if (sortKey === 'points') return sortAsc ? a.points - b.points : b.points - a.points;
    if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortKey === 'level') return sortAsc ? allLevels.indexOf(a.level) - allLevels.indexOf(b.level) : allLevels.indexOf(b.level) - allLevels.indexOf(a.level);
    return 0;
  });

  return (
    <Layout title="Ranking - LangLearn">
      <div className={styles.container}>
        
        <main className={styles.mainPanel}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ranking użytkowników</h1>
            <select className={styles.sortSelect} value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
              <option value="level">Sortuj wg poziomu</option>
              <option value="points">Sortuj wg punktów</option>
              <option value="name">Sortuj wg nazwy</option>
            </select>
            <button onClick={() => setSortAsc(a => !a)} className={styles.filterButton}>
              {sortAsc ? "Rosnąco" : "Malejąco"}
            </button>
          </div>
          
          {loading ? (
             <p style={{padding: 20}}>Ładowanie rankingu...</p>
          ) : (
            <ul className={styles.rankingList}>
              {sortedRanking.map((user, idx) => (
                <li className={styles.card} key={user.id}>
                  <div className={styles.avatar}>{user.avatar}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{idx + 1}. {user.name}</span>
                    <span className={styles.levelTag}>{user.level}</span>
                    <span className={styles.points}>{user.points} pkt</span>
                    
                    {/* TUTAJ BYŁ PASEK POSTĘPU - TERAZ GO NIE MA */}
                    
                    <span className={styles.statusTag}>{user.status}</span>
                  </div>
                </li>
              ))}
              {sortedRanking.length === 0 && !loading && (
                  <p style={{padding: 20}}>Brak użytkowników spełniających kryteria.</p>
              )}
            </ul>
          )}
        </main>
      </div>
    </Layout>
  );
}