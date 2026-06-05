"use client";

import { Plus, Settings } from "lucide-react";
import { getGoogleAdsReport } from "@/lib/google-ads-reports";
import type { ClientAccount } from "@/lib/types";

type GoogleAdsManagerAppProps = {
  client: ClientAccount;
};

export function GoogleAdsManagerApp({ client }: GoogleAdsManagerAppProps) {
  const report = getGoogleAdsReport(client);
  const campaigns = [
    report,
    {
      ...report,
      campaignName: "Brand Search Protection",
      budget: "$700/month",
      clicks: 188,
      impressions: 6410,
      ctr: "2.93%",
      cost: "$421.14",
      conversions: 19,
      status: "Active" as const
    }
  ];

  return (
    <div className="workspace-app-content google-ads-app">
      <div className="app-section-header">
        <div>
          <p className="eyebrow">Google Ads Manager</p>
          <h2>Campaign overview</h2>
        </div>
        <div className="app-actions compact">
          <button className="button" type="button">
            <Plus size={16} aria-hidden="true" />
            Add campaign
          </button>
          <button className="ghost-button light" type="button">
            <Settings size={16} aria-hidden="true" />
            Edit placeholder
          </button>
        </div>
      </div>

      <div className="report-metric-grid">
        <article className="report-metric-card">
          <span>Budget</span>
          <strong>{report.budget}</strong>
        </article>
        <article className="report-metric-card">
          <span>Clicks</span>
          <strong>{report.clicks.toLocaleString()}</strong>
        </article>
        <article className="report-metric-card">
          <span>CTR</span>
          <strong>{report.ctr}</strong>
        </article>
        <article className="report-metric-card">
          <span>Conversions</span>
          <strong>{report.conversions}</strong>
        </article>
      </div>

      <section className="mini-panel">
        <h3>Campaign table</h3>
        <div className="table-wrap embedded">
          <table className="client-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Budget</th>
                <th>Clicks</th>
                <th>Impressions</th>
                <th>CTR</th>
                <th>Cost</th>
                <th>Conversions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaignName}>
                  <td>{campaign.campaignName}</td>
                  <td>{campaign.budget}</td>
                  <td>{campaign.clicks.toLocaleString()}</td>
                  <td>{campaign.impressions.toLocaleString()}</td>
                  <td>{campaign.ctr}</td>
                  <td>{campaign.cost}</td>
                  <td>{campaign.conversions}</td>
                  <td>
                    <span className={`pill ${campaign.status.toLowerCase().replace(" ", "-")}`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="app-grid two-column-app">
        <section className="mini-panel">
          <h3>Recommendations</h3>
          <div className="recommendation-list">
            {report.notes.map((note) => (
              <div className="notice" key={note}>{note}</div>
            ))}
          </div>
        </section>
        <section className="mini-panel">
          <h3>Notes</h3>
          <textarea
            defaultValue={`Last updated: ${report.lastUpdated}\nFuture Google Ads API integration can sync campaigns, budgets, and conversion data here.`}
            rows={6}
          />
        </section>
      </div>
    </div>
  );
}
