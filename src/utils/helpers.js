import { SLA_HOURS } from '@/data/constants'

// ─── DATE FORMATTING ──────────────────────────────────────────────────────────
export const fmt = (iso, short = false) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  if (short) return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
  return d.toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const now = () => new Date().toISOString()

// ─── SLA CALCULATION ──────────────────────────────────────────────────────────
export const getSLA = (complaint) => {
  const { status, loggedAt, slaHours } = complaint

  if (['Resolved', 'Closed'].includes(status)) {
    return { label: '✓ Done', pct: 0, status: 'done', color: '#43A047' }
  }

  const deadline = new Date(loggedAt).getTime() + slaHours * 3_600_000
  const remaining = deadline - Date.now()
  const elapsed = ((slaHours * 3_600_000 - remaining) / (slaHours * 3_600_000)) * 100

  if (remaining <= 0) {
    return { label: 'BREACHED', pct: 100, status: 'breach', color: '#C62828' }
  }

  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const warn = elapsed >= 75

  return {
    label: `${h}h ${m}m left`,
    pct: Math.min(elapsed, 100),
    status: warn ? 'warn' : 'ok',
    color: warn ? '#E65100' : '#43A047',
  }
}

// ─── ID GENERATION ────────────────────────────────────────────────────────────
export const genComplaintId = (region, existingComplaints) => {
  const prefix = region === 'South' ? 'S' : region === 'Central' ? 'C' : 'N'
  const regionCount = existingComplaints.filter(c => c.region === region).length + 1
  return `CMP-${prefix}-${String(regionCount).padStart(4, '0')}`
}

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
export const can = (user, permission) => {
  const map = {
    logComplaint:     ['admin', 'coordinator'],
    assignRegion:     ['admin', 'coordinator'],
    assignFE:         ['admin', 'coordinator', 'regional_manager'],
    escalate:         ['admin', 'coordinator', 'regional_manager'],
    closeComplaint:   ['admin', 'coordinator', 'regional_manager'],
    updateStatus:     ['admin', 'coordinator', 'regional_manager', 'field_engineer', 'workshop_manager'],
    uploadFSR:        ['admin', 'coordinator', 'regional_manager', 'field_engineer'],
    manageUsers:      ['admin'],
    viewAllRegions:   ['admin', 'coordinator'],
    viewReports:      ['admin', 'coordinator', 'regional_manager'],
    accessWorkshop:   ['admin', 'coordinator', 'workshop_manager'],
    manageSettings:   ['admin'],
    deleteComplaints: ['admin'],
    editPayment:      ['admin', 'coordinator', 'regional_manager', 'workshop_manager'],
    addRepairLog:     ['admin', 'coordinator', 'regional_manager', 'field_engineer', 'workshop_manager'],
  }
  return map[permission]?.includes(user?.role) ?? false
}

export const userCanSeeComplaint = (user, complaint) => {
  if (!user) return false
  if (['admin', 'coordinator'].includes(user.role)) return true
  if (user.role === 'workshop_manager') return true
  if (user.role === 'regional_manager') return complaint.region === user.region
  if (user.role === 'field_engineer') return complaint.assignedTo === user.id
  return false
}

// ─── WARRANTY ─────────────────────────────────────────────────────────────────
export const isInWarranty = (warrantyExpiry) => {
  if (!warrantyExpiry) return null
  return new Date(warrantyExpiry) > new Date()
}

// ─── COMPLAINT CREATION ───────────────────────────────────────────────────────
export const buildNewComplaint = (formData, user, existingComplaints) => {
  const id = genComplaintId(formData.region, existingComplaints)
  const timestamp = now()
  const assignedUser = formData.assignedTo ? { id: parseInt(formData.assignedTo) } : null

  return {
    id,
    complaintNo:   formData.complaintNo?.trim() || '',
    customer:      formData.customer.trim(),
    contact:       formData.contact.trim(),
    email:         formData.email?.trim() || '',
    branch:        formData.branch?.trim() || '',
    branchCode:    formData.branchCode?.trim() || '',
    zone:          formData.zone?.trim() || '',
    region:        formData.region,
    city:          formData.city.trim(),
    district:      formData.district?.trim() || '',
    category:      formData.category,
    type:          formData.type,
    priority:      formData.priority,
    status:        assignedUser ? 'Assigned' : 'New',
    assignedTo:    assignedUser?.id || null,
    loggedBy:      user.id,
    loggedAt:      timestamp,
    description:   formData.description.trim(),
    unitId:        formData.unitId?.trim() || '',
    productSerial: formData.productSerial?.trim() || '',
    warrantyExpiry:formData.warrantyExpiry || '',
    paymentStatus: 'Pending',
    slaHours:      SLA_HOURS[formData.type] || 48,
    fsr:           null,
    fsrNotes:      '',
    attachments:   [],
    resolutionPath:'',
    workshopAssigned: null,
    backupUnitInstalled: false,
    repairLog:     [],
    timeline: [
      { action: `Complaint logged by ${user.name}`, user: user.name, at: timestamp, note: '' },
      ...(assignedUser ? [{ action: `Assigned to FE`, user: user.name, at: timestamp, note: '' }] : []),
    ],
  }
}

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────
export const exportToCSV = (data, filename) => {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const prepareExportData = (complaints, users) =>
  complaints.map(c => ({
    'Ticket ID':        c.id,
    'Complaint No.':    c.complaintNo || '',
    Customer:           c.customer,
    Branch:             c.branch || '',
    'Branch Code':      c.branchCode || '',
    Zone:               c.zone || '',
    Region:             c.region,
    City:               c.city,
    'Area / District':  c.district,
    'Contact No.':      c.contact,
    Status:             c.status,
    'Product Category': c.category,
    'Issue Type':       c.type,
    UnitID:             c.unitId,
    'Serial No.':       c.productSerial || '',
    WarrantyExpiry:     c.warrantyExpiry ? fmt(c.warrantyExpiry, true) : '—',
    AssignedTo:         users.find(u => u.id === c.assignedTo)?.name || 'Unassigned',
    LoggedBy:           users.find(u => u.id === c.loggedBy)?.name || '—',
    LoggedAt:           fmt(c.loggedAt),
    PaymentStatus:      c.paymentStatus,
    FSRUploaded:        c.fsr ? 'Yes' : 'No',
    ResolutionPath:     c.resolutionPath || '—',
    SLAHours:           c.slaHours,
    Description:        c.description || '',
  }))
