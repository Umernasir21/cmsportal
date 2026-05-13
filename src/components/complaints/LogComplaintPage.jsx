import { useState } from 'react'
import { btn, inputStyle, Card } from '@/components/shared'
import { REGIONS, COMPLAINT_TYPES, PRODUCT_CATEGORIES, PRIORITIES, SLA_HOURS, REGION_META } from '@/data/constants'

export default function LogComplaintPage({ users, user, complaints, onSubmit, onCancel }) {
  const [f, setF] = useState({
    complaintNo: '', customer: '', contact: '', email: '',
    branch: '', branchCode: '', zone: '',
    region: 'South', city: '', district: '',
    category: 'Solar Inverter', type: 'Unit Faulty',
    priority: 'Normal', assignedTo: '',
    unitId: '', productSerial: '', warrantyExpiry: '',
    description: '',
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const regionFEs = users.filter(u => u.role === 'field_engineer' && u.region === f.region)

  const validate = () => {
    const e = {}
    if (!f.customer.trim())     e.customer     = 'Required'
    if (!f.contact.trim())      e.contact      = 'Required'
    if (!f.city.trim())         e.city         = 'Required'
    if (!f.description.trim())  e.description  = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const ci = { ...inputStyle, padding: '6px 9px', fontSize: 12 }
  const cl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }
  const sh = { fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #F1F5F9' }
  const fr4 = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }
  const fr3 = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }
  const fr2 = { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }

  const inp = (field, placeholder, type = 'text') => (
    <input
      style={{ ...ci, borderColor: errors[field] ? '#C62828' : '' }}
      type={type} value={f[field]} placeholder={placeholder}
      onChange={e => { set(field, e.target.value); if (errors[field]) setErrors(p => ({ ...p, [field]: '' })) }}
    />
  )

  const F = ({ label, error, children }) => (
    <div>
      <label style={cl}>{label}</label>
      {children}
      {error && <div style={{ color: '#C62828', fontSize: 10, marginTop: 1, fontWeight: 600 }}>{error}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={onCancel}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0F2044' }}>Log New Complaint</div>
      </div>

      <Card padding={16}>
        {/* ── Customer Information ────────────────────────────── */}
        <div style={sh}>👤 Customer Information</div>
        <div style={fr3}>
          <F label="Customer Name *" error={errors.customer}>{inp('customer', 'e.g. Ahmed Hassan')}</F>
          <F label="Contact No. *" error={errors.contact}>{inp('contact', '0300-0000000')}</F>
          <F label="Email">{inp('email', 'customer@email.com', 'email')}</F>
        </div>
        <div style={fr4}>
          <F label="Branch">{inp('branch', 'e.g. BAHL Branch 1')}</F>
          <F label="Branch Code">{inp('branchCode', 'e.g. BRC-001')}</F>
          <F label="Zone">{inp('zone', 'e.g. Zone A')}</F>
          <F label="Complaint No.">{inp('complaintNo', 'e.g. REF-001')}</F>
        </div>

        {/* ── Location & Complaint Details ────────────────────── */}
        <div style={{ ...sh, marginTop: 6 }}>📋 Location &amp; Complaint Details</div>
        <div style={fr4}>
          <F label="Region *">
            <select style={ci} value={f.region} onChange={e => { set('region', e.target.value); set('assignedTo', '') }}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </F>
          <F label="City *" error={errors.city}>{inp('city', 'e.g. Karachi')}</F>
          <F label="Area / District">{inp('district', 'e.g. Clifton, DHA')}</F>
          <F label="Product Category">
            <select style={ci} value={f.category} onChange={e => set('category', e.target.value)}>
              {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
        </div>
        <div style={fr4}>
          <F label="Issue Type *">
            <select style={ci} value={f.type} onChange={e => set('type', e.target.value)}>
              {COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </F>
          <F label="Priority">
            <select style={ci} value={f.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </F>
          <F label="Unit / Product ID">{inp('unitId', 'UNIT-0000')}</F>
          <F label="Serial No.">{inp('productSerial', 'SN-000000')}</F>
        </div>
        <div style={fr2}>
          <F label="Warranty Expiry Date">
            <input style={ci} type="date" value={f.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </F>
          <F label="Assign Field Engineer">
            <select style={ci} value={f.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              <option value="">— Assign Later —</option>
              {regionFEs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </F>
        </div>

        <F label="Complaint Description *" error={errors.description}>
          <textarea
            style={{ ...ci, width: '100%', height: 58, resize: 'vertical', borderColor: errors.description ? '#C62828' : '' }}
            value={f.description} placeholder="Describe the issue — what happened, when, any error messages or observed symptoms…"
            onChange={e => { set('description', e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })) }}
          />
        </F>

        {/* ── Preview + Actions ───────────────────────────────── */}
        <div style={{ background: '#F0F7FF', border: '1px solid #BBDEFB', borderRadius: 8, padding: '10px 14px', marginTop: 10, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>SLA Timer</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1565C0' }}>{SLA_HOURS[f.type] || 48}h</span>
          </div>
          <div>
            <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Region</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: REGION_META[f.region]?.color }}>{f.region}</span>
          </div>
          <div>
            <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Complaint ID</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0F2044', fontFamily: 'monospace' }}>Auto-generated on submit</span>
          </div>
          <div>
            <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Status</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: f.assignedTo ? '#1565C0' : '#7E57C2' }}>{f.assignedTo ? 'Assigned' : 'New'}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button style={{ ...btn('ghost'), padding: '6px 14px', fontSize: 12 }} onClick={onCancel}>Cancel</button>
            <button style={{ ...btn('primary'), padding: '6px 14px', fontSize: 12 }} onClick={() => validate() && onSubmit(f)}>Submit Complaint →</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
