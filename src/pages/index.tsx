import { useState } from 'react';
import Layout from '../components/Layout';
import LessonsList from '../components/LessonsList';
import WelcomeSection from '../components/WelcomeSection';
import UserStats from '../components/UserStats';
import styles from '../styles/Home.module.css';

type LessonStatus = 'in_progress' | 'completed' | 'locked';

interface User {
  username: string;
  points: number;
  global_rank: number;
  total_users: number;
  streak_days: number;
  today_lessons: number;
  target_lessons: number;
  weekly_hours: number;
}

interface Lesson {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progress: number;
  status: LessonStatus;
}

interface Stat {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: string;
}

export default function Home() {
  // Przykładowe dane użytkownika
  const user: User = {
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
  const lessons: Lesson[] = [
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
  const stats: Stat[] = [
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
    <Layout>
      <div className={styles.app}>
        <main className={styles.main}>
          <div className={styles.container}>
            
            {/* Left Sidebar - Lessons */}
            <div className={styles.sidebar}>
              <LessonsList lessons={lessons.map(lesson => ({
                id: parseInt(lesson.id),
                title: lesson.title,
                level: lesson.level,
                progress: lesson.progress,
                status: lesson.status === 'in_progress' ? 'inprogress' : 
                       lesson.status === 'completed' ? 'completed' : 'locked'
              }))} />
            </div>
            
            {/* Center - Welcome Section */}
            <div className={styles.welcomeSection}>
              <WelcomeSection user={user} />
            </div>
            
            {/* Right Sidebar - Stats */}
            <div className={styles.statsSection}>
              <UserStats stats={stats} />
            </div>
            
          </div>
        </main>
      </div>
    </Layout>
  );
}