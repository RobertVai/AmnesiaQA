import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Sidebar from '@/components/Sidebar'
import styles from './questions.module.css'
import { isUserAuthenticated } from '@/utils/auth'

interface Answer {
  _id: string
  text: string
  user: string
  date: string
}

interface Question {
  _id: string
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
  const router = useRouter()

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/Register')
    } else {
      setIsAuth(true)
      fetchQuestions()
    }
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        credentials: 'include'
      })
      const data = await res.json()
      const formatted = data.map((q: any) => ({
        ...q,
        liked: false,
        showAnswers: false,
      }))
      setQuestions(formatted)
    } catch (err) {
      console.error('Error fetching questions', err)
    }
  }

  const toggleLike = async (id: string) => {
    setQuestions(prev => prev.map(q => q._id === id ? {
      ...q,
      liked: !q.liked,
      likes: q.liked ? q.likes - 1 : q.likes + 1
    } : q))
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this question?')
    if (!confirmDelete) return

    try {
      await fetch(`http://localhost:5000/api/question/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setQuestions(prev => prev.filter(q => q._id !== id))
    } catch (err) {
      console.error('Delete error', err)
    }
  }

  const toggleAnswers = async (id: string) => {
    const updated = [...questions]
    const q = updated.find(q => q._id === id)
    if (q) {
      if (!q.answers.length) {
        try {
          const res = await fetch(`http://localhost:5000/api/question/${id}/answers`, {
            credentials: 'include'
          })
          const data = await res.json()
          q.answers = data
        } catch (err) {
          console.error('Answers load error', err)
        }
      }
      q.showAnswers = !q.showAnswers
      setQuestions([...updated])
    }
  }

  const handleAnswerChange = (id: string, value: string) => {
    setAnswerInputs({ ...answerInputs, [id]: value })
  }

  const submitAnswer = async (id: string) => {
    const answer = answerInputs[id]
    if (!answer || answer.trim() === '') return

    try {
      const res = await fetch(`http://localhost:5000/api/question/${id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ text: answer })
      })
      const newAnswer = await res.json()

      setQuestions(prev => prev.map(q => q._id === id ? {
        ...q,
        answers: [...q.answers, newAnswer]
      } : q))
      setAnswerInputs(prev => ({ ...prev, [id]: '' }))
    } catch (err) {
      console.error('Answer submit error', err)
    }
  }

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>All Questions</h1>
        {isAuth && (
          <div className={styles.askWrapper}>
            <Link href="/Ask" className={styles.askBtn}>+ Ask Question</Link>
          </div>
        )}
        <div className={styles.list}>
          {questions.map(q => (
            <div key={q._id} className={styles.card}>
              <p className={styles.question}>{q.questionText}</p>
              <div className={styles.meta}>
                <span>{q.userName}</span>
                <span>{q.date}</span>
                <span>
                  <button onClick={() => toggleLike(q._id)} className={`${styles.likeBtn} ${q.liked ? styles.liked : ''}`}>
                    👍
                  </button> {q.likes}
                </span>
                {isAuth && (
                  <button onClick={() => handleDelete(q._id)} className={styles.deleteBtn}>
                    🗑️ Delete
                  </button>
                )}
                <button onClick={() => toggleAnswers(q._id)} className={styles.toggleBtn}>
                  {q.showAnswers ? 'Hide' : 'Show'} Answers ({q.answers.length})
                </button>
              </div>

              {q.showAnswers && (
                <div className={styles.answersBlock}>
                  {q.answers.map((a) => (
                    <div key={a._id} className={styles.answer}>
                      <p>{a.text}</p>
                      <span>{a.user} • {a.date}</span>
                    </div>
                  ))}

                  {isAuth && (
                    <div className={styles.form}>
                      <textarea
                        placeholder="Write your answer..."
                        value={answerInputs[q._id] || ''}
                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                        rows={3}
                        className={styles.input}
                      />
                      <button onClick={() => submitAnswer(q._id)} className={styles.btn}>Submit</button>
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