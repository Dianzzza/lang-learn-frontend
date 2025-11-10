// pages/tests/[id]/index.tsx
// FORMALNA SESJA TESTOWA - jak Cambridge

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/TestSession.module.css';

interface TestSection {
  id: number;
  name: string;
  skill: 'reading' | 'writing' | 'listening' | 'use-of-english';
  timeLimit: number; // minuty
  questionsCount: number;
  isCompleted: boolean;
  questions: TestQuestion[];
}

interface TestQuestion {
  id: number;
  type: 'multiple-choice' | 'cloze' | 'word-formation' | 'key-word' | 'essay' | 'email';
  instruction: string;
  passage?: string;
  question: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  audioUrl?: string;
}

export default function TestSession({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const testId = params?.id ? parseInt(params.id) : 1;

  // 🔒 PRZYKŁADOWY TEST - Cambridge B2 First
  const testSections: TestSection[] = [
    {
      id: 1,
      name: 'Reading and Use of English',
      skill: 'reading',
      timeLimit: 75,
      questionsCount: 52,
      isCompleted: false,
      questions: [
        {
          id: 1,
          type: 'multiple-choice',
          instruction: 'For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
          passage: 'The modern world of work has changed dramatically over the past few decades. Many people now work from home, using technology to (1) _____ with colleagues around the world.',
          question: '1.',
          options: ['communicate', 'contact', 'connect', 'correspond'],
          correctAnswer: 0,
          points: 2
        }
      ]
    },
    {
      id: 2,
      name: 'Writing',
      skill: 'writing',
      timeLimit: 80,
      questionsCount: 2,
      isCompleted: false,
      questions: [
        {
          id: 1,
          type: 'essay',
          instruction: 'You must answer this question. Write your answer in 140-190 words in an appropriate style.',
          question: 'In your English class you have been talking about social media. Now your English teacher has asked you to write an essay. Write an essay using all the notes and give reasons for your point of view.',
          points: 20
        }
      ]
    }
  ];

  const currentSectionData = testSections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];

  // ⏱️ TIMER
  useEffect(() => {
    if (isTestStarted && sectionTimeLeft > 0) {
      const timer = setInterval(() => {
        setSectionTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-move to next section
            if (currentSection < testSections.length - 1) {
              setCurrentSection(currentSection + 1);
              return testSections[currentSection + 1].timeLimit * 60;
            } else {
              // Test finished
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isTestStarted, sectionTimeLeft, currentSection, testSections]);

  // 🚀 START TEST
  const startTest = () => {
    setShowInstructions(false);
    setIsTestStarted(true);
    setSectionTimeLeft(testSections[0].timeLimit * 60);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 📋 TEST INSTRUCTIONS
  if (showInstructions) {
    return (
      <Layout>
        <div className={styles.page}>
          <div className={styles.instructionsContainer}>
            <div className={styles.instructionsHeader}>
              <h1 className={styles.instructionsTitle}>
                <span className={styles.instructionsIcon}>📝</span>
                Cambridge B2 First Mock Exam
              </h1>
              <p className={styles.instructionsSubtitle}>
                Oficjalny egzamin próbny FCE
              </p>
            </div>

            <div className={styles.testOverview}>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>⏱️</div>
                <div className={styles.overviewValue}>3h 30min</div>
                <div className={styles.overviewLabel}>Całkowity czas</div>
              </div>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>📑</div>
                <div className={styles.overviewValue}>{testSections.length}</div>
                <div className={styles.overviewLabel}>Sekcje</div>
              </div>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>❓</div>
                <div className={styles.overviewValue}>
                  {testSections.reduce((sum, section) => sum + section.questionsCount, 0)}
                </div>
                <div className={styles.overviewLabel}>Pytania</div>
              </div>
            </div>

            <div className={styles.sectionsPreview}>
              <h3 className={styles.sectionsTitle}>Struktura testu:</h3>
              <div className={styles.sectionsList}>
                {testSections.map((section, index) => (
                  <div key={section.id} className={styles.sectionPreview}>
                    <div className={styles.sectionNumber}>{index + 1}</div>
                    <div className={styles.sectionInfo}>
                      <div className={styles.sectionName}>{section.name}</div>
                      <div className={styles.sectionDetails}>
                        {section.questionsCount} pytań • {section.timeLimit} min
                      </div>
                    </div>
                    <div className={styles.sectionSkill}>
                      {section.skill === 'reading' && '📖'}
                      {section.skill === 'writing' && '✍️'}
                      {section.skill === 'listening' && '🎧'}
                      {section.skill === 'use-of-english' && '📝'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.testRules}>
              <h3 className={styles.rulesTitle}>
                <span className={styles.rulesIcon}>📋</span>
                Zasady testu:
              </h3>
              <ul className={styles.rulesList}>
                <li>Test składa się z {testSections.length} sekcji z oddzielnymi limitami czasowymi</li>
                <li>Po zakończeniu sekcji nie można do niej powrócić</li>
                <li>Wszystkie odpowiedzi są automatycznie zapisywane</li>
                <li>Timer jest widoczny przez cały czas</li>
                <li>Można pomijać pytania i wracać do nich w ramach sekcji</li>
              </ul>
            </div>

            <div className={styles.instructionsActions}>
              <button onClick={() => router.push('/tests')} className={styles.cancelBtn}>
                <span className={styles.cancelIcon}>←</span>
                Powrót do testów
              </button>
              <button onClick={startTest} className={styles.startTestBtn}>
                <span className={styles.startIcon}>🚀</span>
                Rozpocznij test
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentSectionData || !currentQuestionData) {
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

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.testContainer}>
          
          {/* 🎯 TEST HEADER */}
          <div className={styles.testHeader}>
            <div className={styles.testInfo}>
              <h1 className={styles.testTitle}>
                <span className={styles.testIcon}>📝</span>
                {currentSectionData.name}
              </h1>
              <div className={styles.sectionProgress}>
                Sekcja {currentSection + 1} z {testSections.length} • 
                Pytanie {currentQuestion + 1} z {currentSectionData.questionsCount}
              </div>
            </div>

            <div className={styles.testControls}>
              <div className={`${styles.sectionTimer} ${sectionTimeLeft < 300 ? styles.warning : ''}`}>
                <span className={styles.timerIcon}>⏱️</span>
                {formatTime(sectionTimeLeft)}
              </div>
            </div>
          </div>

          {/* ❓ TEST QUESTION */}
          <div className={styles.testQuestion}>
            <div className={styles.questionHeader}>
              <div className={styles.questionType}>
                {currentQuestionData.type === 'multiple-choice' && '🎯 Multiple Choice'}
                {currentQuestionData.type === 'cloze' && '✏️ Cloze Test'}
                {currentQuestionData.type === 'word-formation' && '🔤 Word Formation'}
                {currentQuestionData.type === 'essay' && '📝 Essay'}
              </div>
              <div className={styles.questionPoints}>
                {currentQuestionData.points} {currentQuestionData.points === 1 ? 'punkt' : 'punkty'}
              </div>
            </div>

            {currentQuestionData.instruction && (
              <div className={styles.questionInstruction}>
                {currentQuestionData.instruction}
              </div>
            )}

            {currentQuestionData.passage && (
              <div className={styles.questionPassage}>
                {currentQuestionData.passage}
              </div>
            )}

            <div className={styles.questionContent}>
              <h2 className={styles.questionText}>
                {currentQuestionData.question}
              </h2>
            </div>

            {/* ANSWER INTERFACE - jak w poprzednich komponentach */}
            <div className={styles.answerInterface}>
              {/* Implementation similar to QuizSession */}
            </div>

            {/* 🎮 NAVIGATION */}
            <div className={styles.questionNavigation}>
              <button 
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={styles.prevBtn}
              >
                <span className={styles.prevIcon}>←</span>
                Poprzednie
              </button>

              <div className={styles.questionNumbers}>
                {currentSectionData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`${styles.questionNumber} 
                      ${index === currentQuestion ? styles.current : ''} 
                      ${answers[`${currentSection}-${index}`] ? styles.answered : ''}
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (currentQuestion < currentSectionData.questionsCount - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                  } else if (currentSection < testSections.length - 1) {
                    setCurrentSection(currentSection + 1);
                    setCurrentQuestion(0);
                  }
                }}
                className={styles.nextBtn}
              >
                <span className={styles.nextIcon}>→</span>
                {currentQuestion < currentSectionData.questionsCount - 1 ? 'Następne' : 'Następna sekcja'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
