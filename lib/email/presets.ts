import type { EmailConnectionInput, EmailProviderType } from "./types";

export type EmailProviderPreset = Pick<
  EmailConnectionInput,
  "imapHost" | "imapPort" | "imapSecure" | "smtpHost" | "smtpPort" | "smtpSecure"
>;

export const emailProviderPresets: Record<EmailProviderType, EmailProviderPreset> = {
  gmail: {
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true
  },
  microsoft: {
    imapHost: "outlook.office365.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    smtpSecure: false
  },
  cpanel: {
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 465,
    smtpSecure: true
  },
  zoho: {
    imapHost: "imap.zoho.com",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "smtp.zoho.com",
    smtpPort: 465,
    smtpSecure: true
  },
  custom: {
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false
  }
};
