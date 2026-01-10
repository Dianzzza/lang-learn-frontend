'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import styles from '@/styles/TestSession.module.css';

type TestTemplateDTO = {
  id: number;
  sentence: string;
  polishWord: string | null;
};

const API_BASE = 'http://localhost:4000';

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function TestSessionPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<TestTemplateDTO[]>([]);
  const [idx, setIdx] = useState(0);

  const [showInstructions, setShowInstructions] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const [userAnswer, setUserAnswer] = useState('');
  const [lastCorrect, setLastCorrect] = useState<null | boolean>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  // ✅ podsumowanie
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const categoryId = useMemo(() => {
    const raw = router.query.id;
    const n = typeof raw === 'string' ? Number(raw) : Array.isArray(raw) ? Number(raw[0]) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [router.query.id]);

  const total = templates.length;
  const current = idx < total ? templates[idx] : null;
  const finished = isStarted && total > 0 && idx >= total;

  // Pobieranie pytań z backendu
  useEffect(() => {
    if (!router.isReady) return;
    if (!categoryId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoadError('Brak tokenu. Zaloguj się ponownie.');
      return;
    }

    setLoadError(null);

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

        // reset licznika przy nowym teście
        setCorrectCount(0);
        setWrongCount(0);
        setLastCorrect(null);
        setUserAnswer('');
      })
      .catch((e) => setLoadError(String(e?.message || e)));
  }, [router.isReady, categoryId]);

  // Timer
  useEffect(() => {
    if (!isStarted) return;
    if (timeLeft <= 0) return;

    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [isStarted, timeLeft]);

  const startTest = () => {
    setShowInstructions(false);
    setIsStarted(true);

    // ~25 sekund na pytanie, min 60s
    const seconds = Math.max(60, templates.length * 25);
    setTimeLeft(seconds);

    // reset licznika przy starcie (na wypadek cofnięcia się do instrukcji)
    setCorrectCount(0);
    setWrongCount(0);
    setLastCorrect(null);
    setUserAnswer('');
    setIdx(0);
  };

  // Ekran instrukcji
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

  // Loading
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

  // Koniec czasu
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

  // Koniec testu
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

  // Widok główny testu
  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.testContainer}>
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
                    setLastCorrect(ok);

                    if (ok) setCorrectCount((p) => p + 1);
                    else setWrongCount((p) => p + 1);

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
