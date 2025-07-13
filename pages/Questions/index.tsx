import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Sidebar from '@/components/Sidebar'
import styles from './questions.module.css'
import { isUserAuthenticated } from '@/utils/auth'
import { useUser } from '@/contexts/UserContext'
import dayjs from 'dayjs'

interface Answer {
  _id: string
  text: string
  user_name: string
  user_id: string
  date: string
  likes: number
  dislikes: number
  liked: boolean
  disliked: boolean
  likedBy: string[]
  dislikedBy: string[]
}

interface Question {
  _id: string
  userName: string
  user_id: string
  questionText: string
  date: string
  likes: number
  dislikes: number
  liked: boolean
  disliked: boolean
  likedBy: string[]
  dislikedBy: string[]
  answers: Answer[]
  showAnswers: boolean
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAuth, setIsAuth] = useState(false)
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({})
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all')
  const router = useRouter()
  const { user } = useUser()

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
      const res = await fetch('http://localhost:5000/api/questions', { credentials: 'include' })
      const data = await res.json()

      const userRes = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
      const userData = await userRes.json()
      const currentUserId = userData.user._id

      const formatted = data.map((q: any) => ({
        ...q,
        liked: q.likedBy?.includes(currentUserId),
        disliked: q.dislikedBy?.includes(currentUserId),
        showAnswers: false,
        likes: q.likes || 0,
        dislikes: q.dislikes || 0,
        answers: Array.isArray(q.answers) ? q.answers : [],
      }))

      setQuestions(formatted)
    } catch (err) {
      console.error('Error fetching questions', err)
    }
  }

const toggleLike = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/question/${id}/like`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to toggle like');

    const updated = await res.json();

    setQuestions(prev =>
      prev.map(q =>
        q._id === id
          ? {
              ...q,
              likes: updated.likes || 0,
              likedBy: Array.isArray(updated.likedBy) ? updated.likedBy : [],
              liked:
                Array.isArray(updated.likedBy) && updated.currentUserId
                  ? updated.likedBy.includes(updated.currentUserId)
                  : false,
            }
          : q
      )
    );
  } catch (err) {
    console.error('Error toggling like', err);
  }
};

  const toggleDislike = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/question/${id}/dislike`, { method: 'POST', credentials: 'include' })
      const updated = await res.json()
      setQuestions(prev =>
        prev.map(q => q._id === id ? {
          ...q,
          dislikes: updated.dislikes,
          dislikedBy: updated.dislikedBy,
          disliked: updated.dislikedBy.includes(updated.currentUserId),
        } : q)
      )
    } catch (err) {
      console.error('Error toggling dislike', err)
    }
  }

  const toggleAnswerLike = async (answerId: string, questionId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/answer/${answerId}/like`, { method: 'POST', credentials: 'include' })
      const updated = await res.json()
      setQuestions(prev => prev.map(q => q._id === questionId ? {
        ...q,
        answers: q.answers.map(a => a._id === answerId ? {
          ...a,
          likes: updated.likes,
          likedBy: updated.likedBy,
          liked: updated.likedBy.includes(updated.currentUserId)
        } : a)
      } : q))
    } catch (err) {
      console.error('Error toggling answer like', err)
    }
  }

  const toggleAnswerDislike = async (answerId: string, questionId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/answer/${answerId}/dislike`, { method: 'POST', credentials: 'include' })
      const updated = await res.json()
      setQuestions(prev => prev.map(q => q._id === questionId ? {
        ...q,
        answers: q.answers.map(a => a._id === answerId ? {
          ...a,
          dislikes: updated.dislikes,
          dislikedBy: updated.dislikedBy,
          disliked: updated.dislikedBy.includes(updated.currentUserId)
        } : a)
      } : q))
    } catch (err) {
      console.error('Error toggling answer dislike', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await fetch(`http://localhost:5000/api/question/${id}`, { method: 'DELETE', credentials: 'include' })
      setQuestions(prev => prev.filter(q => q._id !== id))
    } catch (err) {
      console.error('Delete error', err)
    }
  }

  const handleDeleteAnswer = async (answerId: string, questionId: string) => {
    try {
      await fetch(`http://localhost:5000/api/answer/${answerId}`, { method: 'DELETE', credentials: 'include' })
      setQuestions(prev => prev.map(q => q._id === questionId ? {
        ...q,
        answers: q.answers.filter(a => a._id !== answerId)
      } : q))
    } catch (err) {
      console.error('Delete answer error', err)
    }
  }

  const toggleAnswers = async (id: string) => {
    const updated = [...questions]
    const q = updated.find(q => q._id === id)
    if (q) {
      if (!q.answers.length) {
        try {
          const res = await fetch(`http://localhost:5000/api/question/${id}/answers`, { credentials: 'include' })
          const data = await res.json()
          const updatedAnswers = data.map((a: any) => ({
            ...a,
            liked: a.likedBy?.includes(user?.id),
            disliked: a.dislikedBy?.includes(user?.id),
          }))
          q.answers = updatedAnswers
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
    if (!answer?.trim()) return
    try {
      const res = await fetch(`http://localhost:5000/api/question/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: answer }),
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
      <h1 className={styles.heading}>What’s on your mind?</h1>
      <p className={styles.subheading}>Browse questions or ask your own</p>

      {isAuth && (
        <div className={styles.askWrapper}>
          <Link href="/Ask" className={styles.askBtn}>+ Ask Question</Link>
        </div>
      )}
    <div className={styles.filterWrapper}>
  <label htmlFor="filter" className={styles.filterLabel}>Filter:</label>
  <select
    id="filter"
    value={filter}
    onChange={e => setFilter(e.target.value as 'all' | 'answered' | 'unanswered')}
    className={styles.select}
  >
    <option value="all">All</option>
    <option value="answered">Answered</option>
    <option value="unanswered">Unanswered</option>
  </select>
</div>
      <div className={styles.list}>
        {user && questions
    .filter(q => {
      if (filter === 'answered') return q.answers.length > 0
      if (filter === 'unanswered') return q.answers.length === 0
      return true
    })
    .map(q => (
      <div key={q._id} className={styles.card}>
            <p className={styles.question}>{q.questionText}</p>

            <div className={styles.meta}>
              <span>{q.userName}</span>
              <span>{dayjs(q.date).format('YYYY-MM-DD HH:mm')}</span>

              <span>
                <button
                  onClick={() => toggleLike(q._id)}
                  className={`${styles.likeBtn} ${q.liked ? styles.liked : ''}`}
                >
                  👍 Like {q.likes}
                </button>
                <button
                  onClick={() => toggleDislike(q._id)}
                  className={`${styles.likeBtn} ${q.disliked ? styles.liked : ''}`}
                >
                  👎 Dislike {q.dislikes}
                </button>
              </span>

{user?._id === q.user_id && (
  <button
    onClick={() => handleDelete(q._id)}
    className={styles.deleteBtn}
  >
    🗑️ Delete
  </button>
)}

              <button
                onClick={() => toggleAnswers(q._id)}
                className={styles.toggleBtn}
              >
                {q.showAnswers ? 'Hide' : 'Show'} Answers ({q.answers.length})
              </button>
            </div>

            {q.showAnswers && (
              <div className={styles.answersBlock}>
                {q.answers.map(a => (
                  <div key={a._id} className={styles.answer}>
                    <p>{a.text}</p>
                    <span>{a.user_name} • {dayjs(a.date).format('YYYY-MM-DD HH:mm')}</span>

                    <div className={styles.meta}>
                      <button
                        onClick={() => toggleAnswerLike(a._id, q._id)}
                        className={`${styles.likeBtn} ${a.liked ? styles.liked : ''}`}
                      >
                        👍 Like {a.likes}
                      </button>
                      <button
                        onClick={() => toggleAnswerDislike(a._id, q._id)}
                        className={`${styles.likeBtn} ${a.disliked ? styles.liked : ''}`}
                      >
                        👎 Dislike {a.dislikes}
                      </button>

{user?._id === a.user_id && (
  <button
    className={styles.deleteBtn}
    onClick={() => handleDeleteAnswer(a._id, q._id)}
  >
    🗑️ Delete
  </button>
)}
                    </div>
                  </div>
                ))}

                {isAuth && (
                  <div className={styles.form}>
                    <textarea
                      placeholder="Write your answer..."
                      value={answerInputs[q._id] || ''}
                      onChange={e => handleAnswerChange(q._id, e.target.value)}
                      rows={3}
                      className={styles.input}
                    />
                    <button
                      onClick={() => submitAnswer(q._id)}
                      className={styles.btn}
                    >
                      Submit
                    </button>
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
};
