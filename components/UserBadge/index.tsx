import { useUser } from '@/contexts/UserContext'
import styles from './userbadge.module.css'
import Link from 'next/link'

export default function UserBadge() {
  const { user } = useUser()

  return (
    <div className={styles.badge}>
      {user ? (
        <>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
        </>
      ) : (
        <Link href="/login" className={styles.anon}>
          Anonymous
        </Link>
      )}
    </div>
  )
}