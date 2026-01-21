/**
 * @file ranking.tsx
 * @brief Strona Rankingu Użytkowników (Leaderboard).
 *
 * Komponent ten realizuje funkcje społecznościowe i grywalizacyjne:
 * 1. Pobiera listę użytkowników z endpointu `/ranking`.
 * 2. Normalizuje dane (np. mapuje poziom liczbowy 1-6 na stringi A1-C2).
 * 3. Umożliwia sortowanie (punkty, nazwa, poziom) i zmianę kierunku (rosnąco/malejąco).
 * 4. Obsługuje stan ładowania i braku wyników.
 */

import Layout from '../components/Layout';
import styles from '../styles/RankingPage.module.css';
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

/**
 * Model użytkownika na potrzeby widoku rankingu (Frontend View Model).
 */
type User = {
  id: number;
  name: string;
  points: number;
  level: string; // Np. "A1", "B2"
  progress: number; // Procentowy postęp względem lidera (do wizualizacji)
  avatar: string; // Emoji
  status: string; // Np. "Aktywny"
};

/**
 * Surowy model danych otrzymywany z API.
 */
type BackendUser = {
  id: number;
  username: string;
  points: number;
  level: number; // Backend trzyma poziom jako liczbę (1-6)
  avatar: string;
};

// Stała tablica poziomów do mapowania index -> nazwa
const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Dostępne klucze sortowania
type SortKey = 'points' | 'level' | 'name';

export default function RankingPage() {
  // --- STANY ---
  const [rankingData, setRankingData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtrowanie (obecnie logika zaimplementowana, UI w przygotowaniu)
  const [selectedLevels, setSelectedLevels] = useState<string[]>(allLevels);
  
  // Sortowanie
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortAsc, setSortAsc] = useState(false); // Domyślnie malejąco (najlepsi na górze)

  /**
   * Efekt: Pobieranie i transformacja danych.
   */
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<BackendUser[]>('/ranking', 'GET');

        // Znalezienie maksymalnej liczby punktów dla paska postępu względnego
        const maxPoints = data.length > 0 ? Math.max(...data.map(u => u.points)) : 1;

        // Mapowanie API -> UI
        const formattedUsers: User[] = data.map(u => ({
          id: u.id,
          name: u.username,
          points: u.points,
          // Konwersja poziomu liczbowego na string (zabezpieczenie zakresu indexu)
          level: allLevels[Math.min(u.level - 1, 5)] || 'A1',
          // Obliczenie postępu względem lidera (0-100%)
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

  // --- LOGIKA FILTROWANIA I SORTOWANIA ---

  // Funkcje pomocnicze do filtrowania (przygotowane pod rozbudowę UI)
  const toggleLevel = (level: string) => {
    setSelectedLevels(levels =>
      levels.includes(level) ? levels.filter(l => l !== level) : [...levels, level]
    );
  };
  const selectAllLevels = () => setSelectedLevels(allLevels);
  const clearAllLevels = () => setSelectedLevels([]);

  // 1. Filtrowanie
  const filteredRanking = rankingData.filter(user => selectedLevels.includes(user.level));
  
  // 2. Sortowanie
  const sortedRanking = [...filteredRanking].sort((a, b) => {
    if (sortKey === 'points') return sortAsc ? a.points - b.points : b.points - a.points;
    if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    // Sortowanie poziomów wg ich indeksu w tablicy allLevels
    if (sortKey === 'level') return sortAsc ? allLevels.indexOf(a.level) - allLevels.indexOf(b.level) : allLevels.indexOf(b.level) - allLevels.indexOf(a.level);
    return 0;
  });

  return (
    <Layout title="Ranking - LangLearn">
      <div className={styles.container}>
        
        <main className={styles.mainPanel}>
          {/* Header z kontrolkami sortowania */}
          <div className={styles.header}>
            <h1 className={styles.title}>Ranking użytkowników</h1>
            
            <select className={styles.sortSelect} value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
              <option value="points">Sortuj wg punktów</option>
              <option value="level">Sortuj wg poziomu</option>
              <option value="name">Sortuj wg nazwy</option>
            </select>
            
            <button onClick={() => setSortAsc(a => !a)} className={styles.filterButton}>
              {sortAsc ? "Rosnąco" : "Malejąco"}
            </button>
          </div>
          
          {/* Lista wyników */}
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
                    
                    {/* Placeholder na pasek postępu (obecnie ukryty) */}
                    {/* <div className={styles.progressBar} style={{ width: `${user.progress}%` }} /> */}
                    
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