import { useState } from 'react';
import Layout from '../components/Layout';
import LessonsList from '../components/LessonsList';
import WelcomeSection from '../components/WelcomeSection';
import UserStats from '../components/UserStats';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Przykładowe dane użytkownika
  const user = {
    username: 'Anna',
    points: 2847,
    global_rank: 156,
    total_users: 12543,
    streak_days: 7,
    today_lessons: 2,
    target_lessons: 5,
    weekly_hours: 4.5
  };

  // Przykładowe lekcje
  const lessons = [
    {
      id: '1',
      title: 'Podstawy - Powitania',
      level: 'A1',
      progress: 85,
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Częste zwroty',
      level: 'A1',
      progress: 100,
      status: 'completed'
    },
    {
      id: '3',
      title: 'Czas przeszły',
      level: 'A2',
      progress: 23,
      status: 'in_progress'
    },
    {
      id: '4',
      title: 'Czasowniki nieregularne',
      level: 'A2',
      progress: 0,
      status: 'locked'
    },
    {
      id: '5',
      title: 'Conditional sentences',
      level: 'B1',
      progress: 0,
      status: 'locked'
    }
  ];

  // Przykładowe statystyki
  const stats = [
    {
      title: 'Twoje punkty',
      value: '2,847',
      change: '+124',
      icon: '⭐'
    },
    {
      title: 'Pozycja w rankingu',
      value: '#156',
      subtitle: 'z 12,543 użytkowników',
      icon: '🏆'
    },
    {
      title: 'Seria dni',
      value: '7 dni',
      subtitle: 'z rzędu',
      icon: '🔥'
    },
    {
      title: 'Dzisiejszy postęp',
      value: '2/5',
      subtitle: 'ukończonych lekcji',
      icon: '🎯'
    }
  ];

  return (
    <Layout 
      title="LangLearn - Dashboard" 
      description="Twój osobisty dashboard do nauki języka angielskiego"
    >
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.welcomeSection}>
            <WelcomeSection user={user} />
          </div>

          <div className={styles.sidebar}>
            <LessonsList lessons={lessons} />
          </div>

          <div className={styles.statsSection}>
            <UserStats user={user} stats={stats} />
          </div>
        </div>
      </div>
    </Layout>
  );
}