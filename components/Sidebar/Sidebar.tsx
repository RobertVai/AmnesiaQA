import Link from 'next/link'
import styles from './Sidebar.module.css'
import LogOut from '@/components/LogOut'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>AmnesiaQA</div>

      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>Home</Link>
      </nav>

      <div className={styles.logoutArea}>
        <LogOut />
      </div>
    </aside>
  )
}