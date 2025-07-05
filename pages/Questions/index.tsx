import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { isUserAuthenticated } from '@/utils/auth'
import styles from './questions.module.css'

const initialQuestions = [
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
  const [questions, setQuestions] = useState(initialQuestions)

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

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <h1 className={styles.heading}>All Questions</h1>

        {isUserAuthenticated() && (
          <div className={styles.askWrapper}>
            <Link href="/Ask" className={styles.askBtn}>+ Ask Question</Link>
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
                    aria-label="Like button"
                  >
                    👍
                  </button>
                  {q.likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}