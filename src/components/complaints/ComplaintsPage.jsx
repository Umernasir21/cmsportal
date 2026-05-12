import { useState } from 'react'
import { btn, inputStyle, StatusBadge, PriorityBadge, RegionBadge, SLABar, THead, TableWrap, EmptyState } from '@/components/shared'
import { STATUSES, COMPLAINT_TYPES, REGIONS, PRIORITIES } from '@/data/constants'
import { fmt, exportToCSV, prepareExportData } from '@/utils/helpers'

const PER_PAGE = 12

export default function ComplaintsPage({ complaints, users, user, onSelect, onLog }) {
  const [search, setSearch]     = useState('')
  const [fRegion, setFRegion]   = useState('All')
  const [fStatus, setFStatus]   = useState('All')
  const [fType, setFType]       = useState('All')
  const [fPriority, setFPriority] = useState('All')
  const [sort, setSort]         = useState('date_desc')
  const [page, setPage]         = useState(1)

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase()
    if (search && !c.id.toLowerCase().includes(q) && !c.customer.toLowerCase().includes(q) && !c.city?.toLowerCase().includes(q) && !c.unitId?.toLowerCase().includes(q)) return false
    if (fRegion !== 'All' && c.region !== fRegion) return false
    if (fStatus !== 'All' && c.status !== fStatus) return false
    if (fType !== 'All' && c.type !== fType) return false
    if (fPriority !== 'All' && c.priority !== fPriority) return false
    return true
  }).sort((a,b) => {
    if (sort === 'date_desc') return new Date(b.loggedAt)-new Date(a.loggedAt)
    if (sort === 'date_asc')  return new Date(a.loggedAt)-new Date(b.loggedAt)
    if (sort === 'priority')  return { Urgent:0, High:1, Normal:2 }[a.priority] - { Urgent:0, High:1, Normal:2 }[b.priority]
    if (sort === 'status')    return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status)
    return 0
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  const clearFilters = () => { setSearch(''); setFRegion('All'); setFStatus('All'); setFType('All'); setFPriority('All'); setPage(1) }
  const hasFilters = search || fRegion !== 'All' || fStatus !== 'All' || fType !== 'All' || fPriority !== 'All'

  const handleExport = () => exportToCSV(prepareExportData(filtered, users), 'complaints')

  const sel = { ...inputStyle, width: 'auto' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Filter bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inputStyle, width: 220 }} placeholder="🔍  Search ID, customer, city, unit…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        {(user.role === 'admin' || user.role === 'coordinator') && (
          <select style={sel} value={fRegion} onChange={e => { setFRegion(e.target.value); setPage(1) }}>
            <option value="All">All Regions</option>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        )}
        <select style={sel} value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={sel} value={fType} onChange={e => { setFType(e.target.value); setPage(1) }}>
          <option value="All">All Types</option>
          {COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select style={sel} value={fPriority} onChange={e => { setFPriority(e.target.value); setPage(1) }}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select style={sel} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="priority">By Priority</option>
          <option value="status">By Status</option>
        </select>
        {hasFilters && <button style={{ ...btn('ghost'), padding: '7px 12px', fontSize: 12 }} onClick={clearFilters}>✕ Clear</button>}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B', fontWeight: 600, flexShrink: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
        <button style={{ ...btn('ghost'), padding: '7px 12px', fontSize: 12 }} onClick={handleExport} title="Export CSV">⬇ CSV</button>
        {(user.role === 'admin' || user.role === 'coordinator') && (
          <button style={btn('primary')} onClick={onLog}>＋ Log Complaint</button>
        )}
      </div>

      {/* Table */}
      <TableWrap>
        <table>
          <THead cols={['ID','Customer','City','Region','Type','Category','Priority','Status','Assigned','SLA','Logged']} />
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={11}><EmptyState icon="🔍" title="No complaints found" sub="Try adjusting your search or filters" /></td></tr>
            )}
            {paged.map((c, i) => {
              const fe = users.find(u => u.id === c.assignedTo)
              return (
                <tr key={c.id} onClick={() => onSelect(c.id)} style={{ borderBottom: '1px solid #F8FAFC', background: i%2 ? '#FAFBFC' : '#fff', cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = i%2 ? '#FAFBFC' : '#fff'}>
                  <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1565C0', whiteSpace: 'nowrap' }}>{c.id}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F2044', maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.customer}</td>
                  <td style={{ padding: '9px 12px', color: '#64748B', fontSize: 11 }}>{c.city || '—'}</td>
                  <td style={{ padding: '9px 12px' }}><RegionBadge region={c.region} /></td>
                  <td style={{ padding: '9px 12px', color: '#475569', fontSize: 11, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.type}</td>
                  <td style={{ padding: '9px 12px', color: '#64748B', fontSize: 11 }}>{c.category}</td>
                  <td style={{ padding: '9px 12px' }}><PriorityBadge priority={c.priority} /></td>
                  <td style={{ padding: '9px 12px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '9px 12px', color: '#64748B', fontSize: 11 }}>{fe?.name || <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                  <td style={{ padding: '9px 12px' }}><SLABar complaint={c} compact /></td>
                  <td style={{ padding: '9px 12px', color: '#94A3B8', fontSize: 10, whiteSpace: 'nowrap' }}>{fmt(c.loggedAt, true)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {pages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
            <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>◀ Prev</button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => (
              <button key={i} style={{ ...btn(page === i+1 ? 'primary' : 'ghost'), padding: '5px 10px', fontSize: 11, minWidth: 30 }} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            {pages > 7 && <span style={{ color: '#94A3B8', fontSize: 12 }}>…{pages}</span>}
            <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}>Next ▶</button>
          </div>
        )}
      </TableWrap>
    </div>
  )
}
