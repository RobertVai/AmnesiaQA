import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import styles from './questions.module.css'
import { isUserAuthenticated } from '@/utils/auth'
import api from '@/utils/api'

interface Answer {
  id: string
  text: string
  date: string
  user: string
}

interface Question {
  id: string
  userName: string
  questionText: string
  date: string
  likes: number
  liked: boolean
  answers: Answer[]
  showAnswers: boolean
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAuth, setIsAuth] = useState(false)
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAuth(isUserAuthenticated())

      const saved = localStorage.getItem('newQuestion')
      if (saved) {
        const parsed = JSON.parse(saved)
        setQuestions((prev) => [parsed, ...prev])
        localStorage.removeItem('newQuestion')
      }

      fetchQuestionsFromBackend()
    }
  }, [])

  const fetchQuestionsFromBackend = async () => {
    try {
      const res = await api.get('/questions')
      const data = res.data.map((q: any) => ({
        id: q._id,
        userName: q.userName || 'Anonymous',
        questionText: q.question_text,
        date: new Date(q.date).toLocaleDateString(),
        likes: 0,
        liked: false,
        answers: [],
        showAnswers: false,
      }))
      setQuestions((prev) => [...data, ...prev])
      console.log('Fetched from backend:', data)
    } catch (err: any) {
      console.error('Backend fetch error:', err.message)
    }
  }

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

  const toggleAnswers = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, showAnswers: !q.showAnswers } : q))
    )
  }

  const handleAnswerChange = (id: string, value: string) => {
    setAnswerInputs({ ...answerInputs, [id]: value })
  }

  const submitAnswer = (id: string) => {
    if (!answerInputs[id] || answerInputs[id].trim().length === 0) return

    const newAnswer: Answer = {
      id: Date.now().toString(),
      text: answerInputs[id],
      user: 'You',
      date: new Date().toLocaleDateString(),
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, answers: [...q.answers, newAnswer] } : q
      )
    )
    setAnswerInputs((prev) => ({ ...prev, [id]: '' }))
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
                  <button onClick={() => toggleLike(q.id)} className={`${styles.likeBtn} ${q.liked ? styles.liked : ''}`}>
                    👍
                  </button> {q.likes}
                </span>
                {isAuth && (
                  <button onClick={() => handleDelete(q.id)} className={styles.deleteBtn}>
                    🗑️ Delete
                  </button>
                )}
                <button onClick={() => toggleAnswers(q.id)} className={styles.toggleBtn}>
                  {q.showAnswers ? 'Hide' : 'Show'} Answers ({q.answers.length})
                </button>
              </div>

              {q.showAnswers && (
                <div className={styles.answersBlock}>
                  {q.answers.map((a) => (
                    <div key={a.id} className={styles.answer}>
                      <p>{a.text}</p>
                      <span>{a.user} • {a.date}</span>
                    </div>
                  ))}

                  {isAuth && (
                    <div className={styles.form}>
                      <textarea
                        placeholder="Write your answer..."
                        value={answerInputs[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        rows={3}
                        className={styles.input}
                      />
                      <button onClick={() => submitAnswer(q.id)} className={styles.btn}>Submit</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
