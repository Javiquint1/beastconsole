import { getSql } from "@/lib/db/client";
import { demoHubSpotActivities, demoHubSpotCompanies, demoHubSpotContacts, demoHubSpotDeals, demoHubSpotTasks } from "./mock-data";
import type { HubSpotActivity, HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotSummary, HubSpotTask } from "./types";

let schemaReady: Promise<void> | null = null;

export async function getHubSpotCrmDashboard(clientId: string) {
  const [clientContacts, clientCompanies, clientDeals, clientTasks, clientActivities] = await Promise.all([
    getHubSpotContacts(clientId),
    getHubSpotCompanies(clientId),
    getHubSpotDeals(clientId),
    getHubSpotTasks(clientId),
    getHubSpotActivities(clientId)
  ]);

  if (!clientContacts.length && !clientDeals.length) {
    const demo = getDemoHubSpotCrmData(clientId);
    return { ...demo, summary: summarize(demo.contacts, demo.deals), demoMode: true };
  }

  return {
    contacts: clientContacts,
    companies: clientCompanies,
    deals: clientDeals,
    tasks: clientTasks,
    activities: clientActivities,
    summary: summarize(clientContacts, clientDeals),
    demoMode: false
  };
}

export async function getHubSpotContacts(clientId: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const rows = await sql`
    select
      id,
      client_id,
      first_name,
      last_name,
      email,
      phone,
      company_id,
      lifecycle_stage,
      lead_source,
      last_activity_at,
      created_at,
      updated_at
    from hubspot_contacts
    where client_id = ${clientId}
    order by created_at desc
  `;
  return rows.map(mapContact);
}

export async function getHubSpotCompanies(clientId: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const rows = await sql`
    select
      id,
      client_id,
      name,
      domain,
      industry,
      city,
      created_at,
      updated_at
    from hubspot_companies
    where client_id = ${clientId}
    order by name asc
  `;
  return rows.map(mapCompany);
}

export async function getHubSpotDeals(clientId: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const rows = await sql`
    select
      id,
      client_id,
      deal_name,
      company_id,
      contact_id,
      amount,
      pipeline_stage,
      lead_source,
      close_date,
      created_at,
      updated_at
    from hubspot_deals
    where client_id = ${clientId}
    order by created_at desc
  `;
  return rows.map(mapDeal);
}

export async function getHubSpotTasks(clientId: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const rows = await sql`
    select
      id,
      client_id,
      title,
      owner,
      due_date,
      status,
      related_contact_id,
      related_deal_id,
      created_at,
      updated_at
    from hubspot_tasks
    where client_id = ${clientId}
    order by due_date asc, created_at desc
  `;
  return rows.map(mapTask);
}

export async function getHubSpotActivities(clientId: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const rows = await sql`
    select
      id,
      client_id,
      type,
      description,
      occurred_at
    from hubspot_activities
    where client_id = ${clientId}
    order by occurred_at desc
  `;
  return rows.map(mapActivity);
}

export async function createHubSpotContact(clientId: string, data: Partial<HubSpotContact>) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const id = `hubspot-contact-${Date.now()}`;
  const rows = await sql`
    insert into hubspot_contacts (
      id,
      client_id,
      first_name,
      last_name,
      email,
      phone,
      company_id,
      lifecycle_stage,
      lead_source,
      last_activity_at,
      created_at,
      updated_at
    )
    values (
      ${id},
      ${clientId},
      ${data.firstName || "New"},
      ${data.lastName || "Lead"},
      ${data.email || ""},
      ${data.phone || ""},
      ${data.companyId || ""},
      ${data.lifecycleStage || "Lead"},
      ${data.leadSource || "Manual Entry"},
      ${now},
      ${now},
      ${now}
    )
    returning
      id,
      client_id,
      first_name,
      last_name,
      email,
      phone,
      company_id,
      lifecycle_stage,
      lead_source,
      last_activity_at,
      created_at,
      updated_at
  `;
  const contact = mapContact(rows[0]);
  await createActivity(clientId, "Contact Created", `${contact.firstName} ${contact.lastName} was created from ${contact.leadSource}.`);
  return contact;
}

export async function createHubSpotDeal(clientId: string, data: Partial<HubSpotDeal>) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const id = `hubspot-deal-${Date.now()}`;
  const rows = await sql`
    insert into hubspot_deals (
      id,
      client_id,
      deal_name,
      company_id,
      contact_id,
      amount,
      pipeline_stage,
      lead_source,
      close_date,
      created_at,
      updated_at
    )
    values (
      ${id},
      ${clientId},
      ${data.dealName || "New CRM deal"},
      ${data.companyId || ""},
      ${data.contactId || ""},
      ${Number(data.amount || 0)},
      ${data.pipelineStage || "New Lead"},
      ${data.leadSource || "Manual Entry"},
      ${data.closeDate || now.slice(0, 10)},
      ${now},
      ${now}
    )
    returning
      id,
      client_id,
      deal_name,
      company_id,
      contact_id,
      amount,
      pipeline_stage,
      lead_source,
      close_date,
      created_at,
      updated_at
  `;
  const deal = mapDeal(rows[0]);
  await createActivity(clientId, "Deal Updated", `${deal.dealName} opened in ${deal.pipelineStage}.`);
  return deal;
}

export async function createHubSpotTask(clientId: string, data: Partial<HubSpotTask>) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const now = new Date().toISOString();
  const id = `hubspot-task-${Date.now()}`;
  const rows = await sql`
    insert into hubspot_tasks (
      id,
      client_id,
      title,
      owner,
      due_date,
      status,
      related_contact_id,
      related_deal_id,
      created_at,
      updated_at
    )
    values (
      ${id},
      ${clientId},
      ${data.title || "Follow up with lead"},
      ${data.owner || "Admin"},
      ${data.dueDate || now.slice(0, 10)},
      ${data.status || "Open"},
      ${data.relatedContactId || null},
      ${data.relatedDealId || null},
      ${now},
      ${now}
    )
    returning
      id,
      client_id,
      title,
      owner,
      due_date,
      status,
      related_contact_id,
      related_deal_id,
      created_at,
      updated_at
  `;
  const task = mapTask(rows[0]);
  await createActivity(clientId, "Task Created", `${task.title} assigned to ${task.owner}.`);
  return task;
}

export async function syncHubSpotCrmRecords(clientId: string, data: {
  companies: HubSpotCompany[];
  contacts: HubSpotContact[];
  deals: HubSpotDeal[];
}) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const now = new Date().toISOString();

  for (const company of data.companies) {
    await sql`
      insert into hubspot_companies (
        id,
        client_id,
        name,
        domain,
        industry,
        city,
        created_at,
        updated_at
      )
      values (
        ${company.id},
        ${clientId},
        ${company.name},
        ${company.domain},
        ${company.industry},
        ${company.city},
        ${company.createdAt || now},
        ${company.updatedAt || now}
      )
      on conflict (id)
      do update set
        client_id = excluded.client_id,
        name = excluded.name,
        domain = excluded.domain,
        industry = excluded.industry,
        city = excluded.city,
        updated_at = excluded.updated_at
    `;
  }

  for (const contact of data.contacts) {
    await sql`
      insert into hubspot_contacts (
        id,
        client_id,
        first_name,
        last_name,
        email,
        phone,
        company_id,
        lifecycle_stage,
        lead_source,
        last_activity_at,
        created_at,
        updated_at
      )
      values (
        ${contact.id},
        ${clientId},
        ${contact.firstName},
        ${contact.lastName},
        ${contact.email},
        ${contact.phone},
        ${contact.companyId},
        ${contact.lifecycleStage},
        ${contact.leadSource},
        ${contact.lastActivityAt || now},
        ${contact.createdAt || now},
        ${contact.updatedAt || now}
      )
      on conflict (id)
      do update set
        client_id = excluded.client_id,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        phone = excluded.phone,
        company_id = excluded.company_id,
        lifecycle_stage = excluded.lifecycle_stage,
        lead_source = excluded.lead_source,
        last_activity_at = excluded.last_activity_at,
        updated_at = excluded.updated_at
    `;
  }

  for (const deal of data.deals) {
    await sql`
      insert into hubspot_deals (
        id,
        client_id,
        deal_name,
        company_id,
        contact_id,
        amount,
        pipeline_stage,
        lead_source,
        close_date,
        created_at,
        updated_at
      )
      values (
        ${deal.id},
        ${clientId},
        ${deal.dealName},
        ${deal.companyId},
        ${deal.contactId},
        ${deal.amount},
        ${deal.pipelineStage},
        ${deal.leadSource},
        ${deal.closeDate || now.slice(0, 10)},
        ${deal.createdAt || now},
        ${deal.updatedAt || now}
      )
      on conflict (id)
      do update set
        client_id = excluded.client_id,
        deal_name = excluded.deal_name,
        company_id = excluded.company_id,
        contact_id = excluded.contact_id,
        amount = excluded.amount,
        pipeline_stage = excluded.pipeline_stage,
        lead_source = excluded.lead_source,
        close_date = excluded.close_date,
        updated_at = excluded.updated_at
    `;
  }

  await createActivity(
    clientId,
    "Note",
    `Synced ${data.contacts.length} contacts, ${data.companies.length} companies, and ${data.deals.length} deals from HubSpot.`
  );

  return {
    contacts: data.contacts.length,
    companies: data.companies.length,
    deals: data.deals.length
  };
}

async function createActivity(clientId: string, type: HubSpotActivity["type"], description: string) {
  await ensureHubSpotSchema();
  const sql = getSql();
  const id = `hubspot-activity-${Date.now()}`;
  const rows = await sql`
    insert into hubspot_activities (
      id,
      client_id,
      type,
      description,
      occurred_at
    )
    values (
      ${id},
      ${clientId},
      ${type},
      ${description},
      ${new Date().toISOString()}
    )
    returning
      id,
      client_id,
      type,
      description,
      occurred_at
  `;
  return mapActivity(rows[0]);
}

async function ensureHubSpotSchema() {
  if (!schemaReady) schemaReady = createHubSpotSchema();
  return schemaReady;
}

async function createHubSpotSchema() {
  const sql = getSql();

  await sql`
    create table if not exists hubspot_companies (
      id text primary key,
      client_id text not null,
      name text not null,
      domain text not null default '',
      industry text not null default '',
      city text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists hubspot_companies_client_id_idx on hubspot_companies (client_id)`;

  await sql`
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
    )
  `;
  await sql`create index if not exists hubspot_contacts_client_id_idx on hubspot_contacts (client_id)`;

  await sql`
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
    )
  `;
  await sql`create index if not exists hubspot_deals_client_id_idx on hubspot_deals (client_id)`;

  await sql`
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
    )
  `;
  await sql`create index if not exists hubspot_tasks_client_id_idx on hubspot_tasks (client_id)`;

  await sql`
    create table if not exists hubspot_activities (
      id text primary key,
      client_id text not null,
      type text not null,
      description text not null,
      occurred_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists hubspot_activities_client_id_occurred_at_idx on hubspot_activities (client_id, occurred_at desc)`;
}

function getDemoHubSpotCrmData(clientId: string) {
  return {
    contacts: demoHubSpotContacts.map((item) => ({ ...item, clientId })),
    companies: demoHubSpotCompanies.map((item) => ({ ...item, clientId })),
    deals: demoHubSpotDeals.map((item) => ({ ...item, clientId })),
    tasks: demoHubSpotTasks.map((item) => ({ ...item, clientId })),
    activities: demoHubSpotActivities.map((item) => ({ ...item, clientId }))
  };
}

function summarize(contactList: HubSpotContact[], dealList: HubSpotDeal[]): HubSpotSummary {
  const month = new Date().toISOString().slice(0, 7);
  const openStages = new Set(["New Lead", "Qualified", "Proposal Sent"]);
  const sourceCounts = contactList.reduce<Record<string, number>>((counts, contact) => {
    counts[contact.leadSource] = (counts[contact.leadSource] || 0) + 1;
    return counts;
  }, {});

  return {
    newContactsThisMonth: contactList.filter((contact) => contact.createdAt.startsWith(month)).length,
    openDeals: dealList.filter((deal) => openStages.has(deal.pipelineStage)).length,
    wonDeals: dealList.filter((deal) => deal.pipelineStage === "Won").length,
    lostDeals: dealList.filter((deal) => deal.pipelineStage === "Lost").length,
    totalPipelineValue: dealList.filter((deal) => openStages.has(deal.pipelineStage)).reduce((sum, deal) => sum + deal.amount, 0),
    leadsBySource: Object.entries(sourceCounts).map(([source, count]) => ({ source, count }))
  };
}

function mapContact(row: Record<string, unknown>): HubSpotContact {
  return {
    id: String(row.id || ""),
    clientId: String(row.client_id || ""),
    firstName: String(row.first_name || ""),
    lastName: String(row.last_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    companyId: String(row.company_id || ""),
    lifecycleStage: String(row.lifecycle_stage || "Lead") as HubSpotContact["lifecycleStage"],
    leadSource: String(row.lead_source || "Manual Entry"),
    lastActivityAt: toIso(row.last_activity_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapCompany(row: Record<string, unknown>): HubSpotCompany {
  return {
    id: String(row.id || ""),
    clientId: String(row.client_id || ""),
    name: String(row.name || ""),
    domain: String(row.domain || ""),
    industry: String(row.industry || ""),
    city: String(row.city || ""),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapDeal(row: Record<string, unknown>): HubSpotDeal {
  return {
    id: String(row.id || ""),
    clientId: String(row.client_id || ""),
    dealName: String(row.deal_name || ""),
    companyId: String(row.company_id || ""),
    contactId: String(row.contact_id || ""),
    amount: Number(row.amount || 0),
    pipelineStage: String(row.pipeline_stage || "New Lead") as HubSpotDeal["pipelineStage"],
    leadSource: String(row.lead_source || "Manual Entry"),
    closeDate: toDateOnly(row.close_date),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapTask(row: Record<string, unknown>): HubSpotTask {
  return {
    id: String(row.id || ""),
    clientId: String(row.client_id || ""),
    title: String(row.title || ""),
    owner: String(row.owner || ""),
    dueDate: toDateOnly(row.due_date),
    status: String(row.status || "Open") as HubSpotTask["status"],
    relatedContactId: nullableString(row.related_contact_id),
    relatedDealId: nullableString(row.related_deal_id),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapActivity(row: Record<string, unknown>): HubSpotActivity {
  return {
    id: String(row.id || ""),
    clientId: String(row.client_id || ""),
    type: String(row.type || "Note") as HubSpotActivity["type"],
    description: String(row.description || ""),
    occurredAt: toIso(row.occurred_at)
  };
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function toIso(value: unknown) {
  if (!value) return "";
  return new Date(String(value)).toISOString();
}

function toDateOnly(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
