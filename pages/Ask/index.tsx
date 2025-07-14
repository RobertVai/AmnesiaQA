import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { isUserAuthenticated } from '@/utils/auth'
import styles from '../Register/register.module.css'
import api from '@/utils/api' 

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
      
      await api.post('/api/question', {
        questionText: data.questionText,
      })
      router.push('/Questions')
    } catch (err: any) {
      
      const msg =
        err?.response?.data?.message || err?.response?.data || err.message || 'Failed to post question'
      console.error('❌ Submit error:', err)
      alert(msg)
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