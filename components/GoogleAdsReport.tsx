"use client";

import { CalendarClock, MousePointerClick, Target, TrendingUp } from "lucide-react";
import type { GoogleAdsCampaignReport } from "@/lib/google-ads-reports";

type GoogleAdsReportProps = {
  companyName: string;
  report: GoogleAdsCampaignReport;
};

export function GoogleAdsReport({ companyName, report }: GoogleAdsReportProps) {
  const metrics = [
    {
      label: "Clicks",
      value: report.clicks.toLocaleString(),
      icon: MousePointerClick
    },
    {
      label: "Impressions",
      value: report.impressions.toLocaleString(),
      icon: TrendingUp
    },
    {
      label: "CTR",
      value: report.ctr,
      icon: Target
    },
    {
      label: "Conversions",
      value: report.conversions.toLocaleString(),
      icon: CalendarClock
    }
  ];

  return (
    <div className="ads-report">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Google Ads</p>
          <h1>{companyName}</h1>
          <p className="muted">
            Manual campaign report for the current Google Ads block. Admin-managed
            reporting data can replace this demo source later.
          </p>
        </div>
        <div className="status-summary">
          <div>
            <span className="summary-label">Campaign</span>
            <strong>{report.campaignName}</strong>
          </div>
          <div>
            <span className="summary-label">Budget</span>
            <strong>{report.budget}</strong>
          </div>
          <div>
            <span className="summary-label">Status</span>
            <strong>{report.status}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Campaign overview</h2>
          </div>
          <span className={`pill ${report.status.toLowerCase().replace(" ", "-")}`}>
            {report.status}
          </span>
        </div>

        <div className="grid two">
          <article className="panel">
            <h3>{report.campaignName}</h3>
            <div className="metric">
              <span>Budget</span>
              <strong>{report.budget}</strong>
            </div>
            <div className="metric">
              <span>Cost</span>
              <strong>{report.cost}</strong>
            </div>
            <div className="metric">
              <span>Status</span>
              <strong>{report.status}</strong>
            </div>
          </article>

          <article className="panel">
            <h3>Last updated</h3>
            <p className="muted">
              This manual report was last updated on{" "}
              <strong>{formatReportDate(report.lastUpdated)}</strong>.
            </p>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Performance</p>
            <h2>Basic performance metrics</h2>
          </div>
        </div>
        <div className="ads-metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="ads-metric-card" key={metric.label}>
                <Icon size={20} aria-hidden="true" />
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="support-section">
        <p className="eyebrow">Notes</p>
        <h2>Notes and recommendations</h2>
        <div className="recommendation-list">
          {report.notes.map((note) => (
            <div className="notice" key={note}>
              {note}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatReportDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(date));
}
