import "server-only";

import type {
  EmailConnection,
  EmailDraft,
  EmailMessage,
  EmailSendLog,
  PublicEmailConnection
} from "./types";

const connections = new Map<string, EmailConnection>();
const messages = new Map<string, EmailMessage>();
const drafts = new Map<string, EmailDraft>();
const sendLogs: EmailSendLog[] = [];

export function getConnection(clientId: string) {
  return connections.get(clientId);
}

export function saveConnection(connection: EmailConnection) {
  connections.set(connection.clientId, connection);
  return connection;
}

export function disconnectConnection(clientId: string) {
  const connection = connections.get(clientId);
  if (connection) {
    saveConnection({
      ...connection,
      status: "disconnected",
      updatedAt: new Date().toISOString()
    });
  }
}

export function publicConnection(connection?: EmailConnection): PublicEmailConnection | null {
  if (!connection || connection.status === "disconnected") return null;
  const { passwordEncrypted: _password, ...safe } = connection;
  return safe;
}

export function cacheMessages(clientId: string, incoming: EmailMessage[]) {
  incoming.forEach((message) => messages.set(`${clientId}:${message.id}`, message));
  return getMessages(clientId);
}

export function getMessages(clientId: string) {
  return Array.from(messages.values()).filter((message) => message.clientId === clientId);
}

export function getMessage(clientId: string, id: string) {
  return messages.get(`${clientId}:${id}`);
}

export function updateMessage(clientId: string, id: string, updates: Partial<EmailMessage>) {
  const message = getMessage(clientId, id);
  if (!message) return null;
  const updated = { ...message, ...updates };
  messages.set(`${clientId}:${id}`, updated);
  return updated;
}

export function saveDraft(draft: EmailDraft) {
  drafts.set(`${draft.clientId}:${draft.id}`, draft);
  return draft;
}

export function addSendLog(log: EmailSendLog) {
  sendLogs.unshift(log);
  return log;
}

export function getSendLogs(clientId: string) {
  return sendLogs.filter((log) => log.clientId === clientId).slice(0, 20);
}

// MVP process-memory adapter. Replace these functions with database queries
// before production; passwords stay encrypted in either implementation.
