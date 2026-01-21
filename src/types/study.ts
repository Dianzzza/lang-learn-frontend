/**
 * @file study.ts
 * @brief Globalne definicje typów dla modułów edukacyjnych.
 *
 * Plik zawiera kontrakty danych dla czterech głównych filarów aplikacji:
 * 1. Fiszki (SRS - Spaced Repetition System)
 * 2. Quizy (Szybkie sprawdzenie wiedzy)
 * 3. Testy (Formalna ocena poziomu)
 * 4. Gramatyka (Strukturalna nauka zasad)
 */

// ==========================================
// CORE USER & PROGRESS
// ==========================================

export interface User {
  id: number;
  username: string;
  email: string;
  /** Poziom biegłości językowej wg skali CEFR */
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  points: number;
  streak: number; // Liczba dni z rzędu
  joinDate: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number; // Cel dzienny w punktach lub lekcjach
  reminderTime: string; // Format HH:MM
  autoPlay: boolean; // Automatyczne odtwarzanie audio
  darkMode: boolean;
  notifications: boolean;
}

/**
 * Śledzenie postępu w konkretnym module (np. ile % kursu ukończono).
 */
export interface StudyProgress {
  userId: number;
  moduleType: 'flashcards' | 'quiz' | 'test' | 'grammar';
  moduleId: number;
  progress: number; // Wartość 0-100%
  lastAccessed: Date;
  timeSpent: number; // Całkowity czas spędzony w module (sekundy)
  score?: number; // Opcjonalny wynik (dla testów/quizów)
  completedAt?: Date;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'score' | 'completion' | 'time' | 'special';
  requirement: number; // Wartość progowa do odblokowania
  isUnlocked: boolean;
  unlockedAt?: Date;
}

/**
 * Pojedyncza sesja nauki (np. jedno podejście do quizu).
 * Służy do generowania historii aktywności i statystyk.
 */
export interface StudySession {
  id: number;
  userId: number;
  moduleType: 'flashcards' | 'quiz' | 'test' | 'grammar';
  moduleId: number;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  timeSpent: number; // Czas trwania sesji w sekundach
  questionsAnswered: number;
  correctAnswers: number;
  isCompleted: boolean; // Czy sesja została ukończona, czy przerwana
}

// ==========================================
// FLASHCARDS (SRS SYSTEM)
// ==========================================

export interface FlashcardDeck {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string;
  cardsCount: number;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Agregowane statystyki dla danego użytkownika */
  studyStats: {
    totalStudySessions: number;
    avgScore: number;
    lastStudied?: Date;
    masteredCards: number; // Karty w fazie "learned"
    learningCards: number; // Karty w fazie nauki/powtórek
    newCards: number;      // Karty nigdy nie wyświetlone
  };
}

/**
 * Model pojedynczej fiszki z polami dla algorytmu SM-2.
 */
export interface Flashcard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  hint?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // --- Pola algorytmu SM-2 (Spaced Repetition) ---
  interval: number; // Dni do następnej powtórki
  easeFactor: number; // Mnożnik łatwości (domyślnie 2.5)
  repetitions: number; // Liczba poprawnych powtórek z rzędu
  lastReviewed?: Date;
  nextReview: Date; // Data zaplanowanej powtórki
  
  // --- Flagi stanu UI ---
  isNew: boolean;
  isLearning: boolean;
  isMastered: boolean;
}

// ==========================================
// QUIZ SPECIFIC
// ==========================================

export interface Quiz {
  id: number;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  questionsCount: number;
  timeLimit?: number; // Opcjonalny limit czasu w minutach
  hasHints: boolean;
  category: string;
  tags: string[];
  createdAt: Date;
  stats: {
    totalAttempts: number;
    avgScore: number;
    avgTime: number;
  };
}

// ==========================================
// TEST SPECIFIC (Formal Assessment)
// ==========================================

export interface LanguageTest {
  id: number;
  title: string;
  description: string;
  type: 'placement' | 'achievement' | 'diagnostic' | 'proficiency' | 'mock-exam';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Mixed';
  sections: TestSection[];
  totalDuration: number;
  totalQuestions: number;
  passingScore: number; // Próg zaliczenia (np. 60%)
  isOfficial: boolean; // Czy test daje oficjalny certyfikat wewnątrz apki
  certification?: string; // Nazwa certyfikatu
  createdAt: Date;
}

export interface TestSection {
  id: number;
  name: string;
  skill: 'reading' | 'writing' | 'listening' | 'speaking' | 'use-of-english';
  timeLimit: number;
  questionsCount: number;
  instructions: string;
  questions: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  sectionId: number;
  type: 'multiple-choice' | 'cloze' | 'word-formation' | 'key-word' | 'essay' | 'email' | 'gap-fill';
  instruction?: string;
  passage?: string; // Tekst źródłowy (dla Reading/Cloze)
  question: string;
  options?: string[]; // Dla pytań zamkniętych
  correctAnswer: any; // Może być stringiem, liczbą (index) lub tablicą
  points: number;
  audioUrl?: string; // Dla Listening
  imageUrl?: string;
}

// ==========================================
// GRAMMAR SPECIFIC
// ==========================================

export interface GrammarTopic {
  id: number;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'tenses' | 'modals' | 'conditionals' | 'passive' | 'reported' | 'articles' | 'prepositions' | 'other';
  rules: GrammarRule[];
  exercises: GrammarExercise[];
  estimatedTime: number;
  prerequisites: number[]; // Lista ID tematów wymaganych do rozpoczęcia
  createdAt: Date;
}

export interface GrammarRule {
  id: number;
  title: string;
  explanation: string;
  formula?: string; // Np. "Subject + have/has + Past Participle"
  examples: GrammarExample[];
  commonMistakes?: CommonMistake[];
}

export interface GrammarExample {
  id: number;
  english: string;
  polish: string;
  context?: string;
  isCorrect: boolean; // True dla poprawnego przykładu, False dla anty-przykładu
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface GrammarExercise {
  id: number;
  topicId: number;
  type: 'fill-gap' | 'transform' | 'correct-mistake' | 'multiple-choice' | 'reorder';
  question: string;
  options?: string[];
  correctAnswer: string | string[]; // Może być wiele poprawnych odpowiedzi
  explanation: string; // Wyświetlane po udzieleniu odpowiedzi
  hint?: string;
  points: number;
}