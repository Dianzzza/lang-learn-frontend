/**
 * @file QuizSessionPage.tsx
 * @brief Główny widok sesji quizowej (Game Loop).
 *
 * Komponent ten zarządza całym cyklem życia quizu w ramach jednej strony (Single Page Application UX):
 * 1. **Start Screen:** Użytkownik wybiera poziom trudności i inicjuje sesję.
 * 2. **Quiz Screen:** Pętla pytań (Question Loop). Użytkownik wybiera odpowiedzi, otrzymuje natychmiastowy feedback.
 * 3. **Complete Screen:** Podsumowanie wyników, statystyki i zapis próby w backendzie.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import styles from '@/styles/QuizSession.module.css';
import { apiRequest } from '@/lib/api';

/** Poziomy trudności wpływające na liczbę dystraktorów (błędnych odpowiedzi). */
type Difficulty = 'easy' | 'medium' | 'hard';

/** Struktura pojedynczego pytania w sesji. */
interface QuizSessionDtoQuestion {
  id: number;
  sentence: string; // Zdanie z luką lub pytanie
  polishWord: string | null; // Podpowiedź (tłumaczenie)
  options: string[]; // Lista odpowiedzi (poprawna + dystraktory)
  correctIndex: number; // Indeks poprawnej odpowiedzi w tablicy options
}

/** Struktura danych całej sesji pobieranej z API. */
interface QuizSessionDto {
  categoryId: number;
  difficulty: Difficulty;
  optionCount: number;
  questions: QuizSessionDtoQuestion[];
}

/** Typ wyliczeniowy określający aktualny etap (ekran) quizu. */
type Screen = 'start' | 'quiz' | 'complete';

/**
 * Komponent QuizSessionPage.
 *
 * @returns {JSX.Element} Interaktywny quiz.
 */
export default function QuizSessionPage() {
  const router = useRouter();

  // Pobranie ID kategorii z URL (np. /quiz/[id])
  const categoryId = useMemo(() => {
    const raw = router.query?.id;
    const idStr = Array.isArray(raw) ? raw[0] : raw;
    const parsed = idStr ? parseInt(idStr, 10) : NaN;
    return Number.isNaN(parsed) ? null : parsed;
  }, [router.query?.id]);

  // --- STANY UI ---
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STANY SESJI ---
  const [session, setSession] = useState<QuizSessionDto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Aktualny numer pytania (0-based)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Wybrana odpowiedź
  const [isAnswered, setIsAnswered] = useState(false); // Czy zatwierdzono odpowiedź?

  // --- STANY WYNIKÓW ---
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Historia odpowiedzi
  const [resultSaved, setResultSaved] = useState(false); // Blokada przed wielokrotnym zapisem

  // Helpery
  const currentQuestion = session?.questions?.[currentIndex] ?? null;

  const maxScore = useMemo(() => {
    const count = session?.questions?.length || 0;
    return count * 10;
  }, [session]);

  const percentage = useMemo(() => {
    if (!session || maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  }, [score, maxScore, session]);

  /**
   * Inicjalizuje nową sesję quizu.
   * Pobiera pytania z API na podstawie wybranej trudności.
   */
  const loadSession = async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<QuizSessionDto>(
        `/quizzes/session?categoryId=${categoryId}&difficulty=${difficulty}&limit=10`,
        'GET'
      );
      setSession(data);

      // Reset stanu gry
      setCurrentIndex(0);
      setSelectedIndex(null);
      setIsAnswered(false);
      setScore(0);
      setAnswers({});
      setStartTime(new Date());
      setResultSaved(false);
      setScreen('quiz');
    } catch (e: any) {
      setError(e?.message ?? 'Nie udało się pobrać sesji quizu');
      setScreen('start');
    } finally {
      setLoading(false);
    }
  };

  // Reset widoku przy zmianie URL (np. przejście do innego quizu)
  useEffect(() => {
    if (!router.isReady) return;
    setScreen('start');
    setSession(null);
    setError(null);
    setResultSaved(false);
  }, [router.isReady, categoryId]);

  /**
   * Zatwierdza wybraną odpowiedź.
   * Blokuje zmianę wyboru, nalicza punkty i pokazuje poprawną odpowiedź.
   */
  const submitAnswer = () => {
    if (!currentQuestion) return;
    if (selectedIndex === null) return;

    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedIndex }));
    setIsAnswered(true);

    if (isCorrect) setScore((prev) => prev + 10);
  };

  /**
   * Przechodzi do następnego pytania lub kończy quiz.
   */
  const nextQuestion = () => {
    if (!session) return;

    const next = currentIndex + 1;
    if (next < session.questions.length) {
      setCurrentIndex(next);
      // Reset wyboru dla nowego pytania
      const nextQ = session.questions[next];
      const prevAnswer = answers[nextQ.id]; // Obsługa powrotu (opcjonalna)
      setSelectedIndex(typeof prevAnswer === 'number' ? prevAnswer : null);
      setIsAnswered(typeof prevAnswer === 'number');
    } else {
      setScreen('complete');
    }
  };

  // Obliczenie czasu trwania sesji
  const durationSec = useMemo(() => {
    if (!startTime) return 0;
    return Math.max(
      0,
      Math.round((new Date().getTime() - startTime.getTime()) / 1000)
    );
  }, [startTime, screen]);

  /**
   * Automatyczny zapis wyniku po zakończeniu quizu.
   * Uruchamia się tylko raz po przejściu w stan 'complete'.
   */
  useEffect(() => {
    const save = async () => {
      if (screen !== 'complete') return;
      if (!session) return;
      if (!startTime) return;
      if (resultSaved) return;

      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      if (!token) return;

      try {
        await apiRequest(
          '/quizzes/attempts',
          'POST',
          {
            categoryId: session.categoryId,
            difficulty: session.difficulty,
            score,
            maxScore,
            durationSec,
          },
          token
        );
        setResultSaved(true);
      } catch (e) {
        console.error('Nie udało się zapisać wyniku quizu:', e);
      }
    };

    save();
  }, [screen, session, startTime, score, maxScore, durationSec, resultSaved]);

  // --- RENDEROWANIE W ZALEŻNOŚCI OD STANU 'screen' ---

  // 1. Loading (podczas ładowania strony/danych)
  if (!router.isReady || categoryId === null) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>🔄</div>
            <div className={styles.loadingText}>Ładowanie...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // 2. Start Screen (Wybór trudności)
  if (screen === 'start') {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.quizContainer}>
            <div className={styles.quizHeader}>
              <div className={styles.quizInfo}>
                <h1 className={styles.quizTitle}>
                  <span className={styles.quizIcon}>🧠</span>
                  Quiz
                </h1>
                <div className={styles.quizProgress}>
                  <span className={styles.progressText}>
                    Wybierz trudność i rozpocznij
                  </span>
                </div>
              </div>
              <div className={styles.quizControls}>
                <div className={styles.score}>
                  <span className={styles.scoreIcon}>💎</span>
                  0 pkt
                </div>
              </div>
            </div>

            <div className={styles.questionCard}>
              <div className={styles.questionContent}>
                <h2 className={styles.questionText}>Ustawienia sesji</h2>

                {/* Selektor poziomu trudności */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8, opacity: 0.9 }}>
                    Poziom trudności:
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        className={styles.optionBtn}
                        onClick={() => setDifficulty(lvl)}
                        disabled={loading}
                        // Styl warunkowy dla wybranej opcji
                        style={{
                          border: difficulty === lvl 
                            ? `2px solid var(--secondary-${lvl === 'easy' ? 'green' : lvl === 'medium' ? 'amber' : 'red'})` 
                            : undefined,
                        }}
                      >
                        {lvl === 'easy' ? 'Łatwy (2 opcje)' : lvl === 'medium' ? 'Średni (3 opcje)' : 'Trudny (4 opcje)'}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div style={{ marginTop: 12, color: 'var(--secondary-red)' }}>
                    {error}
                  </div>
                )}
              </div>

              <div className={styles.questionActions}>
                <button
                  onClick={loadSession}
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  <span className={styles.submitIcon}>🚀</span>
                  {loading ? 'Startuję...' : 'Rozpocznij quiz'}
                </button>

                <button
                  onClick={() => router.push('/quiz')}
                  className={styles.nextBtn}
                  disabled={loading}
                >
                  <span className={styles.nextIcon}>🧠</span>
                  Wróć do listy quizów
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 3. Complete Screen (Wyniki)
  if (screen === 'complete') {
    const answeredCount = Object.keys(answers).length;
    const sessionTimeMin = Math.round(durationSec / 60);

    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.resultsContainer}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsIcon}>
                {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : '💪'}
              </div>
              <h2 className={styles.resultsTitle}>Quiz zakończony!</h2>
              <div className={styles.finalScore}>
                <span className={styles.scoreNumber}>{percentage}%</span>
                <span className={styles.scoreLabel}>
                  ({score}/{maxScore} pkt)
                </span>
              </div>
            </div>

            <div className={styles.resultsStats}>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>⏱️</div>
                <div className={styles.resultsStatValue}>{sessionTimeMin} min</div>
                <div className={styles.resultsStatLabel}>Czas</div>
              </div>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>✅</div>
                <div className={styles.resultsStatValue}>{answeredCount}</div>
                <div className={styles.resultsStatLabel}>Odpowiedzi</div>
              </div>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>🎯</div>
                <div className={styles.resultsStatValue}>{percentage}%</div>
                <div className={styles.resultsStatLabel}>Celność</div>
              </div>
            </div>

            <div className={styles.resultsActions}>
              <button
                onClick={() => {
                  setScreen('start');
                  setSession(null);
                  setError(null);
                }}
                className={styles.retryBtn}
              >
                <span className={styles.retryIcon}>🔄</span>
                Zmień trudność / spróbuj ponownie
              </button>

              <button onClick={() => router.push('/quiz')} className={styles.browseBtn}>
                <span className={styles.browseIcon}>🧠</span>
                Inne quizy
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 4. Quiz Screen (Rozgrywka)
  if (!session || !currentQuestion) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>🔄</div>
            <div className={styles.loadingText}>Ładowanie quizu...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const progressPercent = session.questions.length > 0
      ? (currentIndex / session.questions.length) * 100
      : 0;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.quizContainer}>
          
          {/* Header Quizu */}
          <div className={styles.quizHeader}>
            <div className={styles.quizInfo}>
              <h1 className={styles.quizTitle}>
                <span className={styles.quizIcon}>🧠</span>
                Quiz (kategoria {session.categoryId})
              </h1>
              <div className={styles.quizProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className={styles.progressText}>
                  {currentIndex + 1} / {session.questions.length}
                </span>
              </div>
            </div>
            <div className={styles.quizControls}>
              <div className={styles.score}>
                <span className={styles.scoreIcon}>💎</span>
                {score} pkt
              </div>
            </div>
          </div>

          {/* Karta Pytania */}
          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <div className={styles.questionType}>🎯 Wybór wielokrotny</div>
              <div className={styles.questionPoints}>
                <span className={styles.pointsIcon}>💎</span>10 pkt
              </div>
            </div>

            <div className={styles.questionContent}>
              <h2 className={styles.questionText}>{currentQuestion.sentence}</h2>
              <div style={{ marginTop: 10, opacity: 0.9 }}>
                Podpowiedź (PL): <strong>{currentQuestion.polishWord ?? '—'}</strong>
              </div>
            </div>

            {/* Lista Odpowiedzi */}
            <div className={styles.answerInterface}>
              <div className={styles.multipleChoice}>
                {currentQuestion.options.map((opt, idx) => {
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const isSelected = selectedIndex === idx;

                  // Dynamiczne klasy CSS dla stanu 'answered'
                  const className = `${styles.optionBtn}
                    ${isSelected ? styles.selected : ''}
                    ${isAnswered && isCorrect ? styles.correct : ''}
                    ${isAnswered && isSelected && !isCorrect ? styles.incorrect : ''}
                  `;

                  return (
                    <button
                      key={opt + idx}
                      onClick={() => !isAnswered && setSelectedIndex(idx)}
                      className={className}
                      disabled={isAnswered}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Przyciski Akcji */}
            <div className={styles.questionActions}>
              {!isAnswered ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedIndex === null}
                  className={styles.submitBtn}
                >
                  <span className={styles.submitIcon}>✅</span>
                  Sprawdź odpowiedź
                </button>
              ) : (
                <button onClick={nextQuestion} className={styles.nextBtn}>
                  <span className={styles.nextIcon}>➡️</span>
                  {currentIndex + 1 < session.questions.length
                    ? 'Następne pytanie'
                    : 'Zakończ quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}