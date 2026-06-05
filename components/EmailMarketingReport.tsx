"use client";

import { CalendarDays, MailOpen, MousePointerClick, UsersRound } from "lucide-react";
import type { EmailMarketingReport as EmailMarketingReportData } from "@/lib/email-marketing-reports";

type EmailMarketingReportProps = {
  companyName: string;
  report: EmailMarketingReportData;
};

export function EmailMarketingReport({
  companyName,
  report
}: EmailMarketingReportProps) {
  const campaign = report.currentCampaign;
  const openRate = rate(campaign.opens, campaign.recipients);
  const clickRate = rate(campaign.clicks, campaign.recipients);
  const metrics = [
    {
      label: "Recipients",
      value: campaign.recipients.toLocaleString(),
      icon: UsersRound
    },
    {
      label: "Opens",
      value: campaign.opens.toLocaleString(),
      icon: MailOpen
    },
    {
      label: "Clicks",
      value: campaign.clicks.toLocaleString(),
      icon: MousePointerClick
    },
    {
      label: "Open rate",
      value: openRate,
      icon: CalendarDays
    }
  ];

  return (
    <div className="email-report">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Email Marketing</p>
          <h1>{companyName}</h1>
          <p className="muted">
            Manual email campaign report for the current client block. This data
            source can later be replaced by Brevo, Mailchimp, Constant Contact,
            Gmail, or custom SMTP reporting.
          </p>
        </div>
        <div className="status-summary">
          <div>
            <span className="summary-label">Campaign</span>
            <strong>{campaign.campaignName}</strong>
          </div>
          <div>
            <span className="summary-label">Subject</span>
            <strong>{campaign.subject}</strong>
          </div>
          <div>
            <span className="summary-label">Status</span>
            <strong>{campaign.status}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Email campaign overview</h2>
          </div>
          <span className={`pill ${campaign.status.toLowerCase()}`}>
            {campaign.status}
          </span>
        </div>

        <div className="grid two">
          <article className="panel">
            <h3>{campaign.campaignName}</h3>
            <div className="metric">
              <span>Subject line</span>
              <strong>{campaign.subject}</strong>
            </div>
            <div className="metric">
              <span>Sent date</span>
              <strong>{formatReportDate(campaign.sentDate)}</strong>
            </div>
            <div className="metric">
              <span>Status</span>
              <strong>{campaign.status}</strong>
            </div>
          </article>

          <article className="panel">
            <h3>Report details</h3>
            <p className="muted">
              Last updated on <strong>{formatReportDate(report.lastUpdated)}</strong>.
            </p>
            <p className="muted">Current source: {report.source.replace("-", " ")}.</p>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Performance</p>
            <h2>Performance metrics</h2>
          </div>
        </div>
        <div className="report-metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="report-metric-card" key={metric.label}>
                <Icon size={20} aria-hidden="true" />
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent sends</p>
            <h2>Recent emails</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table className="client-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Subject</th>
                <th>Sent date</th>
                <th>Recipients</th>
                <th>Opens</th>
                <th>Clicks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.recentEmails.map((email) => (
                <tr key={`${email.campaignName}-${email.sentDate}`}>
                  <td>{email.campaignName}</td>
                  <td>{email.subject}</td>
                  <td>{formatReportDate(email.sentDate)}</td>
                  <td>{email.recipients.toLocaleString()}</td>
                  <td>{email.opens.toLocaleString()}</td>
                  <td>{email.clicks.toLocaleString()}</td>
                  <td>
                    <span className={`pill ${email.status.toLowerCase()}`}>
                      {email.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="support-section">
        <p className="eyebrow">Next idea</p>
        <h2>Suggested next email idea</h2>
        <div className="notice">{report.suggestedNextEmailIdea}</div>
        <p className="muted email-rate-note">
          Current click rate: {clickRate}. Use it as a baseline for the next send.
        </p>
      </section>
    </div>
  );
}

function rate(value: number, total: number) {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function formatReportDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(date));
}
