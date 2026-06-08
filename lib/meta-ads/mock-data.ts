import type { MetaAdsCampaign, MetaAdsReport } from "./types";

const now = "2026-06-07T14:00:00.000Z";

export const demoMetaReport: MetaAdsReport = {
  id: "meta-report-demo",
  clientId: "demo",
  reportName: "June Facebook & Instagram Performance",
  dateRangeStart: "2026-06-01",
  dateRangeEnd: "2026-06-30",
  notes: "Lead campaigns are producing steady results. Reels creative is earning the strongest reach.",
  recommendations: [],
  source: "manual",
  createdAt: now,
  updatedAt: now
};

export const demoMetaCampaigns: MetaAdsCampaign[] = [
  {
    id: "meta-campaign-leads",
    clientId: "demo",
    reportId: demoMetaReport.id,
    campaignName: "Local Lead Generation",
    objective: "Leads",
    status: "Active",
    budget: 1800,
    spend: 1248.42,
    reach: 38240,
    impressions: 71600,
    clicks: 1240,
    leads: 74,
    ctr: 1.73,
    cpc: 1.01,
    cpl: 16.87,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "Lead form completion rate is strongest on mobile.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "meta-campaign-awareness",
    clientId: "demo",
    reportId: demoMetaReport.id,
    campaignName: "Instagram Reels Awareness",
    objective: "Awareness",
    status: "Active",
    budget: 700,
    spend: 486.18,
    reach: 55400,
    impressions: 82920,
    clicks: 498,
    leads: 8,
    ctr: 0.6,
    cpc: 0.98,
    cpl: 60.77,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "Strong reach, but the offer needs a clearer action.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "meta-campaign-retargeting",
    clientId: "demo",
    reportId: demoMetaReport.id,
    campaignName: "Website Visitor Retargeting",
    objective: "Conversions",
    status: "Paused",
    budget: 500,
    spend: 312.6,
    reach: 8200,
    impressions: 16340,
    clicks: 286,
    leads: 21,
    ctr: 1.75,
    cpc: 1.09,
    cpl: 14.89,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    notes: "Paused pending refreshed creative.",
    createdAt: now,
    updatedAt: now
  }
];
