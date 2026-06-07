"use client";

import {
  Archive,
  Inbox,
  Mail,
  MailOpen,
  Paperclip,
  PenLine,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Unplug,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { emailProviderPresets } from "@/lib/email/presets";
import { mockEmailMessages } from "@/lib/email/mock-data";
import type {
  ComposeEmailInput,
  EmailConnectionInput,
  EmailFolder,
  EmailMessage,
  EmailProviderType,
  EmailSendLog,
  PublicEmailConnection
} from "@/lib/email/types";
import type { ClientAccount } from "@/lib/types";

type EmailAppProps = { client: ClientAccount };

const providerLabels: Record<EmailProviderType, string> = {
  gmail: "Gmail SMTP/IMAP",
  microsoft: "Microsoft 365 SMTP/IMAP",
  cpanel: "cPanel email",
  zoho: "Zoho",
  custom: "Custom"
};
const folders: Array<{ id: EmailFolder; label: string }> = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "trash", label: "Trash" }
];
const emptyCompose: ComposeEmailInput = { to: "", cc: "", bcc: "", subject: "", body: "" };

export function EmailApp({ client }: EmailAppProps) {
  const [connection, setConnection] = useState<PublicEmailConnection | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>(mockEmailMessages);
  const [folder, setFolder] = useState<EmailFolder>("inbox");
  const [selectedId, setSelectedId] = useState(mockEmailMessages[0].id);
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState<ComposeEmailInput>(emptyCompose);
  const [composeOpen, setComposeOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [logs, setLogs] = useState<EmailSendLog[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<EmailConnectionInput>(() =>
    createSettings("gmail", client)
  );
  const headers = useMemo(() => ({ "x-beast-client-id": client.id }), [client.id]);

  useEffect(() => {
    void loadConnection();
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  const visibleMessages = useMemo(() => {
    const search = query.toLowerCase().trim();
    return messages.filter(
      (message) =>
        message.folder === folder &&
        (!search ||
          `${message.fromName} ${message.fromEmail} ${message.subject} ${message.snippet}`
            .toLowerCase()
            .includes(search))
    );
  }, [folder, messages, query]);
  const selected =
    messages.find((message) => message.id === selectedId) ?? visibleMessages[0];

  async function loadConnection() {
    const response = await fetch("/api/email/connections", { headers });
    if (!response.ok) return;
    const data = (await response.json()) as { connection: PublicEmailConnection | null };
    setConnection(data.connection);
    setSetupOpen(!data.connection && client.paymentStatus !== "trial");
    if (data.connection) void loadLogs();
  }

  async function loadMessages() {
    const response = await fetch("/api/email/messages", { headers });
    if (!response.ok) return;
    const data = (await response.json()) as { messages: EmailMessage[] };
    setMessages(data.messages.length ? data.messages : []);
    setSelectedId(data.messages[0]?.id || "");
  }

  async function loadLogs() {
    const response = await fetch("/api/email/send-logs", { headers });
    if (!response.ok) return;
    setLogs(((await response.json()) as { logs: EmailSendLog[] }).logs);
  }

  function chooseProvider(providerType: EmailProviderType) {
    setSettings((current) => ({
      ...current,
      providerType,
      ...emailProviderPresets[providerType]
    }));
  }

  async function testOrSaveConnection(save: boolean) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(
        save ? "/api/email/connections" : "/api/email/connections/test",
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(settings)
        }
      );
      const data = (await response.json()) as {
        connection?: PublicEmailConnection;
        result?: { smtp: boolean; imap: boolean };
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Connection failed.");
      if (save && data.connection) {
        setConnection(data.connection);
        setSetupOpen(false);
        setNotice("Mailbox connected securely.");
        await syncMailbox();
      } else {
        setNotice(`Connection test passed. SMTP ready${data.result?.imap ? " and IMAP ready" : ""}.`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      setBusy(false);
    }
  }

  async function syncMailbox() {
    setBusy(true);
    const response = await fetch("/api/email/sync", { method: "POST", headers });
    const data = (await response.json()) as { messages?: EmailMessage[]; error?: string };
    if (response.ok) {
      setMessages(data.messages || []);
      setNotice("Inbox synced.");
    } else {
      setNotice(data.error || "Inbox sync failed.");
    }
    setBusy(false);
  }

  async function disconnect() {
    await fetch("/api/email/disconnect", { method: "POST", headers });
    setConnection(null);
    setMessages(mockEmailMessages);
    setSetupOpen(true);
    setNotice("Mailbox disconnected.");
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (client.paymentStatus === "trial") {
      setNotice("Trial accounts use the demo inbox. Activate payment to send email.");
      return;
    }
    setBusy(true);
    const response = await fetch("/api/email/messages/send", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(compose)
    });
    const data = (await response.json()) as { error?: string };
    setNotice(response.ok ? "Email sent through SMTP." : data.error || "Email could not be sent.");
    if (response.ok) {
      setCompose(emptyCompose);
      setComposeOpen(false);
      await loadLogs();
    }
    setBusy(false);
  }

  async function saveDraft() {
    const response = await fetch("/api/email/messages/draft", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(compose)
    });
    setNotice(response.ok ? "Draft saved." : "Draft could not be saved.");
  }

  async function updateMessage(action: "read" | "archive" | "delete", isRead?: boolean) {
    if (!selected || !connection) return;
    await fetch(`/api/email/messages/${selected.id}/${action}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: action === "read" ? JSON.stringify({ isRead }) : "{}"
    });
    setMessages((current) =>
      current.map((message) =>
        message.id !== selected.id
          ? message
          : action === "read"
            ? { ...message, isRead: Boolean(isRead) }
            : { ...message, folder: action === "archive" ? "archive" : "trash" }
      )
    );
  }

  return (
    <div className="workspace-app-content smtp-email-app">
      {notice && <div className="smtp-notice">{notice}<button onClick={() => setNotice("")} type="button"><X size={14} /></button></div>}

      {setupOpen ? (
        <EmailSetup
          busy={busy}
          onChange={setSettings}
          onChooseProvider={chooseProvider}
          onClose={connection ? () => setSetupOpen(false) : undefined}
          onSave={() => testOrSaveConnection(true)}
          onTest={() => testOrSaveConnection(false)}
          settings={settings}
        />
      ) : (
        <>
          <header className="smtp-email-toolbar">
            <button className="button" onClick={() => setComposeOpen(true)} type="button"><PenLine size={16} /> Compose</button>
            <label className="smtp-email-search"><Mail size={15} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Search mail..." value={query} /></label>
            <button className="email-tool-button" disabled={busy || !connection?.imapHost} onClick={syncMailbox} title="Refresh inbox" type="button"><RefreshCw className={busy ? "spin" : ""} size={16} /></button>
            <span className="smtp-connection-status"><span /> {connection?.emailAddress}</span>
            <button className="email-tool-button" onClick={() => client.paymentStatus === "trial" ? setNotice("Activate payment to connect a mailbox.") : setSetupOpen(true)} title="Connection settings" type="button"><Settings size={16} /></button>
            <button className="email-tool-button" onClick={disconnect} title="Disconnect" type="button"><Unplug size={16} /></button>
          </header>

          <div className="smtp-email-layout">
            <aside className="smtp-folder-list">
              {folders.map((item) => (
                <button className={folder === item.id ? "selected" : ""} key={item.id} onClick={() => setFolder(item.id)} type="button">
                  {item.id === "inbox" ? <Inbox size={16} /> : item.id === "trash" ? <Trash2 size={16} /> : <Mail size={16} />}
                  <span>{item.label}</span>
                  <strong>{messages.filter((message) => message.folder === item.id).length}</strong>
                </button>
              ))}
              <div className="future-integrations"><p className="eyebrow">Coming later</p><span>Gmail OAuth</span><span>Microsoft 365 OAuth</span></div>
              {logs.length > 0 && <div className="send-log-summary"><p className="eyebrow">Recent sends</p>{logs.slice(0, 3).map((log) => <span key={log.id}>{log.status}: {log.subject}</span>)}</div>}
            </aside>

            <section className="smtp-message-list">
              <div className="smtp-panel-title"><strong>{folder}</strong><span>{visibleMessages.length}</span></div>
              {visibleMessages.map((message) => (
                <button className={`${selected?.id === message.id ? "selected" : ""} ${message.isRead ? "" : "unread"}`} key={message.id} onClick={() => { setSelectedId(message.id); setMessages((current) => current.map((item) => item.id === message.id ? { ...item, isRead: true } : item)); }} type="button">
                  <span className="smtp-avatar">{message.fromName.slice(0, 1)}</span>
                  <span><strong>{message.fromName}</strong><b>{message.subject}</b><small>{message.snippet}</small></span>
                  <small>{message.hasAttachments && <Paperclip size={11} />}{formatDate(message.receivedAt)}</small>
                </button>
              ))}
              {!visibleMessages.length && <div className="empty-state">No messages in this folder.</div>}
            </section>

            <main className="smtp-reader">
              {selected ? (
                <>
                  <header><p className="eyebrow">{selected.folder}</p><h2>{selected.subject}</h2><p>{selected.fromName} &lt;{selected.fromEmail}&gt;</p><small>To: {selected.toEmails.join(", ")}</small></header>
                  <div className="smtp-reader-actions"><button onClick={() => updateMessage("read", !selected.isRead)} type="button"><MailOpen size={14} /> Read/unread</button><button onClick={() => updateMessage("archive")} type="button"><Archive size={14} /> Archive</button><button onClick={() => updateMessage("delete")} type="button"><Trash2 size={14} /> Delete</button></div>
                  <article>{selected.bodyPreview}</article>
                </>
              ) : <div className="empty-state">Select a message to read.</div>}
            </main>
          </div>
        </>
      )}

      {composeOpen && (
        <form className="smtp-compose" onSubmit={sendMessage}>
          <header><strong>New message</strong><button onClick={() => setComposeOpen(false)} type="button"><X size={16} /></button></header>
          {(["to", "cc", "bcc", "subject"] as const).map((field) => <input key={field} onChange={(event) => setCompose((current) => ({ ...current, [field]: event.target.value }))} placeholder={field.toUpperCase()} required={field === "to" || field === "subject"} value={compose[field] || ""} />)}
          <textarea onChange={(event) => setCompose((current) => ({ ...current, body: event.target.value }))} placeholder="Write your message..." required rows={10} value={compose.body} />
          <footer><button className="button" disabled={busy} type="submit"><Send size={15} /> Send</button><button className="ghost-button light" onClick={saveDraft} type="button">Save draft</button><button className="ghost-button light" onClick={() => setNotice("AI Assist is coming later.")} type="button"><Sparkles size={15} /> AI Assist</button><button className="ghost-button light" onClick={() => setComposeOpen(false)} type="button">Cancel</button></footer>
        </form>
      )}
    </div>
  );
}

function EmailSetup({ settings, busy, onChange, onChooseProvider, onTest, onSave, onClose }: {
  settings: EmailConnectionInput;
  busy: boolean;
  onChange: (settings: EmailConnectionInput) => void;
  onChooseProvider: (provider: EmailProviderType) => void;
  onTest: () => void;
  onSave: () => void;
  onClose?: () => void;
}) {
  const set = (key: keyof EmailConnectionInput, value: string | number | boolean) =>
    onChange({ ...settings, [key]: value });
  return (
    <section className="email-setup-screen">
      <header><div><p className="eyebrow">SMTP / IMAP setup</p><h2>Connect your business mailbox</h2><p>Send through SMTP and optionally sync your inbox through IMAP. Credentials are encrypted server-side.</p></div>{onClose && <button className="email-tool-button" onClick={onClose} type="button"><X size={16} /></button>}</header>
      <div className="email-setup-grid">
        <label>Provider preset<select onChange={(event) => onChooseProvider(event.target.value as EmailProviderType)} value={settings.providerType}>{Object.entries(providerLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>Email address<input onChange={(event) => set("emailAddress", event.target.value)} value={settings.emailAddress} /></label>
        <label>Display name<input onChange={(event) => set("displayName", event.target.value)} value={settings.displayName} /></label>
        <label>Username<input onChange={(event) => set("username", event.target.value)} value={settings.username} /></label>
        <label>Password / app password<input autoComplete="new-password" onChange={(event) => set("password", event.target.value)} type="password" value={settings.password} /></label>
        <label>IMAP host<input onChange={(event) => set("imapHost", event.target.value)} value={settings.imapHost || ""} /></label>
        <label>IMAP port<input onChange={(event) => set("imapPort", Number(event.target.value))} type="number" value={settings.imapPort || 993} /></label>
        <label className="email-checkbox"><input checked={Boolean(settings.imapSecure)} onChange={(event) => set("imapSecure", event.target.checked)} type="checkbox" /> IMAP secure</label>
        <label>SMTP host<input onChange={(event) => set("smtpHost", event.target.value)} value={settings.smtpHost} /></label>
        <label>SMTP port<input onChange={(event) => set("smtpPort", Number(event.target.value))} type="number" value={settings.smtpPort} /></label>
        <label className="email-checkbox"><input checked={settings.smtpSecure} onChange={(event) => set("smtpSecure", event.target.checked)} type="checkbox" /> SMTP secure</label>
      </div>
      <div className="email-setup-actions"><button className="ghost-button light" disabled={busy} onClick={onTest} type="button">Test connection</button><button className="button" disabled={busy} onClick={onSave} type="button">{busy ? "Connecting..." : "Test and save connection"}</button></div>
      <aside className="email-security-note">Beast Console never returns saved passwords to the browser. Gmail and Microsoft OAuth options will be added later.</aside>
    </section>
  );
}

function createSettings(providerType: EmailProviderType, client: ClientAccount): EmailConnectionInput {
  return { providerType, emailAddress: client.email, displayName: client.companyName, username: client.email, password: "", ...emailProviderPresets[providerType] };
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value)) : "";
}
