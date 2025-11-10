import Link from 'next/link';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <h3>Nawigacja</h3>
        {/* Sidebar content będzie dodany później */}
      </nav>
    </aside>
  );
}
