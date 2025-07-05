import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../Register/register.module.css'

const schema = z.object({
  questionText: z.string().min(10, 'Question is too short'),
})

type FormData = z.infer<typeof schema>

export default function AskPage() {
  const router = useRouter()

  //test before backend
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('amnesia_user')
    if (!isLoggedIn) {
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

  const onSubmit = (data: FormData) => {
    console.log('NEW QUESTION:', data)
    router.push('/questions')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Ask a Question</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Question:</label>
          <textarea
            rows={5}
            {...register('questionText')}
            className={styles.input}
          />
          {errors.questionText && (
            <span className={styles.error} role="alert">
              {errors.questionText.message}
            </span>
          )}
        </div>

        <button type="submit" className={styles.button}>
          Submit Question
        </button>
      </form>
    </div>
  )
}