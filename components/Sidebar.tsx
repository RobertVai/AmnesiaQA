import Link from 'next/link'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>AmnesiaQA</div>

      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>Home</Link>
        <Link href="#" className={styles.link}>Settings</Link>
      </nav>

      <div className={styles.footer}>
        <Link href="#" className={styles.link}>Log out</Link>
      </div>
    </aside>
  )
}