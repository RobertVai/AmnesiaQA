import { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import axios from 'axios'

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  refreshUser: () => void
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await axios.get('${baseUrl}/api/auth/me', {
        withCredentials: true,
      })
      setUser(res.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const logout = () => {
    fetch('${baseUrl}/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => setUser(null))
      .catch(err => console.error('Logout failed', err));
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}