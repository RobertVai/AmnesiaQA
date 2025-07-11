import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import styles from './register.module.css'

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log('REGISTER DATA:', data)

    // 
    // await axios.post('/Register')

    router.push('/Questions') 
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input type="text" {...register('name')} className={styles.input} />
          {errors.name && <span className={styles.error} role="alert">{errors.name.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email:</label>
          <input type="email" {...register('email')} className={styles.input} />
          {errors.email && <span className={styles.error} role="alert">{errors.email.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Password:</label>
          <input type="password" {...register('password')} className={styles.input} />
          {errors.password && <span className={styles.error} role="alert">{errors.password.message}</span>}
        </div>

        <button type="submit" className={styles.button}>Create account</button>
      </form>
    </div>
  )
}