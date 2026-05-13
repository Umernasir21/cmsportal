import { useState } from 'react'
import { btn, inputStyle, StatusBadge, PriorityBadge, RegionBadge, SLABar, THead, TableWrap, EmptyState } from '@/components/shared'
import { STATUSES, COMPLAINT_TYPES, REGIONS, PRIORITIES } from '@/data/constants'
import { fmt, exportToCSV, prepareExportData } from '@/utils/helpers'

const PER_PAGE = 12

function ComplaintCard({ c, users, onSelect, idx }) {
  const fe = users.find(u => u.id === c.assignedTo)
  return (
    <div
      onClick={() => onSelect(c.id)}
      style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: idx % 2 ? '#FAFBFC' : '#fff', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1565C0' }}>{c.id}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2044', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.customer}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{c.city}{c.city && ' · '}{c.type}</div>
        </div>
        <div style={{ flexShrink: 0, marginLeft: 10 }}>
          <StatusBadge status={c.status} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <PriorityBadge priority={c.priority} />
        <RegionBadge region={c.region} />
        <SLABar complaint={c} compact />
        {fe && <span style={{ fontSize: 11, color: '#64748B' }}>👷 {fe.name}</span>}
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{fmt(c.loggedAt, true)}</span>
      </div>
    </div>
  )
}

export default function ComplaintsPage({ complaints, users, user, onSelect, onLog, isMobile }) {
  const [search, setSearch]     = useState('')
  const [fRegion, setFRegion]   = useState('All')
  const [fStatus, setFStatus]   = useState('All')
  const [fType, setFType]       = useState('All')
  const [fPriority, setFPriority] = useState('All')
  const [sort, setSort]         = useState('date_desc')
  const [page, setPage]         = useState(1)
  const [showFilters, setShowFilters] = useState(false)

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

  const filterSelects = (
    <>
      {(user.role === 'admin' || user.role === 'coordinator') && (
        <select style={isMobile ? { ...inputStyle, flex: 1 } : sel} value={fRegion} onChange={e => { setFRegion(e.target.value); setPage(1) }}>
          <option value="All">All Regions</option>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      )}
      <select style={isMobile ? { ...inputStyle, flex: 1 } : sel} value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}>
        <option value="All">All Statuses</option>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <select style={isMobile ? { ...inputStyle, flex: 1 } : sel} value={fType} onChange={e => { setFType(e.target.value); setPage(1) }}>
        <option value="All">All Types</option>
        {COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <select style={isMobile ? { ...inputStyle, flex: 1 } : sel} value={fPriority} onChange={e => { setFPriority(e.target.value); setPage(1) }}>
        <option value="All">All Priorities</option>
        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
      </select>
      <select style={isMobile ? { ...inputStyle, flex: 1 } : sel} value={sort} onChange={e => setSort(e.target.value)}>
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="priority">By Priority</option>
        <option value="status">By Status</option>
      </select>
      {hasFilters && (
        <button style={{ ...btn('ghost'), padding: '9px 14px', fontSize: 13 }} onClick={clearFilters}>✕ Clear</button>
      )}
    </>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Filter bar */}
      {isMobile ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', overflow: 'hidden' }}>
          {/* Search row */}
          <div style={{ padding: '12px 12px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="🔍  Search ID, customer, city…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            <button
              style={{ ...btn(showFilters || hasFilters ? 'primary' : 'ghost'), padding: '9px 14px', fontSize: 13, flexShrink: 0 }}
              onClick={() => setShowFilters(p => !p)}
            >
              ⚙ {hasFilters ? '!' : ''}
            </button>
            {(user.role === 'admin' || user.role === 'coordinator') && (
              <button style={{ ...btn('primary'), padding: '9px 14px', fontSize: 13, flexShrink: 0 }} onClick={onLog}>＋</button>
            )}
          </div>
          {/* Expandable filters */}
          {showFilters && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {filterSelects}
              </div>
            </div>
          )}
          {/* Results row */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <button style={{ ...btn('ghost'), padding: '5px 10px', fontSize: 11 }} onClick={handleExport}>⬇ CSV</button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...inputStyle, width: 220 }} placeholder="🔍  Search ID, customer, city, unit…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          {filterSelects}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B', fontWeight: 600, flexShrink: 0 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
          <button style={{ ...btn('ghost'), padding: '7px 12px', fontSize: 12 }} onClick={handleExport} title="Export CSV">⬇ CSV</button>
          {(user.role === 'admin' || user.role === 'coordinator') && (
            <button style={btn('primary')} onClick={onLog}>＋ Log Complaint</button>
          )}
        </div>
      )}

      {/* List / Table */}
      {isMobile ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(15,32,68,0.06)', overflow: 'hidden' }}>
          {paged.length === 0 && <EmptyState icon="🔍" title="No complaints found" sub="Try adjusting your search or filters" />}
          {paged.map((c, i) => <ComplaintCard key={c.id} c={c} users={users} onSelect={onSelect} idx={i} />)}
          {pages > 1 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
              <button style={{ ...btn('ghost'), padding: '8px 16px', fontSize: 13 }} onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>◀</button>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{page} / {pages}</span>
              <button style={{ ...btn('ghost'), padding: '8px 16px', fontSize: 13 }} onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}>▶</button>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  )
}
