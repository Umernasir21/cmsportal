import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      try {
        const val = value instanceof Function ? value(prev) : value
        window.localStorage.setItem(key, JSON.stringify(val))
        return val
      } catch (error) {
        console.error('useLocalStorage error:', error)
        return prev
      }
    })
  }, [key])

  return [storedValue, setValue]
}
