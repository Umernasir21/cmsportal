import { useState } from 'react'
import { btn, inputStyle, labelStyle, Field, FieldRow, Card } from '@/components/shared'
import { REGIONS, COMPLAINT_TYPES, PRODUCT_CATEGORIES, PRIORITIES, SLA_HOURS, REGION_META } from '@/data/constants'

export default function LogComplaintPage({ users, user, complaints, onSubmit, onCancel }) {
  const [f, setF] = useState({
    customer: '', contact: '', email: '', city: '', district: '',
    region: 'South', type: 'Unit Faulty', category: 'Solar Inverter',
    priority: 'Normal', description: '', assignedTo: '',
    unitId: '', productSerial: '', warrantyExpiry: '',
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const regionFEs = users.filter(u => u.role === 'field_engineer' && u.region === f.region)

  const validate = () => {
    const e = {}
    if (!f.customer.trim()) e.customer = 'Required'
    if (!f.contact.trim())  e.contact  = 'Required'
    if (!f.city.trim())     e.city     = 'Required'
    if (!f.description.trim()) e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inp = (field, placeholder, type = 'text') => (
    <input
      style={{ ...inputStyle, borderColor: errors[field] ? '#C62828' : '' }}
      type={type} value={f[field]} placeholder={placeholder}
      onChange={e => { set(field, e.target.value); if (errors[field]) setErrors(p => ({ ...p, [field]: '' })) }}
    />
  )

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button style={{ ...btn('ghost'), padding: '6px 12px', fontSize: 12 }} onClick={onCancel}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#0F2044' }}>Log New Complaint</div>
      </div>

      <Card padding={28}>
        {/* Customer info */}
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>👤 Customer Information</div>
        <FieldRow cols={3}>
          <Field label="Customer Name *" error={errors.customer}>{inp('customer', 'e.g. Ahmed Hassan')}</Field>
          <Field label="Contact Number *" error={errors.contact}>{inp('contact', '0300-0000000')}</Field>
          <Field label="Customer Email">{inp('email', 'customer@email.com', 'email')}</Field>
        </FieldRow>
        <FieldRow>
          <Field label="City *" error={errors.city}>{inp('city', 'e.g. Karachi')}</Field>
          <Field label="District / Area">{inp('district', 'e.g. Clifton, DHA')}</Field>
        </FieldRow>

        {/* Complaint details */}
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9', marginTop: 20 }}>📋 Complaint Details</div>
        <FieldRow cols={3}>
          <Field label="Region *">
            <select style={inputStyle} value={f.region} onChange={e => { set('region', e.target.value); set('assignedTo', '') }}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Complaint Type *">
            <select style={inputStyle} value={f.type} onChange={e => set('type', e.target.value)}>
              {COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Product Category">
            <select style={inputStyle} value={f.category} onChange={e => set('category', e.target.value)}>
              {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </FieldRow>
        <FieldRow cols={3}>
          <Field label="Priority">
            <select style={inputStyle} value={f.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Assign Field Engineer">
            <select style={inputStyle} value={f.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              <option value="">— Assign Later —</option>
              {regionFEs.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Unit / Product ID">{inp('unitId', 'UNIT-0000')}</Field>
        </FieldRow>
        <FieldRow>
          <Field label="Product Serial No.">{inp('productSerial', 'SN-000000')}</Field>
          <Field label="Warranty Expiry Date">
            <input style={inputStyle} type="date" value={f.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
          </Field>
        </FieldRow>
        <Field label="Complaint Description *" error={errors.description}>
          <textarea
            style={{ ...inputStyle, height: 100, resize: 'vertical', borderColor: errors.description ? '#C62828' : '' }}
            value={f.description} placeholder="Describe the issue in detail — what happened, when, any error messages or observed symptoms…"
            onChange={e => { set('description', e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })) }}
          />
        </Field>

        {/* Preview */}
        <div style={{ background: '#F0F7FF', border: '1px solid #BBDEFB', borderRadius: 9, padding: '14px 18px', marginTop: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div><span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>SLA Timer</span><span style={{ fontSize: 16, fontWeight: 800, color: '#1565C0' }}>{SLA_HOURS[f.type] || 48}h</span></div>
          <div><span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Region</span><span style={{ fontSize: 13, fontWeight: 700, color: REGION_META[f.region]?.color }}>{f.region}</span></div>
          <div><span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Complaint ID</span><span style={{ fontSize: 12, fontWeight: 700, color: '#0F2044', fontFamily: 'monospace' }}>Auto-generated on submit</span></div>
          <div><span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Status</span><span style={{ fontSize: 12, fontWeight: 700, color: f.assignedTo ? '#1565C0' : '#7E57C2' }}>{f.assignedTo ? 'Assigned' : 'New'}</span></div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button style={btn('ghost')} onClick={onCancel}>Cancel</button>
          <button style={btn('primary')} onClick={() => validate() && onSubmit(f)}>Submit Complaint →</button>
        </div>
      </Card>
    </div>
  )
}
