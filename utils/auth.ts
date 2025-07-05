export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isAuth') === 'true'
}