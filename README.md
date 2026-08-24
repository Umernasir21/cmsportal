# CMS Portal — Complaint Management System

A cloud-based web application for managing customer complaints across **South**, **Central**, and **North** regions. Built with React 18 + Vite.

---

## Quick Start (Developer)

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- npm 9+ (comes with Node.js)

### 1. Install dependencies
```bash
cd cms
npm install
```

### 2. Set up the shared database (Supabase)
All complaint/user/dropdown data is stored in Supabase (Postgres) and synced live to every
browser via Supabase Realtime — this is what makes changes made by one user (admin,
coordinator, field engineer, etc.) show up instantly for everyone else.

1. Create a free project at [supabase.com](https://supabase.com).
2. In your new project, go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `users`,
   `complaints`, and `dropdown_options` tables, enables Realtime on them, and seeds demo data.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public** key.
4. Copy `.env.example` to `.env` and fill in both values:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### 3. Run development server
```bash
npm run dev
```
Opens at **http://localhost:3000**

### 4. Build for production
```bash
npm run build
```
Output goes to `dist/` — deploy this folder.

### 5. Preview production build locally
```bash
npm run preview
```

---

## Demo Login Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@cms.com | admin123 | Super Admin |
| sara@cms.com | pass123 | Coordinator |
| imran@cms.com | pass123 | Regional Manager (South) |
| ayesha@cms.com | pass123 | Regional Manager (Central) |
| zain@cms.com | pass123 | Regional Manager (North) |
| ahmed@cms.com | pass123 | Field Engineer (South) |
| bilal@cms.com | pass123 | Field Engineer (Central) |
| kamran@cms.com | pass123 | Field Engineer (Central) |
| tariq@cms.com | pass123 | Field Engineer (North) |
| raza@cms.com | pass123 | Workshop Manager |

---

## Project Structure

```
cms/
├── index.html                     # App entry HTML
├── vite.config.js                 # Vite + path aliases
├── package.json
└── src/
    ├── main.jsx                   # React root mount
    ├── App.jsx                    # Main app, routing, state wiring
    ├── styles/
    │   └── global.css             # CSS variables, resets, animations
    ├── data/
    │   ├── constants.js           # All enums, SLA config, role/status meta
    │   └── seedData.js            # Demo users + 8 sample complaints
    ├── utils/
    │   └── helpers.js             # Date format, SLA calc, ID gen, CSV export
    ├── hooks/
    │   ├── useLocalStorage.js     # Persistent state hook
    │   ├── useComplaints.js       # All complaint CRUD + SLA checker
    │   ├── useAuth.js             # Login/logout + user management
    │   └── useToast.js            # Toast notification system
    └── components/
        ├── shared/
        │   ├── index.jsx          # Shared UI: badges, modals, cards, inputs
        │   ├── Sidebar.jsx        # Left navigation
        │   └── TopBar.jsx         # Header + notifications bell
        ├── auth/
        │   └── LoginPage.jsx
        ├── dashboard/
        │   └── DashboardPage.jsx  # KPIs, region bars, type breakdown, recent table
        ├── complaints/
        │   ├── ComplaintsPage.jsx # List with filters, pagination, CSV export
        │   ├── ComplaintDetail.jsx# Full detail, FSR, repair log, timeline
        │   └── LogComplaintPage.jsx# New complaint form
        ├── workshop/
        │   └── WorkshopPage.jsx   # Repair jobs + inline log entry
        ├── users/
        │   └── UsersPage.jsx      # User management + add/edit modal
        ├── reports/
        │   └── ReportsPage.jsx    # 7 tabs: summary, FE perf, region, SLA, escalations
        └── settings/
            └── SettingsPage.jsx   # SLA config, notifications, data reset
```

---

## Path Aliases

The `@/` alias resolves to `src/`. Example:
```js
import { can } from '@/utils/helpers'
import { btn } from '@/components/shared'
```
Configured in `vite.config.js`.

---

## Where Data Lives

| Storage | Contents |
|---------|----------|
| Supabase `complaints` table | All complaints — synced live to every user |
| Supabase `users` table | All users — synced live to every user |
| Supabase `dropdown_options` table | Admin-editable Complaint Type / Product Category lists — synced live |
| Browser localStorage `cms_current_user` | This device's logged-in session only |
| Browser localStorage `cms_notifications` | This device's SLA alert bell only |

To bulk-reset the shared demo data back to seed values, re-run
[`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor (it drops and
recreates the tables). **Settings → Clear Local Session** only clears this device's login
session and cached preferences — it does not touch shared data.

---

## Roles & Access

| Role | Access |
|------|--------|
| Super Admin | Full access to everything |
| Coordinator | Log/assign complaints, all regions |
| Regional Manager | Assign FE, close complaints — own region only |
| Field Engineer | View + update own assigned complaints |
| Workshop Manager | Workshop view + repair logs |

---

## How the SLA System Works

1. Every complaint type has an SLA in hours (set in `src/data/constants.js`):
   - Unit Faulty / Hardware: **24h**
   - Battery / Installation / Connectivity: **48h**
   - Software / General: **72h**
   - Maintenance: **96h**

2. A timer runs every **30 seconds** (`App.jsx` → `checkSLABreaches`):
   - At **75% elapsed** → warning added to timeline, notification created
   - At **100% elapsed** → complaint auto-escalated, status set to `Escalated`

3. SLA bars shown on complaint list, dashboard, and detail view.

---

## Deploying to Production

### Option A — Vercel (Recommended, free)
```bash
npm install -g vercel
vercel
```
Vercel builds a static site, so it never sees your Supabase credentials at build time —
you must add them as **Environment Variables** in the Vercel project (Settings →
Environment Variables) before deploying, using the same names as `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If deploying via the Vercel dashboard instead of the CLI: import the GitHub repo, add the
two environment variables above, then deploy.

### Option B — Netlify
```bash
npm run build
# Upload the dist/ folder to Netlify drop
```

### Option C — Any static host
```bash
npm run build
# Serve the dist/ folder with any web server (nginx, Apache, Caddy)
```

### Important: SPA Routing
Since this is a Single Page App, configure your server to redirect all routes to `index.html`:

**Nginx:**
```nginx
location / {
  try_files $uri /index.html;
}
```

**Vercel/Netlify:** handled automatically.

---

## How Data Syncs (Supabase)

`complaints`, `users`, and `dropdown_options` all live in Supabase Postgres
(see [`supabase/schema.sql`](supabase/schema.sql)). Each hook (`useComplaints`,
`useAuth`, `useDropdownConfig`) loads its table once on mount, then subscribes to a
Supabase Realtime channel (`postgres_changes`) — so when any client inserts/updates a
row, every other open browser receives the change over a websocket and updates its UI,
usually within a second, with no refresh needed.

`cms_current_user` (the logged-in session) and `cms_notifications` (the alert bell) stay
in each browser's localStorage on purpose — a login session and a notification feed are
naturally per-device, not shared state.

### Still worth hardening before a wider rollout
| Limitation | Why | Fix |
|------------|-----|-----|
| Passwords stored/checked in plain text | Kept the original demo's login flow as-is | Move to Supabase Auth with hashed passwords |
| Anon key has full read/write on all tables | No per-role Row Level Security yet | Add RLS policies once real Supabase Auth is wired up |
| File uploads stored as base64 inside JSONB columns | Simple, no extra setup | Move to Supabase Storage for larger files |
| Email notifications are simulated (in-app only) | Out of current scope | SendGrid/Resend integration |
| CSV only (no Excel/PDF export) | Out of current scope | Backend export endpoint |

---

## Customising SLA Hours

Edit `src/data/constants.js`:
```js
export const SLA_HOURS = {
  'Unit Faulty':          24,   // ← change these
  'Battery Issue':        48,
  'General Query':        72,
  'Maintenance Request':  96,
  // ...
}
```

---

## Adding a New Region

1. Add to `REGIONS` array in `src/data/constants.js`
2. Add colour entry to `REGION_META`
3. Update complaint ID prefix logic in `src/utils/helpers.js` → `genComplaintId()`

---

## Support & Handover

**System built by:** CMS Development Team  
**Version:** 1.0  
**Stack:** React 18, Vite 5, React Router 6, localStorage persistence  
**Contact:** Raise an issue or contact the development team for backend integration support.
