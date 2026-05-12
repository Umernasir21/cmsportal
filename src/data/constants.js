// ─── REGIONS ──────────────────────────────────────────────────────────────────
export const REGIONS = ['South', 'Central', 'North']

export const REGION_META = {
  South:   { color: '#1565C0', bg: '#E3F2FD', dark: '#0D47A1', dot: '#1E88E5' },
  Central: { color: '#00695C', bg: '#E0F2F1', dark: '#004D40', dot: '#00897B' },
  North:   { color: '#4527A0', bg: '#EDE7F6', dark: '#311B92', dot: '#7E57C2' },
}

// ─── COMPLAINT TYPES & SLA ────────────────────────────────────────────────────
export const COMPLAINT_TYPES = [
  'Unit Faulty',
  'Battery Issue',
  'General Query',
  'Installation Issue',
  'Software Issue',
  'Hardware Damage',
  'Connectivity Issue',
  'Maintenance Request',
]

export const SLA_HOURS = {
  'Unit Faulty':          24,
  'Hardware Damage':      24,
  'Battery Issue':        48,
  'Installation Issue':   48,
  'Connectivity Issue':   48,
  'Software Issue':       72,
  'General Query':        72,
  'Maintenance Request':  96,
}

export const PRODUCT_CATEGORIES = [
  'Solar Inverter',
  'Battery Bank',
  'Solar Panel',
  'Charge Controller',
  'UPS System',
  'Accessories',
]

export const RESOLUTION_PATHS = [
  'Resolved on Spot',
  'Battery Replacement',
  'Unit Repair - Workshop',
  'Remote Resolution',
  'Parts Replacement',
]

// ─── STATUSES ─────────────────────────────────────────────────────────────────
export const STATUSES = [
  'New',
  'Assigned',
  'In Progress',
  'Pending Parts',
  'Resolved',
  'Escalated',
  'Closed',
]

export const STATUS_META = {
  New:            { bg: '#EDE7F6', color: '#4527A0', border: '#9575CD', dot: '#7E57C2' },
  Assigned:       { bg: '#E3F2FD', color: '#1565C0', border: '#64B5F6', dot: '#1E88E5' },
  'In Progress':  { bg: '#FFF8E1', color: '#E65100', border: '#FFB74D', dot: '#FB8C00' },
  'Pending Parts':{ bg: '#FFF3E0', color: '#BF360C', border: '#FF8A65', dot: '#F4511E' },
  Resolved:       { bg: '#E8F5E9', color: '#1B5E20', border: '#81C784', dot: '#43A047' },
  Escalated:      { bg: '#FFEBEE', color: '#B71C1C', border: '#EF9A9A', dot: '#E53935' },
  Closed:         { bg: '#ECEFF1', color: '#37474F', border: '#B0BEC5', dot: '#78909C' },
}

// ─── PRIORITIES ───────────────────────────────────────────────────────────────
export const PRIORITIES = ['Normal', 'High', 'Urgent']

export const PRIORITY_META = {
  Normal: { bg: '#F1F8E9', color: '#558B2F', border: '#AED581' },
  High:   { bg: '#FFF8E1', color: '#E65100', border: '#FFB74D' },
  Urgent: { bg: '#FFEBEE', color: '#C62828', border: '#EF9A9A' },
}

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const ROLES = [
  { value: 'admin',            label: 'Super Admin' },
  { value: 'coordinator',      label: 'Coordinator' },
  { value: 'regional_manager', label: 'Regional Manager' },
  { value: 'field_engineer',   label: 'Field Engineer' },
  { value: 'workshop_manager', label: 'Workshop Manager' },
]

export const ROLE_META = {
  admin:            { color: '#B71C1C', bg: '#FFEBEE', label: 'Super Admin' },
  coordinator:      { color: '#1565C0', bg: '#E3F2FD', label: 'Coordinator' },
  regional_manager: { color: '#2E7D32', bg: '#E8F5E9', label: 'Regional Manager' },
  field_engineer:   { color: '#E65100', bg: '#FFF8E1', label: 'Field Engineer' },
  workshop_manager: { color: '#00695C', bg: '#E0F2F1', label: 'Workshop Manager' },
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Waived', 'Under Warranty', 'N/A']

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  canLogComplaint:     ['admin', 'coordinator'],
  canAssignRegion:     ['admin', 'coordinator'],
  canAssignFE:         ['admin', 'coordinator', 'regional_manager'],
  canEscalate:         ['admin', 'coordinator', 'regional_manager'],
  canCloseComplaint:   ['admin', 'coordinator', 'regional_manager'],
  canUpdateStatus:     ['admin', 'coordinator', 'regional_manager', 'field_engineer'],
  canUploadFSR:        ['admin', 'coordinator', 'regional_manager', 'field_engineer'],
  canManageUsers:      ['admin'],
  canViewAllRegions:   ['admin', 'coordinator'],
  canViewReports:      ['admin', 'coordinator', 'regional_manager'],
  canAccessWorkshop:   ['admin', 'coordinator', 'workshop_manager'],
  canManageSettings:   ['admin'],
  canDeleteComplaints: ['admin'],
  canEditPayment:      ['admin', 'coordinator', 'regional_manager', 'workshop_manager'],
}
