import "server-only";

import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { decryptPassword, encryptPassword } from "./encryption";
import {
  addSendLog,
  cacheMessages,
  getConnection,
  getMessages,
  saveConnection
} from "./store";
import type {
  ComposeEmailInput,
  EmailConnection,
  EmailConnectionInput,
  EmailMessage
} from "./types";

export async function testEmailConnection(input: EmailConnectionInput) {
  const transporter = createTransport(input);
  await transporter.verify();
  if (input.imapHost) {
    const client = createImapClient(input);
    await client.connect();
    await client.logout();
  }
  return { smtp: true, imap: Boolean(input.imapHost) };
}

export async function createEmailConnection(clientId: string, input: EmailConnectionInput) {
  await testEmailConnection(input);
  const now = new Date().toISOString();
  const connection: EmailConnection = {
    ...input,
    id: `email-connection-${clientId}`,
    clientId,
    passwordEncrypted: encryptPassword(input.password),
    status: "connected",
    lastTestedAt: now,
    createdAt: now,
    updatedAt: now
  };
  return saveConnection(connection);
}

export async function sendEmail(clientId: string, input: ComposeEmailInput) {
  const connection = requiredConnection(clientId);
  const now = new Date().toISOString();
  try {
    const result = await createTransport(withPassword(connection)).sendMail({
      from: { name: connection.displayName, address: connection.emailAddress },
      to: input.to,
      cc: input.cc,
      bcc: input.bcc,
      subject: input.subject,
      text: input.body
    });
    addSendLog({
      id: `send-${Date.now()}`,
      clientId,
      emailConnectionId: connection.id,
      toEmails: splitAddresses(input.to),
      subject: input.subject,
      status: "sent",
      sentAt: now,
      createdAt: now
    });
    return { ok: true, messageId: result.messageId };
  } catch (error) {
    addSendLog({
      id: `send-${Date.now()}`,
      clientId,
      emailConnectionId: connection.id,
      toEmails: splitAddresses(input.to),
      subject: input.subject,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "SMTP send failed.",
      createdAt: now
    });
    throw error;
  }
}

export async function syncInbox(clientId: string) {
  const connection = requiredConnection(clientId);
  if (!connection.imapHost) return getMessages(clientId);
  const client = createImapClient(withPassword(connection));
  await client.connect();
  try {
    await client.mailboxOpen("INBOX");
    const uids = await client.search({ all: true }, { uid: true });
    if (!uids) return getMessages(clientId);
    const latestUids = uids.slice(-30);
    if (!latestUids.length) return getMessages(clientId);
    const fetched = await client.fetchAll(latestUids, {
      uid: true,
      envelope: true,
      flags: true,
      internalDate: true,
      bodyStructure: true
    }, { uid: true });
    const cachedAt = new Date().toISOString();
    const messages: EmailMessage[] = fetched.map((message) => ({
      id: String(message.uid),
      clientId,
      emailConnectionId: connection.id,
      providerMessageId: String(message.uid),
      folder: "inbox",
      fromEmail: message.envelope?.from?.[0]?.address || "",
      fromName: message.envelope?.from?.[0]?.name || message.envelope?.from?.[0]?.address || "Unknown sender",
      toEmails: (message.envelope?.to || []).map((address) => address.address || "").filter(Boolean),
      ccEmails: (message.envelope?.cc || []).map((address) => address.address || "").filter(Boolean),
      subject: message.envelope?.subject || "(No subject)",
      snippet: "Open the message in Beast Console to review this email.",
      bodyPreview: "Message body preview will be cached in the next IMAP parsing phase.",
      isRead: message.flags?.has("\\Seen") ?? false,
      hasAttachments: JSON.stringify(message.bodyStructure || "").includes("attachment"),
      receivedAt: message.internalDate ? new Date(message.internalDate).toISOString() : undefined,
      cachedAt
    }));
    return cacheMessages(clientId, messages);
  } finally {
    await client.logout();
  }
}

function createTransport(input: EmailConnectionInput) {
  return nodemailer.createTransport({
    host: input.smtpHost,
    port: Number(input.smtpPort),
    secure: input.smtpSecure,
    auth: { user: input.username, pass: input.password },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000
  });
}

function createImapClient(input: EmailConnectionInput) {
  return new ImapFlow({
    host: input.imapHost!,
    port: Number(input.imapPort || 993),
    secure: Boolean(input.imapSecure),
    auth: { user: input.username, pass: input.password },
    logger: false
  });
}

function requiredConnection(clientId: string) {
  const connection = getConnection(clientId);
  if (!connection || connection.status !== "connected") throw new Error("No email connection is configured.");
  return connection;
}

function withPassword(connection: EmailConnection): EmailConnectionInput {
  return { ...connection, password: decryptPassword(connection.passwordEncrypted) };
}

function splitAddresses(value?: string) {
  return (value || "").split(",").map((address) => address.trim()).filter(Boolean);
}
