import { useLocalStorage } from './useLocalStorage'
import { SEED_USERS } from '@/data/seedData'

export function useAuth() {
  const [users, setUsers] = useLocalStorage('cms_users', SEED_USERS)
  const [currentUser, setCurrentUser] = useLocalStorage('cms_current_user', null)

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.passwordHash === password && u.active)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false, error: 'Invalid email or password.' }
  }

  const logout = () => setCurrentUser(null)

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      active: true,
      joinedAt: new Date().toISOString(),
    }
    setUsers(prev => [...prev, newUser])
    return newUser
  }

  const updateUser = (id, changes) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u))
    // If editing current user, update session too
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...changes }))
    }
  }

  const toggleUserActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  return {
    user: currentUser,
    users,
    login,
    logout,
    addUser,
    updateUser,
    toggleUserActive,
  }
}
