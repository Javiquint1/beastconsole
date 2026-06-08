import "server-only";
import { demoLinkedInCampaigns, demoLinkedInReport } from "./mock-data";
import type { LinkedInAdsCampaign, LinkedInAdsReport, LinkedInAdsSummary, LinkedInAdsUpload } from "./types";

const reports = new Map<string, LinkedInAdsReport>();
const campaigns = new Map<string, LinkedInAdsCampaign>();
const uploads: LinkedInAdsUpload[] = [];
export const getLinkedInAdsReports = (clientId: string) => Array.from(reports.values()).filter((x) => x.clientId === clientId);
export const getLinkedInAdsReport = (clientId: string, id: string) => getLinkedInAdsReports(clientId).find((x) => x.id === id);
export const getLinkedInAdsCampaigns = (clientId: string) => Array.from(campaigns.values()).filter((x) => x.clientId === clientId);
export const getLinkedInAdsSummary = (clientId: string) => summary(getLinkedInAdsCampaigns(clientId));
export function createLinkedInAdsReport(clientId: string, data: Partial<LinkedInAdsReport>) {
  const now = new Date().toISOString();
  const report: LinkedInAdsReport = { id: `linkedin-report-${Date.now()}`, clientId, reportName: data.reportName || "Manual LinkedIn Ads Report", dateRangeStart: data.dateRangeStart || now.slice(0,10), dateRangeEnd: data.dateRangeEnd || now.slice(0,10), notes: data.notes || "", recommendations: data.recommendations || [], source: data.source || "manual", createdAt: now, updatedAt: now };
  reports.set(report.id, report); return report;
}
export function updateLinkedInAdsReport(clientId: string, id: string, data: Partial<LinkedInAdsReport>) {
  const report = getLinkedInAdsReport(clientId, id); if (!report) return null;
  const updated = { ...report, ...data, id, clientId, updatedAt: new Date().toISOString() }; reports.set(id, updated); return updated;
}
export function deleteLinkedInAdsReport(clientId: string, id: string) {
  if (!getLinkedInAdsReport(clientId, id)) return false; reports.delete(id);
  Array.from(campaigns.values()).forEach((x) => { if (x.clientId === clientId && x.reportId === id) campaigns.delete(x.id); }); return true;
}
export function createLinkedInAdsCampaign(clientId: string, data: Partial<LinkedInAdsCampaign>) {
  const now = new Date().toISOString();
  const campaign = normalize({ ...data, id: `linkedin-campaign-${Date.now()}`, clientId, reportId: data.reportId || getLinkedInAdsReports(clientId)[0]?.id || createLinkedInAdsReport(clientId, {}).id, createdAt: now, updatedAt: now });
  campaigns.set(campaign.id, campaign); return campaign;
}
export function updateLinkedInAdsCampaign(clientId: string, id: string, data: Partial<LinkedInAdsCampaign>) {
  const campaign = campaigns.get(id); if (!campaign || campaign.clientId !== clientId) return null;
  const updated = normalize({ ...campaign, ...data, id, clientId, updatedAt: new Date().toISOString() }); campaigns.set(id, updated); return updated;
}
export function deleteLinkedInAdsCampaign(clientId: string, id: string) {
  return Boolean(campaigns.get(id)?.clientId === clientId && campaigns.delete(id));
}
export function importLinkedInAdsCsv(clientId: string, csvData: string, fileName = "linkedin-ads.csv") {
  const lines = csvData.trim().split(/\r?\n/).filter(Boolean); const headers = lines.shift()?.split(",").map((x) => x.trim()) || []; let rowsImported = 0;
  lines.forEach((line) => { const values = line.split(",").map((x) => x.trim()); const row = Object.fromEntries(headers.map((h,i) => [h, values[i] || ""]));
    createLinkedInAdsCampaign(clientId, { campaignName: row.campaign_name, campaignGroup: row.campaign_group, objective: row.objective, status: status(row.status), budget: Number(row.budget), spend: Number(row.spend), impressions: Number(row.impressions), clicks: Number(row.clicks), conversions: Number(row.conversions), leads: Number(row.leads), startDate: row.start_date, endDate: row.end_date, notes: row.notes }); rowsImported++; });
  const upload: LinkedInAdsUpload = { id: `linkedin-upload-${Date.now()}`, clientId, fileName, uploadStatus: "imported", rowsImported, uploadedAt: new Date().toISOString() }; uploads.unshift(upload); return upload;
}
export function getDemoLinkedInAdsData(clientId: string) {
  const campaignList = demoLinkedInCampaigns.map((x) => ({ ...x, clientId })); return { report: { ...demoLinkedInReport, clientId }, campaigns: campaignList, summary: summary(campaignList) };
}
export function getLinkedInRecommendations(list: LinkedInAdsCampaign[]) {
  const out = new Set<string>(); list.forEach((x) => {
    if (x.ctr < .45) out.add("CTR is below 0.45%. Test stronger B2B messaging, offer, or creative.");
    if (x.spend > 1000 && x.leads < 10) out.add("High spend and low leads: review targeting, offer, lead form, or landing page.");
    if (x.cpc > 8) out.add("CPC is high. Test different job titles, industries, seniority levels, or audience sizes.");
    if (x.cpl > 0 && x.cpl < 60) out.add("CPL is strong. Consider increasing budget carefully.");
    if (x.impressions > 100000 && x.clicks < 800) out.add("High impressions but low clicks: improve the headline and value proposition.");
    if (x.clicks > 500 && x.conversions < 15) out.add("Clicks are strong but conversions are low. Review landing page or lead form friction.");
    if (x.status === "Paused") out.add(`${x.campaignName} is paused and currently inactive.`);
  }); return Array.from(out);
}
function summary(list: LinkedInAdsCampaign[]): LinkedInAdsSummary {
  const total = (f: keyof LinkedInAdsCampaign) => list.reduce((s,x) => s + Number(x[f] || 0), 0); const spend = total("spend"), impressions = total("impressions"), clicks = total("clicks"), leads = total("leads");
  return { totalSpend: spend, totalImpressions: impressions, totalClicks: clicks, totalConversions: total("conversions"), totalLeads: leads, averageCtr: impressions ? clicks / impressions * 100 : 0, averageCpc: clicks ? spend / clicks : 0, averageCpl: leads ? spend / leads : 0 };
}
function normalize(data: Partial<LinkedInAdsCampaign> & Pick<LinkedInAdsCampaign,"id"|"clientId"|"reportId"|"createdAt"|"updatedAt">): LinkedInAdsCampaign {
  const spend=Number(data.spend||0), impressions=Number(data.impressions||0), clicks=Number(data.clicks||0), leads=Number(data.leads||0);
  return { ...data, campaignName:data.campaignName||"Untitled campaign",campaignGroup:data.campaignGroup||"General",objective:data.objective||"Lead Generation",status:data.status||"Active",budget:Number(data.budget||0),spend,impressions,clicks,conversions:Number(data.conversions||0),leads,ctr:impressions?clicks/impressions*100:0,cpc:clicks?spend/clicks:0,cpl:leads?spend/leads:0,startDate:data.startDate||"",endDate:data.endDate||"",notes:data.notes||"" };
}
function status(value:string):LinkedInAdsCampaign["status"] { return value.toLowerCase()==="paused"?"Paused":value.toLowerCase()==="completed"?"Completed":"Active"; }
// MVP process-memory adapter; replace with database or LinkedIn Marketing API later.
