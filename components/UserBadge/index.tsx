import { useUser } from '@/contexts/UserContext'
import styles from './userbadge.module.css'
import Link from 'next/link'

export default function UserBadge() {
  const { user } = useUser()

  return (
    <div className={styles.badge}>
      {user ? (
        <>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.email}>{user.email}</div>
        </>
      ) : (
        <Link href="/login" className={styles.anon}>
          Anonymous
        </Link>
      )}
    </div>
  )
}