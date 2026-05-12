import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { SEED_COMPLAINTS } from '@/data/seedData'
import { now, buildNewComplaint, getSLA } from '@/utils/helpers'

export function useComplaints() {
  const [complaints, setComplaints] = useLocalStorage('cms_complaints', SEED_COMPLAINTS)

  // ─── Add a new complaint ───────────────────────────────────────────────────
  const addComplaint = useCallback((formData, user) => {
    const nc = buildNewComplaint(formData, user, complaints)
    setComplaints(prev => [nc, ...prev])
    return nc.id
  }, [complaints, setComplaints])

  // ─── Update complaint fields + append timeline entry ──────────────────────
  const updateComplaint = useCallback((id, changes, actionLabel, note = '', userName = 'System') => {
    const entry = { action: actionLabel, user: userName, at: now(), note }
    setComplaints(prev =>
      prev.map(c =>
        c.id !== id ? c : { ...c, ...changes, timeline: [...c.timeline, entry] }
      )
    )
  }, [setComplaints])

  // ─── Add note to timeline only ────────────────────────────────────────────
  const addTimelineNote = useCallback((id, note, userName) => {
    const entry = { action: 'Note added', user: userName, at: now(), note }
    setComplaints(prev =>
      prev.map(c =>
        c.id !== id ? c : { ...c, timeline: [...c.timeline, entry] }
      )
    )
  }, [setComplaints])

  // ─── Add repair log entry ─────────────────────────────────────────────────
  const addRepairLog = useCallback((id, action, userName) => {
    const entry = { action, by: userName, at: now() }
    const timelineEntry = { action: `Repair log: ${action}`, user: userName, at: now(), note: '' }
    setComplaints(prev =>
      prev.map(c =>
        c.id !== id ? c
          : { ...c, repairLog: [...c.repairLog, entry], timeline: [...c.timeline, timelineEntry] }
      )
    )
  }, [setComplaints])

  // ─── Upload FSR + mark resolved ───────────────────────────────────────────
  const submitFSR = useCallback((id, fsrText, fsrNotes, resolutionPath, userName) => {
    const entry = { action: `FSR submitted — ${resolutionPath || 'Resolved'}`, user: userName, at: now(), note: fsrNotes }
    setComplaints(prev =>
      prev.map(c =>
        c.id !== id ? c
          : { ...c, fsr: fsrText, fsrNotes, resolutionPath, status: 'Resolved', timeline: [...c.timeline, entry] }
      )
    )
  }, [setComplaints])

  // ─── Auto SLA escalation (call this in an interval) ───────────────────────
  const checkSLABreaches = useCallback((currentUserName = 'System') => {
    const notifications = []
    setComplaints(prev =>
      prev.map(c => {
        if (['Resolved', 'Closed', 'Escalated'].includes(c.status)) return c

        const sla = getSLA(c)

        if (sla.status === 'breach') {
          const alreadyEscalated = c.timeline.some(t => t.action.includes('SLA') && t.action.includes('breach'))
          if (!alreadyEscalated) {
            const entry = { action: 'Auto-escalated — SLA breached', user: 'System', at: now(), note: 'SLA timer expired' }
            notifications.push({ type: 'breach', complaintId: c.id, customer: c.customer })
            return { ...c, status: 'Escalated', timeline: [...c.timeline, entry] }
          }
        }

        if (sla.status === 'warn') {
          const alreadyWarned = c.timeline.some(t => t.action.includes('75% SLA'))
          if (!alreadyWarned) {
            const entry = { action: '⚠ 75% SLA warning triggered', user: 'System', at: now(), note: '' }
            notifications.push({ type: 'warn', complaintId: c.id, customer: c.customer })
            return { ...c, timeline: [...c.timeline, entry] }
          }
        }

        return c
      })
    )
    return notifications
  }, [setComplaints])

  // ─── Reset to seed data ───────────────────────────────────────────────────
  const resetData = useCallback(() => {
    setComplaints(SEED_COMPLAINTS)
  }, [setComplaints])

  return {
    complaints,
    addComplaint,
    updateComplaint,
    addTimelineNote,
    addRepairLog,
    submitFSR,
    checkSLABreaches,
    resetData,
  }
}
