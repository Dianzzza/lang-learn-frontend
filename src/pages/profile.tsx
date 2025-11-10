
import { useState } from 'react';
import Layout from '../components/Layout';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import UserCourses from '../components/UserCourses';
import ActivityFeed from '../components/ActivityFeed';
import styles from '../styles/Profile.module.css';

// TypeScript types
interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio?: string;
  level: string;
  joinedDate: string;
  lastActive: string;
}

interface UserStats {
  totalPoints: number;
  globalRank: number;
  totalUsers: number;
  currentStreak: number;
  longestStreak: number;
  todayLessons: number;
  dailyGoal: number;
  weeklyHours: number;
  totalHours: number;
  completedCourses: number;
  activeCourses: number;
}

interface Course {
  id: number;
  title: string;
  level: string;
  progress: number;
  type: string;
  lastStudied: string | null;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: string;
  thumbnail: string;
}

interface Activity {
  id: number;
  type: 'lesson' | 'test' | 'practice' | 'review';
  title: string;
  courseTitle: string;
  date: string;
  duration: number;
  pointsEarned: number;
  accuracy?: number;
}

export default function ProfilePage() {
  // Przykładowe dane użytkownika
  const user: User = {
    id: 1,
    username: 'anna_learns',
    displayName: 'Anna Kowalska',
    email: 'anna@example.com',
    avatar: '👩‍🎓',
    bio: 'Uczę się angielskiego od 6 miesięcy. Cel: poziom B2 do końca roku!',
    level: 'A2',
    joinedDate: '2025-05-15',
    lastActive: '2025-11-05T09:15:00'
  };

  const stats: UserStats = {
    totalPoints: 2847,
    globalRank: 156,
    totalUsers: 12543,
    currentStreak: 7,
    longestStreak: 23,
    todayLessons: 2,
    dailyGoal: 5,
    weeklyHours: 4.5,
    totalHours: 87,
    completedCourses: 3,
    activeCourses: 4
  };

  const activeCourses: Course[] = [
    {
      id: 1,
      title: 'Podstawy - Powitania',
      level: 'A1',
      progress: 85,
      type: 'Dialogi',
      lastStudied: '2025-11-05',
      totalLessons: 12,
      completedLessons: 10,
      estimatedTime: '5-15 min',
      difficulty: 'Łatwe',
      thumbnail: '👋'
    },
    {
      id: 2,
      title: 'Present Simple',
      level: 'A2',
      progress: 45,
      type: 'Gramatyka',
      lastStudied: '2025-11-04',
      totalLessons: 15,
      completedLessons: 7,
      estimatedTime: '10-20 min',
      difficulty: 'Średnie',
      thumbnail: '📝'
    }
  ];

  const recentActivity: Activity[] = [
    {
      id: 1,
      type: 'lesson',
      title: 'Lesson 10: Greetings Practice',
      courseTitle: 'Podstawy - Powitania',
      date: '2025-11-05T08:30:00',
      duration: 12,
      pointsEarned: 45,
      accuracy: 92
    },
    {
      id: 2,
      type: 'test',
      title: 'Quiz: Present Simple',
      courseTitle: 'Present Simple',
      date: '2025-11-04T19:45:00',
      duration: 8,
      pointsEarned: 78,
      accuracy: 85
    }
  ];

  return (
    <Layout title="Profil - LangLearn" description="Twój profil użytkownika">
      <div className={styles.profilePage}>
        <div className={styles.container}>
          
          {/* Header Profilu */}
          <div className={styles.profileHeader}>
            <ProfileHeader user={user} />
          </div>

          {/* Layout główny - 2 kolumny na desktop */}
          <div className={styles.profileLayout}>
            
            {/* Lewa kolumna - Statystyki i kursy */}
            <div className={styles.leftColumn}>
              
              {/* Statystyki */}
              <div className={styles.statsSection}>
                <ProfileStats stats={stats} />
              </div>

              {/* Aktywne kursy */}
              <div className={styles.coursesSection}>
                <UserCourses courses={activeCourses} />
              </div>
              
            </div>

            {/* Prawa kolumna - Historia aktywności */}
            <div className={styles.rightColumn}>
              
              {/* Historia aktywności */}  
              <div className={styles.activitySection}>
                <ActivityFeed activities={recentActivity} />
              </div>
              
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}