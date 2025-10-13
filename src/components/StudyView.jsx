import styles from '../styles/StudyView.module.css';

export default function StudyView({ lessonId }) {
  return (
    <div className={styles.wrapper}>
      <h2>Lekcja {lessonId}</h2>
      <p>Tu pojawi się treść lekcji, ćwiczenia oraz quizy.</p>
    </div>
  );
}
