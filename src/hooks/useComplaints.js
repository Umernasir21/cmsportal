import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { complaintFromRow, complaintToRow } from '@/lib/mappers'
import { now, buildNewComplaint, getSLA } from '@/utils/helpers'

export function useComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const complaintsRef = useRef(complaints)
  complaintsRef.current = complaints

  // ─── Initial load + realtime subscription ─────────────────────────────────
  useEffect(() => {
    let cancelled = false

    supabase.from('complaints').select('*').then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('Failed to load complaints:', error)
      setComplaints((data || []).map(complaintFromRow))
      setLoading(false)
    })

    const channel = supabase
      .channel('complaints-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
        setComplaints(prev => {
          if (payload.eventType === 'DELETE') {
            return prev.filter(c => c.id !== payload.old.id)
          }
          const incoming = complaintFromRow(payload.new)
          const exists = prev.some(c => c.id === incoming.id)
          return exists ? prev.map(c => c.id === incoming.id ? incoming : c) : [incoming, ...prev]
        })
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  const patch = useCallback(async (id, changes) => {
    const current = complaintsRef.current.find(c => c.id === id)
    if (!current) return
    const updated = { ...current, ...changes }
    setComplaints(prev => prev.map(c => c.id === id ? updated : c))
    const { error } = await supabase.from('complaints').update(complaintToRow(updated)).eq('id', id)
    if (error) console.error('Failed to update complaint:', error)
  }, [])

  // ─── Add a new complaint ───────────────────────────────────────────────────
  const addComplaint = useCallback((formData, user) => {
    const nc = buildNewComplaint(formData, user, complaintsRef.current)
    setComplaints(prev => [nc, ...prev])
    supabase.from('complaints').insert(complaintToRow(nc)).then(({ error }) => {
      if (error) console.error('Failed to save complaint:', error)
    })
    return nc.id
  }, [])

  // ─── Update complaint fields + append timeline entry ──────────────────────
  const updateComplaint = useCallback((id, changes, actionLabel, note = '', userName = 'System') => {
    const current = complaintsRef.current.find(c => c.id === id)
    if (!current) return
    const entry = { action: actionLabel, user: userName, at: now(), note }
    patch(id, { ...changes, timeline: [...current.timeline, entry] })
  }, [patch])

  // ─── Add note to timeline only ────────────────────────────────────────────
  const addTimelineNote = useCallback((id, note, userName, attachments = []) => {
    const current = complaintsRef.current.find(c => c.id === id)
    if (!current) return
    const action = attachments.length ? `Note added (${attachments.length} file${attachments.length > 1 ? 's' : ''} attached)` : 'Note added'
    const entry = { action, user: userName, at: now(), note }
    patch(id, { timeline: [...current.timeline, entry], attachments: [...current.attachments, ...attachments] })
  }, [patch])

  // ─── Add repair log entry ─────────────────────────────────────────────────
  const addRepairLog = useCallback((id, action, userName) => {
    const current = complaintsRef.current.find(c => c.id === id)
    if (!current) return
    const entry = { action, by: userName, at: now() }
    const timelineEntry = { action: `Repair log: ${action}`, user: userName, at: now(), note: '' }
    patch(id, { repairLog: [...current.repairLog, entry], timeline: [...current.timeline, timelineEntry] })
  }, [patch])

  // ─── Upload FSR + mark resolved ───────────────────────────────────────────
  const submitFSR = useCallback((id, fsrText, fsrNotes, resolutionPath, userName, attachments = []) => {
    const current = complaintsRef.current.find(c => c.id === id)
    if (!current) return
    const entry = { action: `FSR submitted — ${resolutionPath || 'Resolved'}`, user: userName, at: now(), note: fsrNotes }
    patch(id, {
      fsr: fsrText, fsrNotes, resolutionPath, status: 'Resolved',
      timeline: [...current.timeline, entry],
      attachments: [...current.attachments, ...attachments],
    })
  }, [patch])

  // ─── Auto SLA escalation (call this in an interval) ───────────────────────
  const checkSLABreaches = useCallback(() => {
    const notifications = []
    complaintsRef.current.forEach(c => {
      if (['Resolved', 'Closed', 'Escalated'].includes(c.status)) return
      const sla = getSLA(c)

      if (sla.status === 'breach') {
        const alreadyEscalated = c.timeline.some(t => t.action.includes('SLA') && t.action.includes('breach'))
        if (!alreadyEscalated) {
          const entry = { action: 'Auto-escalated — SLA breached', user: 'System', at: now(), note: 'SLA timer expired' }
          notifications.push({ type: 'breach', complaintId: c.id, customer: c.customer })
          patch(c.id, { status: 'Escalated', timeline: [...c.timeline, entry] })
        }
      } else if (sla.status === 'warn') {
        const alreadyWarned = c.timeline.some(t => t.action.includes('75% SLA'))
        if (!alreadyWarned) {
          const entry = { action: '⚠ 75% SLA warning triggered', user: 'System', at: now(), note: '' }
          notifications.push({ type: 'warn', complaintId: c.id, customer: c.customer })
          patch(c.id, { timeline: [...c.timeline, entry] })
        }
      }
    })
    return notifications
  }, [patch])

  return {
    complaints,
    loading,
    addComplaint,
    updateComplaint,
    addTimelineNote,
    addRepairLog,
    submitFSR,
    checkSLABreaches,
  }
}
