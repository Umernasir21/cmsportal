import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useComplaints } from '@/hooks/useComplaints'
import { useToast } from '@/hooks/useToast'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { can, userCanSeeComplaint } from '@/utils/helpers'
import { ToastContainer } from '@/components/shared'
import LoginPage from '@/components/auth/LoginPage'
import Sidebar from '@/components/shared/Sidebar'
import TopBar from '@/components/shared/TopBar'
import DashboardPage from '@/components/dashboard/DashboardPage'
import ComplaintsPage from '@/components/complaints/ComplaintsPage'
import ComplaintDetail from '@/components/complaints/ComplaintDetail'
import LogComplaintPage from '@/components/complaints/LogComplaintPage'
import WorkshopPage from '@/components/workshop/WorkshopPage'
import UsersPage from '@/components/users/UsersPage'
import ReportsPage from '@/components/reports/ReportsPage'
import SettingsPage from '@/components/settings/SettingsPage'

export default function App() {
  const { user, users, login, logout, addUser, updateUser, toggleUserActive } = useAuth()
  const { complaints, addComplaint, updateComplaint, addTimelineNote, addRepairLog, submitFSR, checkSLABreaches } = useComplaints()
  const { toasts, show: showToast, dismiss } = useToast()
  const [notifications, setNotifications] = useLocalStorage('cms_notifications', [])
  const [view, setView] = useState('dashboard')
  const [selectedId, setSelectedId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ─── SLA watcher ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const run = () => {
      const hits = checkSLABreaches()
      if (hits.length > 0) {
        const newNotifs = hits.map(h => ({
          id: Date.now() + Math.random(),
          type: h.type,
          msg: h.type === 'breach'
            ? `SLA breached: ${h.complaintId} — ${h.customer}`
            : `SLA at 75%: ${h.complaintId} — ${h.customer}`,
          at: new Date().toISOString(),
          read: false,
        }))
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 30))
        hits.filter(h => h.type === 'breach').forEach(h =>
          showToast(`🔴 SLA breached: ${h.complaintId}`, 'error')
        )
      }
    }
    run()
    const t = setInterval(run, 30_000)
    return () => clearInterval(t)
  }, [user, checkSLABreaches])

  // ─── Visible complaints for current user ────────────────────────────────────
  const visibleComplaints = complaints.filter(c => userCanSeeComplaint(user, c))
  const selectedComplaint = selectedId ? complaints.find(c => c.id === selectedId) : null

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback((v, id = null) => {
    setView(v)
    setSelectedId(id)
  }, [])

  const openComplaint = useCallback((id) => navigate('complaint_detail', id), [navigate])
  const markNotifsRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), [setNotifications])

  if (!user) {
    return <LoginPage onLogin={(email, pass) => {
      const result = login(email, pass)
      if (!result.success) return result
      navigate('dashboard')
      return result
    }} />
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F4F8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar
        user={user}
        currentView={view}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(p => !p)}
        onLogout={logout}
        unreadCount={unreadCount}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          user={user}
          view={view}
          selectedComplaint={selectedComplaint}
          notifications={notifications}
          onMarkRead={markNotifsRead}
          onLogComplaint={can(user, 'logComplaint') ? () => navigate('log_complaint') : null}
          onOpenComplaint={openComplaint}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: 20 }} className="fade-in" key={view + selectedId}>
          {view === 'dashboard' && (
            <DashboardPage
              complaints={visibleComplaints}
              users={users}
              user={user}
              onOpenComplaint={openComplaint}
            />
          )}

          {view === 'complaints' && (
            <ComplaintsPage
              complaints={visibleComplaints}
              users={users}
              user={user}
              onSelect={openComplaint}
              onLog={() => navigate('log_complaint')}
            />
          )}

          {view === 'complaint_detail' && selectedComplaint && (
            <ComplaintDetail
              complaint={selectedComplaint}
              complaints={complaints}
              users={users}
              user={user}
              onBack={() => navigate('complaints')}
              onUpdate={(id, changes, label, note) =>
                updateComplaint(id, changes, label, note, user.name)}
              onAddNote={(id, note) => addTimelineNote(id, note, user.name)}
              onAddRepairLog={(id, action) => addRepairLog(id, action, user.name)}
              onSubmitFSR={(id, fsr, notes, path) =>
                submitFSR(id, fsr, notes, path, user.name)}
              showToast={showToast}
            />
          )}

          {view === 'log_complaint' && (
            <LogComplaintPage
              users={users}
              user={user}
              complaints={complaints}
              onSubmit={(data) => {
                const id = addComplaint(data, user)
                showToast(`✓ Complaint ${id} logged successfully`)
                navigate('complaints')
              }}
              onCancel={() => navigate('complaints')}
            />
          )}

          {view === 'workshop' && (
            <WorkshopPage
              complaints={complaints}
              users={users}
              user={user}
              onUpdate={(id, changes, label, note) =>
                updateComplaint(id, changes, label, note, user.name)}
              onAddRepairLog={(id, action) => addRepairLog(id, action, user.name)}
              onOpenComplaint={openComplaint}
              showToast={showToast}
            />
          )}

          {view === 'users' && (
            <UsersPage
              users={users}
              complaints={complaints}
              onAdd={addUser}
              onUpdate={updateUser}
              onToggleActive={toggleUserActive}
              showToast={showToast}
            />
          )}

          {view === 'reports' && (
            <ReportsPage
              complaints={visibleComplaints}
              users={users}
              user={user}
            />
          )}

          {view === 'settings' && (
            <SettingsPage user={user} showToast={showToast} />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
