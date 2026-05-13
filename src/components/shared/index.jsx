import { STATUS_META, PRIORITY_META, REGION_META } from '@/data/constants'
import { getSLA } from '@/utils/helpers'

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 32, bg = '#1565C0' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}

// ─── BADGES ───────────────────────────────────────────────────────────────────
const badgeBase = (bg, color, border) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: bg, color, border: `1.5px solid ${border || bg}`,
  borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700,
  whiteSpace: 'nowrap', lineHeight: 1.5, userSelect: 'none',
})

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || {}
  return (
    <span style={badgeBase(m.bg, m.color, m.border)}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || {}
  return <span style={badgeBase(m.bg, m.color, m.border)}>{priority}</span>
}

export function RegionBadge({ region }) {
  const m = REGION_META[region] || {}
  return <span style={badgeBase(m.bg, m.color)}>{region}</span>
}

export function Badge({ bg, color, border, children }) {
  return <span style={badgeBase(bg, color, border)}>{children}</span>
}

// ─── SLA BAR ──────────────────────────────────────────────────────────────────
export function SLABar({ complaint, compact = false }) {
  const s = getSLA(complaint)
  if (s.status === 'done') return <span style={{ color: '#43A047', fontSize: 11, fontWeight: 700 }}>✓ On time</span>
  const icon = s.status === 'breach' ? '🔴 ' : s.status === 'warn' ? '⚠ ' : ''
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{icon}{s.label}</div>
      {!compact && (
        <div style={{ background: '#F1F5F9', borderRadius: 4, height: 5, width: 80, marginTop: 2 }}>
          <div style={{ height: '100%', borderRadius: 4, background: s.color, width: `${s.pct}%`, transition: 'width 1s' }} />
        </div>
      )}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 580 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.65)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box fade-in" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0F2044' }}>{title}</div>
          <button onClick={onClose} style={{ ...btn('ghost'), padding: '4px 10px', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── TOAST CONTAINER ──────────────────────────────────────────────────────────
export function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="toast-wrap" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} className="fade-in" onClick={() => dismiss(t.id)} style={{
          background: t.type === 'error' ? '#C62828' : t.type === 'warning' ? '#E65100' : '#1B5E20',
          color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}>
          <span>{t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.65)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="fade-in" style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', maxWidth: 400, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2044', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={btn('ghost')} onClick={onCancel}>Cancel</button>
          <button style={btn(danger ? 'danger' : 'primary')} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ─── BUTTON STYLES ────────────────────────────────────────────────────────────
export function btn(variant = 'primary') {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, padding: '8px 16px', lineHeight: 1, transition: 'all .15s', fontFamily: 'inherit' }
  const variants = {
    primary: { background: '#1565C0', color: '#fff' },
    danger:  { background: '#C62828', color: '#fff' },
    success: { background: '#2E7D32', color: '#fff' },
    warning: { background: '#E65100', color: '#fff' },
    outline: { background: '#fff', color: '#1565C0', border: '1.5px solid #1565C0' },
    ghost:   { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' },
  }
  return { ...base, ...(variants[variant] || variants.ghost) }
}

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────
export const inputStyle = { width: '100%', border: '1.5px solid #CBD5E1', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0F2044', background: '#FAFBFC', outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }
export const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }

export function Field({ label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={{ color: '#C62828', fontSize: 11, marginTop: 2, fontWeight: 600 }}>{error}</div>}
    </div>
  )
}

export function FieldRow({ children, cols = 2 }) {
  return (
    <div className={`fr-${cols}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 14 }}>
      {children}
    </div>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, padding = 20, style = {}, className = '' }) {
  return (
    <div className={className} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding, ...style }}>
      {children}
    </div>
  )
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
export function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0F2044' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📋', title = 'No data', sub = '' }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: '#94A3B8' }}>{sub}</div>}
    </div>
  )
}

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #E2E8F0', borderTopColor: '#1565C0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

// ─── TABLE WRAPPER ────────────────────────────────────────────────────────────
export function TableWrap({ children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  )
}

export function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: '#0F2044' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#90CAF9', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
export function KPICard({ label, value, color, icon, sub, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding: '16px 18px', borderLeft: `4px solid ${color}`, cursor: onClick ? 'pointer' : 'default', transition: 'all .15s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,32,68,0.12)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,32,68,0.06)')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 22 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
