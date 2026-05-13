import { useState } from 'react'
import { btn, inputStyle, Card, StatusBadge, PriorityBadge, RegionBadge, SLABar, Avatar, TableWrap, THead, EmptyState } from '@/components/shared'
import { STATUSES, COMPLAINT_TYPES, PRIORITIES, PRIORITY_META, REGIONS, REGION_META } from '@/data/constants'
import { getSLA, fmt, exportToCSV, prepareExportData } from '@/utils/helpers'

const TABS = [
  { id: 'summary',   label: 'Summary',       icon: '📊' },
  { id: 'pending',   label: 'Pending',        icon: '⏳' },
  { id: 'resolved',  label: 'Resolved',       icon: '✅' },
  { id: 'region',    label: 'By Region',      icon: '🗺' },
  { id: 'fe',        label: 'FE Performance', icon: '👷' },
  { id: 'sla',       label: 'SLA Breaches',   icon: '🚨' },
  { id: 'escalated', label: 'Escalations',    icon: '⬆' },
]

function CTable({ data, users }) {
  if (!data.length) return <div style={{ marginTop: 14 }}><Card><EmptyState icon="📋" title="No data" /></Card></div>
  return (
    <TableWrap>
      <table>
        <THead cols={['ID','Customer','Region','Type','Priority','Status','FE','SLA','Date']} />
        <tbody>
          {data.map((c, i) => {
            const fe = users.find(u => u.id === c.assignedTo)
            return (
              <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff' }}>
                <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1565C0' }}>{c.id}</td>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F2044' }}>{c.customer}</td>
                <td style={{ padding: '9px 12px' }}><RegionBadge region={c.region} /></td>
                <td style={{ padding: '9px 12px', color: '#475569', fontSize: 11 }}>{c.type}</td>
                <td style={{ padding: '9px 12px' }}><PriorityBadge priority={c.priority} /></td>
                <td style={{ padding: '9px 12px' }}><StatusBadge status={c.status} /></td>
                <td style={{ padding: '9px 12px', fontSize: 11, color: '#64748B' }}>{fe?.name || '—'}</td>
                <td style={{ padding: '9px 12px' }}><SLABar complaint={c} compact /></td>
                <td style={{ padding: '9px 12px', fontSize: 10, color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmt(c.loggedAt, true)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableWrap>
  )
}

export default function ReportsPage({ complaints, users, user }) {
  const [tab, setTab]       = useState('summary')
  const [fRegion, setFRegion] = useState('All')
  const [fDate, setFDate]   = useState('all')

  const dateOk = (c) => {
    const d = new Date(c.loggedAt), now = new Date()
    if (fDate === 'today')  return d.toDateString() === now.toDateString()
    if (fDate === 'week')   return (now - d) < 7 * 86400000
    if (fDate === 'month')  return (now - d) < 30 * 86400000
    return true
  }

  const filtered = complaints.filter(c => (fRegion === 'All' || c.region === fRegion) && dateOk(c))
  const open      = filtered.filter(c => !['Resolved','Closed'].includes(c.status))
  const resolved  = filtered.filter(c => ['Resolved','Closed'].includes(c.status))
  const escalated = filtered.filter(c => c.status === 'Escalated')
  const slaBreach = filtered.filter(c => !['Resolved','Closed'].includes(c.status) && getSLA(c).status === 'breach')

  const byRegion = REGIONS.map(r => ({
    r, total: filtered.filter(c=>c.region===r).length,
    open:     filtered.filter(c=>c.region===r&&!['Resolved','Closed'].includes(c.status)).length,
    resolved: filtered.filter(c=>c.region===r&&['Resolved','Closed'].includes(c.status)).length,
    esc:      filtered.filter(c=>c.region===r&&c.status==='Escalated').length,
    breach:   filtered.filter(c=>c.region===r&&getSLA(c).status==='breach').length,
  }))

  const fePerf = users.filter(u => u.role === 'field_engineer').map(fe => ({
    ...fe,
    total:    filtered.filter(c=>c.assignedTo===fe.id).length,
    resolved: filtered.filter(c=>c.assignedTo===fe.id&&['Resolved','Closed'].includes(c.status)).length,
    pending:  filtered.filter(c=>c.assignedTo===fe.id&&!['Resolved','Closed'].includes(c.status)).length,
    fsrRate:  filtered.filter(c=>c.assignedTo===fe.id).length
      ? Math.round(filtered.filter(c=>c.assignedTo===fe.id&&c.fsr).length / filtered.filter(c=>c.assignedTo===fe.id).length * 100) : 0,
  }))

  const pctBar = (val, color = '#1565C0', w = 80) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: w, background: '#F1F5F9', borderRadius: 4, height: 8 }}>
        <div style={{ height: '100%', background: color, borderRadius: 4, width: `${val}%` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}%</span>
    </div>
  )

  return (
    <div>
      {/* Filter bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginRight: 4 }}>Filters:</span>
        {(user.role === 'admin' || user.role === 'coordinator') && (
          <select style={{ ...inputStyle, width: 140 }} value={fRegion} onChange={e => setFRegion(e.target.value)}>
            <option value="All">All Regions</option>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        )}
        <select style={{ ...inputStyle, width: 150 }} value={fDate} onChange={e => setFDate(e.target.value)}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B', fontWeight: 600 }}>{filtered.length} complaints</div>
        <button style={{ ...btn('ghost'), padding: '7px 12px', fontSize: 12 }} onClick={() => exportToCSV(prepareExportData(filtered, users), 'cms_report')}>⬇ Export</button>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="tabs-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...btn(tab === t.id ? 'primary' : 'ghost'), padding: '7px 14px', fontSize: 12, flexShrink: 0 }} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="rg-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {[['Total',filtered.length,'#1565C0','📋'],['Open',open.length,'#FB8C00','⏳'],['Resolved',resolved.length,'#43A047','✅'],['Escalated',escalated.length,'#E53935','🚨'],['SLA Breach',slaBreach.length,'#7B1FA2','⏱']].map(([l,v,c,i]) => (
              <Card key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{i}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{l}</div>
              </Card>
            ))}
          </div>
          <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 14 }}>By Complaint Type</div>
              {COMPLAINT_TYPES.map(t => { const n = filtered.filter(c=>c.type===t).length; if (!n) return null; return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <div style={{ fontSize: 11, color: '#475569', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</div>
                  <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 8 }}><div style={{ height: '100%', background: '#1565C0', borderRadius: 4, width: `${filtered.length?(n/filtered.length)*100:0}%` }} /></div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1565C0', width: 22, textAlign: 'right' }}>{n}</span>
                </div>
              )})}
            </Card>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 14 }}>By Priority & Region</div>
              {PRIORITIES.map(p => { const n = filtered.filter(c=>c.priority===p).length; const m = PRIORITY_META[p]; return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <PriorityBadge priority={p} />
                  <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 10 }}><div style={{ height: '100%', background: m.color, borderRadius: 4, width: `${filtered.length?(n/filtered.length)*100:0}%` }} /></div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0F2044', width: 20, textAlign: 'right' }}>{n}</span>
                </div>
              )})}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 4 }}>
                {REGIONS.map(r => { const n = filtered.filter(c=>c.region===r).length; const m = REGION_META[r]; return (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <RegionBadge region={r} />
                    <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 7 }}><div style={{ height: '100%', background: m.dark, borderRadius: 4, width: `${filtered.length?(n/filtered.length)*100:0}%` }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F2044', width: 20, textAlign: 'right' }}>{n}</span>
                  </div>
                )})}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'pending'   && <CTable data={open}      users={users} />}
      {tab === 'resolved'  && <CTable data={resolved}  users={users} />}
      {tab === 'escalated' && <CTable data={escalated} users={users} />}
      {tab === 'sla'       && <CTable data={slaBreach} users={users} />}

      {tab === 'region' && (
        <TableWrap>
          <table>
            <THead cols={['Region','Total','Open','Resolved','Escalated','SLA Breach','Resolve Rate']} />
            <tbody>
              {byRegion.map((r, i) => (
                <tr key={r.r} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff' }}>
                  <td style={{ padding: '12px 16px' }}><RegionBadge region={r.r} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 15 }}>{r.total}</td>
                  <td style={{ padding: '12px 16px', color: '#FB8C00', fontWeight: 600 }}>{r.open}</td>
                  <td style={{ padding: '12px 16px', color: '#43A047', fontWeight: 600 }}>{r.resolved}</td>
                  <td style={{ padding: '12px 16px', color: '#E53935', fontWeight: 600 }}>{r.esc}</td>
                  <td style={{ padding: '12px 16px', color: '#7B1FA2', fontWeight: 600 }}>{r.breach}</td>
                  <td style={{ padding: '12px 16px' }}>{pctBar(r.total ? Math.round((r.resolved/r.total)*100) : 0, '#43A047')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {tab === 'fe' && (
        <TableWrap>
          <table>
            <THead cols={['Field Engineer','Region','Total','Resolved','Pending','FSR Rate','Resolve Rate']} />
            <tbody>
              {fePerf.map((fe, i) => (
                <tr key={fe.id} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={fe.name} size={28} bg="#1565C0" />
                      <span style={{ fontWeight: 700, color: '#0F2044' }}>{fe.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><RegionBadge region={fe.region} /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 15 }}>{fe.total}</td>
                  <td style={{ padding: '12px 16px', color: '#43A047', fontWeight: 600 }}>{fe.resolved}</td>
                  <td style={{ padding: '12px 16px', color: '#FB8C00', fontWeight: 600 }}>{fe.pending}</td>
                  <td style={{ padding: '12px 16px' }}>{pctBar(fe.fsrRate, '#1565C0', 70)}</td>
                  <td style={{ padding: '12px 16px' }}>{pctBar(fe.total ? Math.round((fe.resolved/fe.total)*100) : 0, '#43A047', 70)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  )
}
