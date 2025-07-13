import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './userbadge.module.css'
import Link from 'next/link'

interface User {
  name: string
  email: string
}

export default function UserBadge() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          withCredentials: true,
        })
        setUser(res.data.user)
      } catch (err) {
        setUser(null)
      }
    }

    fetchUser()
  }, [])

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