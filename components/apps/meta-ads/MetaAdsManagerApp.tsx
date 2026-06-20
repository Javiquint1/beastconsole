"use client";

import { Plug, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ClientAccount } from "@/lib/types";

type MetaAdsManagerAppProps = { client: ClientAccount };
type DatePreset = "last_7d" | "last_30d" | "last_90d" | "this_month";
type MetaLevel = "campaign" | "adset" | "ad";
type MetaAdAccount = {
  id: string;
  name: string;
  account_status?: number;
  currency?: string;
  timezone_name?: string;
};
type MetaConnectionStatus = {
  connected: boolean;
  locked?: boolean;
  message?: string;
  adAccounts: MetaAdAccount[];
  selectedAdAccountId: string | null;
};
type MetaCampaignOption = {
  id: string;
  name: string;
  status: string;
  effectiveStatus: string;
  objective: string;
  createdTime: string | null;
  startTime: string | null;
  stopTime: string | null;
};
type MetaInsightRow = {
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetName: string;
  adId: string;
  adName: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
};

const datePresetOptions: Array<{ value: DatePreset; label: string }> = [
  { value: "last_7d", label: "Last 7 days" },
  { value: "last_30d", label: "Last 30 days" },
  { value: "last_90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" }
];

const levelOptions: Array<{ value: MetaLevel; label: string }> = [
  { value: "campaign", label: "Campaign" },
  { value: "adset", label: "Ad set" },
  { value: "ad", label: "Ad" }
];

export function MetaAdsManagerApp({ client }: MetaAdsManagerAppProps) {
  const [connection, setConnection] = useState<MetaConnectionStatus | null>(null);
  const [campaigns, setCampaigns] = useState<MetaCampaignOption[]>([]);
  const [insights, setInsights] = useState<MetaInsightRow[]>([]);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("last_30d");
  const [level, setLevel] = useState<MetaLevel>("campaign");
  const [campaignId, setCampaignId] = useState("all");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [notice, setNotice] = useState("");
  const metaAccessEnabled = client.role === "admin" || client.enabledBlocks.includes("meta-ads");

  const selectedAccount = useMemo(
    () => connection?.adAccounts.find((account) => account.id === selectedAdAccountId),
    [connection?.adAccounts, selectedAdAccountId]
  );

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id, metaAccessEnabled]);

  useEffect(() => {
    if (connection?.connected && selectedAdAccountId) {
      void loadCampaigns(selectedAdAccountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection?.connected, selectedAdAccountId]);

  async function loadStatus() {
    setLoadingStatus(true);
    setNotice("");
    setInsights([]);
    setCampaigns([]);

    if (!metaAccessEnabled) {
      setConnection({
        connected: false,
        locked: true,
        message: "Meta/Facebook Ads is not enabled for this account.",
        adAccounts: [],
        selectedAdAccountId: null
      });
      setSelectedAdAccountId("");
      setLoadingStatus(false);
      return;
    }

    try {
      const response = await fetch(`/api/meta/status?clientId=${encodeURIComponent(client.id)}`);
      const status = (await response.json()) as MetaConnectionStatus & { error?: string };
      if (!response.ok) throw new Error(status.error || "Meta connection status could not be loaded.");
      setConnection(status);
      const firstAccountId = status.selectedAdAccountId || status.adAccounts[0]?.id || "";
      setSelectedAdAccountId(firstAccountId);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Meta connection status could not be loaded.");
      setConnection(null);
      setSelectedAdAccountId("");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function saveSelectedAdAccount(adAccountId: string) {
    setSelectedAdAccountId(adAccountId);
    setCampaignId("all");
    setInsights([]);
    if (!adAccountId) return;

    const response = await fetch("/api/meta/select-ad-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, adAccountId })
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setNotice(result.error || "Meta ad account could not be selected.");
    }
  }

  async function loadCampaigns(adAccountId: string) {
    setLoadingCampaigns(true);
    setCampaigns([]);
    setCampaignId("all");
    setNotice("");

    try {
      const response = await fetch(
        `/api/meta/campaigns?clientId=${encodeURIComponent(client.id)}&adAccountId=${encodeURIComponent(adAccountId)}`
      );
      const result = (await response.json()) as { campaigns?: MetaCampaignOption[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Meta campaigns could not be loaded.");
      setCampaigns(result.campaigns || []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Meta campaigns could not be loaded.");
    } finally {
      setLoadingCampaigns(false);
    }
  }

  async function loadInsights() {
    if (!selectedAdAccountId) {
      setNotice("Choose a Meta ad account before loading data.");
      return;
    }

    setLoadingInsights(true);
    setNotice("");
    setInsights([]);

    const params = new URLSearchParams({
      clientId: client.id,
      adAccountId: selectedAdAccountId,
      datePreset,
      level
    });
    if (campaignId !== "all") params.set("campaignId", campaignId);

    try {
      const response = await fetch(`/api/meta/insights?${params.toString()}`);
      const result = (await response.json()) as { campaigns?: MetaInsightRow[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Meta insights could not be loaded.");
      setInsights(result.campaigns || []);
      if (!result.campaigns?.length) {
        setNotice("Meta returned empty data for this selection.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Meta insights could not be loaded.");
    } finally {
      setLoadingInsights(false);
    }
  }

  return (
    <div className="workspace-app-content meta-ads-app">
      <header className="meta-ads-header">
        <div>
          <p className="eyebrow">Facebook & Instagram</p>
          <h2>Meta Ads Manager</h2>
          <span>Load live campaign data from the connected Meta ad account.</span>
        </div>
        <div className="app-actions compact">
          {connection?.connected && <span className="pill active">Meta Ads Connected</span>}
          <button className="ghost-button light" onClick={loadStatus} type="button">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </header>

      {notice && <div className="notice">{notice}</div>}

      {loadingStatus && <div className="empty-state">Checking Meta connection...</div>}

      {!loadingStatus && connection?.locked && (
        <section className="mini-panel meta-api-card">
          <p className="eyebrow">Locked</p>
          <h3>Meta/Facebook Ads unavailable</h3>
          <p>{connection.message || "Meta/Facebook Ads is not enabled for this account."}</p>
        </section>
      )}

      {!loadingStatus && connection && !connection.locked && !connection.connected && (
        <section className="mini-panel meta-api-card">
          <p className="eyebrow">Not connected</p>
          <h3>Connect Meta Ads</h3>
          <p>Connect Meta Ads to load real ad account and campaign data.</p>
          <a className="button" href={`/api/meta/connect?clientId=${encodeURIComponent(client.id)}`}>
            <Plug size={15} /> Connect Meta Ads
          </a>
        </section>
      )}

      {!loadingStatus && connection?.connected && !connection.adAccounts.length && (
        <section className="mini-panel meta-api-card">
          <p className="eyebrow">Connected</p>
          <h3>No ad accounts found</h3>
          <p>Meta is connected, but no ad accounts were found.</p>
          <div className="recommendation-list">
            <div className="notice">The connected Facebook account may not have ad account access.</div>
            <div className="notice">The wrong Meta account may have been connected.</div>
            <div className="notice">Business or ad account permissions may not have been approved.</div>
          </div>
          <a className="button" href={`/api/meta/connect?clientId=${encodeURIComponent(client.id)}`}>
            <Plug size={15} /> Reconnect Meta Ads
          </a>
        </section>
      )}

      {!loadingStatus && connection?.connected && Boolean(connection.adAccounts.length) && (
        <>
          <section className="mini-panel meta-api-card">
            <div className="app-section-header">
              <div>
                <p className="eyebrow">Meta Ads Connected</p>
                <h3>Choose data to load</h3>
              </div>
            </div>
            <div className="meta-live-controls">
              <label>
                <span>Ad account</span>
                <select
                  onChange={(event) => saveSelectedAdAccount(event.target.value)}
                  value={selectedAdAccountId}
                >
                  {connection.adAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date range</span>
                <select onChange={(event) => setDatePreset(event.target.value as DatePreset)} value={datePreset}>
                  {datePresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Level</span>
                <select onChange={(event) => setLevel(event.target.value as MetaLevel)} value={level}>
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Campaign</span>
                <select
                  disabled={loadingCampaigns || !campaigns.length}
                  onChange={(event) => setCampaignId(event.target.value)}
                  value={campaignId}
                >
                  <option value="all">All campaigns</option>
                  {campaigns.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <button className="button" disabled={loadingInsights} onClick={loadInsights} type="button">
                {loadingInsights ? "Loading..." : "Load Meta Data"}
              </button>
            </div>
            {selectedAccount && (
              <div className="meta-account-list">
                <div className="notice">
                  <strong>{selectedAccount.name}</strong>
                  <span>{selectedAccount.currency || "Currency unavailable"} · {selectedAccount.timezone_name || "Timezone unavailable"}</span>
                </div>
              </div>
            )}
          </section>

          <section className="mini-panel meta-campaign-panel">
            <div className="app-section-header">
              <div>
                <p className="eyebrow">Campaigns</p>
                <h3>Available campaigns</h3>
              </div>
            </div>
            {loadingCampaigns ? (
              <div className="empty-state compact">Loading campaigns...</div>
            ) : !campaigns.length ? (
              <div className="empty-state compact">No campaigns found for this ad account. Try another ad account or date range, or create a campaign in Meta Ads Manager.</div>
            ) : (
              <div className="table-wrap embedded">
                <table className="client-table meta-campaign-table">
                  <thead><tr><th>Campaign</th><th>Status</th><th>Effective status</th><th>Objective</th><th>Start</th><th>Stop</th></tr></thead>
                  <tbody>{campaigns.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.id}</small></td><td>{item.status || "Unavailable"}</td><td>{item.effectiveStatus || "Unavailable"}</td><td>{item.objective || "Unavailable"}</td><td>{formatMaybeDate(item.startTime)}</td><td>{formatMaybeDate(item.stopTime)}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mini-panel meta-campaign-panel">
            <div className="app-section-header">
              <div>
                <p className="eyebrow">Insights</p>
                <h3>Loaded Meta data</h3>
              </div>
            </div>
            {!insights.length ? (
              <div className="empty-state compact">Choose the account, date range, level, and campaign, then load Meta data.</div>
            ) : (
              <>
                <div className="meta-metric-grid">
                  <Metric label="Spend" value={money(sum(insights, "spend"))} />
                  <Metric label="Reach" value={number(sum(insights, "reach"))} />
                  <Metric label="Impressions" value={number(sum(insights, "impressions"))} />
                  <Metric label="Clicks" value={number(sum(insights, "clicks"))} />
                  <Metric label="CTR" value={`${average(insights, "ctr").toFixed(2)}%`} />
                  <Metric label="CPC" value={money(average(insights, "cpc"))} />
                  <Metric label="Frequency" value={average(insights, "frequency").toFixed(2)} />
                </div>
                <div className="table-wrap embedded">
                  <table className="client-table meta-campaign-table">
                    <thead><tr><th>Name</th><th>Campaign</th><th>Spend</th><th>Reach</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPC</th><th>Frequency</th></tr></thead>
                    <tbody>{insights.map((item, index) => <tr key={`${item.campaignId}-${item.adsetId}-${item.adId}-${item.campaignName}-${index}`}><td><strong>{displayInsightName(item, level)}</strong></td><td>{item.campaignName}</td><td>{money(item.spend)}</td><td>{number(item.reach)}</td><td>{number(item.impressions)}</td><td>{number(item.clicks)}</td><td>{item.ctr.toFixed(2)}%</td><td>{money(item.cpc)}</td><td>{item.frequency.toFixed(2)}</td></tr>)}</tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="report-metric-card"><span>{label}</span><strong>{value}</strong></article>;
}

function displayInsightName(item: MetaInsightRow, level: MetaLevel) {
  if (level === "ad") return item.adName || item.campaignName;
  if (level === "adset") return item.adsetName || item.campaignName;
  return item.campaignName;
}

function sum(rows: MetaInsightRow[], field: keyof Pick<MetaInsightRow, "spend" | "reach" | "impressions" | "clicks">) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function average(rows: MetaInsightRow[], field: keyof Pick<MetaInsightRow, "ctr" | "cpc" | "frequency">) {
  return rows.length ? rows.reduce((total, row) => total + Number(row[field] || 0), 0) / rows.length : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function number(value: number) {
  return value.toLocaleString("en-US");
}

function formatMaybeDate(value: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
