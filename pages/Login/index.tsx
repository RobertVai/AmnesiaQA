import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import axios from 'axios'
import styles from '../Register/register.module.css'
import { useUser } from '@/contexts/UserContext'
import api from '@/utils/api'

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useUser() 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post(
        `/api/auth/login`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('LOGIN SUCCESS:', response.data)
      await refreshUser()
      router.push('/Questions')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed'
      alert(msg)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Sign In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input type="email" {...register('email')} className={styles.input} />
          {errors.email && (
            <span className={styles.error} role="alert">{errors.email.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Password:</label>
          <input type="password" {...register('password')} className={styles.input} />
          {errors.password && (
            <span className={styles.error} role="alert">{errors.password.message}</span>
          )}
        </div>

        <button type="submit" className={styles.button}>Sign In</button>
      </form>
    </div>
  )
}