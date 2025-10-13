import Link from 'next/link';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2>Twoje kursy</h2>
      <ul>
        <li><Link href="/study/1">Angielski A1</Link></li>
      </ul>
    </aside>
  );
}
