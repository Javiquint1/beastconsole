import "server-only";

import { demoTikTokCampaigns, demoTikTokReport } from "./mock-data";
import type { TikTokAdsCampaign, TikTokAdsReport, TikTokAdsSummary, TikTokAdsUpload } from "./types";

const reports = new Map<string, TikTokAdsReport>();
const campaigns = new Map<string, TikTokAdsCampaign>();
const uploads: TikTokAdsUpload[] = [];

export function getTikTokAdsReports(clientId: string) {
  return Array.from(reports.values()).filter((report) => report.clientId === clientId);
}
export function getTikTokAdsReport(clientId: string, id: string) {
  return getTikTokAdsReports(clientId).find((report) => report.id === id);
}
export function getTikTokAdsCampaigns(clientId: string) {
  return Array.from(campaigns.values()).filter((campaign) => campaign.clientId === clientId);
}
export function getTikTokAdsSummary(clientId: string) {
  return calculateSummary(getTikTokAdsCampaigns(clientId));
}
export function createTikTokAdsReport(clientId: string, data: Partial<TikTokAdsReport>) {
  const now = new Date().toISOString();
  const report: TikTokAdsReport = {
    id: `tiktok-report-${Date.now()}`,
    clientId,
    reportName: data.reportName || "Manual TikTok Ads Report",
    dateRangeStart: data.dateRangeStart || now.slice(0, 10),
    dateRangeEnd: data.dateRangeEnd || now.slice(0, 10),
    notes: data.notes || "",
    recommendations: data.recommendations || [],
    source: data.source || "manual",
    createdAt: now,
    updatedAt: now
  };
  reports.set(report.id, report);
  return report;
}
export function updateTikTokAdsReport(clientId: string, id: string, data: Partial<TikTokAdsReport>) {
  const report = getTikTokAdsReport(clientId, id);
  if (!report) return null;
  const updated = { ...report, ...data, id, clientId, updatedAt: new Date().toISOString() };
  reports.set(id, updated);
  return updated;
}
export function deleteTikTokAdsReport(clientId: string, id: string) {
  const report = getTikTokAdsReport(clientId, id);
  if (!report) return false;
  reports.delete(id);
  Array.from(campaigns.values()).forEach((campaign) => {
    if (campaign.clientId === clientId && campaign.reportId === id) campaigns.delete(campaign.id);
  });
  return true;
}
export function createTikTokAdsCampaign(clientId: string, data: Partial<TikTokAdsCampaign>) {
  const now = new Date().toISOString();
  const campaign = normalizeCampaign({
    ...data,
    id: `tiktok-campaign-${Date.now()}`,
    clientId,
    reportId: data.reportId || getTikTokAdsReports(clientId)[0]?.id || createTikTokAdsReport(clientId, {}).id,
    createdAt: now,
    updatedAt: now
  });
  campaigns.set(campaign.id, campaign);
  return campaign;
}
export function updateTikTokAdsCampaign(clientId: string, id: string, data: Partial<TikTokAdsCampaign>) {
  const campaign = campaigns.get(id);
  if (!campaign || campaign.clientId !== clientId) return null;
  const updated = normalizeCampaign({ ...campaign, ...data, id, clientId, updatedAt: new Date().toISOString() });
  campaigns.set(id, updated);
  return updated;
}
export function deleteTikTokAdsCampaign(clientId: string, id: string) {
  const campaign = campaigns.get(id);
  return Boolean(campaign?.clientId === clientId && campaigns.delete(id));
}
export function importTikTokAdsCsv(clientId: string, csvData: string, fileName = "tiktok-ads.csv") {
  const lines = csvData.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(",").map((header) => header.trim()) || [];
  let rowsImported = 0;
  lines.forEach((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    createTikTokAdsCampaign(clientId, {
      campaignName: row.campaign_name,
      objective: row.objective,
      status: normalizeStatus(row.status),
      budget: Number(row.budget),
      spend: Number(row.spend),
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      conversions: Number(row.conversions),
      videoViews: Number(row.video_views),
      engagementRate: Number(row.engagement_rate),
      startDate: row.start_date,
      endDate: row.end_date,
      notes: row.notes
    });
    rowsImported += 1;
  });
  const upload: TikTokAdsUpload = {
    id: `tiktok-upload-${Date.now()}`,
    clientId,
    fileName,
    uploadStatus: "imported",
    rowsImported,
    uploadedAt: new Date().toISOString()
  };
  uploads.unshift(upload);
  return upload;
}
export function getDemoTikTokAdsData(clientId: string) {
  const report = { ...demoTikTokReport, clientId };
  const demoCampaigns = demoTikTokCampaigns.map((campaign) => ({ ...campaign, clientId }));
  return { report, campaigns: demoCampaigns, summary: calculateSummary(demoCampaigns) };
}
export function getTikTokRecommendations(list: TikTokAdsCampaign[]) {
  const recommendations = new Set<string>();
  list.forEach((campaign) => {
    if (campaign.ctr < 1) recommendations.add("CTR is below 1%. Test a stronger hook or creative.");
    if (campaign.spend > 500 && campaign.conversions < 10) recommendations.add("High spend and low conversions: review targeting, offer, or landing page.");
    if (campaign.cpc > 2) recommendations.add("CPC is high. Test new audiences or creatives.");
    if (campaign.cpa > 0 && campaign.cpa < 20) recommendations.add("CPA is strong. Consider increasing budget carefully.");
    if (campaign.videoViews > 100000 && campaign.clicks < 2000) recommendations.add("Video views are high but clicks are low. Improve the CTA or offer.");
    if (campaign.impressions > 100000 && campaign.engagementRate < 3) recommendations.add("High impressions with low engagement: test shorter creative or a stronger first 3 seconds.");
    if (campaign.status === "Paused") recommendations.add(`${campaign.campaignName} is paused and currently inactive.`);
  });
  return Array.from(recommendations);
}

function calculateSummary(list: TikTokAdsCampaign[]): TikTokAdsSummary {
  const total = (field: keyof TikTokAdsCampaign) => list.reduce((sum, item) => sum + Number(item[field] || 0), 0);
  const spend = total("spend");
  const impressions = total("impressions");
  const clicks = total("clicks");
  const conversions = total("conversions");
  return {
    totalSpend: spend,
    totalImpressions: impressions,
    totalClicks: clicks,
    totalConversions: conversions,
    totalVideoViews: total("videoViews"),
    averageCtr: impressions ? (clicks / impressions) * 100 : 0,
    averageCpc: clicks ? spend / clicks : 0,
    averageCpa: conversions ? spend / conversions : 0
  };
}
function normalizeCampaign(data: Partial<TikTokAdsCampaign> & Pick<TikTokAdsCampaign, "id" | "clientId" | "reportId" | "createdAt" | "updatedAt">): TikTokAdsCampaign {
  const impressions = Number(data.impressions || 0);
  const clicks = Number(data.clicks || 0);
  const spend = Number(data.spend || 0);
  const conversions = Number(data.conversions || 0);
  return {
    ...data,
    campaignName: data.campaignName || "Untitled campaign",
    objective: data.objective || "Conversions",
    status: data.status || "Active",
    budget: Number(data.budget || 0),
    spend,
    impressions,
    clicks,
    conversions,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpa: conversions ? spend / conversions : 0,
    videoViews: Number(data.videoViews || 0),
    engagementRate: Number(data.engagementRate || 0),
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    notes: data.notes || ""
  };
}
function normalizeStatus(value: string): TikTokAdsCampaign["status"] {
  return value.toLowerCase() === "paused" ? "Paused" : value.toLowerCase() === "completed" ? "Completed" : "Active";
}

// MVP process-memory adapter. Replace with database or TikTok API sync later
// without changing the internal API contracts consumed by the UI.
