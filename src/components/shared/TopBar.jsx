import { useState } from 'react'
import { btn } from '@/components/shared'
import { REGION_META } from '@/data/constants'
import { fmt } from '@/utils/helpers'

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  complaints: 'All Complaints',
  complaint_detail: 'Complaint Detail',
  log_complaint: 'Log New Complaint',
  workshop: 'Workshop & Repairs',
  users: 'User Management',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
}

export default function TopBar({ user, view, selectedComplaint, notifications, onMarkRead, onLogComplaint, onOpenComplaint }) {
  const [showNotifs, setShowNotifs] = useState(false)
  const unread = notifications.filter(n => !n.read).length
  const rm = user?.region ? REGION_META[user.region] : null

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#0F2044' }}>
          {view === 'complaint_detail' && selectedComplaint
            ? `Complaint — ${selectedComplaint.id}`
            : VIEW_LABELS[view] || 'CMS'}
        </div>
        {rm && (
          <span style={{ background: rm.bg, color: rm.color, border: `1.5px solid ${rm.color}30`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {user.region} Region
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(p => !p); if (!showNotifs) onMarkRead() }}
            style={{ ...btn('ghost'), padding: '7px 10px', position: 'relative' }}
          >
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#E53935', borderRadius: '50%' }} />
            )}
          </button>

          {showNotifs && (
            <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 500, overflow: 'hidden' }} className="fade-in">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', fontWeight: 700, fontSize: 13, color: '#0F2044', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Notifications
                <span onClick={onMarkRead} style={{ fontSize: 11, color: '#1565C0', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
              </div>
              <div style={{ maxHeight: 320, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No notifications</div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div
                      key={n.id}
                      onClick={() => { n.complaintId && onOpenComplaint && onOpenComplaint(n.complaintId); setShowNotifs(false) }}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #F8FAFC', background: n.read ? '#fff' : '#F0F7FF', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background .1s' }}
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
            </div>
          )}
        </div>

        {onLogComplaint && (
          <button style={btn('primary')} onClick={onLogComplaint}>＋ Log Complaint</button>
        )}
      </div>
    </header>
  )
}
