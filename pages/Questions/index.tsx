import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import styles from './questions.module.css'

interface Question {
  id: string
  userName: string
  questionText: string
  date: string
  likes: number
  liked: boolean
}

const initialQuestions: Question[] = [
  {
    id: '1',
    userName: 'Alice',
    questionText: 'How does useEffect work in React?',
    date: '2025-07-01',
    likes: 0,
    liked: false,
  },
  {
    id: '2',
    userName: 'Bob',
    questionText: 'What is the difference between == and === in JS?',
    date: '2025-07-02',
    likes: 0,
    liked: false,
  },
]

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuth(localStorage.getItem('isAuth') === 'true')

      const saved = localStorage.getItem('newQuestion')
      if (saved) {
        const parsed = JSON.parse(saved)
        setQuestions((prev) => [parsed, ...prev])
        localStorage.removeItem('newQuestion')
      }
    }
  }, [])

  const toggleLike = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              liked: !q.liked,
              likes: q.liked ? q.likes - 1 : q.likes + 1,
            }
          : q
      )
    )
  }

  const handleDelete = (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this question?')
    if (!confirmDelete) return

    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <h1 className={styles.heading}>All Questions</h1>

        {isAuth && (
          <div className={styles.askWrapper}>
            <Link href="/ask" className={styles.askBtn}>+ Ask Question</Link>
          </div>
        )}

        <div className={styles.list}>
          {questions.map((q) => (
            <div key={q.id} className={styles.card}>
              <p className={styles.question}>{q.questionText}</p>
              <div className={styles.meta}>
                <span>{q.userName}</span>
                <span>{q.date}</span>
                <span>
                  <button
                    onClick={() => toggleLike(q.id)}
                    className={`${styles.likeBtn} ${q.liked ? styles.liked : ''}`}
                  >
                    💙
                  </button>
                  {q.likes}
                </span>
                {isAuth && (
                  <button
                    onClick={() => handleDelete(q.id)}
                    className={styles.deleteBtn}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}