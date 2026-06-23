import type { HubSpotActivity, HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotTask } from "./types";

const now = "2026-06-22T12:00:00.000Z";

export const demoHubSpotCompanies: HubSpotCompany[] = [
  { id: "hs-company-bright-family", clientId: "demo", name: "Bright Family Dental", domain: "brightfamily.test", industry: "Healthcare", city: "Austin", createdAt: "2026-06-03T10:00:00.000Z", updatedAt: now },
  { id: "hs-company-smileworks", clientId: "demo", name: "SmileWorks Group", domain: "smileworks.test", industry: "Healthcare", city: "Dallas", createdAt: "2026-06-08T14:30:00.000Z", updatedAt: now },
  { id: "hs-company-ortho", clientId: "demo", name: "North Hills Orthodontics", domain: "northhillsortho.test", industry: "Healthcare", city: "Plano", createdAt: "2026-06-14T09:15:00.000Z", updatedAt: now }
];

export const demoHubSpotContacts: HubSpotContact[] = [
  { id: "hs-contact-elena", clientId: "demo", firstName: "Elena", lastName: "Parker", email: "elena@brightfamily.test", phone: "(555) 104-7721", companyId: "hs-company-bright-family", lifecycleStage: "Sales Qualified Lead", leadSource: "Google Ads", lastActivityAt: "2026-06-21T16:20:00.000Z", createdAt: "2026-06-02T11:05:00.000Z", updatedAt: now },
  { id: "hs-contact-marcus", clientId: "demo", firstName: "Marcus", lastName: "Reed", email: "marcus@smileworks.test", phone: "(555) 114-6132", companyId: "hs-company-smileworks", lifecycleStage: "Marketing Qualified Lead", leadSource: "Meta Ads", lastActivityAt: "2026-06-20T13:10:00.000Z", createdAt: "2026-06-10T13:10:00.000Z", updatedAt: now },
  { id: "hs-contact-priya", clientId: "demo", firstName: "Priya", lastName: "Shah", email: "priya@northhillsortho.test", phone: "(555) 118-3390", companyId: "hs-company-ortho", lifecycleStage: "Lead", leadSource: "Website Form", lastActivityAt: "2026-06-19T09:30:00.000Z", createdAt: "2026-06-18T09:30:00.000Z", updatedAt: now },
  { id: "hs-contact-jordan", clientId: "demo", firstName: "Jordan", lastName: "Miles", email: "jordan@smileworks.test", phone: "(555) 130-9088", companyId: "hs-company-smileworks", lifecycleStage: "Customer", leadSource: "Email Campaign", lastActivityAt: "2026-06-17T15:44:00.000Z", createdAt: "2026-05-28T12:00:00.000Z", updatedAt: now }
];

export const demoHubSpotDeals: HubSpotDeal[] = [
  { id: "hs-deal-emergency", clientId: "demo", dealName: "Emergency appointment lead package", companyId: "hs-company-bright-family", contactId: "hs-contact-elena", amount: 12400, pipelineStage: "Proposal Sent", leadSource: "Google Ads", closeDate: "2026-06-28", createdAt: "2026-06-04T10:00:00.000Z", updatedAt: now },
  { id: "hs-deal-retainer", clientId: "demo", dealName: "Monthly growth retainer", companyId: "hs-company-smileworks", contactId: "hs-contact-jordan", amount: 36000, pipelineStage: "Won", leadSource: "Email Campaign", closeDate: "2026-06-12", createdAt: "2026-05-28T12:00:00.000Z", updatedAt: now },
  { id: "hs-deal-consult", clientId: "demo", dealName: "New patient consult funnel", companyId: "hs-company-ortho", contactId: "hs-contact-priya", amount: 8400, pipelineStage: "Qualified", leadSource: "Website Form", closeDate: "2026-07-05", createdAt: "2026-06-18T09:30:00.000Z", updatedAt: now },
  { id: "hs-deal-lost", clientId: "demo", dealName: "Seasonal whitening campaign", companyId: "hs-company-smileworks", contactId: "hs-contact-marcus", amount: 5200, pipelineStage: "Lost", leadSource: "Meta Ads", closeDate: "2026-06-15", createdAt: "2026-06-01T08:15:00.000Z", updatedAt: now }
];

export const demoHubSpotTasks: HubSpotTask[] = [
  { id: "hs-task-elena", clientId: "demo", title: "Follow up on emergency package proposal", owner: "Morgan Lee", dueDate: "2026-06-24", status: "Open", relatedContactId: "hs-contact-elena", relatedDealId: "hs-deal-emergency", createdAt: "2026-06-21T16:30:00.000Z", updatedAt: now },
  { id: "hs-task-priya", clientId: "demo", title: "Send consult funnel case study", owner: "Morgan Lee", dueDate: "2026-06-25", status: "Open", relatedContactId: "hs-contact-priya", relatedDealId: "hs-deal-consult", createdAt: "2026-06-19T09:45:00.000Z", updatedAt: now },
  { id: "hs-task-jordan", clientId: "demo", title: "Onboard won retainer deal", owner: "Admin", dueDate: "2026-06-23", status: "Done", relatedContactId: "hs-contact-jordan", relatedDealId: "hs-deal-retainer", createdAt: "2026-06-12T15:00:00.000Z", updatedAt: now }
];

export const demoHubSpotActivities: HubSpotActivity[] = [
  { id: "hs-activity-1", clientId: "demo", type: "Deal Updated", description: "Emergency appointment lead package moved to Proposal Sent.", occurredAt: "2026-06-21T16:20:00.000Z" },
  { id: "hs-activity-2", clientId: "demo", type: "Email", description: "Proposal email sent to Elena Parker from Google Ads lead.", occurredAt: "2026-06-21T16:05:00.000Z" },
  { id: "hs-activity-3", clientId: "demo", type: "Contact Created", description: "Priya Shah was created from Website Form.", occurredAt: "2026-06-18T09:30:00.000Z" },
  { id: "hs-activity-4", clientId: "demo", type: "Deal Updated", description: "Monthly growth retainer marked Won.", occurredAt: "2026-06-12T15:00:00.000Z" }
];
