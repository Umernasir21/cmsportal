-- CMS Portal — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Project → SQL Editor → New query → paste → Run).
-- Safe to re-run: drops and recreates the app's tables only.

drop table if exists complaints;
drop table if exists dropdown_options;
drop table if exists users;

-- ─── USERS ──────────────────────────────────────────────────────────────────
create table users (
  id            bigint primary key,
  name          text not null,
  email         text unique not null,
  role          text not null,
  region        text,
  phone         text,
  active        boolean not null default true,
  joined_at     text,
  password_hash text not null
);

-- ─── COMPLAINTS ─────────────────────────────────────────────────────────────
create table complaints (
  id                    text primary key,
  complaint_no          text default '',
  customer              text not null,
  contact               text not null,
  email                 text default '',
  branch                text default '',
  branch_code           text default '',
  zone                  text default '',
  region                text not null,
  city                  text not null,
  district              text default '',
  category              text,
  type                  text not null,
  priority              text not null default 'Normal',
  status                text not null default 'New',
  assigned_to           bigint references users(id),
  logged_by             bigint references users(id),
  logged_at             timestamptz not null default now(),
  description           text,
  fsr                   text,
  fsr_notes             text default '',
  attachments           jsonb not null default '[]',
  resolution_path       text default '',
  unit_id               text default '',
  product_serial        text default '',
  warranty_expiry       text default '',
  payment_status        text default 'Pending',
  sla_hours             integer not null default 48,
  workshop_assigned     bigint references users(id),
  backup_unit_installed boolean not null default false,
  repair_log            jsonb not null default '[]',
  timeline              jsonb not null default '[]',
  updated_at            timestamptz not null default now()
);

-- ─── ADMIN-EDITABLE DROPDOWN OPTIONS ────────────────────────────────────────
create table dropdown_options (
  key     text primary key,
  options jsonb not null default '[]'
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
-- This app has its own simple email/password login (not Supabase Auth), so every
-- request from the browser uses the shared anon key. These policies keep the
-- anon key able to read/write app data. If you need real per-row auth later,
-- switch to Supabase Auth and tighten these policies accordingly.
alter table users enable row level security;
alter table complaints enable row level security;
alter table dropdown_options enable row level security;

create policy "anon full access users" on users for all using (true) with check (true);
create policy "anon full access complaints" on complaints for all using (true) with check (true);
create policy "anon full access dropdown_options" on dropdown_options for all using (true) with check (true);

-- ─── REALTIME ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table complaints;
alter publication supabase_realtime add table dropdown_options;

-- ─── SEED DATA ──────────────────────────────────────────────────────────────
insert into users (id, name, email, role, region, phone, active, joined_at, password_hash) values
  (1,  'Admin User',         'admin@cms.com',   'admin',            null,      '0300-1110001', true, '2025-01-01', 'admin123'),
  (2,  'Sara Coordinator',   'sara@cms.com',    'coordinator',      null,      '0300-1110002', true, '2025-01-15', 'pass123'),
  (3,  'Imran South Mgr',    'imran@cms.com',   'regional_manager', 'South',   '0300-1110003', true, '2025-02-01', 'pass123'),
  (4,  'Ayesha Central Mgr', 'ayesha@cms.com',  'regional_manager', 'Central', '0300-1110004', true, '2025-02-01', 'pass123'),
  (5,  'Zain North Mgr',     'zain@cms.com',    'regional_manager', 'North',   '0300-1110005', true, '2025-02-01', 'pass123'),
  (6,  'Ahmed FE1',          'ahmed@cms.com',   'field_engineer',   'South',   '0300-1110006', true, '2025-03-01', 'pass123'),
  (7,  'Bilal FE2',          'bilal@cms.com',   'field_engineer',   'Central', '0300-1110007', true, '2025-03-01', 'pass123'),
  (8,  'Kamran FE3',         'kamran@cms.com',  'field_engineer',   'Central', '0300-1110008', true, '2025-03-01', 'pass123'),
  (9,  'Tariq FE4',          'tariq@cms.com',   'field_engineer',   'North',   '0300-1110009', true, '2025-03-01', 'pass123'),
  (10, 'Raza Workshop',      'raza@cms.com',    'workshop_manager', null,      '0300-1110010', true, '2025-04-01', 'pass123');

insert into dropdown_options (key, options) values
  ('complaintTypes', '["Unit Faulty","Battery Issue","General Query","Installation Issue","Software Issue","Hardware Damage","Connectivity Issue","Maintenance Request"]'),
  ('productCategories', '["Solar Inverter","Battery Bank","Solar Panel","Charge Controller","UPS System","Accessories"]');

insert into complaints (
  id, complaint_no, customer, contact, email, branch, branch_code, zone, region, city, district,
  category, type, priority, status, assigned_to, logged_by, logged_at, description,
  fsr, fsr_notes, attachments, resolution_path, unit_id, product_serial, warranty_expiry,
  payment_status, sla_hours, workshop_assigned, backup_unit_installed, repair_log, timeline
) values
(
  'CMP-S-0003', '', 'Solar Homes PVT', '021-999-0000', 'info@solarhomes.pk', '', '', '',
  'South', 'Karachi', 'Nazimabad', 'Solar Panel', 'Installation Issue', 'High', 'New',
  null, 2, now() - interval '1 day',
  'Panels installed 3 days ago are generating only 40% of expected output. Possible incorrect orientation or shading issue. Urgent review required.',
  null, '', '[]', '', 'UNIT-0072', 'SN-SOL-20240072', '2031-05-01', 'Pending', 48, null, false, '[]',
  jsonb_build_array(jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '1 day', 'note',''))
),
(
  'CMP-N-0002', '', 'North Power Ltd', '051-444-5555', 'ops@northpower.com', '', '', '',
  'North', 'Rawalpindi', 'Bahria Town', 'Battery Bank', 'Battery Issue', 'Normal', 'Assigned',
  9, 2, now() - interval '2 days',
  'Battery bank not holding charge for more than 3 hours. Needs full evaluation and possible replacement.',
  null, '', '[]', '', 'UNIT-0055', 'SN-BAT-20220055', '2025-12-31', 'Pending', 48, null, false, '[]',
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '2 days', 'note',''),
    jsonb_build_object('action','Assigned to Tariq FE4','user','Sara Coordinator','at', now() - interval '2 days', 'note','')
  )
),
(
  'CMP-C-0003', '', 'Green Energy Co', '042-111-2222', 'support@greenenergy.pk', '', '', '',
  'Central', 'Faisalabad', 'Samanabad', 'Charge Controller', 'Connectivity Issue', 'Normal', 'In Progress',
  7, 2, now() - interval '2 days 4 hours',
  'Charge controller WiFi module not connecting to monitoring app. Possible firmware issue or hardware fault.',
  null, '', '[]', '', 'UNIT-0091', 'SN-CC-20240091', '2028-11-30', 'N/A', 48, null, false, '[]',
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '2 days 4 hours', 'note',''),
    jsonb_build_object('action','Assigned to Bilal FE2','user','Ayesha Central Mgr','at', now() - interval '2 days 3 hours', 'note',''),
    jsonb_build_object('action','Status → In Progress','user','Bilal FE2','at', now() - interval '1 day 8 hours', 'note','Checking firmware version on device')
  )
),
(
  'CMP-S-0001', '', 'BAHL Branch 4', '021-111-0001', 'bahl.b4@bank.com', 'BAHL Branch 4', 'BAHL-S-004', 'South Zone',
  'South', 'Karachi', 'Clifton', 'Solar Inverter', 'Unit Faulty', 'High', 'Escalated',
  6, 2, now() - interval '3 days',
  'Unit not powering on since morning. Complete blackout at site. Customer urgently needs resolution. Power board suspected.',
  null, '', '[]', '', 'UNIT-0042', 'SN-INV-20230042', '2027-06-01', 'Pending', 24, null, false, '[]',
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '3 days', 'note',''),
    jsonb_build_object('action','Assigned to Ahmed FE1','user','Sara Coordinator','at', now() - interval '3 days', 'note',''),
    jsonb_build_object('action','Status → In Progress','user','Ahmed FE1','at', now() - interval '2 days 4 hours', 'note','Visited site. Diagnosing power board issue.'),
    jsonb_build_object('action','Auto-escalated — SLA breached','user','System','at', now() - interval '2 days', 'note','SLA timer expired')
  )
),
(
  'CMP-C-0002', '', 'Tech Corp Solutions', '042-777-8888', 'it@techcorp.com', '', '', '',
  'Central', 'Lahore', 'Johar Town', 'UPS System', 'Unit Faulty', 'High', 'Escalated',
  8, 2, now() - interval '4 days',
  'UPS display completely blank. Unit powers on (LEDs work) but display shows nothing. Suspected display board failure.',
  null, '', jsonb_build_array(jsonb_build_object('name','unit_photo.jpg','type','image','size','0.8 MB','at', now() - interval '3 days')),
  'Unit Repair - Workshop', 'UNIT-0031', 'SN-UPS-20230031', '2026-09-20', 'Pending', 48, 10, true,
  jsonb_build_array(
    jsonb_build_object('action','Unit diagnosed — display board failure confirmed','by','Kamran FE3','at', now() - interval '3 days'),
    jsonb_build_object('action','Backup unit installed','by','Kamran FE3','at', now() - interval '3 days'),
    jsonb_build_object('action','Display board ordered from supplier','by','Raza Workshop','at', now() - interval '2 days')
  ),
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '4 days', 'note',''),
    jsonb_build_object('action','Assigned to Kamran FE3','user','Sara Coordinator','at', now() - interval '4 days', 'note',''),
    jsonb_build_object('action','Status → In Progress','user','Kamran FE3','at', now() - interval '3 days', 'note',''),
    jsonb_build_object('action','Status → Pending Parts','user','Kamran FE3','at', now() - interval '2 days 4 hours', 'note','Waiting for display board from warehouse'),
    jsonb_build_object('action','Auto-escalated — SLA breached','user','System','at', now() - interval '2 days', 'note','SLA timer expired')
  )
),
(
  'CMP-N-0001', '', 'BAHL North Branch', '051-222-3333', 'bahl.north@bank.com', 'BAHL North Branch', 'BAHL-N-001', 'North Zone',
  'North', 'Islamabad', 'F-7', 'Solar Inverter', 'Unit Faulty', 'Urgent', 'Escalated',
  9, 2, now() - interval '5 days',
  'Complete system failure at bank branch. All inverter units non-functional. Critical infrastructure affected. Requires immediate resolution.',
  null, '', '[]', 'Unit Repair - Workshop', 'UNIT-0088', 'SN-INV-20230088', '2028-03-15', 'Pending', 24, 10, true,
  jsonb_build_array(
    jsonb_build_object('action','Faulty unit picked up from site','by','Tariq FE4','at', now() - interval '4 days'),
    jsonb_build_object('action','Backup unit installed at customer site','by','Tariq FE4','at', now() - interval '4 days'),
    jsonb_build_object('action','Unit received at workshop','by','Raza Workshop','at', now() - interval '3 days')
  ),
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '5 days', 'note',''),
    jsonb_build_object('action','Assigned to Tariq FE4','user','Sara Coordinator','at', now() - interval '5 days', 'note',''),
    jsonb_build_object('action','Status → In Progress','user','Tariq FE4','at', now() - interval '4 days 6 hours', 'note','Multiple units affected at site.'),
    jsonb_build_object('action','Repair log: Faulty unit picked up','user','Tariq FE4','at', now() - interval '4 days', 'note',''),
    jsonb_build_object('action','Repair log: Backup unit installed','user','Tariq FE4','at', now() - interval '4 days', 'note',''),
    jsonb_build_object('action','Auto-escalated — SLA breached','user','System','at', now() - interval '4 days', 'note','SLA timer expired')
  )
),
(
  'CMP-C-0001', '', 'Customer ABC Ltd', '042-333-4444', 'abc@customer.com', '', '', '',
  'Central', 'Lahore', 'Gulberg', 'Battery Bank', 'Battery Issue', 'Normal', 'Resolved',
  7, 2, now() - interval '6 days',
  'Battery drains completely within 2 hours of charging. Started after power surge last week.',
  'Battery cells replaced. Unit tested for 4 hours — stable charge holding at 95%.',
  'Replaced 3 dead battery cells. Ran full diagnostic. Warranty covers replacement.',
  jsonb_build_array(jsonb_build_object('name','site_photo.jpg','type','image','size','1.2 MB','at', now() - interval '4 days')),
  'Battery Replacement', 'UNIT-0019', 'SN-BAT-20220019', '2026-01-01', 'Under Warranty', 48, null, false, '[]',
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '6 days', 'note',''),
    jsonb_build_object('action','Assigned to Bilal FE2','user','Sara Coordinator','at', now() - interval '6 days', 'note',''),
    jsonb_build_object('action','Status → In Progress','user','Bilal FE2','at', now() - interval '5 days', 'note',''),
    jsonb_build_object('action','FSR submitted — Battery Replacement','user','Bilal FE2','at', now() - interval '4 days', 'note',''),
    jsonb_build_object('action','Status → Resolved','user','Bilal FE2','at', now() - interval '4 days', 'note','')
  )
),
(
  'CMP-S-0002', '', 'Customer XYZ', '021-555-6666', '', '', '', '',
  'South', 'Karachi', 'DHA Phase 5', 'Accessories', 'General Query', 'Normal', 'Closed',
  6, 2, now() - interval '8 days',
  'Customer enquiring about annual maintenance schedule and service package options.',
  'Provided full maintenance schedule documentation. Customer opted for annual service package.',
  'Customer satisfied. Will schedule annual visit in Q3.',
  '[]', 'Resolved on Spot', '', '', '', 'N/A', 72, null, false, '[]',
  jsonb_build_array(
    jsonb_build_object('action','Complaint logged by Sara Coordinator','user','Sara Coordinator','at', now() - interval '8 days', 'note',''),
    jsonb_build_object('action','Assigned to Ahmed FE1','user','Sara Coordinator','at', now() - interval '8 days', 'note',''),
    jsonb_build_object('action','Status → Resolved','user','Ahmed FE1','at', now() - interval '7 days', 'note','Query resolved via phone'),
    jsonb_build_object('action','Status → Closed','user','Sara Coordinator','at', now() - interval '6 days', 'note','')
  )
);
