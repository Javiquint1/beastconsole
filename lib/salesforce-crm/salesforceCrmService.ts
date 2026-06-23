import { demoSalesforceAccounts, demoSalesforceActivities, demoSalesforceContacts, demoSalesforceLeads, demoSalesforceOpportunities, demoSalesforceTasks } from "./mock-data";
import type { SalesforceAccount, SalesforceActivity, SalesforceContact, SalesforceLead, SalesforceOpportunity, SalesforceSummary, SalesforceTask } from "./types";

const leads = new Map<string, SalesforceLead>();
const accounts = new Map<string, SalesforceAccount>();
const contacts = new Map<string, SalesforceContact>();
const opportunities = new Map<string, SalesforceOpportunity>();
const tasks = new Map<string, SalesforceTask>();
const activities = new Map<string, SalesforceActivity>();

export function getSalesforceCrmDashboard(clientId: string) {
  const clientLeads = getSalesforceLeads(clientId);
  const clientAccounts = getSalesforceAccounts(clientId);
  const clientContacts = getSalesforceContacts(clientId);
  const clientOpportunities = getSalesforceOpportunities(clientId);
  const clientTasks = getSalesforceTasks(clientId);
  const clientActivities = getSalesforceActivities(clientId);

  if (!clientLeads.length && !clientOpportunities.length) {
    const demo = getDemoSalesforceCrmData(clientId);
    return { ...demo, summary: summarize(demo.leads, demo.opportunities), demoMode: true };
  }

  return {
    leads: clientLeads,
    accounts: clientAccounts,
    contacts: clientContacts,
    opportunities: clientOpportunities,
    tasks: clientTasks,
    activities: clientActivities,
    summary: summarize(clientLeads, clientOpportunities),
    demoMode: false
  };
}

export const getSalesforceLeads = (clientId: string) => Array.from(leads.values()).filter((item) => item.clientId === clientId);
export const getSalesforceAccounts = (clientId: string) => Array.from(accounts.values()).filter((item) => item.clientId === clientId);
export const getSalesforceContacts = (clientId: string) => Array.from(contacts.values()).filter((item) => item.clientId === clientId);
export const getSalesforceOpportunities = (clientId: string) => Array.from(opportunities.values()).filter((item) => item.clientId === clientId);
export const getSalesforceTasks = (clientId: string) => Array.from(tasks.values()).filter((item) => item.clientId === clientId);
export const getSalesforceActivities = (clientId: string) => Array.from(activities.values()).filter((item) => item.clientId === clientId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

export function createSalesforceLead(clientId: string, data: Partial<SalesforceLead>) {
  const now = new Date().toISOString();
  const lead: SalesforceLead = {
    id: `salesforce-lead-${Date.now()}`,
    clientId,
    firstName: data.firstName || "New",
    lastName: data.lastName || "Lead",
    company: data.company || "Unassigned Account",
    email: data.email || "",
    phone: data.phone || "",
    leadSource: data.leadSource || "Manual Entry",
    status: data.status || "New",
    createdAt: now,
    updatedAt: now
  };
  leads.set(lead.id, lead);
  createActivity(clientId, "Lead Created", `${lead.firstName} ${lead.lastName} entered Salesforce from ${lead.leadSource}.`);
  return lead;
}

export function createSalesforceOpportunity(clientId: string, data: Partial<SalesforceOpportunity>) {
  const now = new Date().toISOString();
  const opportunity: SalesforceOpportunity = {
    id: `salesforce-opportunity-${Date.now()}`,
    clientId,
    accountId: data.accountId || "",
    contactId: data.contactId || "",
    opportunityName: data.opportunityName || "New Salesforce opportunity",
    amount: Number(data.amount || 0),
    stage: data.stage || "Prospecting",
    probability: Number(data.probability || 10),
    leadSource: data.leadSource || "Manual Entry",
    closeDate: data.closeDate || now.slice(0, 10),
    createdAt: now,
    updatedAt: now
  };
  opportunities.set(opportunity.id, opportunity);
  createActivity(clientId, "Opportunity Updated", `${opportunity.opportunityName} opened in ${opportunity.stage}.`);
  return opportunity;
}

export function createSalesforceTask(clientId: string, data: Partial<SalesforceTask>) {
  const now = new Date().toISOString();
  const task: SalesforceTask = {
    id: `salesforce-task-${Date.now()}`,
    clientId,
    title: data.title || "Follow up on Salesforce opportunity",
    owner: data.owner || "Admin",
    dueDate: data.dueDate || now.slice(0, 10),
    status: data.status || "Open",
    relatedOpportunityId: data.relatedOpportunityId,
    relatedLeadId: data.relatedLeadId,
    createdAt: now,
    updatedAt: now
  };
  tasks.set(task.id, task);
  createActivity(clientId, "Task Created", `${task.title} assigned to ${task.owner}.`);
  return task;
}

function createActivity(clientId: string, type: SalesforceActivity["type"], description: string) {
  const activity: SalesforceActivity = { id: `salesforce-activity-${Date.now()}`, clientId, type, description, occurredAt: new Date().toISOString() };
  activities.set(activity.id, activity);
  return activity;
}

function getDemoSalesforceCrmData(clientId: string) {
  return {
    leads: demoSalesforceLeads.map((item) => ({ ...item, clientId })),
    accounts: demoSalesforceAccounts.map((item) => ({ ...item, clientId })),
    contacts: demoSalesforceContacts.map((item) => ({ ...item, clientId })),
    opportunities: demoSalesforceOpportunities.map((item) => ({ ...item, clientId })),
    tasks: demoSalesforceTasks.map((item) => ({ ...item, clientId })),
    activities: demoSalesforceActivities.map((item) => ({ ...item, clientId }))
  };
}

function summarize(leadList: SalesforceLead[], opportunityList: SalesforceOpportunity[]): SalesforceSummary {
  const month = new Date().toISOString().slice(0, 7);
  const openStages = new Set(["Prospecting", "Qualification", "Proposal", "Negotiation"]);
  const openOpportunities = opportunityList.filter((item) => openStages.has(item.stage));
  const stageCounts = opportunityList.reduce<Record<string, { count: number; value: number }>>((counts, opportunity) => {
    const current = counts[opportunity.stage] || { count: 0, value: 0 };
    counts[opportunity.stage] = { count: current.count + 1, value: current.value + opportunity.amount };
    return counts;
  }, {});
  const sourceCounts = leadList.reduce<Record<string, number>>((counts, lead) => {
    counts[lead.leadSource] = (counts[lead.leadSource] || 0) + 1;
    return counts;
  }, {});

  return {
    newLeads: leadList.filter((lead) => lead.createdAt.startsWith(month)).length,
    openOpportunities: openOpportunities.length,
    pipelineValue: openOpportunities.reduce((sum, opportunity) => sum + opportunity.amount, 0),
    revenueForecast: openOpportunities.reduce((sum, opportunity) => sum + opportunity.amount * (opportunity.probability / 100), 0),
    closedWonDeals: opportunityList.filter((opportunity) => opportunity.stage === "Closed Won").length,
    closedLostDeals: opportunityList.filter((opportunity) => opportunity.stage === "Closed Lost").length,
    closedWonRevenue: opportunityList.filter((opportunity) => opportunity.stage === "Closed Won").reduce((sum, opportunity) => sum + opportunity.amount, 0),
    closedLostRevenue: opportunityList.filter((opportunity) => opportunity.stage === "Closed Lost").reduce((sum, opportunity) => sum + opportunity.amount, 0),
    dealsByStage: Object.entries(stageCounts).map(([stage, data]) => ({ stage, count: data.count, value: data.value })),
    leadSources: Object.entries(sourceCounts).map(([source, count]) => ({ source, count }))
  };
}
