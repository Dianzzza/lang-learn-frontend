/**
 * @file TestSessionPage.tsx
 * @brief Widok sesji testowej typu "Wpisz brakujące słowo" (Fill-in-the-gap).
 *
 * Komponent ten realizuje bardziej rygorystyczną formę sprawdzania wiedzy niż Quiz:
 * 1. **Brak podpowiedzi A/B/C/D:** Użytkownik musi znać pisownię.
 * 2. **Weryfikacja Server-Side:** Odpowiedź jest wysyłana do API, które sprawdza poprawność (fuzzy matching).
 * 3. **Presja czasu:** Globalny licznik czasu dla całego testu.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import styles from '@/styles/TestSession.module.css';

/**
 * Struktura szablonu pytania pobieranego z API.
 */
type TestTemplateDTO = {
  id: number;
  sentence: string; // Zdanie z luką (np. "I ___ to the cinema.")
  polishWord: string | null; // Tłumaczenie brakującego słowa (np. "chodzę")
};

// Adres API (w produkcji powinien być w zmiennych środowiskowych)
const API_BASE = 'http://localhost:4000';

/**
 * Formatuje sekundy do formatu MM:SS lub HH:MM:SS.
 */
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Komponent TestSessionPage.
 *
 * @returns {JSX.Element} Interfejs testu pisemnego.
 */
export default function TestSessionPage() {
  const router = useRouter();

  // --- STANY DANYCH ---
  const [templates, setTemplates] = useState<TestTemplateDTO[]>([]);
  const [idx, setIdx] = useState(0); // Indeks aktualnego pytania

  // --- STANY UI ---
  const [showInstructions, setShowInstructions] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- STANY INTERAKCJI ---
  const [userAnswer, setUserAnswer] = useState('');
  // Stan feedbacku: null (brak), true (poprawna), false (błędna)
  const [lastCorrect, setLastCorrect] = useState<null | boolean>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATYSTYKI SESJI ---
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Parsowanie ID kategorii z URL
  const categoryId = useMemo(() => {
    const raw = router.query.id;
    const n = typeof raw === 'string' ? Number(raw) : Array.isArray(raw) ? Number(raw[0]) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [router.query.id]);

  // Helpery nawigacyjne
  const total = templates.length;
  const current = idx < total ? templates[idx] : null;
  const finished = isStarted && total > 0 && idx >= total;

  /**
   * Efekt 1: Pobieranie pytań z backendu po załadowaniu ID kategorii.
   */
  useEffect(() => {
    if (!router.isReady) return;
    if (!categoryId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoadError('Brak tokenu. Zaloguj się ponownie.');
      return;
    }

    setLoadError(null);

    // Pobranie szablonów testu (pytań)
    fetch(`${API_BASE}/api/tests/templates?categoryId=${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || 'Nie udało się pobrać pytań.');
        return data;
      })
      .then((data) => {
        const list: TestTemplateDTO[] = Array.isArray(data?.templates) ? data.templates : [];
        setTemplates(list);
        setIdx(0);

        // Reset stanu przy nowym zestawie
        setCorrectCount(0);
        setWrongCount(0);
        setLastCorrect(null);
        setUserAnswer('');
      })
      .catch((e) => setLoadError(String(e?.message || e)));
  }, [router.isReady, categoryId]);

  /**
   * Efekt 2: Globalny Timer.
   * Odlicza czas tylko gdy test jest aktywny (`isStarted`).
   */
  useEffect(() => {
    if (!isStarted) return;
    if (timeLeft <= 0) return;

    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [isStarted, timeLeft]);

  /**
   * Uruchamia test, ukrywa instrukcje i ustawia czas.
   */
  const startTest = () => {
    setShowInstructions(false);
    setIsStarted(true);

    // Algorytm czasu: ~25 sekund na pytanie, ale minimum 60s na cały test
    const seconds = Math.max(60, templates.length * 25);
    setTimeLeft(seconds);

    // Reset liczników
    setCorrectCount(0);
    setWrongCount(0);
    setLastCorrect(null);
    setUserAnswer('');
    setIdx(0);
  };

  // --- RENDEROWANIE EKRANÓW (State Machine) ---

  // 1. Ekran Instrukcji (Start Screen)
  if (showInstructions) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.instructionsContainer}>
            <div className={styles.instructionsHeader}>
              <h1 className={styles.instructionsTitle}>
                <span className={styles.instructionsIcon}>📝</span>
                Test (uzupełnij lukę)
              </h1>
              <p className={styles.instructionsSubtitle}>
                Wpisuj brakujące słowo po angielsku — podpowiedź jest po polsku.
              </p>
            </div>

            <div className={styles.testOverview}>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>❓</div>
                <div className={styles.overviewValue}>{templates.length || '—'}</div>
                <div className={styles.overviewLabel}>Pytania</div>
              </div>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>⏱️</div>
                <div className={styles.overviewValue}>
                  {templates.length ? `${Math.max(1, Math.round((templates.length * 25) / 60))} min` : '—'}
                </div>
                <div className={styles.overviewLabel}>Czas (szac.)</div>
              </div>
            </div>

            <div className={styles.testRules}>
              <h3 className={styles.rulesTitle}>
                <span className={styles.rulesIcon}>📋</span>
                Zasady:
              </h3>
              <ul className={styles.rulesList}>
                <li>Odpowiedź wpisujesz ręcznie (nie ma wyboru z listy).</li>
                <li>Ignorowana jest wielkość liter i interpunkcja.</li>
                <li>Po wysłaniu odpowiedź zapisuje się w bazie.</li>
              </ul>
            </div>

            {loadError && (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingIcon}>⚠️</div>
                <div className={styles.loadingText}>{loadError}</div>
              </div>
            )}

            <div className={styles.instructionsActions}>
              <button onClick={() => router.push('/tests')} className={styles.cancelBtn}>
                <span className={styles.cancelIcon}>←</span>
                Powrót do testów
              </button>
              <button
                onClick={startTest}
                className={styles.startTestBtn}
                disabled={templates.length === 0 || Boolean(loadError)}
              >
                <span className={styles.startIcon}>🚀</span>
                Rozpocznij test
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 2. Loading State (w trakcie pobierania danych)
  if (loadError) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>⚠️</div>
            <div className={styles.loadingText}>{loadError}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isStarted || templates.length === 0) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>🔄</div>
            <div className={styles.loadingText}>Ładowanie testu...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // 3. Koniec Czasu (Time's Up)
  if (timeLeft === 0 && !finished) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.instructionsContainer}>
            <div className={styles.instructionsHeader}>
              <h1 className={styles.instructionsTitle}>
                <span className={styles.instructionsIcon}>⏱️</span>
                Koniec czasu
              </h1>
              <p className={styles.instructionsSubtitle}>
                Poprawne: {correctCount} • Błędne: {wrongCount}
              </p>
            </div>

            <div className={styles.instructionsActions}>
              <button onClick={() => router.push('/tests')} className={styles.startTestBtn}>
                Wróć do testów
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 4. Ekran Końcowy (Finished)
  if (finished) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.instructionsContainer}>
            <div className={styles.instructionsHeader}>
              <h1 className={styles.instructionsTitle}>
                <span className={styles.instructionsIcon}>✅</span>
                Test ukończony
              </h1>
              <p className={styles.instructionsSubtitle}>
                Poprawne: {correctCount} • Błędne: {wrongCount}
              </p>
            </div>

            <div className={styles.instructionsActions}>
              <button onClick={() => router.push('/tests')} className={styles.startTestBtn}>
                Wróć do testów
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 5. Główny Widok Testu (Active Question)
  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.testContainer}>
          
          {/* Header Pytania */}
          <div className={styles.testHeader}>
            <div className={styles.testInfo}>
              <h1 className={styles.testTitle}>
                <span className={styles.testIcon}>📝</span>
                Test
              </h1>
              <div className={styles.sectionProgress}>
                Pytanie {idx + 1} z {total} • Poprawne: {correctCount} • Błędne: {wrongCount}
              </div>
            </div>

            <div className={styles.testControls}>
              {/* Timer zmienia kolor na czerwony poniżej 30s */}
              <div className={`${styles.sectionTimer} ${timeLeft < 30 ? styles.warning : ''}`}>
                <span className={styles.timerIcon}>⏱️</span>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className={styles.testQuestion}>
            <div className={styles.questionHeader}>
              <div className={styles.questionType}>✏️ Uzupełnij lukę</div>
              <div className={styles.questionPoints}>1 punkt</div>
            </div>

            <div className={styles.questionInstruction}>
              Podpowiedź (PL): <strong>{current?.polishWord ?? '—'}</strong>
            </div>

            <div className={styles.questionContent}>
              <h2 className={styles.questionText}>{current?.sentence}</h2>
            </div>

            {/* Formularz odpowiedzi */}
            <div className={styles.answerInterface}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!current || isSubmitting) return;

                  const token = localStorage.getItem('token');
                  if (!token) {
                    setLoadError('Brak tokenu. Zaloguj się ponownie.');
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    // Weryfikacja odpowiedzi przez API
                    const resp = await fetch(`${API_BASE}/api/tests/submit`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        testTemplateId: current.id,
                        userAnswer,
                      }),
                    });

                    const data = await resp.json().catch(() => ({}));
                    if (!resp.ok) throw new Error(data?.error || 'Nie udało się zapisać odpowiedzi.');

                    const ok = Boolean(data?.isCorrect);
                    setLastCorrect(ok); // Pokazuje feedback wizualny

                    if (ok) setCorrectCount((p) => p + 1);
                    else setWrongCount((p) => p + 1);

                    // Opóźnienie przed przejściem do następnego pytania (UX)
                    setTimeout(() => {
                      setLastCorrect(null);
                      setUserAnswer('');
                      setIdx((p) => p + 1);
                    }, 1500);
                  } catch (err: any) {
                    setLoadError(String(err?.message || err));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={styles.searchInput}
                  placeholder="Wpisz odpowiedź po angielsku..."
                  autoFocus
                />
                <button type="submit" className={styles.nextBtn} disabled={isSubmitting || !userAnswer.trim()}>
                  <span className={styles.nextIcon}>→</span>
                  Sprawdź
                </button>
              </form>

              {/* Feedback wizualny po zatwierdzeniu */}
              {lastCorrect !== null && (
                <div className={lastCorrect ? styles.correct : styles.wrong}>
                  {lastCorrect ? '✅ Poprawna odpowiedź' : '❌ Błędna odpowiedź'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}