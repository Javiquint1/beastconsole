export type HubSpotContact = {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string;
  lifecycleStage: "Lead" | "Marketing Qualified Lead" | "Sales Qualified Lead" | "Customer";
  leadSource: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
};

export type HubSpotCompany = {
  id: string;
  clientId: string;
  name: string;
  domain: string;
  industry: string;
  city: string;
  createdAt: string;
  updatedAt: string;
};

export type HubSpotDeal = {
  id: string;
  clientId: string;
  dealName: string;
  companyId: string;
  contactId: string;
  amount: number;
  pipelineStage: "New Lead" | "Qualified" | "Proposal Sent" | "Won" | "Lost";
  leadSource: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
};

export type HubSpotTask = {
  id: string;
  clientId: string;
  title: string;
  owner: string;
  dueDate: string;
  status: "Open" | "Done";
  relatedContactId?: string;
  relatedDealId?: string;
  createdAt: string;
  updatedAt: string;
};

export type HubSpotActivity = {
  id: string;
  clientId: string;
  type: "Contact Created" | "Deal Updated" | "Task Created" | "Note" | "Email";
  description: string;
  occurredAt: string;
};

export type HubSpotSummary = {
  newContactsThisMonth: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalPipelineValue: number;
  leadsBySource: Array<{ source: string; count: number }>;
};
