export type MetaAdsCampaign = {
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

export type MetaAdsReport = {
  id: string;
  clientId: string;
  reportName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  notes: string;
  recommendations: string[];
  source: "manual" | "csv" | "meta-api";
  createdAt: string;
  updatedAt: string;
};

export type MetaAdsSummary = {
  totalSpend: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  averageCtr: number;
  averageCpc: number;
  averageCpl: number;
};

export type MetaAdsUpload = {
  id: string;
  clientId: string;
  fileName: string;
  uploadStatus: "received" | "imported" | "failed";
  rowsImported: number;
  errorMessage?: string;
  uploadedAt: string;
};

// Future server tables: meta_ads_reports, meta_ads_campaigns, meta_ads_uploads.
// Future API tables: meta_connections and meta_ad_accounts. Tokens must remain server-side.
