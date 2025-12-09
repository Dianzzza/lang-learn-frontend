// src/types/index.ts

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  level?: string;
  joinedDate?: string;
  lastActive?: string;
}

export interface UserStats {
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

export interface Course {
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
  thumbnail?: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  isActive: boolean;
}

export interface Activity {
  id: number;
  type: 'lesson' | 'quiz' | 'achievement' | 'streak';
  title: string;
  courseName: string;
  date: string;
  duration: number;
  points: number;
  accuracy?: number;
}

export interface RawActivity {
  id: number;
  type: string;
  title: string;
  courseTitle: string;
  courseName?: string;
  date: string;
  duration: number;
  pointsEarned: number;
  points?: number;
  accuracy?: number;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}
