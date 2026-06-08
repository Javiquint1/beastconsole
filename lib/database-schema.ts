import type { AiCopyToolId } from "./ai-copy-tools";
import type { BlockId, PaymentStatus, UserRole, UserStatus } from "./types";

export type UserRecord = {
  id: string;
  clientId?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  businessWebsite: string;
  monthlyBudget: number;
  leadGoal: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientBlockRecord = {
  id: string;
  clientId: string;
  blockType: BlockId;
  enabled: boolean;
  status: "active" | "locked" | "coming-soon";
  createdAt: string;
  updatedAt: string;
};

export type GoogleAdsReportRecord = {
  id: string;
  clientId: string;
  campaignName: string;
  budget: string;
  clicks: number;
  impressions: number;
  ctr: string;
  cost: string;
  conversions: number;
  status: "Active" | "Paused" | "Needs Review";
  notes: string[];
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsReportRecord = {
  id: string;
  clientId: string;
  reportName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  totalSpend: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  averageCtr: number;
  averageCpc: number;
  averageCpl: number;
  notes: string;
  recommendations: string[];
  source: "manual" | "csv" | "meta-api";
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsCampaignRecord = {
  id: string;
  clientId: string;
  reportId: string;
  campaignName: string;
  objective: string;
  status: "Active" | "Paused" | "Completed";
  budget: number;
  spend: number;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  cpc: number;
  cpl: number;
  startDate: string;
  endDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsUploadRecord = {
  id: string;
  clientId: string;
  fileName: string;
  uploadStatus: "received" | "imported" | "failed";
  rowsImported: number;
  errorMessage?: string;
  uploadedAt: string;
};

export type EmailReportRecord = {
  id: string;
  clientId: string;
  campaignName: string;
  subject: string;
  sentDate: string;
  recipients: number;
  opens: number;
  clicks: number;
  status: "Draft" | "Scheduled" | "Sent";
  suggestedNextEmailIdea?: string;
  source:
    | "manual-admin"
    | "brevo"
    | "mailchimp"
    | "constant-contact"
    | "gmail"
    | "custom-smtp";
  createdAt: string;
  updatedAt: string;
};

export type AiGenerationRecord = {
  id: string;
  clientId: string;
  toolId: AiCopyToolId;
  input: {
    businessName: string;
    service: string;
    offer: string;
    tone: string;
    targetAudience: string;
  };
  output: string;
  createdAt: string;
};

export type PaymentRecord = {
  id: string;
  clientId: string;
  status: PaymentStatus;
  source:
    | "manual-admin"
    | "bill-com"
    | "stripe"
    | "paypal"
    | "manual-invoice"
    | "admin-approval";
  amount?: string;
  period?: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalDatabase = {
  users: UserRecord[];
  clients: ClientRecord[];
  client_blocks: ClientBlockRecord[];
  google_ads_reports: GoogleAdsReportRecord[];
  meta_ads_reports: MetaAdsReportRecord[];
  meta_ads_campaigns: MetaAdsCampaignRecord[];
  meta_ads_uploads: MetaAdsUploadRecord[];
  email_reports: EmailReportRecord[];
  ai_generations: AiGenerationRecord[];
  payments: PaymentRecord[];
};
