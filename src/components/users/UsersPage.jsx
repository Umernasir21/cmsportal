import { useState } from 'react'
import { btn, inputStyle, Card, Avatar, RegionBadge, Badge, Modal, Field, FieldRow, TableWrap, THead, EmptyState } from '@/components/shared'
import { ROLES, ROLE_META, REGIONS } from '@/data/constants'
import { useMobile } from '@/hooks/useMobile'

export default function UsersPage({ users, complaints, onAdd, onUpdate, onToggleActive, showToast }) {
  const isMobile = useMobile()
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [search, setSearch]     = useState('')
  const [form, setForm] = useState({ name: '', email: '', role: 'field_engineer', region: 'South', phone: '', passwordHash: 'pass123', active: true })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditUser(null); setForm({ name: '', email: '', role: 'field_engineer', region: 'South', phone: '', passwordHash: 'pass123', active: true }); setShowForm(true) }
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, region: u.region || 'South', phone: u.phone || '', passwordHash: u.passwordHash, active: u.active }); setShowForm(true) }

  const save = () => {
    if (!form.name || !form.email) { showToast('Name and email required', 'error'); return }
    if (editUser) { onUpdate(editUser.id, form); showToast('User updated') }
    else { onAdd(form); showToast('User added') }
    setShowForm(false)
  }

  const stats = [
    ['Total Users', users.length, '#1565C0'],
    ['Field Engineers', users.filter(u=>u.role==='field_engineer').length, '#E65100'],
    ['Managers', users.filter(u=>u.role==='regional_manager').length, '#2E7D32'],
    ['Active', users.filter(u=>u.active).length, '#43A047'],
  ]

  const regionsNeedRole = ['field_engineer', 'regional_manager']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {stats.map(([l, v, c]) => (
            <div key={l} style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding: '10px 14px', borderLeft: `3px solid ${c}`, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="users-actions" style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inputStyle, width: isMobile ? '100%' : 200, minWidth: 0 }} placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)} />
          <button style={{ ...btn('primary'), flexShrink: 0 }} onClick={openAdd}>{isMobile ? '＋' : '＋ Add User'}</button>
        </div>
      </div>

      <TableWrap>
        <table>
          <THead cols={isMobile
            ? ['User','Role','Status','Actions']
            : ['User','Email','Role','Region','Phone','Active Complaints','Status','Actions']
          } />
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={isMobile ? 4 : 8}><EmptyState icon="👥" title="No users found" /></td></tr>}
            {filtered.map((u, i) => {
              const rm = ROLE_META[u.role] || {}
              const activeCmps = complaints.filter(c => c.assignedTo === u.id && !['Resolved','Closed'].includes(c.status)).length
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={32} bg={u.active ? rm.color || '#1565C0' : '#94A3B8'} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F2044', fontSize: 13 }}>{u.name}</div>
                        {isMobile
                          ? <div style={{ fontSize: 10, color: '#64748B' }}>{u.email}</div>
                          : <div style={{ fontSize: 10, color: '#94A3B8' }}>ID: {u.id}</div>
                        }
                      </div>
                    </div>
                  </td>
                  {!isMobile && <td style={{ padding: '12px 14px', color: '#475569', fontSize: 12 }}>{u.email}</td>}
                  <td style={{ padding: '12px 14px' }}><Badge bg={rm.bg} color={rm.color}>{isMobile ? rm.label?.split(' ')[0] : rm.label}</Badge></td>
                  {!isMobile && <td style={{ padding: '12px 14px' }}>{u.region ? <RegionBadge region={u.region} /> : <span style={{ color: '#CBD5E1', fontSize: 12 }}>All</span>}</td>}
                  {!isMobile && <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12 }}>{u.phone || '—'}</td>}
                  {!isMobile && (
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {u.role === 'field_engineer' ? <span style={{ fontWeight: 700, color: activeCmps > 0 ? '#E65100' : '#94A3B8' }}>{activeCmps}</span> : <span style={{ color: '#CBD5E1' }}>—</span>}
                    </td>
                  )}
                  <td style={{ padding: '12px 14px' }}><Badge bg={u.active ? '#E8F5E9' : '#FFEBEE'} color={u.active ? '#2E7D32' : '#C62828'}>{u.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={() => openEdit(u)}>Edit</button>
                      <button style={{ ...btn(u.active ? 'danger' : 'success'), padding: '5px 10px', fontSize: 11 }} onClick={() => { onToggleActive(u.id); showToast(u.active ? 'User deactivated' : 'User activated') }}>
                        {u.active ? (isMobile ? '✕' : 'Deactivate') : (isMobile ? '✓' : 'Activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrap>

      {showForm && (
        <Modal title={editUser ? 'Edit User' : 'Add New User'} onClose={() => setShowForm(false)}>
          <FieldRow>
            <Field label="Full Name *"><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></Field>
            <Field label="Email *"><input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" /></Field>
          </FieldRow>
          <FieldRow>
            <Field label="Role">
              <select style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Region">
              <select style={inputStyle} value={form.region || ''} onChange={e => set('region', e.target.value || null)} disabled={!regionsNeedRole.includes(form.role)}>
                <option value="">All Regions</option>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0300-0000000" /></Field>
            <Field label="Password"><input style={inputStyle} value={form.passwordHash} onChange={e => set('passwordHash', e.target.value)} placeholder="Password" /></Field>
          </FieldRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button style={btn('ghost')} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={btn('primary')} onClick={save}>{editUser ? 'Save Changes' : 'Add User'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
