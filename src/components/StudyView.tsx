/**
 * @file StudyView.tsx
 * @brief Komponent widoku szczegółowego pojedynczej lekcji.
 *
 * Jest to główny obszar roboczy, w którym użytkownik rozwiązuje zadania.
 * Obecnie pełni funkcję szkieletu (placeholder), ale docelowo będzie:
 * 1. Pobierać szczegółowe dane lekcji na podstawie `lessonId`.
 * 2. Zarządzać stanem quizu/ćwiczeń (np. aktualne pytanie, wynik).
 * 3. Obsługiwać logikę zakończenia lekcji i przyznawania punktów.
 */

import styles from '../styles/StudyView.module.css';

/**
 * Właściwości (Props) przyjmowane przez komponent StudyView.
 */
interface StudyViewProps {
  /**
   * Unikalny identyfikator lekcji.
   * Może być liczbą (ID z bazy) lub stringiem (np. slug z URL),
   * w zależności od przyjętej strategii routingu.
   */
  lessonId: string | number;
}

/**
 * Komponent StudyView.
 *
 * @param {StudyViewProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Kontener treści lekcji.
 */
export default function StudyView({ lessonId }: StudyViewProps) {
  
  // TODO: W przyszłości tutaj znajdzie się hook do pobierania danych, np.:
  // const { lesson, isLoading } = useLesson(lessonId);

  return (
    <div className={styles.container}>
      {/* Nagłówek lekcji - tymczasowo wyświetla tylko ID */}
      <h1>Lekcja #{lessonId}</h1>
      
      {/* Obszar roboczy - tutaj będą renderowane komponenty typu <Quiz />, <VideoPlayer /> lub <Flashcards /> */}
      <p>Tu pojawi się treść lekcji, ćwiczenia oraz quizy.</p>
    </div>
  );
}