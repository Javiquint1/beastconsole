import type { SalesforceAccount, SalesforceActivity, SalesforceContact, SalesforceLead, SalesforceOpportunity, SalesforceTask } from "./types";

const now = "2026-06-22T12:00:00.000Z";

export const demoSalesforceLeads: SalesforceLead[] = [
  { id: "sf-lead-ava", clientId: "demo", firstName: "Ava", lastName: "Chen", company: "Orion Enterprise Health", email: "ava.chen@orionhealth.test", phone: "(555) 210-7801", leadSource: "LinkedIn Ads", status: "Qualified", createdAt: "2026-06-03T09:10:00.000Z", updatedAt: now },
  { id: "sf-lead-noah", clientId: "demo", firstName: "Noah", lastName: "Singh", company: "Pinnacle Benefits Group", email: "noah@pinnaclebenefits.test", phone: "(555) 219-5031", leadSource: "Referral", status: "Working", createdAt: "2026-06-11T15:40:00.000Z", updatedAt: now },
  { id: "sf-lead-maya", clientId: "demo", firstName: "Maya", lastName: "Rivera", company: "Summit Care Network", email: "maya@summitcare.test", phone: "(555) 224-9150", leadSource: "Website Form", status: "New", createdAt: "2026-06-18T12:25:00.000Z", updatedAt: now }
];

export const demoSalesforceAccounts: SalesforceAccount[] = [
  { id: "sf-account-orion", clientId: "demo", name: "Orion Enterprise Health", industry: "Healthcare", annualRevenue: 48000000, owner: "Morgan Lee", createdAt: "2026-06-04T10:00:00.000Z", updatedAt: now },
  { id: "sf-account-pinnacle", clientId: "demo", name: "Pinnacle Benefits Group", industry: "Insurance", annualRevenue: 22000000, owner: "Morgan Lee", createdAt: "2026-06-12T10:30:00.000Z", updatedAt: now },
  { id: "sf-account-summit", clientId: "demo", name: "Summit Care Network", industry: "Healthcare", annualRevenue: 31000000, owner: "Admin", createdAt: "2026-06-18T12:25:00.000Z", updatedAt: now }
];

export const demoSalesforceContacts: SalesforceContact[] = [
  { id: "sf-contact-ava", clientId: "demo", accountId: "sf-account-orion", firstName: "Ava", lastName: "Chen", title: "VP Growth", email: "ava.chen@orionhealth.test", phone: "(555) 210-7801", createdAt: "2026-06-04T10:05:00.000Z", updatedAt: now },
  { id: "sf-contact-noah", clientId: "demo", accountId: "sf-account-pinnacle", firstName: "Noah", lastName: "Singh", title: "Revenue Operations Director", email: "noah@pinnaclebenefits.test", phone: "(555) 219-5031", createdAt: "2026-06-12T10:35:00.000Z", updatedAt: now },
  { id: "sf-contact-maya", clientId: "demo", accountId: "sf-account-summit", firstName: "Maya", lastName: "Rivera", title: "Chief Marketing Officer", email: "maya@summitcare.test", phone: "(555) 224-9150", createdAt: "2026-06-18T12:30:00.000Z", updatedAt: now }
];

export const demoSalesforceOpportunities: SalesforceOpportunity[] = [
  { id: "sf-opp-orion", clientId: "demo", accountId: "sf-account-orion", contactId: "sf-contact-ava", opportunityName: "Enterprise patient acquisition rollout", amount: 148000, stage: "Negotiation", probability: 70, leadSource: "LinkedIn Ads", closeDate: "2026-07-15", createdAt: "2026-06-04T11:00:00.000Z", updatedAt: now },
  { id: "sf-opp-pinnacle", clientId: "demo", accountId: "sf-account-pinnacle", contactId: "sf-contact-noah", opportunityName: "Regional benefits lead engine", amount: 86000, stage: "Proposal", probability: 55, leadSource: "Referral", closeDate: "2026-07-03", createdAt: "2026-06-12T11:20:00.000Z", updatedAt: now },
  { id: "sf-opp-summit", clientId: "demo", accountId: "sf-account-summit", contactId: "sf-contact-maya", opportunityName: "Multi-location revenue attribution", amount: 124000, stage: "Qualification", probability: 35, leadSource: "Website Form", closeDate: "2026-08-01", createdAt: "2026-06-18T13:00:00.000Z", updatedAt: now },
  { id: "sf-opp-won", clientId: "demo", accountId: "sf-account-orion", contactId: "sf-contact-ava", opportunityName: "Pilot revenue dashboard", amount: 42000, stage: "Closed Won", probability: 100, leadSource: "LinkedIn Ads", closeDate: "2026-06-14", createdAt: "2026-05-20T09:00:00.000Z", updatedAt: now },
  { id: "sf-opp-lost", clientId: "demo", accountId: "sf-account-pinnacle", contactId: "sf-contact-noah", opportunityName: "Legacy CRM migration audit", amount: 28000, stage: "Closed Lost", probability: 0, leadSource: "Outbound", closeDate: "2026-06-10", createdAt: "2026-05-27T09:00:00.000Z", updatedAt: now }
];

export const demoSalesforceTasks: SalesforceTask[] = [
  { id: "sf-task-orion", clientId: "demo", title: "Send negotiation packet to Ava Chen", owner: "Morgan Lee", dueDate: "2026-06-24", status: "Open", relatedOpportunityId: "sf-opp-orion", createdAt: "2026-06-21T10:00:00.000Z", updatedAt: now },
  { id: "sf-task-pinnacle", clientId: "demo", title: "Review proposal numbers with finance", owner: "Admin", dueDate: "2026-06-25", status: "Open", relatedOpportunityId: "sf-opp-pinnacle", createdAt: "2026-06-20T14:00:00.000Z", updatedAt: now },
  { id: "sf-task-summit", clientId: "demo", title: "Qualify Summit buying committee", owner: "Morgan Lee", dueDate: "2026-06-27", status: "Open", relatedLeadId: "sf-lead-maya", relatedOpportunityId: "sf-opp-summit", createdAt: "2026-06-18T13:10:00.000Z", updatedAt: now }
];

export const demoSalesforceActivities: SalesforceActivity[] = [
  { id: "sf-activity-1", clientId: "demo", type: "Opportunity Updated", description: "Enterprise patient acquisition rollout moved to Negotiation.", occurredAt: "2026-06-21T10:00:00.000Z" },
  { id: "sf-activity-2", clientId: "demo", type: "Email", description: "Proposal follow-up sent to Pinnacle Benefits Group.", occurredAt: "2026-06-20T14:20:00.000Z" },
  { id: "sf-activity-3", clientId: "demo", type: "Lead Created", description: "Maya Rivera entered Salesforce from Website Form.", occurredAt: "2026-06-18T12:25:00.000Z" },
  { id: "sf-activity-4", clientId: "demo", type: "Opportunity Updated", description: "Pilot revenue dashboard marked Closed Won.", occurredAt: "2026-06-14T16:30:00.000Z" }
];
