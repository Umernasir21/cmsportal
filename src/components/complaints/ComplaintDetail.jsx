import { useState } from 'react'
import { btn, inputStyle, labelStyle, Card, StatusBadge, PriorityBadge, RegionBadge, Badge, Modal } from '@/components/shared'
import { STATUSES, RESOLUTION_PATHS, PAYMENT_STATUSES, REGION_META } from '@/data/constants'
import { can, getSLA, isInWarranty, fmt, now } from '@/utils/helpers'

export default function ComplaintDetail({ complaint: c, complaints, users, user, onBack, onUpdate, onAddNote, onAddRepairLog, onSubmitFSR, showToast }) {
  const [newStatus, setNewStatus]   = useState(c.status)
  const [newAssigned, setNewAssigned] = useState(c.assignedTo || '')
  const [fsrText, setFsrText]       = useState('')
  const [fsrNotes, setFsrNotes]     = useState('')
  const [resPath, setResPath]       = useState(c.resolutionPath || '')
  const [showFsr, setShowFsr]       = useState(false)
  const [repairAction, setRepairAction] = useState('')
  const [showRepair, setShowRepair] = useState(false)
  const [timelineNote, setTimelineNote] = useState('')
  const [showNote, setShowNote]     = useState(false)
  const [payStatus, setPayStatus]   = useState(c.paymentStatus)

  const fe         = users.find(u => u.id === c.assignedTo)
  const loggedBy   = users.find(u => u.id === c.loggedBy)
  const sla        = getSLA(c)
  const warranty   = isInWarranty(c.warrantyExpiry)
  const regionFEs  = users.filter(u => u.role === 'field_engineer' && u.region === c.region)
  const workshopUsers = users.filter(u => u.role === 'workshop_manager')
  const canEdit    = can(user, 'assignFE')
  const canFSR     = can(user, 'uploadFSR') && (user.role !== 'field_engineer' || c.assignedTo === user.id)
  const canStatus  = can(user, 'updateStatus') && (user.role !== 'field_engineer' || c.assignedTo === user.id)
  const canRepair  = can(user, 'addRepairLog')

  const applyStatus = () => {
    if (newStatus === c.status) return
    if (newStatus === 'Resolved' && !c.fsr && user.role !== 'admin') {
      showToast('Upload FSR before marking as Resolved', 'error'); return
    }
    onUpdate(c.id, { status: newStatus }, `Status → "${newStatus}"`)
    showToast(`Status updated to ${newStatus}`)
  }

  const applyAssign = () => {
    const uid = newAssigned ? parseInt(newAssigned) : null
    if (uid === c.assignedTo) return
    const feUser = users.find(u => u.id === uid)
    onUpdate(c.id, { assignedTo: uid, status: uid ? 'Assigned' : c.status }, `Assigned to ${feUser?.name || 'nobody'}`)
    showToast(feUser ? `Assigned to ${feUser.name}` : 'Unassigned')
  }

  const handleFSR = () => {
    if (!fsrText.trim()) { showToast('FSR summary cannot be empty', 'error'); return }
    onSubmitFSR(c.id, fsrText, fsrNotes, resPath)
    setShowFsr(false)
    showToast('FSR submitted. Complaint marked Resolved.')
  }

  const handleNote = () => {
    if (!timelineNote.trim()) return
    onAddNote(c.id, timelineNote)
    setTimelineNote(''); setShowNote(false)
    showToast('Note added to timeline')
  }

  const handleRepair = () => {
    if (!repairAction.trim()) return
    onAddRepairLog(c.id, repairAction)
    setRepairAction(''); setShowRepair(false)
    showToast('Repair log updated')
  }

  const applyPayment = (v) => {
    setPayStatus(v)
    onUpdate(c.id, { paymentStatus: v }, `Payment status → "${v}"`)
    showToast(`Payment: ${v}`)
  }

  const infoRow = (label, value) => (
    <div key={label}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 13, color: '#1E293B', fontWeight: 500, wordBreak: 'break-word' }}>{value || '—'}</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button style={{ ...btn('ghost'), padding: '6px 12px', fontSize: 12 }} onClick={onBack}>← All Complaints</button>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1565C0', fontSize: 14 }}>{c.id}</span>
        <StatusBadge status={c.status} />
        <PriorityBadge priority={c.priority} />
        <RegionBadge region={c.region} />
        {warranty === true  && <Badge bg="#E8F5E9" color="#2E7D32" border="#81C784">✓ In Warranty</Badge>}
        {warranty === false && <Badge bg="#FFEBEE" color="#C62828" border="#EF9A9A">✕ Out of Warranty</Badge>}
        {sla.status === 'breach' && <Badge bg="#FFEBEE" color="#C62828">🔴 SLA Breached</Badge>}
        {sla.status === 'warn'   && <Badge bg="#FFF8E1" color="#E65100">⚠ SLA Warning</Badge>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {canEdit && !['Escalated','Closed'].includes(c.status) && (
            <button style={{ ...btn('warning'), padding: '6px 12px', fontSize: 12 }} onClick={() => { onUpdate(c.id, { status: 'Escalated' }, 'Escalated by ' + user.name); showToast('Complaint escalated', 'warning') }}>🚨 Escalate</button>
          )}
          {canEdit && c.status === 'Resolved' && (
            <button style={{ ...btn('ghost'), padding: '6px 12px', fontSize: 12 }} onClick={() => { onUpdate(c.id, { status: 'Closed' }, 'Complaint closed'); showToast('Complaint closed') }}>✕ Close</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Info card */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>📋 Complaint Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
              {[['Customer', c.customer],['Contact', c.contact],['Email', c.email],['City', c.city],['District', c.district],['Region', c.region],['Type', c.type],['Category', c.category],['Priority', c.priority],['Unit ID', c.unitId],['Serial No.', c.productSerial],['Warranty Expiry', c.warrantyExpiry ? fmt(c.warrantyExpiry, true) : ''],['Payment', c.paymentStatus],['Logged By', loggedBy?.name],['Logged At', fmt(c.loggedAt)],['SLA', `${c.slaHours}h`]].map(([l,v]) => infoRow(l, v))}
            </div>
            <div>
              <div style={labelStyle}>Description</div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.75, background: '#F8FAFC', borderRadius: 8, padding: '12px 14px', border: '1px solid #F1F5F9' }}>{c.description}</div>
            </div>
          </Card>

          {/* SLA bar */}
          {!['Resolved','Closed'].includes(c.status) && (
            <Card padding={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0F2044' }}>⏱ SLA Monitor</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sla.color }}>{sla.label}</span>
              </div>
              <div style={{ background: '#F1F5F9', borderRadius: 20, height: 12, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', borderRadius: 20, background: sla.color, width: `${sla.pct}%`, transition: 'width 1s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Started: {fmt(c.loggedAt)}</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>SLA: {c.slaHours}h total</span>
              </div>
            </Card>
          )}

          {/* Repair log */}
          {(c.type === 'Unit Faulty' || c.repairLog?.length > 0) && (
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                🔧 Repair Log
                {canRepair && <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={() => setShowRepair(!showRepair)}>+ Entry</button>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <Badge bg={c.backupUnitInstalled ? '#E8F5E9' : '#F1F5F9'} color={c.backupUnitInstalled ? '#2E7D32' : '#64748B'}>{c.backupUnitInstalled ? '✓' : '○'} Backup Installed</Badge>
                <Badge bg={c.workshopAssigned ? '#E0F2F1' : '#F1F5F9'} color={c.workshopAssigned ? '#00695C' : '#64748B'}>{c.workshopAssigned ? '✓ Workshop: ' + (users.find(u=>u.id===c.workshopAssigned)?.name||'—') : '○ No Workshop'}</Badge>
              </div>
              {c.repairLog?.map((r, i) => (
                <div key={i} style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: 7, marginBottom: 6, border: '1px solid #F1F5F9' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#0F2044' }}>{r.action}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>By {r.by} · {fmt(r.at)}</div>
                </div>
              ))}
              {!c.repairLog?.length && <div style={{ color: '#94A3B8', fontSize: 12 }}>No repair log entries yet.</div>}
              {showRepair && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={repairAction} onChange={e => setRepairAction(e.target.value)} placeholder="e.g. Unit picked up, Backup installed, Repair completed…" onKeyDown={e => e.key === 'Enter' && handleRepair()} />
                  <button style={btn('primary')} onClick={handleRepair}>Add</button>
                  <button style={btn('ghost')} onClick={() => setShowRepair(false)}>✕</button>
                </div>
              )}
            </Card>
          )}

          {/* FSR */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              📄 Field Service Report (FSR)
              {canFSR && !c.fsr && <button style={btn('success')} onClick={() => setShowFsr(!showFsr)}>+ Upload FSR</button>}
            </div>
            {c.fsr ? (
              <div>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>✅ FSR Submitted</div>
                  <div style={{ fontSize: 13, color: '#2E7D32', lineHeight: 1.6 }}>{c.fsr}</div>
                </div>
                {c.fsrNotes && <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}><div style={labelStyle}>Notes</div><div style={{ fontSize: 12, color: '#475569' }}>{c.fsrNotes}</div></div>}
                {c.resolutionPath && <Badge bg="#E0F2F1" color="#00695C" border="#4DB6AC">Resolution: {c.resolutionPath}</Badge>}
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No FSR uploaded yet.</div>
            )}
            {showFsr && (
              <div style={{ marginTop: 14, border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Resolution Path</label>
                  <select style={inputStyle} value={resPath} onChange={e => setResPath(e.target.value)}>
                    <option value="">Select resolution type…</option>
                    {RESOLUTION_PATHS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>FSR Summary *</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={fsrText} onChange={e => setFsrText(e.target.value)} placeholder="Describe work done, parts replaced, tests performed…" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Additional Notes</label>
                  <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={fsrNotes} onChange={e => setFsrNotes(e.target.value)} placeholder="Customer feedback, follow-up, warranty notes…" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btn('success')} onClick={handleFSR}>Submit FSR & Mark Resolved</button>
                  <button style={btn('ghost')} onClick={() => setShowFsr(false)}>Cancel</button>
                </div>
              </div>
            )}
          </Card>

          {/* Attachments */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>📎 Attachments</div>
            {c.attachments?.length > 0 ? c.attachments.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F8FAFC', borderRadius: 7, marginBottom: 6, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 20 }}>{a.type === 'image' ? '🖼' : '📄'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F2044' }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.size} · {fmt(a.at)}</div>
                </div>
                <span style={{ fontSize: 11, color: '#1565C0', cursor: 'pointer', fontWeight: 600 }}>View</span>
              </div>
            )) : <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: '14px 0' }}>No attachments uploaded.</div>}
          </Card>

          {/* Timeline */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F2044', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              🕐 Activity Timeline
              <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={() => setShowNote(!showNote)}>+ Note</button>
            </div>
            {showNote && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={timelineNote} onChange={e => setTimelineNote(e.target.value)} placeholder="Add a note…" onKeyDown={e => e.key === 'Enter' && handleNote()} />
                <button style={btn('primary')} onClick={handleNote}>Add</button>
                <button style={btn('ghost')} onClick={() => { setShowNote(false); setTimelineNote('') }}>✕</button>
              </div>
            )}
            {[...c.timeline].reverse().map((t, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < arr.length-1 ? 16 : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, background: t.user === 'System' ? '#E53935' : '#1E88E5', borderRadius: '50%', marginTop: 3, zIndex: 1 }} />
                  {i < arr.length-1 && <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 3 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13, color: '#0F2044', fontWeight: 600 }}>{t.action}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }}>{fmt(t.at)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{t.user}</div>
                  {t.note && <div style={{ fontSize: 11, color: '#475569', background: '#F8FAFC', borderRadius: 5, padding: '5px 8px', marginTop: 4, border: '1px solid #F1F5F9' }}>{t.note}</div>}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Status update */}
          {canStatus && (
            <Card padding={18}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 12 }}>Update Status</div>
              <div style={{ marginBottom: 8 }}><div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>Current:</div><StatusBadge status={c.status} /></div>
              <select style={{ ...inputStyle, marginBottom: 10 }} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button style={{ ...btn('primary'), width: '100%' }} onClick={applyStatus}>Apply Status</button>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Resolving requires FSR upload</div>
            </Card>
          )}

          {/* Assign FE */}
          {canEdit && (
            <Card padding={18}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 12 }}>Assign Field Engineer</div>
              <div style={{ marginBottom: 10, padding: '8px 10px', background: '#F8FAFC', borderRadius: 7, fontSize: 12, color: '#0F2044', fontWeight: 600 }}>
                {fe ? `${fe.name} (${fe.region})` : <span style={{ color: '#94A3B8' }}>Unassigned</span>}
              </div>
              <select style={{ ...inputStyle, marginBottom: 10 }} value={newAssigned} onChange={e => setNewAssigned(e.target.value)}>
                <option value="">— Unassigned —</option>
                {regionFEs.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button style={{ ...btn('primary'), width: '100%' }} onClick={applyAssign}>Assign</button>
            </Card>
          )}

          {/* Workshop */}
          {canEdit && c.type === 'Unit Faulty' && (
            <Card padding={18}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 10 }}>Workshop Assignment</div>
              <select style={{ ...inputStyle, marginBottom: 10 }} defaultValue={c.workshopAssigned || ''} onChange={e => {
                const uid = e.target.value ? parseInt(e.target.value) : null
                const wm = users.find(u => u.id === uid)
                onUpdate(c.id, { workshopAssigned: uid }, `Workshop assigned to ${wm?.name || 'none'}`)
                showToast(wm ? `Workshop: ${wm.name}` : 'Workshop unassigned')
              }}>
                <option value="">— No Workshop —</option>
                {workshopUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#475569' }}>
                <input type="checkbox" checked={c.backupUnitInstalled} onChange={e => {
                  const v = e.target.checked
                  onUpdate(c.id, { backupUnitInstalled: v }, v ? 'Backup unit installed at site' : 'Backup unit removed')
                  showToast(v ? 'Backup unit installed' : 'Backup unit removed')
                }} /> Backup unit installed at site
              </label>
            </Card>
          )}

          {/* Payment & Warranty */}
          {can(user, 'editPayment') && (
            <Card padding={18}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 12 }}>Payment & Warranty</div>
              <div style={{ padding: '8px 12px', background: warranty ? '#E8F5E9' : '#FFEBEE', borderRadius: 7, fontSize: 12, fontWeight: 700, color: warranty ? '#2E7D32' : '#C62828', marginBottom: 12 }}>
                {warranty ? '✅ Within Warranty' : warranty === false ? '❌ Warranty Expired' : '○ No Warranty Data'}
                {c.warrantyExpiry && <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>Expires: {fmt(c.warrantyExpiry, true)}</div>}
              </div>
              <label style={labelStyle}>Payment Status</label>
              <select style={inputStyle} value={payStatus} onChange={e => applyPayment(e.target.value)}>
                {PAYMENT_STATUSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Card>
          )}

          {/* Resolution paths guide */}
          <Card padding={18}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 10 }}>Resolution Paths</div>
            {[
              { label: '✓ Resolved on Spot',    desc: 'Fixed at customer site. Upload FSR.', color: '#2E7D32', bg: '#E8F5E9' },
              { label: '⚡ Battery Replacement', desc: 'Battery fault — arrange replacement.', color: '#E65100', bg: '#FFF8E1' },
              { label: '🔧 Unit Repair',         desc: 'Pick up → backup → workshop → reinstall.', color: '#C62828', bg: '#FFEBEE' },
              { label: '💻 Remote Resolution',   desc: 'Resolved via phone/remote support.', color: '#1565C0', bg: '#E3F2FD' },
            ].map(p => (
              <div key={p.label} style={{ background: p.bg, borderRadius: 7, padding: '9px 12px', marginBottom: 7, border: `1px solid ${p.color}25`, cursor: canFSR ? 'pointer' : 'default' }}
                onClick={() => canFSR && setResPath(p.label.replace(/^[✓⚡🔧💻] /, ''))}>
                <div style={{ fontWeight: 700, fontSize: 12, color: p.color }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
