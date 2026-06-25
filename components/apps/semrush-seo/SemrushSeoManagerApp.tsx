"use client";

import { AlertTriangle, BarChart3, Download, ExternalLink, Eye, FileWarning, Link2, Plug, Search, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import type { ClientAccount } from "@/lib/types";
import type { SemrushBacklink, SemrushCompetitor, SemrushKeyword, SemrushKeywordGap, SemrushSeoSummary, SemrushSiteAuditIssue, SemrushVisibilityPoint } from "@/lib/semrush-seo/types";

type SemrushDashboard = {
  keywords: SemrushKeyword[];
  competitors: SemrushCompetitor[];
  backlinks: SemrushBacklink[];
  siteAuditIssues: SemrushSiteAuditIssue[];
  keywordGaps: SemrushKeywordGap[];
  visibilityTrend: SemrushVisibilityPoint[];
  summary: SemrushSeoSummary;
  demoMode: boolean;
};

export function SemrushSeoManagerApp({ client }: { client: ClientAccount }) {
  const [data, setData] = useState<SemrushDashboard | null>(null);
  const [notice, setNotice] = useState("");
  const headers = useMemo(() => ({ "x-beast-client-id": client.id, "x-beast-role": client.role }), [client.id, client.role]);

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [client.id]);

  async function load() {
    const response = await fetch("/api/semrush-seo/summary", { headers });
    if (!response.ok) return setNotice("Semrush SEO dashboard could not be loaded.");
    setData(await response.json() as SemrushDashboard);
  }

  if (!data) return <div className="empty-state">Loading Semrush SEO visibility...</div>;

  return (
    <div className="workspace-app-content semrush-seo-app">
      <header className="semrush-seo-header">
        <div className="semrush-title">
          <Search size={25} />
          <div>
            <p className="eyebrow">SEO / search visibility</p>
            <h2>Semrush SEO Manager</h2>
            <span>Organic rankings, competitor intelligence, backlinks, site audit, and paid search research</span>
          </div>
        </div>
        <div className="app-actions compact">
          <span className={`pill ${data.demoMode ? "trial" : "active"}`}>{data.demoMode ? "Demo Semrush data" : "Semrush synced"}</span>
          <button className="ghost-button light" onClick={() => setNotice("Semrush export download is coming next.")} type="button"><Download size={15} /> Export</button>
        </div>
      </header>

      {notice ? <div className="notice">{notice}</div> : null}

      <div className="semrush-metric-grid">
        <Metric icon={<Search size={17} />} label="Top ranking keywords" value={String(data.summary.topRankingKeywords)} />
        <Metric icon={<TrendingUp size={17} />} label="Keywords gained" value={String(data.summary.keywordsGained)} />
        <Metric icon={<TrendingDown size={17} />} label="Keywords lost" value={String(data.summary.keywordsLost)} />
        <Metric icon={<BarChart3 size={17} />} label="Position tracking" value={String(data.summary.trackedKeywords)} />
        <Metric icon={<FileWarning size={17} />} label="Site audit score" value={`${data.summary.siteAuditScore}%`} />
        <Metric icon={<Link2 size={17} />} label="Backlink count" value={compact(data.summary.backlinkCount)} />
        <Metric icon={<ShieldAlert size={17} />} label="Toxic backlinks" value={String(data.summary.toxicBacklinks)} />
        <Metric icon={<Eye size={17} />} label="Domain visibility" value={`${data.summary.domainVisibility}%`} />
      </div>

      <div className="app-grid semrush-main-grid">
        <section className="mini-panel semrush-keyword-panel">
          <div className="app-section-header">
            <div>
              <p className="eyebrow">Keyword rankings</p>
              <h3>Top organic keywords</h3>
            </div>
            <span className="pill active">{compact(data.summary.organicTrafficEstimate)} traffic estimate</span>
          </div>
          <div className="table-wrap embedded">
            <table className="client-table semrush-keyword-table">
              <thead><tr><th>Keyword</th><th>Intent</th><th>Pos.</th><th>Move</th><th>Volume</th><th>Traffic</th><th>URL</th></tr></thead>
              <tbody>
                {data.keywords.map((item) => {
                  const movement = item.previousPosition - item.position;
                  return <tr key={item.id}><td><strong>{item.keyword}</strong></td><td>{item.intent}</td><td>{item.position}</td><td><span className={`pill ${movement >= 0 ? "active" : "locked"}`}>{movement >= 0 ? `+${movement}` : movement}</span></td><td>{compact(item.volume)}</td><td>{compact(item.traffic)}</td><td>{item.url}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mini-panel semrush-trend-panel">
          <p className="eyebrow">Organic visibility trend</p>
          <h3>Search visibility movement</h3>
          <div className="semrush-trend">
            {data.visibilityTrend.map((item) => <div key={item.month}><span style={{ height: `${Math.max(18, item.visibility * 5)}px` }} /><small>{item.month}</small></div>)}
          </div>
        </section>
      </div>

      <div className="app-grid semrush-bottom-grid">
        <section className="mini-panel">
          <p className="eyebrow">Competitor comparison</p>
          <h3>Organic and paid search research</h3>
          <div className="semrush-list">
            {data.competitors.map((item) => <article key={item.domain}><strong>{item.domain}</strong><span>{item.sharedKeywords} shared keywords · {item.competitorKeywords} competitor keywords</span><small>{item.visibility}% visibility · {item.paidKeywords} advertised keywords</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Backlink analytics</p>
          <h3>Authority and toxic link checks</h3>
          <div className="semrush-list">
            {data.backlinks.map((item) => <article className={item.toxic ? "risk" : ""} key={item.domain}><strong>{item.domain}</strong><span>{item.links} links · authority {item.authorityScore}</span><small>{item.toxic ? "Toxic backlink review" : `Anchor: ${item.anchor}`}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Site audit errors</p>
          <h3>SEO health score blockers</h3>
          <div className="semrush-list compact">
            {data.siteAuditIssues.map((item) => <article key={item.id}><strong>{item.issue}</strong><span>{item.pages} affected pages</span><small>{item.severity}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Keyword gap analysis</p>
          <h3>Competitor keyword gaps</h3>
          <div className="semrush-list compact">
            {data.keywordGaps.map((item) => <article key={item.keyword}><strong>{item.keyword}</strong><span>{item.competitor} ranks #{item.competitorPosition}</span><small>{item.clientPosition ? `Client ranks #${item.clientPosition}` : "Client does not rank"} · {compact(item.volume)} volume</small></article>)}
          </div>
        </section>
        <section className="mini-panel semrush-api-card">
          <p className="eyebrow">Coming later</p>
          <h3>Connect Semrush APIs</h3>
          <p>Future sync can pull Domain Analytics, Keyword Analytics, Backlink Analytics, Organic Research, Advertising Research, Position Tracking, Site Audit, and Keyword Gap reports.</p>
          <button disabled type="button"><Plug size={14} /> Connect Semrush API</button>
        </section>
      </div>

      <div className="semrush-context-note">
        <AlertTriangle size={15} />
        <span>Paid search data here is competitive intelligence, not ad management.</span>
        <ExternalLink size={14} />
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="report-metric-card">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

function compact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
