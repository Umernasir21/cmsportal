import { useState } from 'react'
import { btn, Card, StatusBadge, RegionBadge, Badge, TableWrap, THead, EmptyState, KPICard } from '@/components/shared'
import { fmt } from '@/utils/helpers'

export default function WorkshopPage({ complaints, users, user, onUpdate, onAddRepairLog, onOpenComplaint, showToast }) {
  const [repairInputs, setRepairInputs] = useState({})
  const jobs = complaints.filter(c => c.workshopAssigned || (c.type === 'Unit Faulty' && ['In Progress','Pending Parts','Escalated'].includes(c.status)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <KPICard label="Total Jobs" value={jobs.length} color="#1565C0" icon="🔧" />
        <KPICard label="In Progress" value={jobs.filter(c=>c.status==='In Progress').length} color="#FB8C00" icon="⚙" />
        <KPICard label="Pending Parts" value={jobs.filter(c=>c.status==='Pending Parts').length} color="#F4511E" icon="📦" />
        <KPICard label="Backup Installed" value={jobs.filter(c=>c.backupUnitInstalled).length} color="#43A047" icon="✅" />
      </div>

      <TableWrap>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', fontWeight: 700, fontSize: 13, color: '#0F2044' }}>Workshop Repair Jobs</div>
        <table>
          <THead cols={['ID','Customer','Region','Unit ID','Status','Backup','Workshop Mgr','Last Entry','Action']} />
          <tbody>
            {jobs.length === 0 && <tr><td colSpan={9}><EmptyState icon="🔧" title="No workshop jobs" sub="Unit-faulty complaints with workshop assignment appear here" /></td></tr>}
            {jobs.map((c, i) => {
              const wm   = users.find(u => u.id === c.workshopAssigned)
              const last = c.timeline[c.timeline.length-1]
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff' }}>
                  <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1565C0', cursor: 'pointer' }} onClick={() => onOpenComplaint(c.id)}>{c.id}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#0F2044' }}>{c.customer}</td>
                  <td style={{ padding: '9px 14px' }}><RegionBadge region={c.region} /></td>
                  <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{c.unitId || '—'}</td>
                  <td style={{ padding: '9px 14px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '9px 14px' }}><Badge bg={c.backupUnitInstalled ? '#E8F5E9' : '#F1F5F9'} color={c.backupUnitInstalled ? '#2E7D32' : '#64748B'}>{c.backupUnitInstalled ? '✓ Yes' : '○ No'}</Badge></td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: '#475569' }}>{wm?.name || '—'}</td>
                  <td style={{ padding: '9px 14px', fontSize: 10, color: '#94A3B8' }}>{fmt(last?.at)}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        style={{ fontSize: 11, border: '1px solid #E2E8F0', borderRadius: 5, padding: '4px 8px', width: 140, fontFamily: 'inherit', color: '#0F2044' }}
                        placeholder="Log action…"
                        value={repairInputs[c.id] || ''}
                        onChange={e => setRepairInputs(p => ({ ...p, [c.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && repairInputs[c.id]?.trim()) {
                            onAddRepairLog(c.id, repairInputs[c.id])
                            setRepairInputs(p => ({ ...p, [c.id]: '' }))
                            showToast('Repair log updated')
                          }
                        }}
                      />
                      <button style={{ ...btn('primary'), padding: '4px 10px', fontSize: 11 }} onClick={() => {
                        if (repairInputs[c.id]?.trim()) {
                          onAddRepairLog(c.id, repairInputs[c.id])
                          setRepairInputs(p => ({ ...p, [c.id]: '' }))
                          showToast('Repair log updated')
                        }
                      }}>Add</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrap>

      {/* Repair logs detail */}
      {jobs.filter(c => c.repairLog?.length > 0).map(c => (
        <Card key={c.id}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 12 }}>🔧 {c.id} — {c.customer} — Repair Log</div>
          {c.repairLog.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #F8FAFC' }}>
              <div style={{ width: 8, height: 8, background: '#1E88E5', borderRadius: '50%', marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0F2044' }}>{r.action}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.by} · {fmt(r.at)}</div>
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}
