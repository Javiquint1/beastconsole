import type { ClientAccount } from "./types";
import type { GoogleAdsReportRecord } from "./database-schema";
import { initialDatabase } from "./database-seed";
import { loadDatabase } from "./storage";

export type GoogleAdsCampaignReport = {
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
};

const fallbackReport: GoogleAdsCampaignReport = {
  campaignName: "Local Lead Campaign",
  budget: "$300/month",
  clicks: 245,
  impressions: 12000,
  ctr: "2.04%",
  cost: "$185.22",
  conversions: 18,
  status: "Active",
  notes: [
    "Search campaigns are producing steady lead volume this month.",
    "Review location targeting before increasing monthly budget.",
    "Add two new ad variations focused on urgency and social proof."
  ],
  lastUpdated: "2026-06-04"
};

export function getGoogleAdsReport(client: ClientAccount) {
  const report = loadDatabase().google_ads_reports.find(
    (item) => item.clientId === client.id
  );

  return report ? toGoogleAdsCampaignReport(report) : fallbackReport;
}

export function getSeedGoogleAdsReport(clientId: string) {
  const report = initialDatabase.google_ads_reports.find(
    (item) => item.clientId === clientId
  );

  return report ? toGoogleAdsCampaignReport(report) : fallbackReport;
}

function toGoogleAdsCampaignReport(
  report: GoogleAdsReportRecord
): GoogleAdsCampaignReport {
  return {
    campaignName: report.campaignName,
    budget: report.budget,
    clicks: report.clicks,
    impressions: report.impressions,
    ctr: report.ctr,
    cost: report.cost,
    conversions: report.conversions,
    status: report.status,
    notes: report.notes,
    lastUpdated: report.lastUpdated
  };
}
