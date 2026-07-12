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
