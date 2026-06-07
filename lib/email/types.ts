export type EmailProviderType =
  | "gmail"
  | "microsoft"
  | "cpanel"
  | "zoho"
  | "custom";

export type EmailFolder = "inbox" | "sent" | "drafts" | "archive" | "trash";

export type EmailConnectionInput = {
  providerType: EmailProviderType;
  emailAddress: string;
  displayName: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  username: string;
  password: string;
};

export type EmailConnection = Omit<EmailConnectionInput, "password"> & {
  id: string;
  clientId: string;
  passwordEncrypted: string;
  status: "connected" | "error" | "disconnected";
  lastTestedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicEmailConnection = Omit<EmailConnection, "passwordEncrypted">;

export type EmailMessage = {
  id: string;
  clientId: string;
  emailConnectionId: string;
  providerMessageId: string;
  folder: EmailFolder;
  fromEmail: string;
  fromName: string;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  snippet: string;
  bodyPreview: string;
  isRead: boolean;
  hasAttachments: boolean;
  receivedAt?: string;
  sentAt?: string;
  cachedAt: string;
};

export type ComposeEmailInput = {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
};

export type EmailDraft = ComposeEmailInput & {
  id: string;
  clientId: string;
  emailConnectionId: string;
  status: "draft";
  createdAt: string;
  updatedAt: string;
};

export type EmailSendLog = {
  id: string;
  clientId: string;
  emailConnectionId: string;
  toEmails: string[];
  subject: string;
  status: "sent" | "failed";
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
};

// Future database tables map directly to these records:
// email_connections, email_messages_cache, email_drafts, email_send_logs.
