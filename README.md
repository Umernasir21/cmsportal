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

### 2. Run development server
```bash
npm run dev
```
Opens at **http://localhost:3000**

### 3. Build for production
```bash
npm run build
```
Output goes to `dist/` — deploy this folder.

### 4. Preview production build locally
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

## localStorage Keys

All data is persisted in the browser's localStorage:

| Key | Contents |
|-----|----------|
| `cms_complaints` | Array of all complaints |
| `cms_users` | Array of all users |
| `cms_current_user` | Currently logged-in user object |
| `cms_notifications` | SLA alert notification array |

To reset all data: **Settings → Reset to Seed Data**, or clear localStorage manually.

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

## Swapping in a Real Backend

This demo uses **localStorage** for data persistence. For production, replace:

### 1. `src/hooks/useComplaints.js`
Replace `useLocalStorage` calls with `fetch()` or `axios` calls to your REST API:
```js
// Current (localStorage):
const [complaints, setComplaints] = useLocalStorage('cms_complaints', SEED_COMPLAINTS)

// Replace with (API):
const [complaints, setComplaints] = useState([])
useEffect(() => {
  fetch('/api/complaints').then(r => r.json()).then(setComplaints)
}, [])
```

### 2. `src/hooks/useAuth.js`
Replace password matching with a real `/api/auth/login` endpoint:
```js
// Replace the login() function body with:
const res = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  headers: { 'Content-Type': 'application/json' }
})
const data = await res.json()
if (data.token) {
  localStorage.setItem('cms_token', data.token)
  setCurrentUser(data.user)
  return { success: true }
}
return { success: false, error: data.error }
```

### Recommended Backend Stack
- **Node.js + Express** or **Django REST Framework**
- **PostgreSQL** database
- **JWT** for authentication
- **AWS S3** or **Cloudinary** for file attachments
- **NodeMailer** or **SendGrid** for email notifications

---

## Known Limitations (Current Demo)

| Limitation | Production Fix |
|------------|----------------|
| Data lost on localStorage clear | PostgreSQL backend |
| Passwords stored in plain text | Hashed passwords + JWT |
| File uploads are UI-only | S3/Cloudinary integration |
| Email notifications are simulated | SendGrid/NodeMailer |
| No real multi-user sync | WebSocket or polling |
| CSV only (no Excel/PDF export) | Backend export endpoint |

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
