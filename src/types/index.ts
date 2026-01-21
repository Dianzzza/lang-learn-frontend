/**
 * @file index.ts
 * @brief Globalne definicje typów TypeScript (Shared Data Models).
 *
 * Plik ten zawiera interfejsy opisujące kształt danych używanych w aplikacji.
 * Służy jako "kontrakt" między API a komponentami Reacta, zapewniając:
 * 1. Type Safety (bezpieczeństwo typów).
 * 2. Autouzupełnianie w IDE (IntelliSense).
 * 3. Łatwiejsze refaktoryzacje.
 */

// ==========================================
// USER & PROFILE
// ==========================================

/**
 * Podstawowe dane profilowe użytkownika.
 */
export interface User {
  /** Unikalne ID z bazy danych */
  id: number;
  /** Nazwa użytkownika (login) */
  username: string;
  email: string;
  /** Opcjonalna nazwa wyświetlana (np. Imię Nazwisko) */
  displayName?: string;
  /** URL do avatara lub emoji */
  avatar?: string;
  /** Krótki opis "O mnie" */
  bio?: string;
  /** Poziom zaawansowania (np. A1, B2) */
  level?: string;
  /** Data rejestracji (ISO string) */
  joinedDate?: string;
  /** Data ostatniej aktywności */
  lastActive?: string;
}

/**
 * Statystyki grywalizacji użytkownika (wyświetlane w profilu i na dashboardzie).
 */
export interface UserStats {
  totalPoints: number;
  globalRank: number;     // Miejsce w rankingu globalnym
  totalUsers: number;     // Całkowita liczba użytkowników (do obliczania percentyla)
  currentStreak: number;  // Dni z rzędu
  longestStreak: number;
  todayLessons: number;   // Liczba lekcji ukończonych dzisiaj
  dailyGoal: number;      // Cel dzienny (np. 5 lekcji)
  weeklyHours: number;
  totalHours: number;
  completedCourses: number;
  activeCourses: number;
}

// ==========================================
// CONTENT & COURSES
// ==========================================

/**
 * Model kursu/kategorii wyświetlany na listach.
 */
export interface Course {
  id: number;
  title: string;
  level: string;
  /** Postęp w procentach (0-100) */
  progress: number;
  type: string;           // np. 'vocabulary', 'grammar'
  lastStudied: string | null;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;  // np. '15 min'
  difficulty: string;
  thumbnail?: string;
  description: string;
  category: string;
  emoji: string;          // Ikona wizualna
  color: string;          // Kolor tła/akcentu (np. 'blue', 'green')
  isActive: boolean;
}

// ==========================================
// ACTIVITY FEED (Adapter Pattern)
// ==========================================

/**
 * Znormalizowana aktywność (Format UI).
 * Tego interfejsu używają komponenty React (np. ActivityFeed).
 */
export interface Activity {
  id: number;
  type: 'lesson' | 'quiz' | 'achievement' | 'streak';
  title: string;
  courseName: string;
  date: string;
  duration: number;       // Czas trwania w sekundach
  points: number;
  accuracy?: number;      // Wynik w procentach (dla quizów)
}

/**
 * Surowa aktywność z API (Format Backend).
 * Może różnić się nazwami pól w zależności od tego, jak backend zwraca dane.
 * Używany tylko w warstwie `lib/api.ts` do transformacji na `Activity`.
 */
export interface RawActivity {
  id: number;
  type: string;
  title: string;
  /** Backend może zwracać courseTitle zamiast courseName */
  courseTitle: string;
  courseName?: string;
  date: string;
  duration: number;
  /** Backend może zwracać pointsEarned */
  pointsEarned: number;
  points?: number;
  accuracy?: number;
}

// ==========================================
// API UTILS
// ==========================================

/**
 * Generyczny wrapper na odpowiedzi API.
 * Ułatwia typowanie funkcji `fetch` (np. apiRequest<User>).
 * * @template T - Typ danych oczekiwanych w polu `data`.
 */
export interface ApiResponse<T = unknown> {
  message?: string;       // Komunikat (np. "Success", "Error")
  data?: T;               // Właściwe dane (payload)
  token?: string;         // Token JWT (przy logowaniu/odświeżaniu)
  user?: User;            // Obiekt usera (często zwracany przy auth)
}