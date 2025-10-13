import Link from 'next/link';
import styles from '../styles/LessonCard.module.css';

export default function LessonCard({ lesson }) {
  return (
    <Link href={`/study/${lesson.id}`} className={styles.card}>
      <h3>{lesson.title}</h3>
      <p>Poziom: {lesson.level}</p>
      <progress value={lesson.progress} max="1"></progress>
    </Link>
  );
}
