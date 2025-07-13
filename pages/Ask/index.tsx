import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { isUserAuthenticated } from '@/utils/auth'
import styles from '../Register/register.module.css'

const schema = z.object({
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function AskPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

const onSubmit = async (data: FormData) => {
  try {
    const res = await fetch('http://localhost:5000/api/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
      body: JSON.stringify({
        questionText: data.questionText, 
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error('Failed to post question')
    }

    router.push('/Questions')
  } catch (err) {
    console.error('Submit error:', err)
  }
}

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Ask a Question</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Question:</label>
          <textarea {...register('questionText')} className={styles.input} rows={5} />
          {errors.questionText && (
            <span className={styles.error} role="alert">{errors.questionText.message}</span>
          )}
        </div>

        <button type="submit" className={styles.button}>Submit Question</button>
      </form>
    </div>
  )
}