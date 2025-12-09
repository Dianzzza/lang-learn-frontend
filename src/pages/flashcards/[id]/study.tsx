'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardStudy.module.css';
import { apiRequest } from '@/lib/api';

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

interface StudyStats {
  correctAnswers: number;
  wrongAnswers: number;
  avgResponseTime: number;
  studyStreak: number;
  points: number;
}

interface FlashcardFromApi {
  id: number;
  front: string;
  back: string;
  categoryId: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function FlashcardStudy() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const deckId = parseInt(params.id, 10);

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState<StudyCard | null>(null);
  const [studyMode, setStudyMode] = useState<'study' | 'settings' | 'complete'>('study');
  const [showHint, setShowHint] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

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
    studyStreak: 7,
    points: 0,
  });

  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);

  const [studySettings, setStudySettings] = useState({
    showTimer: true,
    autoFlip: false,
    shuffleCards: true,
    maxNewCards: 10,
    maxReviewCards: 20,
    playAudio: true,
  });

  // 🔤 nazwa kategorii jako tytuł
  useEffect(() => {
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

  // 🚀 Pobierz fiszki z backendu dla danej kategorii (deckId = categoryId)
 useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

        const data = await apiRequest<FlashcardFromApi[]>(
          `/flashcards?categoryId=${deckId}&includePrivate=true`,
          'GET',
          undefined,
          token || undefined
        );

        const mapped: StudyCard[] = data.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          difficulty: 'easy',
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          isNew: true,
          isLearning: false,
          isMastered: false,
        }));

        const cardsToUse =
          studySettings.shuffleCards && mapped.length > 1
            ? [...mapped].sort(() => Math.random() - 0.5)
            : mapped;

        setStudyCards(cardsToUse);

        setSession((prev) => ({
          ...prev,
          deckId,
          totalCards: cardsToUse.length,
          newCards: cardsToUse.length,
          reviewCards: 0,
          learningCards: 0,
          studiedToday: 0,
          sessionStartTime: new Date(),
          currentCardIndex: 0,
          isComplete: cardsToUse.length === 0,
        }));

        if (cardsToUse.length > 0) {
          setCurrentCard(cardsToUse[0]);
          setResponseStartTime(new Date());
        } else {
          setCurrentCard(null);
        }
      } catch (e) {
        console.error('Błąd ładowania fiszek:', e);
        setCurrentCard(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [deckId]); // ← przy każdym innym /flashcards/:id ładuje inne fiszki [web:85]

  // 🧠 SM-2
  const calculateNextInterval = (card: StudyCard, quality: number) => {
    let { interval, easeFactor, repetitions } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      easeFactor =
        easeFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = Math.max(1.3, easeFactor);
    interval = Math.max(1, interval);

    return { interval, easeFactor, repetitions };
  };

  // 🎯 OCEŃ KARTĘ
  const gradeCard = (quality: number) => {
    if (!currentCard) return;

    const responseTime = new Date().getTime() - responseStartTime.getTime();
    const newCardData = calculateNextInterval(currentCard, quality);

    setStats((prev) => ({
      ...prev,
      correctAnswers:
        quality >= 3 ? prev.correctAnswers + 1 : prev.correctAnswers,
      wrongAnswers: quality < 3 ? prev.wrongAnswers + 1 : prev.wrongAnswers,
      avgResponseTime: (prev.avgResponseTime + responseTime) / 2,
      points: prev.points + (quality >= 3 ? quality * 10 : 0),
    }));

    const updatedCard: StudyCard = {
      ...currentCard,
      ...newCardData,
      lastReviewed: new Date(),
      isNew: false,
      isLearning: quality < 4,
      isMastered: quality >= 4 && newCardData.repetitions >= 3,
    };

    const remainingCards = studyCards.filter((card) => card.id !== currentCard.id);

    if (quality < 3) {
      remainingCards.push(updatedCard);
    }

    setStudyCards(remainingCards);
    setSession((prev) => ({
      ...prev,
      studiedToday: prev.studiedToday + 1,
      currentCardIndex: 0,
    }));

    if (remainingCards.length > 0) {
      setCurrentCard(remainingCards[0]);
      setIsCardFlipped(false);
      setShowHint(false);
      setResponseStartTime(new Date());
    } else {
      setStudyMode('complete');
    }
  };

  const flipCard = () => setIsCardFlipped((prev) => !prev);
  const toggleHint = () => setShowHint((prev) => !prev);

  const playAudio = () => {
    if (currentCard?.audio && studySettings.playAudio) {
      console.log('Playing audio:', currentCard.audio);
    }
  };

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

  // ⚙️ SETTINGS MODE
  if (studyMode === 'settings') {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.settingsContainer}>
            <div className={styles.settingsHeader}>
              <h2 className={styles.settingsTitle}>
                <span className={styles.settingsIcon}>⚙️</span>
                Ustawienia sesji
              </h2>
            </div>

            <div className={styles.settingsForm}>
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>
                  <input
                    type="checkbox"
                    checked={studySettings.showTimer}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        showTimer: e.target.checked,
                      })
                    }
                    className={styles.settingCheckbox}
                  />
                  <span className={styles.settingIcon}>⏱️</span>
                  Pokaż timer
                </label>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>
                  <input
                    type="checkbox"
                    checked={studySettings.autoFlip}
                    onChange={(e) =>
                      setStudySettings({
                        ...studySettings,
                        autoFlip: e.target.checked,
                      })
                    }
                    className={styles.settingCheckbox}
                  />
                  <span className={styles.settingIcon}>🔄</span>
                  Auto-flip po 3 sekundach
                </label>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>
                  <span className={styles.settingIcon}>🆕</span>
                  Maksymalnie nowych kart dziennie:
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={studySettings.maxNewCards}
                  onChange={(e) =>
                    setStudySettings({
                      ...studySettings,
                      maxNewCards: parseInt(e.target.value, 10),
                    })
                  }
                  className={styles.settingRange}
                />
                <span className={styles.settingValue}>
                  {studySettings.maxNewCards}
                </span>
              </div>
            </div>

            <div className={styles.settingsActions}>
              <button
                onClick={() => setStudyMode('study')}
                className={styles.backToStudyBtn}
              >
                <span className={styles.backIcon}>🧠</span>
                Powrót do nauki
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 🏁 STUDY COMPLETE
  if (studyMode === 'complete') {
    const sessionTime = Math.round(
      (new Date().getTime() - session.sessionStartTime.getTime()) / 60000
    );
    const accuracy =
      stats.correctAnswers + stats.wrongAnswers > 0
        ? Math.round(
            (stats.correctAnswers /
              (stats.correctAnswers + stats.wrongAnswers)) *
              100
          )
        : 0;

    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.completeContainer}>
            <div className={styles.completeHeader}>
              <div className={styles.completeIcon}>🎉</div>
              <h2 className={styles.completeTitle}>Sesja zakończona!</h2>
              <p className={styles.completeSubtitle}>
                Świetna robota! Czas na przerwę.
              </p>
            </div>

            <div className={styles.completedStats}>
              <div className={styles.completedStat}>
                <div className={styles.completedStatIcon}>🃏</div>
                <div className={styles.completedStatValue}>
                  {session.studiedToday}
                </div>
                <div className={styles.completedStatLabel}>
                  Przećwiczonych kart
                </div>
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

            <div className={styles.completeActions}>
              <button
                onClick={() => router.push('/flashcards')}
                className={styles.completeBtn}
              >
                <span className={styles.completeActionIcon}>🗂️</span>
                Wszystkie zestawy
              </button>
              <button
                onClick={() => window.location.reload()}
                className={styles.completeBtn}
              >
                <span className={styles.completeActionIcon}>🔄</span>
                Jeszcze raz
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

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.studyContainer}>
          {/* 🎯 STUDY HEADER */}
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
                        width: `${
                          (session.studiedToday /
                            Math.max(
                              1,
                              session.newCards +
                                session.reviewCards +
                                session.learningCards
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {session.studiedToday} /{' '}
                    {session.newCards +
                      session.reviewCards +
                      session.learningCards}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.studyControls}>
              <button
                onClick={() => setStudyMode('settings')}
                className={styles.controlBtn}
              >
                <span className={styles.controlIcon}>⚙️</span>
              </button>
              <button
                onClick={() => router.push('/flashcards')}
                className={styles.controlBtn}
              >
                <span className={styles.controlIcon}>❌</span>
              </button>
            </div>
          </div>

          {/* 📊 QUICK STATS */}
          <div className={styles.quickStats}>
            <div className={styles.quickStat}>
              <span className={styles.quickStatIcon}>✅</span>
              <span className={styles.quickStatValue}>
                {stats.correctAnswers}
              </span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatIcon}>❌</span>
              <span className={styles.quickStatValue}>
                {stats.wrongAnswers}
              </span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatIcon}>💎</span>
              <span className={styles.quickStatValue}>{stats.points}</span>
            </div>
            <div className={styles.quickStat}>
              <span className={styles.quickStatIcon}>🔥</span>
              <span className={styles.quickStatValue}>
                {stats.studyStreak}
              </span>
            </div>
          </div>

          {/* 🃏 FLASHCARD */}
          <div className={styles.flashcardContainer}>
            <div
              className={`${styles.flashcard} ${
                isCardFlipped ? styles.flipped : ''
              }`}
            >
              {/* PRZÓD KARTY */}
              <div className={styles.cardFront}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardType}>
                    {currentCard.isNew
                      ? '🆕 Nowa'
                      : currentCard.isLearning
                      ? '🔄 Powtórka'
                      : '✅ Opanowana'}
                  </div>
                  <div className={styles.cardDifficulty}>
                    {currentCard.difficulty === 'easy'
                      ? '🟢'
                      : currentCard.difficulty === 'medium'
                      ? '🟡'
                      : '🔴'}
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
                  <button
                    onClick={flipCard}
                    className={styles.flipBtn}
                  >
                    <span className={styles.flipIcon}>🔄</span>
                    Pokaż odpowiedź
                  </button>
                  {currentCard.audio && (
                    <button
                      onClick={playAudio}
                      className={styles.audioBtn}
                    >
                      <span className={styles.audioIcon}>🔊</span>
                      Odtwórz
                    </button>
                  )}
                  {currentCard.hint && (
                    <button
                      onClick={toggleHint}
                      className={styles.hintBtn}
                    >
                      <span className={styles.hintIcon}>💡</span>
                      {showHint ? 'Ukryj' : 'Podpowiedź'}
                    </button>
                  )}
                </div>

                {showHint && currentCard.hint && (
                  <div className={styles.cardHint}>
                    <span className={styles.hintLabel}>💡 Podpowiedź:</span>
                    {currentCard.hint}
                  </div>
                )}
              </div>

              {/* TYŁ KARTY */}
              <div className={styles.cardBack}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardType}>Odpowiedź</div>
                  <div className={styles.cardDifficulty}>
                    {currentCard.difficulty === 'easy'
                      ? '🟢'
                      : currentCard.difficulty === 'medium'
                      ? '🟡'
                      : '🔴'}
                  </div>
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

                {/* 🎯 RATING BUTTONS */}
                <div className={styles.ratingButtons}>
                  <button
                    onClick={() => gradeCard(1)}
                    className={`${styles.ratingBtn} ${styles.again}`}
                  >
                    <div className={styles.ratingLabel}>Znów</div>
                    <div className={styles.ratingTime}>{'<1min'}</div>
                  </button>

                  <button
                    onClick={() => gradeCard(2)}
                    className={`${styles.ratingBtn} ${styles.hard}`}
                  >
                    <div className={styles.ratingLabel}>Trudne</div>
                    <div className={styles.ratingTime}>{'<10min'}</div>
                  </button>

                  <button
                    onClick={() => gradeCard(3)}
                    className={`${styles.ratingBtn} ${styles.good}`}
                  >
                    <div className={styles.ratingLabel}>Dobrze</div>
                    <div className={styles.ratingTime}>4 dni</div>
                  </button>

                  <button
                    onClick={() => gradeCard(4)}
                    className={`${styles.ratingBtn} ${styles.easy}`}
                  >
                    <div className={styles.ratingLabel}>Łatwo</div>
                    <div className={styles.ratingTime}>10 dni</div>
                  </button>
                </div>

                <div className={styles.backActions}>
                  <button
                    onClick={flipCard}
                    className={styles.flipBackBtn}
                  >
                    <span className={styles.flipIcon}>🔄</span>
                    Pokaż pytanie
                  </button>
                  <button
                    onClick={skipCard}
                    className={styles.skipBtn}
                  >
                    <span className={styles.skipIcon}>⏭️</span>
                    Pomiń
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 📱 MOBILE HINT */}
          <div className={styles.swipeHint}>
            <span className={styles.swipeIcon}>👆</span>
            Stuknij kartę aby ją przewrócić
          </div>
        </div>
      </div>
    </Layout>
  );
}
