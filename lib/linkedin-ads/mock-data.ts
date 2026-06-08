import type { LinkedInAdsCampaign, LinkedInAdsReport } from "./types";
const now = "2026-06-08T14:00:00.000Z";
export const demoLinkedInReport: LinkedInAdsReport = {
  id: "linkedin-report-demo", clientId: "demo", reportName: "June LinkedIn B2B Performance",
  dateRangeStart: "2026-06-01", dateRangeEnd: "2026-06-30",
  notes: "Decision-maker lead forms are producing qualified conversations.",
  recommendations: [], source: "manual", createdAt: now, updatedAt: now
};
export const demoLinkedInCampaigns: LinkedInAdsCampaign[] = [
  {
    id: "linkedin-demo-leads", clientId: "demo", reportId: demoLinkedInReport.id,
    campaignName: "Operations Leaders Lead Gen", campaignGroup: "Q2 Demand Generation",
    objective: "Lead Generation", status: "Active", budget: 4200, spend: 2984.4,
    impressions: 118400, clicks: 936, conversions: 68, leads: 54, ctr: .79,
    cpc: 3.19, cpl: 55.27, startDate: "2026-06-01", endDate: "2026-06-30",
    notes: "Director-level operations titles are converting best.", createdAt: now, updatedAt: now
  },
  {
    id: "linkedin-demo-awareness", clientId: "demo", reportId: demoLinkedInReport.id,
    campaignName: "Enterprise Thought Leadership", campaignGroup: "Brand Authority",
    objective: "Brand Awareness", status: "Active", budget: 2200, spend: 1468.2,
    impressions: 206500, clicks: 764, conversions: 11, leads: 7, ctr: .37,
    cpc: 1.92, cpl: 209.74, startDate: "2026-06-01", endDate: "2026-06-30",
    notes: "Strong reach but the value proposition needs sharpening.", createdAt: now, updatedAt: now
  },
  {
    id: "linkedin-demo-retargeting", clientId: "demo", reportId: demoLinkedInReport.id,
    campaignName: "Website Visitor Retargeting", campaignGroup: "Q2 Demand Generation",
    objective: "Website Conversions", status: "Paused", budget: 1600, spend: 842.7,
    impressions: 38400, clicks: 422, conversions: 35, leads: 28, ctr: 1.1,
    cpc: 2, cpl: 30.1, startDate: "2026-06-01", endDate: "2026-06-30",
    notes: "Paused while the lead form is refreshed.", createdAt: now, updatedAt: now
  }
];
