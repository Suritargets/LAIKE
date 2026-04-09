# Forms + Admin Dashboard Design

## Context

The LAIKE/SurveyFlow landing page needs lead capture forms and an admin dashboard to manage submissions. Three form types (Early Access, Demo Request, Donate) open as modal popups. All submissions are stored in Neon Postgres and viewable in a protected admin dashboard with CSV export.

## Tech Stack

- **Neon Postgres** via Vercel Marketplace (auto-provisioned DATABASE_URL)
- **Drizzle ORM** for type-safe queries
- **JWT cookie** for admin session (env-based credentials)

## Database Schema

One table: `submissions`

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | auto-increment |
| name | varchar(255) | required |
| email | varchar(255) | required |
| company | varchar(255) | optional |
| phone | varchar(50) | optional |
| message | text | optional |
| category | varchar(20) | "early_access" / "demo" / "donate" |
| amount | integer | nullable, cents, for donations |
| created_at | timestamp | default now() |

## API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/submissions | public | Save form submission |
| POST | /api/admin/login | public | Admin login → set JWT cookie |
| GET | /api/admin/submissions | admin | List submissions (filter by ?category=) |
| GET | /api/admin/export | admin | Download CSV of filtered submissions |

## Modal Forms

### Shared FormModal component
- Framer Motion animated overlay (fade in) + panel (slide up)
- Close on backdrop click or X button
- Loading state on submit
- Success state with checkmark

### Early Access Form
- Trigger: "Aanmelden voor early access" buttons (hero CTA, CTA section)
- Fields: Naam*, Email*, Bedrijf, Rol (select: landmeter/developer/anders)
- Category: "early_access"

### Demo Form
- Trigger: "Demo aanvragen" button (CTA section)
- Fields: Naam*, Email*, Bedrijf*, Telefoon, Bericht
- Category: "demo"

### Donate Form
- Trigger: Donate tier buttons ($10/$50/$100/custom)
- Fields: Naam*, Email*, Bedrag (pre-filled from tier, editable), Bericht
- Category: "donate"
- Amount stored in cents

## Admin Dashboard (/admin)

### Login
- Simple form: username + password
- Validates against ADMIN_USER and ADMIN_PASS env vars
- Sets httpOnly JWT cookie (24h expiry)
- Redirects to dashboard

### Dashboard
- Tab filters: Alle | Early Access | Demo | Donatie
- Count badges on each tab
- Table: Naam, Email, Categorie, Bedrijf, Datum
- Search bar (filters client-side on name/email)
- "Export CSV" button downloads filtered results
- Logout button

## Environment Variables

```
DATABASE_URL=          # via Vercel Marketplace (Neon)
ADMIN_USER=admin
ADMIN_PASS=admin12345
JWT_SECRET=            # random 32-char string
```

## File Structure

```
app/
├── api/
│   ├── submissions/route.ts
│   └── admin/
│       ├── login/route.ts
│       ├── submissions/route.ts
│       └── export/route.ts
├── admin/
│   └── page.tsx
components/
├── FormModal.tsx
├── EarlyAccessModal.tsx
├── DemoModal.tsx
├── DonateModal.tsx
lib/
├── db.ts
├── schema.ts
├── auth.ts
```

## Verification

- [ ] Early Access form submits and appears in admin
- [ ] Demo form submits and appears in admin
- [ ] Donate form submits with correct amount
- [ ] Admin login works with env credentials
- [ ] Tab filtering works
- [ ] CSV export downloads correct data
- [ ] Unauthorized access to /admin redirects to login
- [ ] Modal animations work smoothly
