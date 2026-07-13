# Globe Manual Vercel Deployment

## Upload

Upload/import the full project folder or zip. Do not upload local `.env.local`, `.next`, or `node_modules`.

## Vercel Project Settings

- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Install Command: `cd ../.. && pnpm install --frozen-lockfile`
- Build Command: `cd ../.. && pnpm --filter @globe/web build`
- Development Command: `cd ../.. && pnpm --filter @globe/web dev`
- Output Directory: `.next`

The file `apps/web/vercel.json` contains these commands for convenience.

If Vercel shows `No Output Directory named "public" found`, open Project Settings > Build & Development Settings and change:

- Framework Preset: `Next.js`
- Output Directory: `.next`

Do not use `public` as the output directory for this app.

## Required Environment Variables

Set these in Vercel Project Settings > Environment Variables:

```bash
NEXTAUTH_URL=https://www.globe.beer
NEXTAUTH_SECRET=
GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_REFERER=https://www.globe.beer
GOOGLE_SHEETS_TARGET_SPREADSHEET_ID=
```

For persistent storage, also set:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional Google Sheets service-account variables, once Sheets export is fully enabled:

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
```

## Database

Run this schema in Supabase SQL editor:

```sql
create table if not exists leads (
  id text primary key,
  name text not null,
  category text,
  address text,
  phone text unique not null,
  email text,
  website text,
  maps text,
  source text not null,
  agent text,
  lead_status text not null default 'Not Contacted',
  actionable text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leads add column if not exists actionable text;

create table if not exists manual_users (
  id text primary key,
  name text not null,
  email text not null unique,
  mobile text not null,
  username text not null unique,
  password_hash text not null,
  role text not null default 'Operator',
  created_at timestamptz not null default now()
);

create table if not exists exports (
  id text primary key,
  name text not null,
  export_type text not null,
  rows integer not null default 0,
  destination text not null,
  status text not null,
  created_at timestamptz not null default now()
);
```

## After Deploy

1. Open `https://www.globe.beer/business-crawl`.
2. Run a Google Maps search.
3. Confirm leads show phone numbers.
4. Save leads.
5. Export Report.
