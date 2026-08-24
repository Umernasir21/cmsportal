import { useState } from 'react'
import { btn, inputStyle, Card } from '@/components/shared'
import { REGIONS, COMPLAINT_TYPES, PRODUCT_CATEGORIES, PRIORITIES, SLA_HOURS, REGION_META } from '@/data/constants'
import { useMobile } from '@/hooks/useMobile'
import { filesToAttachments } from '@/utils/helpers'

// ── Static styles (never change, safe at module level) ────────────────────────
const ci = { ...inputStyle, padding: '6px 9px', fontSize: 12 }
const cl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }
const sh = { fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #F1F5F9' }

// ── Defined outside component — stable reference, no remount on state change ──
function CField({ label, error, children }) {
  return (
    <div>
      <label style={cl}>{label}</label>
      {children}
      {error && <div style={{ color: '#C62828', fontSize: 10, marginTop: 1, fontWeight: 600 }}>{error}</div>}
    </div>
  )
}

export default function LogComplaintPage({ users, user, complaints, dropdownConfig, onSubmit, onCancel }) {
  const isPhone  = useMobile(600)   // < 600px  → 1 column
  const isTablet = useMobile(1024)  // < 1024px → 2 columns
  const types      = dropdownConfig?.complaintTypes || COMPLAINT_TYPES
  const categories  = dropdownConfig?.productCategories || PRODUCT_CATEGORIES

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
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (e) => {
    const list = e.target.files
    if (!list?.length) return
    setUploading(true)
    const newFiles = await filesToAttachments(list, 'Initial Log', user.name)
    setFiles(p => [...p, ...newFiles])
    setUploading(false)
    e.target.value = ''
  }
  const removeFile = (i) => setFiles(p => p.filter((_, idx) => idx !== i))

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const regionFEs = users.filter(u => u.role === 'field_engineer' && u.region === f.region)

  // Responsive column counts
  const c4 = isPhone ? 1 : isTablet ? 2 : 4
  const c3 = isPhone ? 1 : isTablet ? 2 : 3
  const c2 = isPhone ? 1 : 2
  const gap = isPhone ? 8 : 10
  const mb  = isPhone ? 8 : 10

  const grid = (cols) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap,
    marginBottom: mb,
  })

  const validate = () => {
    const e = {}
    if (!f.customer.trim())    e.customer    = 'Required'
    if (!f.contact.trim())     e.contact     = 'Required'
    if (!f.city.trim())        e.city        = 'Required'
    if (!f.description.trim()) e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const inp = (field, placeholder, type = 'text') => (
    <input
      style={{ ...ci, borderColor: errors[field] ? '#C62828' : '' }}
      type={type}
      value={f[field]}
      placeholder={placeholder}
      onChange={e => {
        set(field, e.target.value)
        if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
      }}
    />
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={onCancel}>← Back</button>
        <div style={{ fontWeight: 800, fontSize: isPhone ? 14 : 16, color: '#0F2044' }}>Log New Complaint</div>
      </div>

      <Card padding={isPhone ? 12 : 16}>
        {/* ── Customer Information ─────────────────────────────── */}
        <div style={sh}>👤 Customer Information</div>
        <div style={grid(c3)}>
          <CField label="Customer Name *" error={errors.customer}>{inp('customer', 'e.g. Ahmed Hassan')}</CField>
          <CField label="Contact No. *"   error={errors.contact}>{inp('contact', '0300-0000000')}</CField>
          <CField label="Email">{inp('email', 'customer@email.com', 'email')}</CField>
        </div>
        <div style={grid(c4)}>
          <CField label="Branch">{inp('branch', 'e.g. BAHL Branch 1')}</CField>
          <CField label="Branch Code">{inp('branchCode', 'e.g. BRC-001')}</CField>
          <CField label="Zone">{inp('zone', 'e.g. Zone A')}</CField>
          <CField label="Complaint No.">{inp('complaintNo', 'e.g. REF-001')}</CField>
        </div>

        {/* ── Location & Complaint Details ─────────────────────── */}
        <div style={{ ...sh, marginTop: 6 }}>📋 Location &amp; Complaint Details</div>
        <div style={grid(c4)}>
          <CField label="Region *">
            <select
              style={ci}
              value={f.region}
              onChange={e => { set('region', e.target.value); set('assignedTo', '') }}
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </CField>
          <CField label="City *" error={errors.city}>{inp('city', 'e.g. Karachi')}</CField>
          <CField label="Area / District">{inp('district', 'e.g. Clifton, DHA')}</CField>
          <CField label="Priority">
            <select style={ci} value={f.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </CField>
        </div>
        <div style={grid(c4)}>
          <CField label="Product Category">
            <select style={ci} value={f.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </CField>
          <CField label="Issue Type *">
            <select style={ci} value={f.type} onChange={e => set('type', e.target.value)}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </CField>
          <CField label="Unit / Product ID">{inp('unitId', 'UNIT-0000')}</CField>
          <CField label="Serial No.">{inp('productSerial', 'SN-000000')}</CField>
        </div>
        <div style={grid(c2)}>
          <CField label="Warranty Expiry Date">
            <input
              style={ci}
              type="date"
              value={f.warrantyExpiry}
              onChange={e => set('warrantyExpiry', e.target.value)}
            />
          </CField>
          <CField label="Assign Field Engineer">
            <select style={ci} value={f.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              <option value="">— Assign Later —</option>
              {regionFEs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </CField>
        </div>

        <CField label="Complaint Description *" error={errors.description}>
          <textarea
            style={{
              ...ci, width: '100%',
              height: isPhone ? 80 : 58,
              resize: 'vertical',
              borderColor: errors.description ? '#C62828' : '',
            }}
            value={f.description}
            placeholder="Describe the issue — what happened, when, any error messages or observed symptoms…"
            onChange={e => {
              set('description', e.target.value)
              if (errors.description) setErrors(p => ({ ...p, description: '' }))
            }}
          />
        </CField>

        {/* ── Attachments ──────────────────────────────────────── */}
        <div style={{ ...sh, marginTop: 6 }}>📎 Attachments</div>
        <div style={{ marginBottom: mb }}>
          <label style={{ ...btn('ghost'), padding: '7px 14px', fontSize: 12, display: 'inline-flex', cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : '+ Attach Files'}
            <input type="file" multiple style={{ display: 'none' }} onChange={handleFiles} disabled={uploading} />
          </label>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 16 }}>{f.type === 'image' ? '🖼' : '📄'}</span>
                  <div style={{ flex: 1, fontSize: 12, color: '#0F2044', fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{f.size}</div>
                  <span style={{ fontSize: 11, color: '#C62828', cursor: 'pointer', fontWeight: 600 }} onClick={() => removeFile(i)}>Remove</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Preview + Actions ────────────────────────────────── */}
        <div style={{
          background: '#F0F7FF',
          border: '1px solid #BBDEFB',
          borderRadius: 8,
          padding: isPhone ? '10px 12px' : '10px 14px',
          marginTop: 10,
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          gap: isPhone ? 10 : 20,
          alignItems: isPhone ? 'stretch' : 'center',
          flexWrap: 'wrap',
        }}>
          {/* Info chips */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0F2044', fontFamily: 'monospace' }}>Auto-generated</span>
            </div>
            <div>
              <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Status</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: f.assignedTo ? '#1565C0' : '#7E57C2' }}>{f.assignedTo ? 'Assigned' : 'New'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            marginLeft: isPhone ? 0 : 'auto',
            display: 'flex',
            gap: 8,
            flexDirection: isPhone ? 'column' : 'row',
          }}>
            <button
              style={{ ...btn('ghost'), padding: '8px 14px', fontSize: 12, ...(isPhone && { textAlign: 'center' }) }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              style={{ ...btn('primary'), padding: '8px 14px', fontSize: 12, ...(isPhone && { textAlign: 'center' }) }}
              onClick={() => validate() && onSubmit({ ...f, attachments: files })}
            >
              Submit Complaint →
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
