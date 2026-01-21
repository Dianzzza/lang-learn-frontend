'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/GrammarLesson.module.css';

interface GrammarRule {
  id: number;
  title: string;
  explanation: string;
  formula?: string;
  examples: {
    english: string;
    polish: string;
    isCorrect: boolean;
  }[];
  commonMistakes?: {
    wrong: string;
    correct: string;
    explanation: string;
  }[];
}

interface Exercise {
  id: number;
  type: 'fill-gap' | 'transform' | 'correct-mistake' | 'multiple-choice';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export default function GrammarLesson({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<'theory' | 'examples' | 'exercises'>('theory');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const lessonId = params?.id ? parseInt(params.id) : 1;

  // PRZYKŁADOWA LEKCJA - Present Simple vs Continuous
  const grammarRules: GrammarRule[] = [
    {
      id: 1,
      title: 'Present Simple',
      explanation: 'Używamy Present Simple do opisania stałych faktów, nawyków i rutynowych czynności.',
      formula: 'I/You/We/They + verb | He/She/It + verb + s/es',
      examples: [
        { english: 'I work in a bank.', polish: '[translate:Pracuję w banku.]', isCorrect: true },
        { english: 'She speaks French fluently.', polish: '[translate:Ona płynnie mówi po francusku.]', isCorrect: true },
        { english: 'The sun rises in the east.', polish: '[translate:Słońce wschodzi na wschodzie.]', isCorrect: true }
      ],
      commonMistakes: [
        {
          wrong: 'He work in London.',
          correct: 'He works in London.',
          explanation: 'W trzeciej osobie liczby pojedynczej dodajemy końcówkę -s lub -es'
        }
      ]
    },
    {
      id: 2,
      title: 'Present Continuous',
      explanation: 'Używamy Present Continuous do opisania czynności odbywających się teraz lub tymczasowych sytuacji.',
      formula: 'I am/You are/He is + verb + ing',
      examples: [
        { english: 'I am working right now.', polish: '[translate:Pracuję właśnie teraz.]', isCorrect: true },
        { english: 'She is studying English this year.', polish: '[translate:Ona uczy się angielskiego w tym roku.]', isCorrect: true },
        { english: 'They are coming tomorrow.', polish: '[translate:Oni przychodzą jutro.]', isCorrect: true }
      ]
    }
  ];

  const exercises: Exercise[] = [
    {
      id: 1,
      type: 'fill-gap',
      question: 'She _____ (work) in a hospital.',
      correctAnswer: 'works',
      explanation: 'Present Simple - stały fakt, trzecia osoba liczby pojedynczej',
      hint: 'To jest stały fakt o jej pracy'
    },
    {
      id: 2,
      type: 'fill-gap',
      question: 'Right now, I _____ (write) an email.',
      correctAnswer: 'am writing',
      explanation: 'Present Continuous - czynność odbywająca się teraz ("right now")',
      hint: 'Słowa kluczowe: "right now"'
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: 'Which sentence is correct?',
      options: [
        'I am usually getting up at 7 AM.',
        'I usually get up at 7 AM.',
        'I usually am getting up at 7 AM.',
        'I am usually get up at 7 AM.'
      ],
      correctAnswer: 'I usually get up at 7 AM.',
      explanation: '"Usually" wskazuje na nawyk - używamy Present Simple',
      hint: 'Zwróć uwagę na słowo "usually"'
    }
  ];

  const handleAnswerSubmit = () => {
    setShowAnswer(true);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserAnswer('');
      setShowAnswer(false);
    }
  };

  const currentExerciseData = exercises[currentExercise];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* 🎯 LESSON HEADER */}
          <div className={styles.lessonHeader}>
            <button onClick={() => router.push('/grammar')} className={styles.backBtn}>
              <span className={styles.backIcon}>←</span>
              Powrót do gramatyki
            </button>
            
            <div className={styles.lessonInfo}>
              <h1 className={styles.lessonTitle}>
                <span className={styles.lessonIcon}>📚</span>
                Present Simple vs Present Continuous
              </h1>
              <div className={styles.lessonMeta}>
                <span className={styles.levelBadge}>A2</span>
                <span className={styles.categoryBadge}>Czasy</span>
                <span className={styles.timeBadge}>⏱️ 10 min</span>
              </div>
            </div>
          </div>

          {/* 📋 SECTION NAVIGATION */}
          <div className={styles.sectionNav}>
            <button
              onClick={() => setCurrentSection('theory')}
              className={`${styles.sectionBtn} ${currentSection === 'theory' ? styles.active : ''}`}
            >
              <span className={styles.sectionIcon}>📖</span>
              Teoria
            </button>
            <button
              onClick={() => setCurrentSection('examples')}
              className={`${styles.sectionBtn} ${currentSection === 'examples' ? styles.active : ''}`}
            >
              <span className={styles.sectionIcon}>💡</span>
              Przykłady
            </button>
            <button
              onClick={() => setCurrentSection('exercises')}
              className={`${styles.sectionBtn} ${currentSection === 'exercises' ? styles.active : ''}`}
            >
              <span className={styles.sectionIcon}>✏️</span>
              Ćwiczenia ({exercises.length})
            </button>
          </div>

          {/* 📖 THEORY SECTION */}
          {currentSection === 'theory' && (
            <div className={styles.theorySection}>
              {grammarRules.map(rule => (
                <div key={rule.id} className={styles.ruleCard}>
                  <div className={styles.ruleHeader}>
                    <h2 className={styles.ruleTitle}>{rule.title}</h2>
                  </div>
                  <div className={styles.ruleContent}>
                    <p className={styles.ruleExplanation}>
                      {rule.explanation}
                    </p>
                    {rule.formula && (
                      <div className={styles.ruleFormula}>
                        <div className={styles.formulaLabel}>
                          <span className={styles.formulaIcon}>📐</span>
                          Wzór:
                        </div>
                        <div className={styles.formulaText}>
                          {rule.formula}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 💡 EXAMPLES SECTION */}
          {currentSection === 'examples' && (
            <div className={styles.examplesSection}>
              {grammarRules.map(rule => (
                <div key={rule.id} className={styles.exampleCard}>
                  <div className={styles.exampleHeader}>
                    <h3 className={styles.exampleTitle}>
                      <span className={styles.exampleIcon}>💡</span>
                      {rule.title} - Przykłady
                    </h3>
                  </div>
                  <div className={styles.examplesList}>
                    {rule.examples.map((example, index) => (
                      <div key={index} className={styles.exampleItem}>
                        <div className={styles.exampleEnglish}>
                          {example.english}
                        </div>
                        <div className={styles.examplePolish}>
                          {example.polish}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {rule.commonMistakes && (
                    <div className={styles.mistakesSection}>
                      <div className={styles.mistakesTitle}>
                        <span className={styles.mistakeIcon}>⚠️</span>
                        Częste błędy:
                      </div>
                      {rule.commonMistakes.map((mistake, index) => (
                        <div key={index} className={styles.mistakeItem}>
                          <div className={styles.mistakeWrong}>
                            <span className={styles.wrongIcon}>❌</span>
                            {mistake.wrong}
                          </div>
                          <div className={styles.mistakeCorrect}>
                            <span className={styles.correctIcon}>✅</span>
                            {mistake.correct}
                          </div>
                          <div className={styles.mistakeExplanation}>
                            {mistake.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ✏️ EXERCISES SECTION */}
          {currentSection === 'exercises' && (
            <div className={styles.exercisesSection}>
              <div className={styles.exerciseCard}>
                
                <div className={styles.exerciseHeader}>
                  <div className={styles.exerciseProgress}>
                    Ćwiczenie {currentExercise + 1} z {exercises.length}
                  </div>
                  <div className={styles.exerciseType}>
                    {currentExerciseData.type === 'fill-gap' && '✏️ Uzupełnij lukę'}
                    {currentExerciseData.type === 'multiple-choice' && '🎯 Wybór wielokrotny'}
                    {currentExerciseData.type === 'transform' && '🔄 Przekształć'}
                    {currentExerciseData.type === 'correct-mistake' && '🔧 Popraw błąd'}
                  </div>
                </div>

                <div className={styles.exerciseContent}>
                  <h3 className={styles.exerciseQuestion}>
                    {currentExerciseData.question}
                  </h3>

                  {/* FILL GAP */}
                  {currentExerciseData.type === 'fill-gap' && (
                    <div className={styles.fillGap}>
                      <input
                        type="text"
                        placeholder="Wpisz odpowiedź..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className={styles.gapInput}
                        disabled={showAnswer}
                      />
                    </div>
                  )}

                  {/* MULTIPLE CHOICE */}
                  {currentExerciseData.type === 'multiple-choice' && currentExerciseData.options && (
                    <div className={styles.multipleChoice}>
                      {currentExerciseData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setUserAnswer(option)}
                          className={`${styles.optionBtn} ${userAnswer === option ? styles.selected : ''}`}
                          disabled={showAnswer}
                        >
                          <span className={styles.optionLetter}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* HINT */}
                  {currentExerciseData.hint && !showAnswer && (
                    <div className={styles.hintSection}>
                      <div className={styles.hintText}>
                        <span className={styles.hintIcon}>💡</span>
                        {currentExerciseData.hint}
                      </div>
                    </div>
                  )}

                  {/* ANSWER & EXPLANATION */}
                  {showAnswer && (
                    <div className={styles.answerSection}>
                      <div className={styles.correctAnswer}>
                        <span className={styles.answerIcon}>✅</span>
                        <strong>Prawidłowa odpowiedź:</strong> {currentExerciseData.correctAnswer}
                      </div>
                      <div className={styles.explanation}>
                        <span className={styles.explanationIcon}>📚</span>
                        <strong>Wyjaśnienie:</strong> {currentExerciseData.explanation}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.exerciseActions}>
                  {!showAnswer ? (
                    <button 
                      onClick={handleAnswerSubmit}
                      disabled={!userAnswer.trim()}
                      className={styles.submitBtn}
                    >
                      <span className={styles.submitIcon}>✅</span>
                      Sprawdź odpowiedź
                    </button>
                  ) : (
                    <div className={styles.nextActions}>
                      {currentExercise < exercises.length - 1 ? (
                        <button onClick={nextExercise} className={styles.nextBtn}>
                          <span className={styles.nextIcon}>➡️</span>
                          Następne ćwiczenie
                        </button>
                      ) : (
                        <button 
                          onClick={() => router.push('/grammar')}
                          className={styles.completeBtn}
                        >
                          <span className={styles.completeIcon}>🎉</span>
                          Ukończ lekcję
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
