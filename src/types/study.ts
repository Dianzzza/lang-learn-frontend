// types/study.ts
// WSPÓLNE TYPY DLA WSZYSTKICH MODUŁÓW NAUKI

export interface User {
  id: number;
  username: string;
  email: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  points: number;
  streak: number;
  joinDate: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number;
  reminderTime: string;
  autoPlay: boolean;
  darkMode: boolean;
  notifications: boolean;
}

export interface StudyProgress {
  userId: number;
  moduleType: 'flashcards' | 'quiz' | 'test' | 'grammar';
  moduleId: number;
  progress: number; // 0-100%
  lastAccessed: Date;
  timeSpent: number; // sekundy
  score?: number;
  completedAt?: Date;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'score' | 'completion' | 'time' | 'special';
  requirement: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface StudySession {
  id: number;
  userId: number;
  moduleType: 'flashcards' | 'quiz' | 'test' | 'grammar';
  moduleId: number;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  timeSpent: number;
  questionsAnswered: number;
  correctAnswers: number;
  isCompleted: boolean;
}

// FLASHCARDS SPECIFIC
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
  studyStats: {
    totalStudySessions: number;
    avgScore: number;
    lastStudied?: Date;
    masteredCards: number;
    learningCards: number;
    newCards: number;
  };
}

export interface Flashcard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  hint?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // SM-2 Algorithm fields
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed?: Date;
  nextReview: Date;
  // Study progress
  isNew: boolean;
  isLearning: boolean;
  isMastered: boolean;
}

// QUIZ SPECIFIC
export interface Quiz {
  id: number;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  questionsCount: number;
  timeLimit?: number; // minuty
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

// TEST SPECIFIC
export interface LanguageTest {
  id: number;
  title: string;
  description: string;
  type: 'placement' | 'achievement' | 'diagnostic' | 'proficiency' | 'mock-exam';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Mixed';
  sections: TestSection[];
  totalDuration: number; // minuty
  totalQuestions: number;
  passingScore: number;
  isOfficial: boolean;
  certification?: string;
  createdAt: Date;
}

export interface TestSection {
  id: number;
  name: string;
  skill: 'reading' | 'writing' | 'listening' | 'speaking' | 'use-of-english';
  timeLimit: number; // minuty
  questionsCount: number;
  instructions: string;
  questions: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  sectionId: number;
  type: 'multiple-choice' | 'cloze' | 'word-formation' | 'key-word' | 'essay' | 'email' | 'gap-fill';
  instruction?: string;
  passage?: string;
  question: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  audioUrl?: string;
  imageUrl?: string;
}

// GRAMMAR SPECIFIC
export interface GrammarTopic {
  id: number;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'tenses' | 'modals' | 'conditionals' | 'passive' | 'reported' | 'articles' | 'prepositions' | 'other';
  rules: GrammarRule[];
  exercises: GrammarExercise[];
  estimatedTime: number; // minuty
  prerequisites: number[]; // topic IDs
  createdAt: Date;
}

export interface GrammarRule {
  id: number;
  title: string;
  explanation: string;
  formula?: string;
  examples: GrammarExample[];
  commonMistakes?: CommonMistake[];
}

export interface GrammarExample {
  id: number;
  english: string;
  polish: string;
  context?: string;
  isCorrect: boolean;
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
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
  points: number;
}
