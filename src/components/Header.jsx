import styles from '@/styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>LangLearn</h1>
      <nav>
        <a href="#">Moje lekcje</a>
        <a href="#">Profil</a>
        <a href="#">Ustawienia</a>
      </nav>
    </header>
  );
}
