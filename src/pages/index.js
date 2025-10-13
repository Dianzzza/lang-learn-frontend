import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LessonCard from '../components/LessonCard';
import styles from '../styles/Home.module.css'; // CSS Module

export default function Home() {
  const lessons = [
    { id: '1', title: 'Podstawy - Powitania', level: 'A1', progress: 0.2 },
    { id: '2', title: 'Częste zwroty', level: 'A1', progress: 0.6 },
    { id: '3', title: 'Czas przeszły', level: 'A2', progress: 0.4 }
  ];

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <Header />
        <section className={styles.lessons}>
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </section>
      </main>
    </div>
  );
}
