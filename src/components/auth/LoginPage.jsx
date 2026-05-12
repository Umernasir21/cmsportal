import { useState } from 'react'
import { btn, inputStyle, Field } from '@/components/shared'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = () => {
    if (!email || !pass) { setErr('Please enter email and password.'); return }
    setLoading(true)
    setTimeout(() => {
      const result = onLogin(email, pass)
      if (!result.success) { setErr(result.error); setLoading(false) }
    }, 400)
  }

  const demos = [
    ['admin@cms.com',  'admin123', 'Super Admin',      '#B71C1C'],
    ['sara@cms.com',   'pass123',  'Coordinator',       '#1565C0'],
    ['imran@cms.com',  'pass123',  'Regional Manager',  '#2E7D32'],
    ['ahmed@cms.com',  'pass123',  'Field Engineer',    '#E65100'],
    ['raza@cms.com',   'pass123',  'Workshop Manager',  '#00695C'],
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0F2044 0%,#1E3A5F 60%,#0D47A1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 860, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ background: 'linear-gradient(160deg,#0F2044,#1E3A5F)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <div style={{ width: 44, height: 44, background: '#1E88E5', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛡</div>
              <div><div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>CMS Portal</div><div style={{ color: '#546E7A', fontSize: 11 }}>Complaint Management System</div></div>
            </div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>Centralized<br />Complaint<br />Management</div>
            <div style={{ color: '#90CAF9', fontSize: 13, lineHeight: 1.9, marginBottom: 24 }}>Manage complaints across South, Central & North regions with full SLA tracking, FSR management, and role-based access.</div>
            {['Multi-region complaint tracking','SLA monitoring & auto-escalation','FSR upload & workflow management','Role-based access control','Workshop & repair tracking','Reports & analytics'].map(f => (
              <div key={f} style={{ color: '#64B5F6', fontSize: 12, fontWeight: 500, marginBottom: 6, display: 'flex', gap: 8 }}><span style={{ color: '#43A047' }}>✓</span>{f}</div>
            ))}
          </div>
          <div style={{ color: '#37474F', fontSize: 11, marginTop: 24 }}>CMS v1.0 — Complaint Management System</div>
        </div>

        <div style={{ padding: '48px 40px' }}>
          <div style={{ fontWeight: 800, fontSize: 24, color: '#0F2044', marginBottom: 6 }}>Sign In</div>
          <div style={{ color: '#64748B', fontSize: 13, marginBottom: 28 }}>Access your regional dashboard</div>
          <div style={{ marginBottom: 14 }}>
            <Field label="Email Address"><input style={inputStyle} type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="you@company.com" /></Field>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Field label="Password"><input style={inputStyle} type="password" value={pass} onChange={e => { setPass(e.target.value); setErr('') }} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handle()} /></Field>
          </div>
          {err && <div style={{ color: '#C62828', fontSize: 12, marginBottom: 14, fontWeight: 600, background: '#FFEBEE', padding: '8px 12px', borderRadius: 7 }}>{err}</div>}
          <button style={{ ...btn('primary'), width: '100%', padding: 12, fontSize: 14 }} onClick={handle} disabled={loading}>{loading ? '⏳ Signing in…' : 'Sign In →'}</button>
          <div style={{ marginTop: 24, background: '#F8FAFC', borderRadius: 10, padding: '16px 18px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo Accounts — Click to fill</div>
            {demos.map(([e, p, role, color]) => (
              <div key={e} onClick={() => { setEmail(e); setPass(p); setErr('') }} style={{ padding: '7px 0', cursor: 'pointer', fontSize: 12, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1565C0', fontWeight: 600 }}>{e}</span>
                <span style={{ background: color + '20', color, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{role}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 8 }}>Passwords: pass123 (admin: admin123)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
