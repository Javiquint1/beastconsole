export type TikTokAdsCampaign = {
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

export type TikTokAdsReport = {
  id: string;
  clientId: string;
  reportName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  notes: string;
  recommendations: string[];
  source: "manual" | "csv" | "tiktok-api";
  createdAt: string;
  updatedAt: string;
};

export type TikTokAdsSummary = {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalVideoViews: number;
  averageCtr: number;
  averageCpc: number;
  averageCpa: number;
};

export type TikTokAdsUpload = {
  id: string;
  clientId: string;
  fileName: string;
  uploadStatus: "received" | "imported" | "failed";
  rowsImported: number;
  errorMessage?: string;
  uploadedAt: string;
};

// Future tables: tiktok_ads_reports, tiktok_ads_campaigns, tiktok_ads_uploads.
// Future API tables: tiktok_connections and tiktok_ad_accounts. Tokens stay server-side.
