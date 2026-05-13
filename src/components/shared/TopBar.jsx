import { useState } from 'react'
import { btn } from '@/components/shared'
import { REGION_META } from '@/data/constants'
import { fmt } from '@/utils/helpers'

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  complaints: 'All Complaints',
  complaint_detail: 'Complaint Detail',
  log_complaint: 'Log Complaint',
  workshop: 'Workshop',
  users: 'User Management',
  reports: 'Reports',
  settings: 'Settings',
}

export default function TopBar({ user, view, selectedComplaint, notifications, onMarkRead, onLogComplaint, onOpenComplaint, isMobile, onMenuToggle }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const unread = notifications.filter(n => !n.read).length
  const rm = user?.region ? REGION_META[user.region] : null

  const title = view === 'complaint_detail' && selectedComplaint
    ? (isMobile ? `#${selectedComplaint.id}` : `Complaint — ${selectedComplaint.id}`)
    : VIEW_LABELS[view] || 'CMS'

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      padding: isMobile ? '0 12px' : '0 24px',
      height: isMobile ? 52 : 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, minWidth: 0 }}>
        {isMobile && (
          <button
            onClick={onMenuToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: '4px 6px', color: '#0F2044', lineHeight: 1, flexShrink: 0 }}
            aria-label="Open menu"
          >☰</button>
        )}
        <div style={{ fontWeight: 800, fontSize: isMobile ? 15 : 17, color: '#0F2044', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        {!isMobile && rm && (
          <span style={{ background: rm.bg, color: rm.color, border: `1.5px solid ${rm.color}30`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {user.region} Region
          </span>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 10, flexShrink: 0 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(p => !p); if (!showNotifs) onMarkRead() }}
            style={{ ...btn('ghost'), padding: isMobile ? '7px 9px' : '7px 10px', position: 'relative' }}
          >
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#E53935', borderRadius: '50%' }} />
            )}
          </button>

          {showNotifs && (
            <div
              className="fade-in"
              style={isMobile
                ? { position: 'fixed', top: 52, left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 500, overflow: 'hidden' }
                : { position: 'absolute', right: 0, top: 46, width: 340, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 500, overflow: 'hidden' }
              }
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', fontWeight: 700, fontSize: 13, color: '#0F2044', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Notifications
                <span onClick={() => { onMarkRead(); setShowNotifs(false) }} style={{ fontSize: 11, color: '#1565C0', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              <div style={{ maxHeight: isMobile ? '60vh' : 320, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No notifications</div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div
                      key={n.id}
                      onClick={() => { n.complaintId && onOpenComplaint && onOpenComplaint(n.complaintId); setShowNotifs(false) }}
                      style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', background: n.read ? '#fff' : '#F0F7FF', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{n.type === 'breach' ? '🔴' : n.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#0F2044', fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.msg}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{fmt(n.at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {isMobile && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9' }}>
                  <button style={{ ...btn('ghost'), width: '100%', justifyContent: 'center' }} onClick={() => setShowNotifs(false)}>Close</button>
                </div>
              )}
            </div>
          )}
        </div>

        {onLogComplaint && (
          <button
            style={{ ...btn('primary'), padding: isMobile ? '8px 12px' : '8px 16px', fontSize: isMobile ? 18 : 13 }}
            onClick={onLogComplaint}
            title="Log Complaint"
          >
            {isMobile ? '＋' : '＋ Log Complaint'}
          </button>
        )}
      </div>
    </header>
  )
}
