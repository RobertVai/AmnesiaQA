import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AmnesiaQA</h1>
      <p className={styles.slogan}>Memory fades. Answers stay.</p>

      <div className={styles.buttons}>
        <Link href="/Register" className={styles.btn}>Register</Link>
        <Link href="/login" className={styles.btn}>Sign In</Link>
        <Link href="/Questions" className={styles.btn}>Explore</Link>
      </div>
    </div>
  )
}