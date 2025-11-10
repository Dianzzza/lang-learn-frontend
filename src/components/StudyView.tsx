import styles from '../styles/StudyView.module.css';

interface StudyViewProps {
  lessonId: string | number;
}

export default function StudyView({ lessonId }: StudyViewProps) {
  return (
    <div className={styles.container}>
      <h1>Lekcja #{lessonId}</h1>
      <p>Tu pojawi się treść lekcji, ćwiczenia oraz quizy.</p>
    </div>
  );
}