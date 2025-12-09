import { User, UserStats, Course, Activity, ApiResponse, RawActivity } from '../types';

// Ta linia jest kluczowa. Zostaw ją dokładnie tak.
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // Logujemy, że wysyłamy token i jego fragment
    console.log(`🔑 Wysyłam token dla ${endpoint}:`, `Bearer ${token.substring(0, 20)}...`);
  } else {
    // Logujemy, że do tego zapytania nie ma tokena
    console.warn(`⚠️ Brak tokena dla zapytania: ${endpoint}`);
  }
  // --- KONIEC DEBUGOWANIA ---

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

export async function requestPasswordReset(email: string) {
  return apiRequest('/auth/request-password-reset', 'POST', {
    email,
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest('/auth/reset-password', 'POST', {
    token,
    newPassword,
  });
}

// ============================================
// PROFILE API FUNCTIONS
// ============================================

export async function getUserProfile(token: string) {
  return apiRequest<User>('/auth/users/me', 'GET', null, token);
}

export async function getUserStats(userId: number, token: string) {
  return apiRequest<UserStats>(`/auth/users/${userId}/stats`, 'GET', null, token);
}

export async function getUserCourses(userId: number, token:string) {
  const courses = await apiRequest<Course[]>(
    `/auth/users/${userId}/courses?status=active`,
    'GET',
    null,
    token
  );
  return (courses || []).map(course => ({
    ...course,
    description: course.description || '',
    category: course.category || 'Nauka',
    emoji: course.emoji || '📚',
    color: course.color || 'blue',
    isActive: course.isActive !== false,
  }));
}

export async function getUserActivity(userId: number, token: string) {
  const activities = await apiRequest<RawActivity[]>(
    `/auth/users/${userId}/activity?limit=10`,
    'GET',
    null,
    token
  );
  return (activities || []).map(activity => ({
    id: activity.id,
    type: mapActivityType(activity.type),
    title: activity.title,
    courseName: activity.courseName || activity.courseTitle,
    date: activity.date,
    duration: activity.duration,
    points: activity.points || activity.pointsEarned,
    accuracy: activity.accuracy,
  })) as Activity[];
}

function mapActivityType(type: string): 'lesson' | 'quiz' | 'achievement' | 'streak' {
  const typeMap: Record<string, 'lesson' | 'quiz' | 'achievement' | 'streak'> = {
    'lesson': 'lesson', 'test': 'quiz', 'practice': 'achievement', 'review': 'streak',
  };
  return typeMap[type] || 'lesson';
}

// ============================================
// UPDATE USER PROFILE
// ============================================
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

// Helper do dodawania fiszek
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
