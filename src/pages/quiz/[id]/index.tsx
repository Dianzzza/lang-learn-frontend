// pages/quiz/[id]/index.tsx
// SESJA QUIZU - interaktywne rozwiązywanie

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/QuizSession.module.css';

interface QuizQuestion {
  id: number;
  type: 'multiple-choice' | 'gap-fill' | 'matching' | 'true-false' | 'listening' | 'transformation';
  question: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | string[] | number;
  explanation?: string;
  hint?: string;
  points: number;
}

interface QuizSession {
  quizId: number;
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  maxScore: number;
  timeRemaining: number;
  hasTimer: boolean;
  startTime: Date;
  answers: Record<number, any>;
  isComplete: boolean;
}

export default function QuizSession({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const quizId = params?.id ? parseInt(params.id) : 1;

  // 🔒 PRZYKŁADOWE PYTANIA
  const [questions] = useState<QuizQuestion[]>([
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Which sentence is correct?',
      options: [
        'I am working in London now.',
        'I work in London now.',
        'I working in London now.',
        'I am work in London now.'
      ],
      correctAnswer: 0,
      explanation: 'Present Continuous (am working) is used for temporary actions happening now.',
      hint: 'Think about temporary vs permanent actions',
      points: 10
    },
    {
      id: 2,
      type: 'gap-fill',
      question: 'Complete the sentence: She _____ (go) to school every day.',
      correctAnswer: 'goes',
      explanation: 'Present Simple uses "goes" for third person singular.',
      hint: 'Third person singular form',
      points: 10
    },
    {
      id: 3,
      type: 'transformation',
      question: 'Transform: "I eat breakfast at 8 AM" → "I _____ breakfast right now"',
      correctAnswer: 'am eating',
      explanation: 'Change from Present Simple to Present Continuous for actions happening now.',
      hint: 'Use Present Continuous form',
      points: 15
    }
  ]);

  const [session, setSession] = useState<QuizSession>({
    quizId: quizId,
    title: 'Present Simple vs Present Continuous',
    currentQuestion: 0,
    totalQuestions: questions.length,
    score: 0,
    maxScore: questions.reduce((sum, q) => sum + q.points, 0),
    timeRemaining: 600, // 10 minut w sekundach
    hasTimer: true,
    startTime: new Date(),
    answers: {},
    isComplete: false
  });

  // ⏱️ TIMER EFFECT
  useEffect(() => {
    if (session.hasTimer && session.timeRemaining > 0 && !session.isComplete) {
      const timer = setInterval(() => {
        setSession(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            return { ...prev, timeRemaining: 0, isComplete: true };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session.hasTimer, session.timeRemaining, session.isComplete]);

  // 🔄 SET CURRENT QUESTION
  useEffect(() => {
    if (questions.length > 0 && session.currentQuestion < questions.length) {
      setCurrentQuestion(questions[session.currentQuestion]);
      setSelectedAnswer(session.answers[session.currentQuestion] || null);
      setIsAnswered(!!session.answers[session.currentQuestion]);
      setShowExplanation(false);
      setShowHint(false);
    }
  }, [session.currentQuestion, questions]);

  // ✅ SUBMIT ANSWER
  const submitAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.includes(selectedAnswer)
      : currentQuestion.correctAnswer === selectedAnswer;

    const points = isCorrect ? currentQuestion.points : 0;

    setSession(prev => ({
      ...prev,
      answers: { ...prev.answers, [session.currentQuestion]: selectedAnswer },
      score: prev.score + points
    }));

    setIsAnswered(true);
    setShowExplanation(true);
  };

  // ⏭️ NEXT QUESTION
  const nextQuestion = () => {
    if (session.currentQuestion + 1 < questions.length) {
      setSession(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      setSession(prev => ({ ...prev, isComplete: true }));
    }
  };

  // 📊 QUIZ COMPLETE
  if (session.isComplete) {
    const percentage = Math.round((session.score / session.maxScore) * 100);
    const sessionTime = Math.round((new Date().getTime() - session.startTime.getTime()) / 60000);

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
                <span className={styles.scoreLabel}>({session.score}/{session.maxScore} pkt)</span>
              </div>
            </div>

            <div className={styles.resultsStats}>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>⏱️</div>
                <div className={styles.resultsStatValue}>{sessionTime} min</div>
                <div className={styles.resultsStatLabel}>Czas</div>
              </div>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>✅</div>
                <div className={styles.resultsStatValue}>{Object.keys(session.answers).length}</div>
                <div className={styles.resultsStatLabel}>Odpowiedzi</div>
              </div>
              <div className={styles.resultsStat}>
                <div className={styles.resultsStatIcon}>🎯</div>
                <div className={styles.resultsStatValue}>{percentage}%</div>
                <div className={styles.resultsStatLabel}>Celność</div>
              </div>
            </div>

            <div className={styles.resultsActions}>
              <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                <span className={styles.retryIcon}>🔄</span>
                Spróbuj ponownie
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

  if (!currentQuestion) {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.quizContainer}>
          
          {/* 🎯 QUIZ HEADER */}
          <div className={styles.quizHeader}>
            <div className={styles.quizInfo}>
              <h1 className={styles.quizTitle}>
                <span className={styles.quizIcon}>🧠</span>
                {session.title}
              </h1>
              <div className={styles.quizProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${(session.currentQuestion / session.totalQuestions) * 100}%` }}
                  ></div>
                </div>
                <span className={styles.progressText}>
                  {session.currentQuestion + 1} / {session.totalQuestions}
                </span>
              </div>
            </div>

            <div className={styles.quizControls}>
              {session.hasTimer && (
                <div className={`${styles.timer} ${session.timeRemaining < 60 ? styles.warning : ''}`}>
                  <span className={styles.timerIcon}>⏱️</span>
                  {formatTime(session.timeRemaining)}
                </div>
              )}
              <div className={styles.score}>
                <span className={styles.scoreIcon}>💎</span>
                {session.score} pkt
              </div>
            </div>
          </div>

          {/* ❓ QUESTION CARD */}
          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <div className={styles.questionType}>
                {currentQuestion.type === 'multiple-choice' && '🎯 Wybór wielokrotny'}
                {currentQuestion.type === 'gap-fill' && '✏️ Uzupełnij lukę'}
                {currentQuestion.type === 'transformation' && '🔄 Przekształć'}
                {currentQuestion.type === 'true-false' && '✅ Prawda/Fałsz'}
                {currentQuestion.type === 'matching' && '🔗 Dopasuj'}
                {currentQuestion.type === 'listening' && '🎧 Słuchanie'}
              </div>
              <div className={styles.questionPoints}>
                <span className={styles.pointsIcon}>💎</span>
                {currentQuestion.points} pkt
              </div>
            </div>

            <div className={styles.questionContent}>
              <h2 className={styles.questionText}>
                {currentQuestion.question}
              </h2>
              
              {currentQuestion.imageUrl && (
                <div className={styles.questionImage}>
                  <img src={currentQuestion.imageUrl} alt="Question visual" />
                </div>
              )}

              {currentQuestion.audioUrl && (
                <div className={styles.audioPlayer}>
                  <button className={styles.playAudioBtn}>
                    <span className={styles.audioIcon}>🔊</span>
                    Odtwórz nagranie
                  </button>
                </div>
              )}
            </div>

            {/* 🎮 ANSWER INTERFACE */}
            <div className={styles.answerInterface}>
              
              {/* MULTIPLE CHOICE */}
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className={styles.multipleChoice}>
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !isAnswered && setSelectedAnswer(index)}
                      className={`${styles.optionBtn} 
                        ${selectedAnswer === index ? styles.selected : ''} 
                        ${isAnswered && index === currentQuestion.correctAnswer ? styles.correct : ''}
                        ${isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer ? styles.incorrect : ''}
                      `}
                      disabled={isAnswered}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* GAP FILL */}
              {currentQuestion.type === 'gap-fill' && (
                <div className={styles.gapFill}>
                  <input
                    type="text"
                    placeholder="Wpisz odpowiedź..."
                    value={selectedAnswer || ''}
                    onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
                    className={`${styles.gapInput} 
                      ${isAnswered && selectedAnswer?.toLowerCase() === currentQuestion.correctAnswer?.toString().toLowerCase() ? styles.correct : ''}
                      ${isAnswered && selectedAnswer?.toLowerCase() !== currentQuestion.correctAnswer?.toString().toLowerCase() ? styles.incorrect : ''}
                    `}
                    disabled={isAnswered}
                  />
                  {isAnswered && (
                    <div className={styles.correctAnswer}>
                      <strong>Prawidłowa odpowiedź:</strong> {currentQuestion.correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* TRUE/FALSE */}
              {currentQuestion.type === 'true-false' && (
                <div className={styles.trueFalse}>
                  <button
                    onClick={() => !isAnswered && setSelectedAnswer(true)}
                    className={`${styles.tfBtn} ${styles.trueBtn} 
                      ${selectedAnswer === true ? styles.selected : ''}
                      ${isAnswered && currentQuestion.correctAnswer === true ? styles.correct : ''}
                      ${isAnswered && selectedAnswer === true && currentQuestion.correctAnswer === false ? styles.incorrect : ''}
                    `}
                    disabled={isAnswered}
                  >
                    <span className={styles.tfIcon}>✅</span>
                    Prawda
                  </button>
                  <button
                    onClick={() => !isAnswered && setSelectedAnswer(false)}
                    className={`${styles.tfBtn} ${styles.falseBtn}
                      ${selectedAnswer === false ? styles.selected : ''}
                      ${isAnswered && currentQuestion.correctAnswer === false ? styles.correct : ''}
                      ${isAnswered && selectedAnswer === false && currentQuestion.correctAnswer === true ? styles.incorrect : ''}
                    `}
                    disabled={isAnswered}
                  >
                    <span className={styles.tfIcon}>❌</span>
                    Fałsz
                  </button>
                </div>
              )}

            </div>

            {/* 💡 HINT */}
            {currentQuestion.hint && !isAnswered && (
              <div className={styles.hintSection}>
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className={styles.hintBtn}
                >
                  <span className={styles.hintIcon}>💡</span>
                  {showHint ? 'Ukryj podpowiedź' : 'Pokaż podpowiedź'}
                </button>
                {showHint && (
                  <div className={styles.hintText}>
                    {currentQuestion.hint}
                  </div>
                )}
              </div>
            )}

            {/* 📚 EXPLANATION */}
            {showExplanation && currentQuestion.explanation && (
              <div className={styles.explanationSection}>
                <div className={styles.explanationHeader}>
                  <span className={styles.explanationIcon}>📚</span>
                  Wyjaśnienie:
                </div>
                <div className={styles.explanationText}>
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* 🎮 QUESTION ACTIONS */}
            <div className={styles.questionActions}>
              {!isAnswered ? (
                <button 
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null || selectedAnswer === ''}
                  className={styles.submitBtn}
                >
                  <span className={styles.submitIcon}>✅</span>
                  Sprawdź odpowiedź
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className={styles.nextBtn}
                >
                  <span className={styles.nextIcon}>➡️</span>
                  {session.currentQuestion + 1 < session.totalQuestions ? 'Następne pytanie' : 'Zakończ quiz'}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
