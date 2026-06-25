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
  trialEnabled?: boolean;
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

export type ClientAppAccessRecord = {
  id: string;
  clientId: string;
  appId: "ai_helper" | "email" | "google_ads" | "meta_ads" | "tiktok_ads" | "linkedin_ads" | "hubspot_crm" | "salesforce_crm" | "semrush_seo";
  enabled: boolean;
  trialEnabled: boolean;
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

export type TikTokAdsReportRecord = {
  id: string;
  clientId: string;
  reportName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalVideoViews: number;
  averageCtr: number;
  averageCpc: number;
  averageCpa: number;
  notes: string;
  recommendations: string[];
  source: "manual" | "csv" | "tiktok-api";
  createdAt: string;
  updatedAt: string;
};

export type TikTokAdsCampaignRecord = {
  id: string;
  clientId: string;
  reportId: string;
  campaignName: string;
  objective: string;
  status: "Active" | "Paused" | "Completed";
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  videoViews: number;
  engagementRate: number;
  startDate: string;
  endDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TikTokAdsUploadRecord = {
  id: string;
  clientId: string;
  fileName: string;
  uploadStatus: "received" | "imported" | "failed";
  rowsImported: number;
  errorMessage?: string;
  uploadedAt: string;
};

export type LinkedInAdsReportRecord = {
  id:string;clientId:string;reportName:string;dateRangeStart:string;dateRangeEnd:string;
  totalSpend:number;totalImpressions:number;totalClicks:number;totalConversions:number;
  totalLeads:number;averageCtr:number;averageCpc:number;averageCpl:number;notes:string;
  recommendations:string[];source:"manual"|"csv"|"linkedin-api";createdAt:string;updatedAt:string;
};
export type LinkedInAdsCampaignRecord = {
  id:string;clientId:string;reportId:string;campaignName:string;campaignGroup:string;
  objective:string;status:"Active"|"Paused"|"Completed";budget:number;spend:number;
  impressions:number;clicks:number;conversions:number;leads:number;ctr:number;cpc:number;
  cpl:number;startDate:string;endDate:string;notes:string;createdAt:string;updatedAt:string;
};
export type LinkedInAdsUploadRecord = {
  id:string;clientId:string;fileName:string;uploadStatus:"received"|"imported"|"failed";
  rowsImported:number;errorMessage?:string;uploadedAt:string;
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
  client_app_access?: ClientAppAccessRecord[];
  google_ads_reports: GoogleAdsReportRecord[];
  meta_ads_reports: MetaAdsReportRecord[];
  meta_ads_campaigns: MetaAdsCampaignRecord[];
  meta_ads_uploads: MetaAdsUploadRecord[];
  tiktok_ads_reports: TikTokAdsReportRecord[];
  tiktok_ads_campaigns: TikTokAdsCampaignRecord[];
  tiktok_ads_uploads: TikTokAdsUploadRecord[];
  linkedin_ads_reports: LinkedInAdsReportRecord[];
  linkedin_ads_campaigns: LinkedInAdsCampaignRecord[];
  linkedin_ads_uploads: LinkedInAdsUploadRecord[];
  email_reports: EmailReportRecord[];
  ai_generations: AiGenerationRecord[];
  payments: PaymentRecord[];
};
