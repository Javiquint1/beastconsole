import "server-only";

import { demoMetaCampaigns, demoMetaReport } from "./mock-data";
import type { MetaAdsCampaign, MetaAdsReport, MetaAdsSummary, MetaAdsUpload } from "./types";

const reports = new Map<string, MetaAdsReport>();
const campaigns = new Map<string, MetaAdsCampaign>();
const uploads: MetaAdsUpload[] = [];

export function getMetaAdsReports(clientId: string) {
  return Array.from(reports.values()).filter((report) => report.clientId === clientId);
}

export function getMetaAdsReport(clientId: string, reportId: string) {
  return getMetaAdsReports(clientId).find((report) => report.id === reportId);
}

export function getMetaAdsCampaigns(clientId: string) {
  return Array.from(campaigns.values()).filter((campaign) => campaign.clientId === clientId);
}

export function getMetaAdsSummary(clientId: string): MetaAdsSummary {
  return calculateSummary(getMetaAdsCampaigns(clientId));
}

export function createMetaAdsReport(clientId: string, data: Partial<MetaAdsReport>) {
  const now = new Date().toISOString();
  const report: MetaAdsReport = {
    id: `meta-report-${Date.now()}`,
    clientId,
    reportName: data.reportName || "Manual Meta Ads Report",
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

export function updateMetaAdsReport(clientId: string, reportId: string, data: Partial<MetaAdsReport>) {
  const report = getMetaAdsReport(clientId, reportId);
  if (!report) return null;
  const updated = { ...report, ...data, id: report.id, clientId, updatedAt: new Date().toISOString() };
  reports.set(report.id, updated);
  return updated;
}

export function deleteMetaAdsReport(clientId: string, reportId: string) {
  const report = getMetaAdsReport(clientId, reportId);
  if (!report) return false;
  reports.delete(reportId);
  Array.from(campaigns.values()).forEach((campaign) => {
    if (campaign.clientId === clientId && campaign.reportId === reportId) campaigns.delete(campaign.id);
  });
  return true;
}

export function createMetaAdsCampaign(clientId: string, data: Partial<MetaAdsCampaign>) {
  const now = new Date().toISOString();
  const campaign = normalizeCampaign({
    ...data,
    id: `meta-campaign-${Date.now()}`,
    clientId,
    reportId: data.reportId || getMetaAdsReports(clientId)[0]?.id || createMetaAdsReport(clientId, {}).id,
    createdAt: now,
    updatedAt: now
  });
  campaigns.set(campaign.id, campaign);
  return campaign;
}

export function updateMetaAdsCampaign(clientId: string, id: string, data: Partial<MetaAdsCampaign>) {
  const campaign = campaigns.get(id);
  if (!campaign || campaign.clientId !== clientId) return null;
  const updated = normalizeCampaign({ ...campaign, ...data, id, clientId, updatedAt: new Date().toISOString() });
  campaigns.set(id, updated);
  return updated;
}

export function deleteMetaAdsCampaign(clientId: string, id: string) {
  const campaign = campaigns.get(id);
  return Boolean(campaign?.clientId === clientId && campaigns.delete(id));
}

export function importMetaAdsCsv(clientId: string, csvData: string, fileName = "meta-ads.csv") {
  const lines = csvData.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(",").map((header) => header.trim()) || [];
  let rowsImported = 0;
  lines.forEach((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    createMetaAdsCampaign(clientId, {
      campaignName: row.campaign_name,
      objective: row.objective,
      status: normalizeStatus(row.status),
      budget: Number(row.budget),
      spend: Number(row.spend),
      reach: Number(row.reach),
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      leads: Number(row.leads),
      startDate: row.start_date,
      endDate: row.end_date,
      notes: row.notes
    });
    rowsImported += 1;
  });
  const upload: MetaAdsUpload = {
    id: `meta-upload-${Date.now()}`,
    clientId,
    fileName,
    uploadStatus: "imported",
    rowsImported,
    uploadedAt: new Date().toISOString()
  };
  uploads.unshift(upload);
  return upload;
}

export function getDemoMetaAdsData(clientId: string) {
  const report = { ...demoMetaReport, clientId };
  const demoCampaigns = demoMetaCampaigns.map((campaign) => ({ ...campaign, clientId }));
  return { report, campaigns: demoCampaigns, summary: calculateSummary(demoCampaigns) };
}

export function getRecommendations(campaignList: MetaAdsCampaign[]) {
  const recommendations = new Set<string>();
  campaignList.forEach((campaign) => {
    if (campaign.ctr < 1) recommendations.add("CTR is below 1%. Test new creative or ad copy.");
    if (campaign.spend > 500 && campaign.leads < 10) recommendations.add("High spend and low leads: review targeting and the landing page.");
    if (campaign.cpc > 2) recommendations.add("CPC is high. Test audience segments or fresh creative.");
    if (campaign.cpl > 0 && campaign.cpl < 20) recommendations.add("CPL is strong. Consider increasing budget carefully.");
    if (campaign.impressions > 20000 && campaign.clicks < 500) recommendations.add("High impressions but low clicks: improve the offer or headline.");
    if (campaign.status === "Paused") recommendations.add(`${campaign.campaignName} is paused and currently inactive.`);
  });
  return Array.from(recommendations);
}

function calculateSummary(list: MetaAdsCampaign[]): MetaAdsSummary {
  const total = (field: keyof MetaAdsCampaign) => list.reduce((sum, item) => sum + Number(item[field] || 0), 0);
  const spend = total("spend");
  const impressions = total("impressions");
  const clicks = total("clicks");
  const leads = total("leads");
  return {
    totalSpend: spend,
    totalReach: total("reach"),
    totalImpressions: impressions,
    totalClicks: clicks,
    totalLeads: leads,
    averageCtr: impressions ? (clicks / impressions) * 100 : 0,
    averageCpc: clicks ? spend / clicks : 0,
    averageCpl: leads ? spend / leads : 0
  };
}

function normalizeCampaign(data: Partial<MetaAdsCampaign> & Pick<MetaAdsCampaign, "id" | "clientId" | "reportId" | "createdAt" | "updatedAt">): MetaAdsCampaign {
  const impressions = Number(data.impressions || 0);
  const clicks = Number(data.clicks || 0);
  const spend = Number(data.spend || 0);
  const leads = Number(data.leads || 0);
  return {
    ...data,
    campaignName: data.campaignName || "Untitled campaign",
    objective: data.objective || "Leads",
    status: data.status || "Active",
    budget: Number(data.budget || 0),
    spend,
    reach: Number(data.reach || 0),
    impressions,
    clicks,
    leads,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpl: leads ? spend / leads : 0,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    notes: data.notes || ""
  };
}

function normalizeStatus(value: string): MetaAdsCampaign["status"] {
  return value.toLowerCase() === "paused" ? "Paused" : value.toLowerCase() === "completed" ? "Completed" : "Active";
}

// MVP process-memory adapter. Swap this service implementation to database/API
// persistence later without changing UI calls or internal API contracts.
