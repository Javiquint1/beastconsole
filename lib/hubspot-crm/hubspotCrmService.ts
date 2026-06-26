import { getSql } from "@/lib/db/client";
import { demoHubSpotActivities, demoHubSpotCompanies, demoHubSpotContacts, demoHubSpotDeals, demoHubSpotTasks } from "./mock-data";
import type { HubSpotActivity, HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotSummary, HubSpotTask } from "./types";

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

async function createActivity(clientId: string, type: HubSpotActivity["type"], description: string) {
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
