import type { EmailMessage } from "./types";

const now = "2026-06-07T14:00:00.000Z";

export const mockEmailMessages: EmailMessage[] = [
  {
    id: "demo-1",
    clientId: "demo",
    emailConnectionId: "demo",
    providerMessageId: "demo-1",
    folder: "inbox",
    fromEmail: "jordan@example.com",
    fromName: "Jordan Miles",
    toEmails: ["hello@business.test"],
    ccEmails: [],
    subject: "Question about an appointment",
    snippet: "I found your website and wanted to ask about availability...",
    bodyPreview: "Hi, I found your website and wanted to ask about availability this week. Please let me know the best next step.",
    isRead: false,
    hasAttachments: false,
    receivedAt: now,
    cachedAt: now
  },
  {
    id: "demo-2",
    clientId: "demo",
    emailConnectionId: "demo",
    providerMessageId: "demo-2",
    folder: "inbox",
    fromEmail: "supplier@example.com",
    fromName: "Business Supplier",
    toEmails: ["hello@business.test"],
    ccEmails: [],
    subject: "Updated proposal",
    snippet: "The updated proposal is ready for your review...",
    bodyPreview: "The updated proposal is ready for your review. Let us know if you would like to discuss the details.",
    isRead: true,
    hasAttachments: true,
    receivedAt: "2026-06-06T16:30:00.000Z",
    cachedAt: now
  }
];
