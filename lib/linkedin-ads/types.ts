export type LinkedInAdsCampaign = {
  id: string; clientId: string; reportId: string; campaignName: string;
  campaignGroup: string; objective: string; status: "Active" | "Paused" | "Completed";
  budget: number; spend: number; impressions: number; clicks: number;
  conversions: number; leads: number; ctr: number; cpc: number; cpl: number;
  startDate: string; endDate: string; notes: string; createdAt: string; updatedAt: string;
};
export type LinkedInAdsReport = {
  id: string; clientId: string; reportName: string; dateRangeStart: string;
  dateRangeEnd: string; notes: string; recommendations: string[];
  source: "manual" | "csv" | "linkedin-api"; createdAt: string; updatedAt: string;
};
export type LinkedInAdsSummary = {
  totalSpend: number; totalImpressions: number; totalClicks: number;
  totalConversions: number; totalLeads: number; averageCtr: number;
  averageCpc: number; averageCpl: number;
};
export type LinkedInAdsUpload = {
  id: string; clientId: string; fileName: string;
  uploadStatus: "received" | "imported" | "failed"; rowsImported: number;
  errorMessage?: string; uploadedAt: string;
};
// Future tables: linkedin_ads_reports, linkedin_ads_campaigns, linkedin_ads_uploads,
// linkedin_connections, and linkedin_ad_accounts. API tokens remain server-side.
