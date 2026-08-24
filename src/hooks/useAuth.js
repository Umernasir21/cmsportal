import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { supabase } from '@/lib/supabaseClient'
import { userFromRow, userToRow } from '@/lib/mappers'

export function useAuth() {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [currentUser, setCurrentUser] = useLocalStorage('cms_current_user', null)
  const usersRef = useRef(users)
  usersRef.current = users

  // ─── Initial load + realtime subscription ─────────────────────────────────
  useEffect(() => {
    let cancelled = false

    supabase.from('users').select('*').then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('Failed to load users:', error)
      setUsers((data || []).map(userFromRow))
      setUsersLoading(false)
    })

    const channel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        setUsers(prev => {
          if (payload.eventType === 'DELETE') return prev.filter(u => u.id !== payload.old.id)
          const incoming = userFromRow(payload.new)
          const exists = prev.some(u => u.id === incoming.id)
          return exists ? prev.map(u => u.id === incoming.id ? incoming : u) : [...prev, incoming]
        })
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  // Keep the logged-in session's user object in sync if an admin edits it elsewhere
  useEffect(() => {
    if (!currentUser) return
    const fresh = users.find(u => u.id === currentUser.id)
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
      if (!fresh.active) { setCurrentUser(null); return }
      setCurrentUser(fresh)
    }
  }, [users, currentUser, setCurrentUser])

  const login = useCallback((email, password) => {
    const user = usersRef.current.find(u => u.email === email && u.passwordHash === password && u.active)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false, error: 'Invalid email or password.' }
  }, [setCurrentUser])

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser])

  const addUser = useCallback((userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      active: true,
      joinedAt: new Date().toISOString(),
    }
    setUsers(prev => [...prev, newUser])
    supabase.from('users').insert(userToRow(newUser)).then(({ error }) => {
      if (error) console.error('Failed to save user:', error)
    })
    return newUser
  }, [])

  const updateUser = useCallback((id, changes) => {
    const current = usersRef.current.find(u => u.id === id)
    if (!current) return
    const updated = { ...current, ...changes }
    setUsers(prev => prev.map(u => u.id === id ? updated : u))
    supabase.from('users').update(userToRow(updated)).eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to update user:', error)
    })
  }, [])

  const toggleUserActive = useCallback((id) => {
    const current = usersRef.current.find(u => u.id === id)
    if (!current) return
    updateUser(id, { active: !current.active })
  }, [updateUser])

  return {
    user: currentUser,
    users,
    usersLoading,
    login,
    logout,
    addUser,
    updateUser,
    toggleUserActive,
  }
}
