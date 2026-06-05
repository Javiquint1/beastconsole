"use client";

import { CalendarClock, Send, Sparkles } from "lucide-react";
import { getEmailMarketingReport } from "@/lib/email-marketing-reports";
import type { ClientAccount } from "@/lib/types";

type EmailAppProps = {
  client: ClientAccount;
};

export function EmailApp({ client }: EmailAppProps) {
  const report = getEmailMarketingReport(client);
  const campaign = report.currentCampaign;

  return (
    <div className="workspace-app-content email-app">
      <div className="app-grid email-layout">
        <aside className="app-sidebar">
          <button className="button app-full-button" type="button">
            New campaign
          </button>
          <h3>Campaign list</h3>
          {report.recentEmails.map((email) => (
            <button className="campaign-list-item" key={`${email.campaignName}-${email.sentDate}`} type="button">
              <strong>{email.campaignName}</strong>
              <span>{email.status}</span>
            </button>
          ))}
        </aside>

        <main className="app-main-panel">
          <div className="app-section-header">
            <div>
              <p className="eyebrow">Email builder</p>
              <h2>{campaign.campaignName}</h2>
            </div>
            <span className={`pill ${campaign.status.toLowerCase()}`}>{campaign.status}</span>
          </div>

          <div className="field">
            <label htmlFor="emailSubject">Subject line</label>
            <input id="emailSubject" defaultValue={campaign.subject} />
          </div>

          <div className="field">
            <label htmlFor="emailBody">Email body editor</label>
            <textarea
              id="emailBody"
              defaultValue={`Hi there,\n\nThis month, ${client.companyName} has a helpful update for you.\n\nBook today to take advantage of the latest offer.`}
              rows={9}
            />
          </div>

          <section className="mini-panel">
            <h3>Audience and recipients</h3>
            <div className="metric">
              <span>Selected audience</span>
              <strong>Current customer list</strong>
            </div>
            <div className="metric">
              <span>Recipients</span>
              <strong>{campaign.recipients.toLocaleString()}</strong>
            </div>
          </section>

          <div className="app-actions">
            <button className="button" type="button">
              <Send size={16} aria-hidden="true" />
              Send placeholder
            </button>
            <button className="ghost-button light" type="button">
              <CalendarClock size={16} aria-hidden="true" />
              Schedule placeholder
            </button>
            <button className="ghost-button light" type="button">
              <Sparkles size={16} aria-hidden="true" />
              AI suggestion
            </button>
          </div>
        </main>

        <aside className="app-side-panel">
          <h3>Campaign stats</h3>
          <div className="metric">
            <span>Sent</span>
            <strong>{campaign.recipients.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Opens</span>
            <strong>{campaign.opens.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Clicks</span>
            <strong>{campaign.clicks.toLocaleString()}</strong>
          </div>
          <div className="metric">
            <span>Status</span>
            <strong>{campaign.status}</strong>
          </div>
          <div className="notice">{report.suggestedNextEmailIdea}</div>
        </aside>
      </div>
    </div>
  );
}
