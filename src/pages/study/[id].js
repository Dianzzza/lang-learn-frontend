import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StudyView from '../../components/StudyView';
import styles from '../../styles/Home.module.css'; // CSS Module

export default function StudyPage() {
  const { id } = useRouter().query;

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <Header />
        <StudyView lessonId={id} />
      </main>
    </div>
  );
}
