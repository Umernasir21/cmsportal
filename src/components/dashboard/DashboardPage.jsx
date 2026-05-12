import { KPICard, Card, StatusBadge, PriorityBadge, RegionBadge, SLABar, THead, TableWrap } from '@/components/shared'
import { STATUSES, STATUS_META, COMPLAINT_TYPES, REGIONS, REGION_META } from '@/data/constants'
import { getSLA, fmt } from '@/utils/helpers'

export default function DashboardPage({ complaints, users, onOpenComplaint }) {
  const open     = complaints.filter(c => !['Resolved','Closed'].includes(c.status))
  const resolved = complaints.filter(c => ['Resolved','Closed'].includes(c.status))
  const escalated= complaints.filter(c => c.status === 'Escalated')
  const breach   = complaints.filter(c => !['Resolved','Closed','Escalated'].includes(c.status) && getSLA(c).status === 'breach')
  const recent   = [...complaints].sort((a,b) => new Date(b.loggedAt)-new Date(a.loggedAt)).slice(0,8)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        <KPICard label="Total Complaints" value={complaints.length} color="#1565C0" icon="📋" />
        <KPICard label="Open / Pending" value={open.length} color="#FB8C00" icon="⏳" sub={`${open.filter(c=>c.status==='New').length} new unassigned`} />
        <KPICard label="Resolved" value={resolved.length} color="#43A047" icon="✅" />
        <KPICard label="Escalated" value={escalated.length} color="#E53935" icon="🚨" />
        <KPICard label="SLA Breached" value={breach.length} color="#7B1FA2" icon="⏱" sub="Auto-escalating" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F2044', marginBottom: 16 }}>Region Performance</div>
          {REGIONS.map(r => {
            const total = complaints.filter(c=>c.region===r).length
            const res   = complaints.filter(c=>c.region===r&&['Resolved','Closed'].includes(c.status)).length
            const opn   = total - res
            const m = REGION_META[r]
            return (
              <div key={r} style={{ marginBottom: 14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <RegionBadge region={r} />
                  <span style={{ fontSize:11, color:'#64748B' }}>{total} total</span>
                </div>
                <div style={{ background:'#F1F5F9', borderRadius:20, height:8, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:m.dark, borderRadius:20, width:`${total?(res/total)*100:0}%`, transition:'width .6s' }} />
                </div>
                <div style={{ display:'flex', gap:12, marginTop:4 }}>
                  <span style={{ fontSize:10, color:'#FB8C00', fontWeight:600 }}>⏳ {opn} open</span>
                  <span style={{ fontSize:10, color:'#43A047', fontWeight:600 }}>✓ {res} resolved</span>
                </div>
              </div>
            )
          })}
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#0F2044', marginBottom:16 }}>By Complaint Type</div>
          {COMPLAINT_TYPES.map(t => {
            const n = complaints.filter(c=>c.type===t).length
            if (!n) return null
            return (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                <div style={{ fontSize:11, color:'#475569', width:140, flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t}</div>
                <div style={{ flex:1, background:'#F1F5F9', borderRadius:4, height:7 }}>
                  <div style={{ height:'100%', background:'#1565C0', borderRadius:4, width:`${complaints.length?(n/complaints.length)*100:0}%` }} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'#1565C0', width:18, textAlign:'right' }}>{n}</div>
              </div>
            )
          })}
        </Card>

        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:'#0F2044', marginBottom:16 }}>Status Distribution</div>
          {STATUSES.map(s => {
            const n = complaints.filter(c=>c.status===s).length
            const m = STATUS_META[s]
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #F8FAFC' }}>
                <StatusBadge status={s} />
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:50, background:'#F1F5F9', borderRadius:4, height:6 }}>
                    <div style={{ height:'100%', background:m.dot, borderRadius:4, width:`${complaints.length?(n/complaints.length)*100:0}%` }} />
                  </div>
                  <span style={{ fontWeight:700, color:m.color, width:18, textAlign:'right', fontSize:12 }}>{n}</span>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      <TableWrap>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#0F2044' }}>Recent Complaints</div>
          <div style={{ fontSize:11, color:'#64748B' }}>{complaints.length} total</div>
        </div>
        <table>
          <THead cols={['ID','Customer','Region','Type','Priority','Status','SLA','Assigned','Logged']} />
          <tbody>
            {recent.map((c,i) => {
              const fe = users.find(u=>u.id===c.assignedTo)
              return (
                <tr key={c.id} onClick={()=>onOpenComplaint(c.id)} style={{ borderBottom:'1px solid #F8FAFC', background:i%2?'#FAFBFC':'#fff', cursor:'pointer', transition:'background .1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2?'#FAFBFC':'#fff'}>
                  <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#1565C0' }}>{c.id}</td>
                  <td style={{ padding:'10px 14px', fontWeight:600, color:'#0F2044' }}>{c.customer}</td>
                  <td style={{ padding:'10px 14px' }}><RegionBadge region={c.region} /></td>
                  <td style={{ padding:'10px 14px', color:'#475569', fontSize:12 }}>{c.type}</td>
                  <td style={{ padding:'10px 14px' }}><PriorityBadge priority={c.priority} /></td>
                  <td style={{ padding:'10px 14px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding:'10px 14px' }}><SLABar complaint={c} compact /></td>
                  <td style={{ padding:'10px 14px', color:'#64748B', fontSize:11 }}>{fe?.name||<span style={{color:'#CBD5E1'}}>—</span>}</td>
                  <td style={{ padding:'10px 14px', color:'#94A3B8', fontSize:10, whiteSpace:'nowrap' }}>{fmt(c.loggedAt,true)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  )
}
