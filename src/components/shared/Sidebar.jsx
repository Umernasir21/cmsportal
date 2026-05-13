import { Avatar, btn } from '@/components/shared'
import { ROLE_META } from '@/data/constants'
import { can } from '@/utils/helpers'

const NAV = [
  { id: 'dashboard',   icon: '⊞',  label: 'Dashboard',   roles: ['admin','coordinator','regional_manager','field_engineer','workshop_manager'] },
  { id: 'complaints',  icon: '📋', label: 'Complaints',   roles: ['admin','coordinator','regional_manager','field_engineer'] },
  { id: 'workshop',    icon: '🔧', label: 'Workshop',     roles: ['admin','coordinator','workshop_manager'] },
  { id: 'users',       icon: '👥', label: 'Users',        roles: ['admin'] },
  { id: 'reports',     icon: '📈', label: 'Reports',      roles: ['admin','coordinator','regional_manager'] },
  { id: 'settings',   icon: '⚙',  label: 'Settings',     roles: ['admin'] },
]

export default function Sidebar({ user, currentView, onNavigate, collapsed, onToggleCollapse, onLogout, unreadCount, isMobile, mobileOpen, onMobileClose }) {
  const visible = NAV.filter(n => n.roles.includes(user?.role))
  const rm = ROLE_META[user?.role] || {}
  const activeView = ['complaint_detail', 'log_complaint'].includes(currentView) ? 'complaints' : currentView

  const asideStyle = isMobile
    ? {
        position: 'fixed', top: 0, left: 0,
        height: '100dvh', width: 280,
        background: '#0F2044',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
        zIndex: 1000,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
      }
    : {
        width: collapsed ? 64 : 220,
        background: '#0F2044',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        transition: 'width .25s',
        overflow: 'hidden',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }

  return (
    <aside style={asideStyle}>
      {/* Logo row */}
      <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#1E88E5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🛡</div>
            {(!collapsed || isMobile) && (
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>CMS Portal</div>
                <div style={{ color: '#546E7A', fontSize: 10, letterSpacing: 1 }}>COMPLAINT MGMT</div>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onMobileClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#90CAF9', fontSize: 18, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, lineHeight: 1, flexShrink: 0 }}
            >✕</button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {visible.map(n => {
          const active = activeView === n.id
          return (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: isMobile ? '13px 14px' : '10px 12px',
                borderRadius: 9, marginBottom: isMobile ? 3 : 2,
                cursor: 'pointer', width: '100%', border: 'none',
                background: active ? '#1E3A5F' : 'transparent',
                color: active ? '#90CAF9' : '#7B8898',
                fontSize: isMobile ? 14 : 13,
                fontWeight: active ? 700 : 400,
                transition: 'all .15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: isMobile ? 20 : 16, flexShrink: 0 }}>{n.icon}</span>
              {(!collapsed || isMobile) && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{n.label}</span>
                  {n.id === 'complaints' && unreadCount > 0 && (
                    <span style={{ background: '#E53935', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {(!collapsed || isMobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: isMobile ? '10px 12px' : '8px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 9 }}>
            <Avatar name={user?.name} size={isMobile ? 36 : 30} bg={rm.color || '#1E88E5'} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: '#546E7A', fontSize: 10 }}>{rm.label}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              style={{ ...btn('ghost'), padding: '7px 10px', fontSize: 12, background: 'rgba(255,255,255,0.06)', color: '#90CAF9', border: 'none', borderRadius: 7, flex: collapsed ? 1 : 0 }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          )}
          {(!collapsed || isMobile) && (
            <button
              onClick={onLogout}
              style={{ ...btn('ghost'), padding: isMobile ? '11px 14px' : '7px 10px', fontSize: 13, background: 'rgba(229,57,53,0.12)', color: '#EF9A9A', border: 'none', borderRadius: 7, flex: 1 }}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
