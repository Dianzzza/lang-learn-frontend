import Layout from '../components/Layout';
import styles from '../styles/RankingPage.module.css';
import { useState } from 'react';

type User = {
  id: number;
  name: string;
  points: number;
  level: string;
  progress: number;
  avatar: string;
  status: string;
};

const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const ranking: User[] = [
  { id: 1, name: "Anna", points: 1500, level: 'B2', progress: 85, avatar: "🦉", status: "W trakcie" },
  { id: 2, name: "Bartek", points: 1800, level: 'A2', progress: 100, avatar: "🐧", status: "Ukończone" },
  { id: 3, name: "Celina", points: 1200, level: 'A1', progress: 70, avatar: "🐻", status: "Nowy" }
  // Możesz dodać więcej użytkowników
];

type SortKey = 'points' | 'level' | 'name';

export default function RankingPage() {
  const [selectedLevels, setSelectedLevels] = useState<string[]>(allLevels);
  const [sortKey, setSortKey] = useState<SortKey>('level');
  const [sortAsc, setSortAsc] = useState(true);

  const toggleLevel = (level: string) => {
    setSelectedLevels(levels =>
      levels.includes(level)
        ? levels.filter(l => l !== level)
        : [...levels, level]
    );
  };

  const selectAllLevels = () => setSelectedLevels(allLevels);
  const clearAllLevels = () => setSelectedLevels([]);

  // Filtr i sortowanie
  const filteredRanking = ranking.filter(user => selectedLevels.includes(user.level));
  const sortedRanking = [...filteredRanking].sort((a, b) => {
    if (sortKey === 'points') {
      return sortAsc ? a.points - b.points : b.points - a.points;
    }
    if (sortKey === 'name') {
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortKey === 'level') {
      return sortAsc
        ? allLevels.indexOf(a.level) - allLevels.indexOf(b.level)
        : allLevels.indexOf(b.level) - allLevels.indexOf(a.level);
    }
    return 0;
  });

  return (
    <Layout
      title="Ranking - LangLearn"
      description="Zobacz ranking najlepszych uczniów"
    >
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <h2>Filtry</h2>
          <div>
            <h3>Poziom</h3>
            <div style={{ display: "flex", gap: "0.5em", marginBottom: 10 }}>
              <button
                className={styles.filterButton}
                onClick={selectAllLevels}
                type="button"
              >
                Zaznacz wszystkie
              </button>
              <button
                className={styles.filterButton}
                onClick={clearAllLevels}
                type="button"
              >
                Wyczyść wszystkie
              </button>
            </div>
            {allLevels.map(level => (
              <label key={level} className={styles.levelCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => toggleLevel(level)}
                /> {level}
              </label>
            ))}
          </div>
        </aside>
        <main className={styles.mainPanel}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ranking użytkowników</h1>
            <select
              className={styles.sortSelect}
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
            >
              <option value="level">Sortuj wg poziomu</option>
              <option value="points">Sortuj wg punktów</option>
              <option value="name">Sortuj wg nazwy</option>
            </select>
            <button onClick={() => setSortAsc(a => !a)} className={styles.filterButton}>
              {sortAsc ? "Rosnąco" : "Malejąco"}
            </button>
          </div>
          <ul className={styles.rankingList}>
            {sortedRanking.map((user, idx) => (
              <li className={styles.card} key={user.id}>
                <div className={styles.avatar}>{user.avatar}</div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {idx + 1}. {user.name}
                  </span>
                  <span className={styles.levelTag}>{user.level}</span>
                  <span className={styles.points}>{user.points} pkt</span>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: user.progress + "%" }}
                    />
                  </div>
                  <span className={styles.statusTag}>{user.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </Layout>
  );
}
