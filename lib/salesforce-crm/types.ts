export type SalesforceLead = {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  leadSource: string;
  status: "New" | "Working" | "Qualified" | "Unqualified";
  createdAt: string;
  updatedAt: string;
};

export type SalesforceAccount = {
  id: string;
  clientId: string;
  name: string;
  industry: string;
  annualRevenue: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesforceContact = {
  id: string;
  clientId: string;
  accountId: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesforceOpportunity = {
  id: string;
  clientId: string;
  accountId: string;
  contactId: string;
  opportunityName: string;
  amount: number;
  stage: "Prospecting" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  probability: number;
  leadSource: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesforceTask = {
  id: string;
  clientId: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "Open" | "Completed";
  relatedOpportunityId?: string;
  relatedLeadId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesforceActivity = {
  id: string;
  clientId: string;
  type: "Lead Created" | "Opportunity Updated" | "Task Created" | "Call" | "Email" | "Note";
  description: string;
  occurredAt: string;
};

export type SalesforceSummary = {
  newLeads: number;
  openOpportunities: number;
  pipelineValue: number;
  revenueForecast: number;
  closedWonDeals: number;
  closedLostDeals: number;
  closedWonRevenue: number;
  closedLostRevenue: number;
  dealsByStage: Array<{ stage: string; count: number; value: number }>;
  leadSources: Array<{ source: string; count: number }>;
};
