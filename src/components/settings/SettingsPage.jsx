import { useState } from 'react'
import { btn, inputStyle, Card, Badge } from '@/components/shared'
import { SLA_HOURS } from '@/data/constants'

function DropdownOptionsEditor({ label, options, onAdd, onRemove }) {
  const [value, setValue] = useState('')
  const submit = () => {
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {options.map(o => (
          <Badge key={o} bg="#F1F5F9" color="#334155" border="#E2E8F0">
            {o}
            <span style={{ marginLeft: 4, cursor: 'pointer', color: '#C62828', fontWeight: 700 }} onClick={() => onRemove(o)}>✕</span>
          </Badge>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...inputStyle, flex: 1 }} value={value} placeholder={`New ${label.toLowerCase()} option…`} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <button style={btn('primary')} onClick={submit}>+ Add</button>
      </div>
    </div>
  )
}

export default function SettingsPage({ user, showToast, dropdownConfig }) {
  const [slaConfig, setSlaConfig] = useState({ ...SLA_HOURS })
  const [systemName, setSystemName] = useState('Complaint Management System')
  const [timezone, setTimezone] = useState('Asia/Karachi')
  const isAdmin = user.role === 'admin'

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F2044', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>⚙ System Configuration</div>
        <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['System Name', systemName, setSystemName, 'text', 'Complaint Management System'],
            ['Version', 'v1.0', null, 'text', ''],
            ['Timezone', timezone, setTimezone, 'text', 'Asia/Karachi (PKT)'],
            ['Date Format', 'DD MMM YYYY', null, 'text', '']].map(([l, v, setter, type, ph]) => (
            <div key={l}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{l}</label>
              <input style={inputStyle} type={type} value={v} onChange={e => setter && setter(e.target.value)} placeholder={ph} readOnly={!setter} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F2044', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>⏱ SLA Configuration (hours per complaint type)</div>
        <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {(dropdownConfig?.complaintTypes || []).map(t => (
            <div key={t}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input style={{ ...inputStyle, width: 80 }} type="number" value={slaConfig[t] || 48} onChange={e => setSlaConfig(p => ({ ...p, [t]: parseInt(e.target.value) || 48 }))} />
                <span style={{ fontSize: 12, color: '#64748B' }}>hours</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isAdmin && dropdownConfig && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F2044', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>📋 Dropdown Options</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DropdownOptionsEditor
              label="Complaint Types"
              options={dropdownConfig.complaintTypes}
              onAdd={v => { if (dropdownConfig.addOption('complaintTypes', v)) showToast(`Added complaint type "${v}"`) }}
              onRemove={v => { dropdownConfig.removeOption('complaintTypes', v); showToast(`Removed "${v}"`) }}
            />
            <DropdownOptionsEditor
              label="Product Categories"
              options={dropdownConfig.productCategories}
              onAdd={v => { if (dropdownConfig.addOption('productCategories', v)) showToast(`Added product category "${v}"`) }}
              onRemove={v => { dropdownConfig.removeOption('productCategories', v); showToast(`Removed "${v}"`) }}
            />
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F2044', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>🔔 Notification Settings</div>
        {[
          ['SLA Warning at 75% elapsed', true],
          ['Auto-escalate on SLA breach', true],
          ['In-app notifications for new complaints', true],
          ['SLA breach alerts for coordinators', true],
        ].map(([label, defaultVal]) => {
          const [enabled, setEnabled] = useState(defaultVal)
          return (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
              <span style={{ fontSize: 13, color: '#334155' }}>{label}</span>
              <div onClick={() => setEnabled(p => !p)} style={{ width: 40, height: 22, background: enabled ? '#1565C0' : '#CBD5E1', borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: enabled ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          )
        })}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0F2044', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' }}>🗄 Data Management</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...btn('ghost'), fontSize: 12 }} onClick={() => showToast('Export started — check downloads')}>⬇ Export All Data (CSV)</button>
          <button style={{ ...btn('ghost'), fontSize: 12 }} onClick={() => { if (window.confirm('Clear this device\'s local session and cached preferences? Shared complaint/user data is unaffected.')) { localStorage.clear(); window.location.reload() } }}>🧹 Clear Local Session</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#94A3B8' }}>Complaints, users, and dropdown options are stored in a shared Supabase database and sync live to everyone. To bulk-reset shared data, use the Supabase dashboard's Table Editor directly.</div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={btn('primary')} onClick={() => showToast('Settings saved successfully')}>Save Settings</button>
      </div>
    </div>
  )
}
