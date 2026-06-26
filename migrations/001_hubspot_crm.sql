create table if not exists hubspot_companies (
  id text primary key,
  client_id text not null,
  name text not null,
  domain text not null default '',
  industry text not null default '',
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hubspot_companies_client_id_idx
  on hubspot_companies (client_id);

create table if not exists hubspot_contacts (
  id text primary key,
  client_id text not null,
  first_name text not null,
  last_name text not null,
  email text not null default '',
  phone text not null default '',
  company_id text not null default '',
  lifecycle_stage text not null default 'Lead',
  lead_source text not null default 'Manual Entry',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hubspot_contacts_client_id_idx
  on hubspot_contacts (client_id);

create table if not exists hubspot_deals (
  id text primary key,
  client_id text not null,
  deal_name text not null,
  company_id text not null default '',
  contact_id text not null default '',
  amount numeric(12, 2) not null default 0,
  pipeline_stage text not null default 'New Lead',
  lead_source text not null default 'Manual Entry',
  close_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hubspot_deals_client_id_idx
  on hubspot_deals (client_id);

create table if not exists hubspot_tasks (
  id text primary key,
  client_id text not null,
  title text not null,
  owner text not null default 'Admin',
  due_date date not null default current_date,
  status text not null default 'Open',
  related_contact_id text,
  related_deal_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hubspot_tasks_client_id_idx
  on hubspot_tasks (client_id);

create table if not exists hubspot_activities (
  id text primary key,
  client_id text not null,
  type text not null,
  description text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists hubspot_activities_client_id_occurred_at_idx
  on hubspot_activities (client_id, occurred_at desc);
