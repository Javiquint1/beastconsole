"use client";

import { Download, FileUp, Music2, Plus, Save, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ClientAccount } from "@/lib/types";
import type { TikTokAdsCampaign, TikTokAdsReport, TikTokAdsSummary } from "@/lib/tiktok-ads/types";

type TikTokDashboard = {
  report: TikTokAdsReport;
  campaigns: TikTokAdsCampaign[];
  summary: TikTokAdsSummary;
  recommendations?: string[];
  demoMode: boolean;
};
const emptyCampaign = {
  campaignName: "",
  objective: "Conversions",
  status: "Active",
  budget: 0,
  spend: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  videoViews: 0,
  engagementRate: 0,
  startDate: "",
  endDate: "",
  notes: ""
};

export function TikTokAdsManagerApp({ client }: { client: ClientAccount }) {
  const [data, setData] = useState<TikTokDashboard | null>(null);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [campaign, setCampaign] = useState(emptyCampaign);
  const [notes, setNotes] = useState("");
  const isAdmin = client.role === "admin";
  const headers = useMemo(() => ({ "x-beast-client-id": client.id, "x-beast-role": client.role }), [client.id, client.role]);

  useEffect(() => { void loadDashboard(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [client.id]);

  async function loadDashboard() {
    const response = await fetch("/api/tiktok-ads/summary", { headers });
    if (!response.ok) return setNotice("TikTok Ads report could not be loaded.");
    const dashboard = await response.json() as TikTokDashboard;
    setData(dashboard);
    setNotes(dashboard.report.notes);
  }
  async function addCampaign(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/tiktok-ads/campaigns", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(campaign) });
    setNotice(response.ok ? "TikTok campaign added." : "Campaign could not be added.");
    if (response.ok) { setCampaign(emptyCampaign); setEditing(false); await loadDashboard(); }
  }
  async function uploadCsv(file?: File) {
    if (!file) return;
    const response = await fetch("/api/tiktok-ads/upload", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, csvData: await file.text() }) });
    const result = await response.json() as { upload?: { rowsImported: number }; error?: string };
    setNotice(response.ok ? `CSV imported: ${result.upload?.rowsImported || 0} campaigns.` : result.error || "CSV upload failed.");
    if (response.ok) await loadDashboard();
  }
  async function saveNotes() {
    if (!data || data.demoMode) return setNotice("Create a manual report before saving notes.");
    const response = await fetch(`/api/tiktok-ads/reports/${data.report.id}`, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ notes }) });
    setNotice(response.ok ? "TikTok report notes saved." : "Notes could not be saved.");
  }

  if (!data) return <div className="empty-state">Loading TikTok Ads performance...</div>;
  const recommendations = data.recommendations?.length ? data.recommendations : ["Upload TikTok campaign data to generate performance recommendations."];
  return (
    <div className="workspace-app-content tiktok-ads-app">
      <header className="tiktok-ads-header">
        <div className="tiktok-title"><Music2 size={24} /><div><p className="eyebrow">TikTok advertising</p><h2>TikTok Ads Manager</h2><span>{data.report.dateRangeStart} to {data.report.dateRangeEnd} · Updated {formatDate(data.report.updatedAt)}</span></div></div>
        <div className="app-actions compact"><span className={`pill ${data.demoMode ? "trial" : "active"}`}>{data.demoMode ? "Demo data" : "Manual report"}</span><button className="ghost-button light" onClick={() => setNotice("Export download is coming next.")} type="button"><Download size={15} /> Export</button>{isAdmin && <button className="button" onClick={() => setEditing(true)} type="button"><Plus size={15} /> Add campaign</button>}</div>
      </header>
      {notice && <div className="notice">{notice}</div>}
      <div className="tiktok-metric-grid">
        <Metric label="Total spend" value={money(data.summary.totalSpend)} /><Metric label="Impressions" value={number(data.summary.totalImpressions)} /><Metric label="Clicks" value={number(data.summary.totalClicks)} /><Metric label="Conversions" value={number(data.summary.totalConversions)} /><Metric label="Video views" value={number(data.summary.totalVideoViews)} /><Metric label="CTR" value={`${data.summary.averageCtr.toFixed(2)}%`} /><Metric label="CPC" value={money(data.summary.averageCpc)} /><Metric label="CPA" value={money(data.summary.averageCpa)} />
      </div>
      <section className="mini-panel tiktok-campaign-panel">
        <div className="app-section-header"><div><p className="eyebrow">Campaign Performance</p><h3>{data.report.reportName}</h3></div>{isAdmin && <label className="ghost-button light tiktok-upload"><FileUp size={15} /> Upload CSV<input accept=".csv,text/csv" onChange={(event) => uploadCsv(event.target.files?.[0])} type="file" /></label>}</div>
        <div className="table-wrap embedded"><table className="client-table tiktok-campaign-table"><thead><tr><th>Campaign</th><th>Objective</th><th>Status</th><th>Budget</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>Conversions</th><th>CTR</th><th>CPC</th><th>CPA</th><th>Video views</th><th>Engagement</th></tr></thead><tbody>{data.campaigns.map((item) => <tr key={item.id}><td><strong>{item.campaignName}</strong><small>{item.notes}</small></td><td>{item.objective}</td><td><span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{money(item.budget)}</td><td>{money(item.spend)}</td><td>{number(item.impressions)}</td><td>{number(item.clicks)}</td><td>{item.conversions}</td><td>{item.ctr.toFixed(2)}%</td><td>{money(item.cpc)}</td><td>{money(item.cpa)}</td><td>{number(item.videoViews)}</td><td>{item.engagementRate.toFixed(2)}%</td></tr>)}</tbody></table></div>
      </section>
      <div className="app-grid tiktok-bottom-grid">
        <section className="mini-panel"><p className="eyebrow">Recommendations</p><h3>Creative and conversion actions</h3><div className="recommendation-list">{recommendations.map((item) => <div className="notice" key={item}><Sparkles size={14} /> {item}</div>)}</div></section>
        <section className="mini-panel"><p className="eyebrow">Notes</p><h3>Report context</h3><textarea onChange={(event) => setNotes(event.target.value)} readOnly={!isAdmin} rows={7} value={notes} />{isAdmin && <button className="ghost-button light" onClick={saveNotes} type="button"><Save size={15} /> Save notes</button>}</section>
        <section className="mini-panel tiktok-api-card"><p className="eyebrow">Coming later</p><h3>Connect TikTok Ads API</h3><p>Future version will connect TikTok ad accounts through TikTok API for Business and Marketing API.</p><button disabled type="button">Connect TikTok Ads API</button></section>
      </div>
      {editing && <form className="tiktok-campaign-form" onSubmit={addCampaign}><header><strong>Add manual TikTok campaign</strong><button onClick={() => setEditing(false)} type="button">Close</button></header><div className="tiktok-form-grid">{Object.entries(campaign).map(([key, value]) => key === "notes" ? <textarea key={key} onChange={(event) => setCampaign((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes" value={String(value)} /> : <input key={key} onChange={(event) => setCampaign((current) => ({ ...current, [key]: typeof value === "number" ? Number(event.target.value) : event.target.value }))} placeholder={key.replace(/([A-Z])/g, " $1")} type={typeof value === "number" ? "number" : key.includes("Date") ? "date" : "text"} value={value} />)}</div><button className="button" type="submit">Save campaign</button></form>}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) { return <article className="report-metric-card"><span>{label}</span><strong>{value}</strong></article>; }
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
function number(value: number) { return value.toLocaleString("en-US"); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
