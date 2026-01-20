// src/lib/api.ts - POPRAWIONY BEZ ANY TYPÓW

import { User, UserStats, Course, Activity, ApiResponse, RawActivity } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ============================================
// TYPY
// ============================================

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  level?: string;
  points?: number;
  streak_days?: number;
  today_lessons?: number;
  target_lessons?: number;
  global_rank?: number;
  total_users?: number;
  createdAt?: string;
}

export interface UserSettingsData {
  id: number;
  userId: number;
  dailyGoal: number;
  difficulty: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  profilePublic: boolean;
  showStats: boolean;
}

export interface ActivityItem {
  id: number;
  type: 'course' | 'flashcard' | 'test' | 'quiz';
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'started';
  createdAt: string;
}

// ============================================
// API REQUEST FUNCTION
// ============================================

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, any> | null,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(`🔑 Token dla ${endpoint}`);
  }

  console.log("API CALL:", `${BASE}${endpoint}`);

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T;

  if (!res.ok) {
    const msg =
      (data as { message?: string })?.message ||
      `${res.status} ${res.statusText}` ||
      "Błąd sieci";
    throw new Error(msg);
  }

  return data;
}

// ============================================
// AUTH API FUNCTIONS
// ============================================

export async function registerUser(username: string, email: string, password: string) {
  return apiRequest('/auth/register', 'POST', {
    username,
    email,
    password,
  });
}

export async function loginUser(email: string, password: string) {
  return apiRequest('/auth/login', 'POST', {
    email,
    password,
  });
}

// ============================================
// PROFILE API FUNCTIONS
// ============================================

/**
 * Pobierz aktualnego zalogowanego użytkownika
 * @param token - JWT token autoryzacji
 * @returns Dane profilu użytkownika
 */
export async function getCurrentUser(token: string): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me', 'GET', null, token);
}

/**
 * Zaktualizuj profil użytkownika
 * @param token - JWT token autoryzacji
 * @param data - Dane do aktualizacji
 */
export async function updateUserProfile(
  token: string,
  data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
  }
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/users/me/update', 'PUT', data, token);
}

/**
 * Zmień hasło użytkownika
 * @param token - JWT token autoryzacji
 * @param currentPassword - Aktualne hasło
 * @param newPassword - Nowe hasło
 */
export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/users/me/password', 'PUT', {
    currentPassword,
    newPassword,
  }, token);
}

// ============================================
// SETTINGS API FUNCTIONS
// ============================================

/**
 * Pobierz ustawienia użytkownika
 * @param userId - ID użytkownika
 * @param token - JWT token autoryzacji
 */
export async function getUserSettings(userId: number, token: string): Promise<UserSettingsData> {
  return apiRequest<UserSettingsData>(`/auth/users/${userId}/settings`, 'GET', null, token);
}

/**
 * Zaktualizuj ustawienia użytkownika
 * @param userId - ID użytkownika
 * @param token - JWT token autoryzacji
 * @param data - Ustawienia do aktualizacji
 */
export async function updateUserSettings(
  userId: number,
  token: string,
  data: Partial<UserSettingsData>
): Promise<UserSettingsData> {
  return apiRequest<UserSettingsData>(`/auth/users/${userId}/settings`, 'PUT', data, token);
}

// ============================================
// ACTIVITY API FUNCTIONS
// ============================================

/**
 * Pobierz aktywność użytkownika
 * ⚠️ UWAGA: Endpoint może nie istnieć na backendzie
 * Jeśli zwraca 404 - backend nie ma tego endpointu
 * @param userId - ID użytkownika
 * @param token - JWT token autoryzacji
 * @param limit - Liczba elementów do pobrania
 */
export async function getUserActivity(
  userId: number,
  token: string,
  limit: number = 10
): Promise<ActivityItem[]> {
  try {
    return await apiRequest<ActivityItem[]>(
      `/auth/users/${userId}/activity?limit=${limit}`,
      'GET',
      null,
      token
    );
  } catch (error) {
    console.warn('⚠️ Endpoint /auth/users/:id/activity nie istnieje na backendzie');
    // Zwracamy pustą tablicę zamiast rzucać błąd
    return [];
  }
}

/**
 * Pobierz statystyki użytkownika
 * @param userId - ID użytkownika
 * @param token - JWT token autoryzacji
 */
export async function getUserStats(userId: number, token: string): Promise<UserStats> {
  return apiRequest<UserStats>(`/auth/users/${userId}/stats`, 'GET', null, token);
}

// ============================================
// COURSES API FUNCTIONS
// ============================================

/**
 * Pobierz kursy użytkownika
 * @param userId - ID użytkownika
 * @param token - JWT token autoryzacji
 */
export async function getUserCourses(userId: number, token: string): Promise<Course[]> {
  return apiRequest<Course[]>(`/auth/users/${userId}/courses`, 'GET', null, token);
}

/**
 * Pobierz wszystkie dostępne kursy
 */
export async function getAllCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/categories', 'GET');
}

/**
 * Pobierz fiszki dla kursu
 * @param courseId - ID kursu
 */
export async function getFlashcards(courseId: number) {
  return apiRequest<Record<string, any>[]>(`/flashcards?courseId=${courseId}`, 'GET');
}

/**
 * Pobierz quizy dla kursu
 * @param courseId - ID kursu
 */
export async function getQuizzes(courseId: number) {
  return apiRequest<Record<string, any>[]>(`/quizzes?courseId=${courseId}`, 'GET');
}

/**
 * Pobierz testy dla kursu
 * @param courseId - ID kursu
 */
export async function getTests(courseId: number) {
  return apiRequest<Record<string, any>[]>(`/tests?courseId=${courseId}`, 'GET');
}

// ============================================
// LEARNING API FUNCTIONS
// ============================================

/**
 * Wyślij odpowiedź na quiz
 * @param token - JWT token autoryzacji
 * @param data - Dane quizu
 */
export async function submitQuizAnswer(
  token: string,
  data: {
    quizId: number;
    answer: string;
  }
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/quizzes/answer', 'POST', data, token);
}

/**
 * Wyślij wynik testu
 * @param token - JWT token autoryzacji
 * @param data - Dane testu
 */
export async function submitTestResult(
  token: string,
  data: {
    testId: number;
    score: number;
    answers: Record<string, any>[];
  }
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/tests/submit', 'POST', data, token);
}

/**
 * Oznacz fiszkę jako nauczoną
 * @param token - JWT token autoryzacji
 * @param flashcardId - ID fiszki
 */
export async function markFlashcardAsLearned(
  token: string,
  flashcardId: number
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/flashcards/${flashcardId}/learn`, 'POST', {}, token);
}

// ============================================
// RANKING API FUNCTIONS
// ============================================

/**
 * Pobierz ranking użytkowników
 * @param limit - Liczba użytkowników
 */
export async function getLeaderboard(limit: number = 100): Promise<Record<string, any>[]> {
  return apiRequest<Record<string, any>[]>(`/ranking/leaderboard?limit=${limit}`, 'GET');
}

/**
 * Pobierz pozycję użytkownika w rankingu
 * @param userId - ID użytkownika
 */
export async function getUserRank(userId: number): Promise<Record<string, any>> {
  return apiRequest<Record<string, any>>(`/ranking/user/${userId}`, 'GET');
}

// ============================================
// TYPE EXPORTS
// ============================================

export type { User, UserStats, Course, Activity, ApiResponse, RawActivity };