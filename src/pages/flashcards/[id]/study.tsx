/**
 * @file FlashcardStudy.tsx
 * @brief Główny interfejs sesji nauki z fiszkami (Game Loop).
 *
 * Komponent realizuje pełny cykl nauki:
 * 1. Inicjalizacja: Pobranie talii kart na podstawie ID kategorii z URL.
 * 2. Prezentacja: Wyświetlanie awersu (pytanie) i rewersu (odpowiedź) karty.
 * 3. Interakcja: Obsługa gestów/kliknięć (Flip) i oceny (Umiem/Powtórz).
 * 4. Synchronizacja: Wysyłanie postępów do API w czasie rzeczywistym.
 * 5. Podsumowanie: Wyświetlenie raportu końcowego po osiągnięciu limitu kart.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardStudy.module.css';
import { apiRequest } from '@/lib/api';

/**
 * Wewnętrzna reprezentacja karty używana podczas sesji.
 * Zawiera dodatkowe pola stanu UI (isNew, isLearning) mapowane z API.
 */
interface StudyCard {
  id: number;
  front: string;
  back: string;
  hint?: string;
  image?: string;
  audio?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed?: Date;
  isNew: boolean;
  isLearning: boolean;
  isMastered: boolean;
}

/**
 * Stan sesji nauki. Przechowuje metadane o postępie w bieżącej lekcji.
 */
interface StudySession {
  deckId: number;
  deckTitle: string;
  totalCards: number;
  newCards: number;
  reviewCards: number;
  learningCards: number;
  studiedToday: number;
  sessionStartTime: Date;
  currentCardIndex: number;
  isComplete: boolean;
}

/**
 * Statystyki zbierane w trakcie sesji (do raportu końcowego).
 */
interface StudyStats {
  correctAnswers: number;
  wrongAnswers: number;
  avgResponseTime: number;
  studyStreak: number;
  points: number;
}

/**
 * Typ danych surowych przychodzących z API.
 */
interface FlashcardFromApi {
  id: number;
  front: string;
  back: string;
  categoryId: number | null;
  status?: 'none' | 'repeat' | 'learned';
}

interface Category {
  id: number;
  name: string;
}

// Stała określająca długość "mikro-lekcji". Zapobiega przemęczeniu użytkownika.
const LESSON_CARD_LIMIT = 5;

export default function FlashcardStudy() {
  const router = useRouter();
  const params = useParams<{ id: string } | null>();
  // Parsowanie ID talii z URL (np. /study/12)
  const deckId = params?.id ? parseInt(params.id, 10) : NaN;

  // --- STANY UI ---
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState<StudyCard | null>(null);
  
  // Tryby widoku: 
  // 'study' - aktywna nauka
  // 'settings' - konfiguracja (obecnie wyłączona w UI)
  // 'complete' - podsumowanie
  const [studyMode, setStudyMode] = useState<'study' | 'settings' | 'complete'>('study');
  
  const [showHint, setShowHint] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // --- STANY SESJI I DANYCH ---
  const [session, setSession] = useState<StudySession>({
    deckId,
    deckTitle: 'Fiszki z wybranej kategorii',
    totalCards: 0,
    newCards: 0,
    reviewCards: 0,
    learningCards: 0,
    studiedToday: 0,
    sessionStartTime: new Date(),
    currentCardIndex: 0,
    isComplete: false,
  });

  const [stats, setStats] = useState<StudyStats>({
    correctAnswers: 0,
    wrongAnswers: 0,
    avgResponseTime: 0,
    studyStreak: 7, // Mock streak
    points: 0,
  });

  // Kolejka kart do nauki
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);

  // Ustawienia lokalne sesji (domyślne)
  const [studySettings, setStudySettings] = useState({
    showTimer: true,
    autoFlip: false,
    shuffleCards: true,
    maxNewCards: 10,
    maxReviewCards: 20,
    playAudio: true,
  });

  /**
   * Efekt 1: Pobranie nazwy kategorii dla nagłówka.
   */
  useEffect(() => {
    if (Number.isNaN(deckId)) return;

    const loadCategory = async () => {
      try {
        const categories = await apiRequest<Category[]>('/categories', 'GET');
        const cat = categories.find((c) => c.id === deckId);
        if (cat) {
          setSession((prev) => ({
            ...prev,
            deckTitle: `Fiszki: ${cat.name}`,
          }));
        }
      } catch (e) {
        console.warn('Nie udało się pobrać kategorii do tytułu', e);
      }
    };
    loadCategory();
  }, [deckId]);

  /**
   * Efekt 2: Inicjalizacja sesji.
   * Pobiera karty z API, mapuje je na format wewnętrzny, tasuje i ustawia pierwszą kartę.
   */
  useEffect(() => {
    if (Number.isNaN(deckId)) {
      setIsLoading(false);
      setStudyMode('complete');
      return;
    }

    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // Pobranie fiszek z konkretnej kategorii
        const data = await apiRequest<FlashcardFromApi[]>(
          `/flashcards?categoryId=${deckId}&includePrivate=true`,
          'GET',
          undefined,
          token || undefined
        );

        // Mapowanie API -> Frontend Model
        const mapped: StudyCard[] = data.map((card) => {
          const status = card.status ?? 'none';
          return {
            id: card.id,
            front: card.front,
            back: card.back,
            difficulty: 'easy',
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            isNew: status === 'none',
            isLearning: status === 'repeat',
            isMastered: status === 'learned',
          };
        });

        // Opcjonalne tasowanie
        const cardsToUse = studySettings.shuffleCards && mapped.length > 1
            ? [...mapped].sort(() => Math.random() - 0.5)
            : mapped;

        setStudyCards(cardsToUse);

        // Aktualizacja stanu sesji
        setSession((prev) => ({
          ...prev,
          deckId,
          totalCards: cardsToUse.length,
          newCards: cardsToUse.filter((c) => c.isNew).length,
          reviewCards: cardsToUse.filter((c) => c.isLearning).length,
          learningCards: 0,
          studiedToday: 0,
          sessionStartTime: new Date(),
          currentCardIndex: 0,
          isComplete: cardsToUse.length === 0,
        }));

        // Ustawienie pierwszej karty lub zakończenie, jeśli talia jest pusta
        if (cardsToUse.length > 0) {
          setCurrentCard(cardsToUse[0]);
          setResponseStartTime(new Date());
          setStudyMode('study');
        } else {
          setCurrentCard(null);
          setStudyMode('complete');
        }
      } catch (e) {
        console.error('Błąd ładowania fiszek:', e);
        setCurrentCard(null);
        setStudyMode('complete');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [deckId]);

  // --- HANDLERY UI ---
  const flipCard = () => setIsCardFlipped((prev) => !prev);
  const toggleHint = () => setShowHint((prev) => !prev);

  const playAudio = () => {
    if (currentCard?.audio && studySettings.playAudio) {
      console.log('Playing audio:', currentCard.audio); // Placeholder dla odtwarzacza
    }
  };

  /**
   * Przesuwa obecną kartę na koniec kolejki (bez oceniania).
   */
  const skipCard = () => {
    if (studyCards.length > 1) {
      const remainingCards = studyCards.slice(1);
      remainingCards.push(studyCards[0]);
      setStudyCards(remainingCards);
      setCurrentCard(remainingCards[0]);
      setIsCardFlipped(false);
      setShowHint(false);
      setResponseStartTime(new Date());
    }
  };

  /**
   * Główna logika oceny karty.
   * 1. Wysyła status do API.
   * 2. Aktualizuje statystyki (czas reakcji, poprawność).
   * 3. Zarządza kolejką (usuwa nauczone, przesuwa do powtórki te oznaczone 'repeat').
   * 4. Sprawdza limit lekcji.
   */
  const handleStatus = async (status: 'repeat' | 'learned') => {
    if (!currentCard) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('Musisz być zalogowany.');
      return;
    }

    try {
      // 1. Zapis w bazie
      await apiRequest(
        `/flashcards/${currentCard.id}/status`,
        'PATCH',
        { status },
        token
      );

      // 2. Obliczenie statystyk
      const responseTime = new Date().getTime() - responseStartTime.getTime();

      setStats((prev) => ({
        ...prev,
        correctAnswers: status === 'learned' ? prev.correctAnswers + 1 : prev.correctAnswers,
        wrongAnswers: status === 'repeat' ? prev.wrongAnswers + 1 : prev.wrongAnswers,
        avgResponseTime: (prev.avgResponseTime + responseTime) / 2,
        points: prev.points + (status === 'learned' ? 10 : 0),
      }));

      // 3. Zarządzanie kolejką kart
      let remainingCards = studyCards.filter((card) => card.id !== currentCard.id);

      if (status === 'repeat') {
        // Jeśli "do powtórki", wrzucamy na koniec kolejki w tej samej sesji
        remainingCards.push({
          ...currentCard,
          isNew: false,
          isLearning: true,
          isMastered: false,
        });
      }

      const nextStudied = session.studiedToday + 1;

      setStudyCards(remainingCards);
      setSession((prev) => ({
        ...prev,
        studiedToday: nextStudied,
        currentCardIndex: 0,
      }));

      // 4. Warunek zakończenia sesji (limit dzienny lub brak kart)
      if (nextStudied >= LESSON_CARD_LIMIT) {
        setStudyMode('complete');
        return;
      }

      if (remainingCards.length > 0) {
        setCurrentCard(remainingCards[0]);
        setIsCardFlipped(false);
        setShowHint(false);
        setResponseStartTime(new Date());
      } else {
        setStudyMode('complete');
      }
    } catch (e: any) {
      console.error('Błąd zapisu statusu fiszki:', e);
      alert(e?.message ?? 'Nie udało się zapisać statusu fiszki.');
    }
  };

  // ⚙️ SETTINGS MODE (Kod zakomentowany w oryginale - pominięty w dokumentacji aktywnej, ale zachowany w pliku)
  // ... (kod ustawień)

  // 🏁 STUDY COMPLETE (Ekran podsumowania)
  if (studyMode === 'complete') {
    // Obliczanie czasu trwania i skuteczności
    const sessionTime = Math.round((new Date().getTime() - session.sessionStartTime.getTime()) / 60000);
    const accuracy = stats.correctAnswers + stats.wrongAnswers > 0
        ? Math.round((stats.correctAnswers / (stats.correctAnswers + stats.wrongAnswers)) * 100)
        : 0;

    const noCards = session.totalCards === 0 || (studyCards.length === 0 && session.studiedToday === 0);

    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.completeContainer}>
            <div className={styles.completeHeader}>
              <div className={styles.completeIcon}>🎉</div>
              <h2 className={styles.completeTitle}>
                {noCards ? 'Brak fiszek do nauki w tym zestawie' : 'Lekcja zakończona!'}
              </h2>
              <p className={styles.completeSubtitle}>
                {noCards
                  ? 'Wszystkie fiszki w tym zestawie masz już oznaczone jako nauczone lub nie ma żadnych kart.'
                  : `Przerobiłeś dzisiaj ${session.studiedToday} kart.`}
              </p>
            </div>

            {!noCards && (
              <div className={styles.completedStats}>
                {/* Statystyki: Liczba kart, Celność, Czas, Punkty */}
                <div className={styles.completedStat}>
                  <div className={styles.completedStatIcon}>🃏</div>
                  <div className={styles.completedStatValue}>{session.studiedToday}</div>
                  <div className={styles.completedStatLabel}>Przećwiczonych kart</div>
                </div>
                <div className={styles.completedStat}>
                  <div className={styles.completedStatIcon}>🎯</div>
                  <div className={styles.completedStatValue}>{accuracy}%</div>
                  <div className={styles.completedStatLabel}>Celność</div>
                </div>
                <div className={styles.completedStat}>
                  <div className={styles.completedStatIcon}>⏱️</div>
                  <div className={styles.completedStatValue}>{sessionTime} min</div>
                  <div className={styles.completedStatLabel}>Czas sesji</div>
                </div>
                <div className={styles.completedStat}>
                  <div className={styles.completedStatIcon}>💎</div>
                  <div className={styles.completedStatValue}>+{stats.points}</div>
                  <div className={styles.completedStatLabel}>Punkty</div>
                </div>
              </div>
            )}

            <div className={styles.completeActions}>
              <button onClick={() => router.push('/flashcards')} className={styles.completeBtn}>
                <span className={styles.completeActionIcon}>🗂️</span>
                Wróć do wyboru zestawu
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ⏳ LOADING STATE
  if (isLoading || !currentCard) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>🔄</div>
            <div className={styles.loadingText}>Ładowanie fiszek...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // 🎮 MAIN STUDY VIEW (Aktywna nauka)
  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.studyContainer}>
          
          {/* HEADER: Tytuł + Pasek postępu */}
          <div className={styles.studyHeader}>
            <div className={styles.studyInfo}>
              <h1 className={styles.studyTitle}>
                <span className={styles.studyIcon}>🧠</span>
                {session.deckTitle}
              </h1>
              <div className={styles.studyProgress}>
                <div className={styles.progressIndicator}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(session.studiedToday / Math.max(1, LESSON_CARD_LIMIT)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {session.studiedToday} / {LESSON_CARD_LIMIT}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.studyControls}>
              <button onClick={() => setStudyMode('settings')} className={styles.controlBtn}>
                <span className={styles.controlIcon}>⚙️</span>
              </button>
              <button onClick={() => router.push('/flashcards')} className={styles.controlBtn}>
                <span className={styles.controlIcon}>❌</span>
              </button>
            </div>
          </div>

          {/* SZYBKIE STATYSTYKI (Na górze ekranu) */}
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatIcon}>✅</span>
              <span className={styles.quickStatValue}>{stats.correctAnswers}</span>
            </div>
            {/* ... inne statystyki ... */}
          </div>

          {/* 🃏 KARTA FISZKI (Front/Back) */}
          <div className={styles.flashcardContainer}>
            <div className={`${styles.flashcard} ${isCardFlipped ? styles.flipped : ''}`}>
              
              {/* AWERS KARTY (Pytanie) */}
              <div className={styles.cardFront}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardType}>
                    {currentCard.isNew ? '🆕 Nowa' : currentCard.isLearning ? '🔄 Do powtórki' : '✅ Opanowana'}
                  </div>
                  <div className={styles.cardDifficulty}>
                    {/* Wskaźnik trudności (kropki) */}
                    {currentCard.difficulty === 'easy' ? '🟢' : currentCard.difficulty === 'medium' ? '🟡' : '🔴'}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardText}>{currentCard.front}</div>
                  {currentCard.image && (
                    <div className={styles.cardImage}>
                      <img src={currentCard.image} alt="Card visual" />
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button onClick={flipCard} className={styles.flipBtn}>
                    <span className={styles.flipIcon}>🔄</span> Pokaż odpowiedź
                  </button>
                  {/* Przyciski Audio i Hint */}
                </div>
              </div>

              {/* REWERS KARTY (Odpowiedź) */}
              <div className={styles.cardBack}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardType}>Odpowiedź</div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardQuestion}>
                    <strong>Pytanie:</strong> {currentCard.front}
                  </div>
                  <div className={styles.cardAnswer}>
                    <strong>Odpowiedź:</strong>
                    <div className={styles.answerText}>{currentCard.back}</div>
                  </div>
                </div>

                {/* PRZYCISKI OCENY (Decyzja użytkownika) */}
                <div className={styles.ratingButtons}>
                  <button onClick={() => handleStatus('repeat')} className={`${styles.ratingBtn} ${styles.again}`}>
                    <div className={styles.ratingLabel}>Powtórzmy to następnym razem!</div>
                  </button>

                  <button onClick={() => handleStatus('learned')} className={`${styles.ratingBtn} ${styles.easy}`}>
                    <div className={styles.ratingLabel}>To już umiem!</div>
                  </button>
                </div>

                <div className={styles.backActions}>
                  <button onClick={flipCard} className={styles.flipBackBtn}>
                    <span className={styles.flipIcon}>🔄</span> Pokaż pytanie
                  </button>
                  <button onClick={skipCard} className={styles.skipBtn}>
                    <span className={styles.skipIcon}>⏭️</span> Pomiń
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Podpowiedź dla urządzeń mobilnych */}
          <div className={styles.swipeHint}>
            <span className={styles.swipeIcon}>👆</span>
            Stuknij kartę aby ją przewrócić
          </div>
        </div>
      </div>
    </Layout>
  );
}