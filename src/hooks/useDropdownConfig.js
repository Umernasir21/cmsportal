import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { COMPLAINT_TYPES, PRODUCT_CATEGORIES } from '@/data/constants'

const DEFAULTS = {
  complaintTypes:    COMPLAINT_TYPES,
  productCategories: PRODUCT_CATEGORIES,
}

// Admin-editable dropdown option lists, synced live across all clients via Supabase.
export function useDropdownConfig() {
  const [config, setConfig] = useState(DEFAULTS)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    let cancelled = false

    supabase.from('dropdown_options').select('*').then(({ data, error }) => {
      if (cancelled) return
      if (error) { console.error('Failed to load dropdown options:', error); return }
      const next = { ...DEFAULTS }
      ;(data || []).forEach(row => { next[row.key] = row.options })
      setConfig(next)
    })

    const channel = supabase
      .channel('dropdown-options-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dropdown_options' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        setConfig(prev => ({ ...prev, [payload.new.key]: payload.new.options }))
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  const addOption = useCallback((field, value) => {
    const v = value.trim()
    if (!v) return false
    const list = configRef.current[field] || []
    if (list.includes(v)) return false
    const next = [...list, v]
    setConfig(prev => ({ ...prev, [field]: next }))
    supabase.from('dropdown_options').upsert({ key: field, options: next }).then(({ error }) => {
      if (error) console.error('Failed to save dropdown option:', error)
    })
    return true
  }, [])

  const removeOption = useCallback((field, value) => {
    const next = (configRef.current[field] || []).filter(o => o !== value)
    setConfig(prev => ({ ...prev, [field]: next }))
    supabase.from('dropdown_options').upsert({ key: field, options: next }).then(({ error }) => {
      if (error) console.error('Failed to save dropdown option:', error)
    })
  }, [])

  return {
    complaintTypes:    config.complaintTypes,
    productCategories: config.productCategories,
    addOption,
    removeOption,
  }
}
