import type { TikTokAdsCampaign, TikTokAdsReport } from "./types";

const now = "2026-06-08T14:00:00.000Z";

export const demoTikTokReport: TikTokAdsReport = {
  id: "tiktok-report-demo",
  clientId: "demo",
  reportName: "June TikTok Performance",
  dateRangeStart: "2026-06-01",
  dateRangeEnd: "2026-06-30",
  notes: "Short-form testimonial creative is driving the strongest conversion rate.",
  recommendations: [],
  source: "manual",
  createdAt: now,
  updatedAt: now
};

export const demoTikTokCampaigns: TikTokAdsCampaign[] = [
  {
    id: "tiktok-demo-leads",
    clientId: "demo",
    reportId: demoTikTokReport.id,
    campaignName: "Creator Testimonial Leads",
    objective: "Lead Generation",
    status: "Active",
    budget: 1800,
    spend: 1164.3,
    impressions: 184500,
    clicks: 2952,
    conversions: 86,
    ctr: 1.6,
    cpc: 0.39,
    cpa: 13.54,
    videoViews: 128400,
    engagementRate: 5.8,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "The opening customer quote is holding attention.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "tiktok-demo-awareness",
    clientId: "demo",
    reportId: demoTikTokReport.id,
    campaignName: "Brand Story Awareness",
    objective: "Reach",
    status: "Active",
    budget: 800,
    spend: 538.2,
    impressions: 246800,
    clicks: 1728,
    conversions: 9,
    ctr: 0.7,
    cpc: 0.31,
    cpa: 59.8,
    videoViews: 202500,
    engagementRate: 2.1,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "Strong views, but the CTA needs more clarity.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "tiktok-demo-retargeting",
    clientId: "demo",
    reportId: demoTikTokReport.id,
    campaignName: "Video Viewer Retargeting",
    objective: "Conversions",
    status: "Paused",
    budget: 600,
    spend: 286.45,
    impressions: 42100,
    clicks: 842,
    conversions: 31,
    ctr: 2,
    cpc: 0.34,
    cpa: 9.24,
    videoViews: 34800,
    engagementRate: 6.4,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "Paused while new product creative is prepared.",
    createdAt: now,
    updatedAt: now
  }
];
