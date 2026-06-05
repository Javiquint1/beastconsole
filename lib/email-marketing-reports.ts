import type { ClientAccount } from "./types";
import type { EmailReportRecord } from "./database-schema";
import { loadDatabase } from "./storage";

export type EmailCampaign = {
  campaignName: string;
  subject: string;
  sentDate: string;
  recipients: number;
  opens: number;
  clicks: number;
  status: "Draft" | "Scheduled" | "Sent";
};

export type EmailMarketingReport = {
  currentCampaign: EmailCampaign;
  recentEmails: EmailCampaign[];
  suggestedNextEmailIdea: string;
  lastUpdated: string;
  source: "manual-admin" | "brevo" | "mailchimp" | "constant-contact" | "gmail" | "custom-smtp";
};

const fallbackCampaign: EmailCampaign = {
  campaignName: "June Promo Email",
  subject: "Special Offer This Month",
  sentDate: "2026-06-04",
  recipients: 850,
  opens: 312,
  clicks: 67,
  status: "Sent"
};

const fallbackReport: EmailMarketingReport = {
  currentCampaign: fallbackCampaign,
  recentEmails: [
    fallbackCampaign,
    {
      campaignName: "Welcome Back Offer",
      subject: "We saved something special for you",
      sentDate: "2026-05-22",
      recipients: 790,
      opens: 281,
      clicks: 49,
      status: "Sent"
    },
    {
      campaignName: "Customer Check-In",
      subject: "Quick question about your next visit",
      sentDate: "2026-05-08",
      recipients: 725,
      opens: 244,
      clicks: 38,
      status: "Sent"
    }
  ],
  suggestedNextEmailIdea:
    "Send a short reminder email that highlights the strongest current offer and adds one clear booking or contact button.",
  lastUpdated: "2026-06-04",
  source: "manual-admin"
};

export function getEmailMarketingReport(client: ClientAccount) {
  const reports = loadDatabase()
    .email_reports.filter((item) => item.clientId === client.id)
    .sort((a, b) => b.sentDate.localeCompare(a.sentDate));

  if (!reports.length) {
    return fallbackReport;
  }

  const currentCampaign = toEmailCampaign(reports[0]);

  return {
    currentCampaign,
    recentEmails: reports.map(toEmailCampaign),
    suggestedNextEmailIdea:
      reports[0].suggestedNextEmailIdea ??
      "Send a short follow-up email with one clear call to action.",
    lastUpdated: reports[0].updatedAt,
    source: reports[0].source
  };
}

function toEmailCampaign(report: EmailReportRecord): EmailCampaign {
  return {
    campaignName: report.campaignName,
    subject: report.subject,
    sentDate: report.sentDate,
    recipients: report.recipients,
    opens: report.opens,
    clicks: report.clicks,
    status: report.status
  };
}
