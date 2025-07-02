import styles from './questions.module.css'

const questions = [
  {
    id: '1',
    userName: 'Alice',
    questionText: 'How does useEffect work in React?',
    date: '2025-07-01',
    likes: 12,
  },
  {
    id: '2',
    userName: 'Bob',
    questionText: 'What is the difference between == and === in JS?',
    date: '2025-07-02',
    likes: 7,
  },
]

export default function QuestionsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>All Questions</h1>

      <div className={styles.list}>
        {questions.map((q) => (
          <div key={q.id} className={styles.card}>
            <p className={styles.question}>{q.questionText}</p>
            <div className={styles.meta}>
              <span>{q.userName}</span>
              <span>{q.date}</span>
              <span>👍 {q.likes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}