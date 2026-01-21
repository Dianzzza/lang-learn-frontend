/**
 * @file api.ts
 * @brief Warstwa komunikacji z Backendem (API Client).
 *
 * Plik ten zawiera:
 * 1. Generyczny wrapper `apiRequest` obsługujący konfigurację fetch, nagłówki i błędy.
 * 2. Funkcje celowe dla poszczególnych endpointów (Auth, Profile, Settings).
 * 3. Logikę normalizacji danych (mapowanie surowych danych z DB na format UI).
 */

import { User, UserStats, Course, Activity, ApiResponse, RawActivity } from '../types';

// Adres bazowy API. W produkcji pobierany ze zmiennych środowiskowych, lokalnie fallback na port 4000.
// Ta linia jest kluczowa. Zostaw ją dokładnie tak.
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Główny wrapper na natywną funkcję `fetch`.
 *
 * Odpowiada za:
 * - Automatyczne dodawanie nagłówka Authorization (jeśli podano token).
 * - Obsługę serializacji body do JSON.
 * - Centralną obsługę błędów (rzucanie wyjątków przy statusach !res.ok).
 * - Logowanie zapytań w konsoli (pomocne przy debugowaniu).
 *
 * @template T - Oczekiwany typ danych zwracanych przez API.
 * @param {string} endpoint - Ścieżka relatywna (np. '/auth/login').
 * @param {string} method - Metoda HTTP (GET, POST, etc.).
 * @param {object} body - Dane do wysłania (dla POST/PUT).
 * @param {string} token - Opcjonalny token JWT do autoryzacji.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown> | null,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // --- POCZĄTEK DEBUGOWANIA ---
  // Wstrzykiwanie tokena do nagłówków, jeśli użytkownik jest zalogowany
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // Logujemy, że wysyłamy token i jego fragment (bezpieczeństwo)
    console.log(`🔑 Wysyłam token dla ${endpoint}:`, `Bearer ${token.substring(0, 20)}...`);
  } else {
    // Logujemy, że do tego zapytania nie ma tokena (np. logowanie/rejestracja)
    console.warn(`⚠️ Brak tokena dla zapytania: ${endpoint}`);
  }
  // --- KONIEC DEBUGOWANIA ---

  console.log("API CALL:", `${BASE}${endpoint}`);

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Próba parsowania JSON. Jeśli backend nic nie zwróci (np. 204 No Content), zwraca pusty obiekt.
  const data = (await res.json().catch(() => ({}))) as T;

  // Globalna obsługa błędów HTTP
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

/** Rejestracja nowego użytkownika */
export async function registerUser(username: string, email: string, password: string) {
  return apiRequest('/auth/register', 'POST', {
    username,
    email,
    password,
  });
}

/** Logowanie użytkownika i pobranie tokena */
export async function loginUser(email: string, password: string) {
  return apiRequest('/auth/login', 'POST', {
    email,
    password,
  });
}

/** Żądanie wysłania linku resetującego hasło */
export async function requestPasswordReset(email: string) {
  return apiRequest('/auth/request-password-reset', 'POST', {
    email,
  });
}

/** Ustawienie nowego hasła przy użyciu tokenu z e-maila */
export async function resetPassword(token: string, newPassword: string) {
  return apiRequest('/auth/reset-password', 'POST', {
    token,
    newPassword,
  });
}

// ============================================
// PROFILE API FUNCTIONS
// ============================================

/** Pobranie danych zalogowanego użytkownika (wymaga tokena) */
export async function getUserProfile(token: string) {
  return apiRequest<User>('/auth/users/me', 'GET', null, token);
}

/** Pobranie statystyk (punkty, streak) */
export async function getUserStats(userId: number, token: string) {
  return apiRequest<UserStats>(`/auth/users/${userId}/stats`, 'GET', null, token);
}

/**
 * Pobranie listy kursów użytkownika.
 * Zawiera logikę NORMALIZACJI danych (frontend adapter):
 * Uzupełnia brakujące pola (emoji, color) wartościami domyślnymi, aby UI się nie zepsuł.
 */
export async function getUserCourses(userId: number, token:string) {
  const courses = await apiRequest<Course[]>(
    `/auth/users/${userId}/courses?status=active`,
    'GET',
    null,
    token
  );
  
  // Mapowanie surowych danych na format bezpieczny dla UI
  return (courses || []).map(course => ({
    ...course,
    description: course.description || '',
    category: course.category || 'Nauka',
    emoji: course.emoji || '📚', // Fallback emoji
    color: course.color || 'blue', // Fallback color
    isActive: course.isActive !== false,
  }));
}

/**
 * Pobranie historii aktywności.
 * Również normalizuje dane (mapuje backendowe typy string na frontendowe union types).
 */
export async function getUserActivity(userId: number, token: string) {
  const activities = await apiRequest<RawActivity[]>(
    `/auth/users/${userId}/activity?limit=10`,
    'GET',
    null,
    token
  );
  return (activities || []).map(activity => ({
    id: activity.id,
    type: mapActivityType(activity.type), // Konwersja typu
    title: activity.title,
    courseName: activity.courseName || activity.courseTitle, // Obsługa różnic w nazewnictwie
    date: activity.date,
    duration: activity.duration,
    points: activity.points || activity.pointsEarned,
    accuracy: activity.accuracy,
  })) as Activity[];
}

/**
 * Helper mapujący typy aktywności z bazy danych na typy ikonek w UI.
 */
function mapActivityType(type: string): 'lesson' | 'quiz' | 'achievement' | 'streak' {
  const typeMap: Record<string, 'lesson' | 'quiz' | 'achievement' | 'streak'> = {
    'lesson': 'lesson', 
    'test': 'quiz', 
    'practice': 'achievement', 
    'review': 'streak',
  };
  return typeMap[type] || 'lesson'; // Domyślnie lekcja
}

// ============================================
// UPDATE USER PROFILE
// ============================================

/** Aktualizacja danych profilowych (Bio, Avatar, DisplayName) */
export async function updateUserProfile(
  token: string,
  data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
  }
) {
  return apiRequest('/auth/users/me/update', 'PUT', data, token);
}

// ============================================
// CHANGE PASSWORD
// ============================================

/** Zmiana hasła dla zalogowanego użytkownika */
export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
) {
  return apiRequest('/auth/users/me/password', 'PUT', {
    currentPassword,
    newPassword,
  }, token);
}

// ============================================
// GET USER SETTINGS
// ============================================
export async function getUserSettings(userId: number, token: string) {
  return apiRequest('/auth/users/' + userId + '/settings', 'GET', null, token);
}

// ============================================
// UPDATE USER SETTINGS
// ============================================

/** Aktualizacja preferencji (Powiadomienia, Cele dzienne, Prywatność) */
export async function updateUserSettings(
  userId: number,
  token: string,
  data: {
    dailyGoal?: number;
    difficulty?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
    profilePublic?: boolean;
    showStats?: boolean;
  }
) {
  return apiRequest('/auth/users/' + userId + '/settings', 'PUT', data, token);
}

// Helper do tworzenia nowych fiszek (funkcjonalność administracyjna/lektora)
export async function createFlashcard(
  token: string,
  data: {
    front: string;
    back: string;
    categoryId: number | null;
    isGlobal?: boolean;
  }
) {
  return apiRequest('/flashcards', 'POST', data, token);
}

export type { User, UserStats, Course, Activity, ApiResponse, RawActivity };