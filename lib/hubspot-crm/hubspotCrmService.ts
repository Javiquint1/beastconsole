import { demoHubSpotActivities, demoHubSpotCompanies, demoHubSpotContacts, demoHubSpotDeals, demoHubSpotTasks } from "./mock-data";
import type { HubSpotActivity, HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotSummary, HubSpotTask } from "./types";

const contacts = new Map<string, HubSpotContact>();
const companies = new Map<string, HubSpotCompany>();
const deals = new Map<string, HubSpotDeal>();
const tasks = new Map<string, HubSpotTask>();
const activities = new Map<string, HubSpotActivity>();

export function getHubSpotCrmDashboard(clientId: string) {
  const clientContacts = getHubSpotContacts(clientId);
  const clientCompanies = getHubSpotCompanies(clientId);
  const clientDeals = getHubSpotDeals(clientId);
  const clientTasks = getHubSpotTasks(clientId);
  const clientActivities = getHubSpotActivities(clientId);

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

export const getHubSpotContacts = (clientId: string) => Array.from(contacts.values()).filter((item) => item.clientId === clientId);
export const getHubSpotCompanies = (clientId: string) => Array.from(companies.values()).filter((item) => item.clientId === clientId);
export const getHubSpotDeals = (clientId: string) => Array.from(deals.values()).filter((item) => item.clientId === clientId);
export const getHubSpotTasks = (clientId: string) => Array.from(tasks.values()).filter((item) => item.clientId === clientId);
export const getHubSpotActivities = (clientId: string) => Array.from(activities.values()).filter((item) => item.clientId === clientId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

export function createHubSpotContact(clientId: string, data: Partial<HubSpotContact>) {
  const now = new Date().toISOString();
  const contact: HubSpotContact = {
    id: `hubspot-contact-${Date.now()}`,
    clientId,
    firstName: data.firstName || "New",
    lastName: data.lastName || "Lead",
    email: data.email || "",
    phone: data.phone || "",
    companyId: data.companyId || "",
    lifecycleStage: data.lifecycleStage || "Lead",
    leadSource: data.leadSource || "Manual Entry",
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now
  };
  contacts.set(contact.id, contact);
  createActivity(clientId, "Contact Created", `${contact.firstName} ${contact.lastName} was created from ${contact.leadSource}.`);
  return contact;
}

export function createHubSpotDeal(clientId: string, data: Partial<HubSpotDeal>) {
  const now = new Date().toISOString();
  const deal: HubSpotDeal = {
    id: `hubspot-deal-${Date.now()}`,
    clientId,
    dealName: data.dealName || "New CRM deal",
    companyId: data.companyId || "",
    contactId: data.contactId || "",
    amount: Number(data.amount || 0),
    pipelineStage: data.pipelineStage || "New Lead",
    leadSource: data.leadSource || "Manual Entry",
    closeDate: data.closeDate || now.slice(0, 10),
    createdAt: now,
    updatedAt: now
  };
  deals.set(deal.id, deal);
  createActivity(clientId, "Deal Updated", `${deal.dealName} opened in ${deal.pipelineStage}.`);
  return deal;
}

export function createHubSpotTask(clientId: string, data: Partial<HubSpotTask>) {
  const now = new Date().toISOString();
  const task: HubSpotTask = {
    id: `hubspot-task-${Date.now()}`,
    clientId,
    title: data.title || "Follow up with lead",
    owner: data.owner || "Admin",
    dueDate: data.dueDate || now.slice(0, 10),
    status: data.status || "Open",
    relatedContactId: data.relatedContactId,
    relatedDealId: data.relatedDealId,
    createdAt: now,
    updatedAt: now
  };
  tasks.set(task.id, task);
  createActivity(clientId, "Task Created", `${task.title} assigned to ${task.owner}.`);
  return task;
}

function createActivity(clientId: string, type: HubSpotActivity["type"], description: string) {
  const activity: HubSpotActivity = { id: `hubspot-activity-${Date.now()}`, clientId, type, description, occurredAt: new Date().toISOString() };
  activities.set(activity.id, activity);
  return activity;
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
