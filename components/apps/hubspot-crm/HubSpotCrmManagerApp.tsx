"use client";

import { Activity, BadgeDollarSign, Building2, ClipboardList, Download, Handshake, Plus, Plug, Save, Users } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { ClientAccount } from "@/lib/types";
import type { HubSpotActivity, HubSpotCompany, HubSpotContact, HubSpotDeal, HubSpotSummary, HubSpotTask } from "@/lib/hubspot-crm/types";

type HubSpotDashboard = {
  contacts: HubSpotContact[];
  companies: HubSpotCompany[];
  deals: HubSpotDeal[];
  tasks: HubSpotTask[];
  activities: HubSpotActivity[];
  summary: HubSpotSummary;
  demoMode: boolean;
};

type HubSpotConnectionStatus = {
  connected: boolean;
  hubId: string | null;
  tokenExpiresAt: string | null;
  updatedAt: string | null;
};

const emptyContact: Pick<HubSpotContact, "firstName" | "lastName" | "email" | "phone" | "companyId" | "lifecycleStage" | "leadSource"> = { firstName: "", lastName: "", email: "", phone: "", companyId: "", lifecycleStage: "Lead", leadSource: "Google Ads" };
const emptyDeal: Pick<HubSpotDeal, "dealName" | "companyId" | "contactId" | "amount" | "pipelineStage" | "leadSource" | "closeDate"> = { dealName: "", companyId: "", contactId: "", amount: 0, pipelineStage: "New Lead", leadSource: "Google Ads", closeDate: "" };
const emptyTask: Pick<HubSpotTask, "title" | "owner" | "dueDate" | "status"> = { title: "", owner: "", dueDate: "", status: "Open" };

export function HubSpotCrmManagerApp({ client }: { client: ClientAccount }) {
  const [data, setData] = useState<HubSpotDashboard | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<HubSpotConnectionStatus | null>(null);
  const [panel, setPanel] = useState<"contact" | "deal" | "task" | null>(null);
  const [contact, setContact] = useState(emptyContact);
  const [deal, setDeal] = useState(emptyDeal);
  const [task, setTask] = useState(emptyTask);
  const admin = client.role === "admin";
  const headers = useMemo(() => ({ "x-beast-client-id": client.id, "x-beast-role": client.role }), [client.id, client.role]);

  useEffect(() => { void load(); void loadConnectionStatus(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [client.id]);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/hubspot-crm/summary", { headers });
      if (!response.ok) {
        setNotice("HubSpot CRM dashboard could not be loaded.");
        setData(null);
        return;
      }
      setData(await response.json() as HubSpotDashboard);
    } catch {
      setNotice("HubSpot CRM dashboard could not be loaded.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function addContact(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/hubspot-crm/contacts", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(contact) });
    setNotice(response.ok ? "HubSpot contact added." : "Contact could not be added.");
    if (response.ok) { setContact(emptyContact); setPanel(null); await load(); }
  }

  async function addDeal(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/hubspot-crm/deals", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(deal) });
    setNotice(response.ok ? "HubSpot deal added." : "Deal could not be added.");
    if (response.ok) { setDeal(emptyDeal); setPanel(null); await load(); }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/hubspot-crm/tasks", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(task) });
    setNotice(response.ok ? "HubSpot task added." : "Task could not be added.");
    if (response.ok) { setTask(emptyTask); setPanel(null); await load(); }
  }

  async function loadConnectionStatus() {
    const response = await fetch("/api/hubspot/status", { headers });
    if (response.ok) setConnection(await response.json() as HubSpotConnectionStatus);
  }

  function connectHubSpot() {
    window.location.href = `/api/hubspot/connect?clientId=${encodeURIComponent(client.id)}`;
  }

  if (loading) return <div className="empty-state">Loading HubSpot CRM pipeline...</div>;
  if (!data) return <div className="empty-state">{notice || "HubSpot CRM dashboard could not be loaded."}</div>;

  const companyName = (id: string) => data.companies.find((company) => company.id === id)?.name || "Unassigned";
  const contactName = (id: string) => {
    const record = data.contacts.find((item) => item.id === id);
    return record ? `${record.firstName} ${record.lastName}` : "Unassigned";
  };

  return (
    <div className="workspace-app-content hubspot-crm-app">
      <header className="hubspot-crm-header">
        <div className="hubspot-title">
          <Handshake size={25} />
          <div>
            <p className="eyebrow">CRM / lead management</p>
            <h2>HubSpot CRM Manager</h2>
            <span>Contacts → companies → deals → won/lost sales outcomes</span>
          </div>
        </div>
        <div className="app-actions compact">
          <span className={`pill ${data.demoMode ? "trial" : "active"}`}>{data.demoMode ? "Demo data" : "Manual CRM"}</span>
          <button className="ghost-button light" onClick={() => setNotice("Export download is coming next.")} type="button"><Download size={15} /> Export</button>
          {admin ? <button className="button" onClick={() => setPanel("contact")} type="button"><Plus size={15} /> Add lead</button> : null}
        </div>
      </header>

      {notice ? <div className="notice">{notice}</div> : null}

      <div className="hubspot-metric-grid">
        <Metric icon={<Users size={17} />} label="New contacts this month" value={String(data.summary.newContactsThisMonth)} />
        <Metric icon={<Handshake size={17} />} label="Open deals" value={String(data.summary.openDeals)} />
        <Metric icon={<BadgeDollarSign size={17} />} label="Total pipeline value" value={money(data.summary.totalPipelineValue)} />
        <Metric icon={<Building2 size={17} />} label="Companies" value={String(data.companies.length)} />
        <Metric icon={<Save size={17} />} label="Won deals" value={String(data.summary.wonDeals)} />
        <Metric icon={<ClipboardList size={17} />} label="Lost deals" value={String(data.summary.lostDeals)} />
        <Metric icon={<Activity size={17} />} label="Open follow-up tasks" value={String(data.tasks.filter((item) => item.status === "Open").length)} />
        <Metric icon={<Plug size={17} />} label="Lead sources" value={String(data.summary.leadsBySource.length)} />
      </div>

      <section className="mini-panel hubspot-deal-panel">
        <div className="app-section-header">
          <div>
            <p className="eyebrow">Lead pipeline</p>
            <h3>Deals and pipeline stages</h3>
          </div>
          {admin ? <div className="app-actions compact"><button className="ghost-button light" onClick={() => setPanel("deal")} type="button"><Plus size={15} /> Add deal</button><button className="ghost-button light" onClick={() => setPanel("task")} type="button"><Plus size={15} /> Add task</button></div> : null}
        </div>
        <div className="table-wrap embedded">
          <table className="client-table hubspot-deal-table">
            <thead><tr><th>Deal</th><th>Company</th><th>Contact</th><th>Value</th><th>Pipeline stage</th><th>Lead source</th><th>Close date</th></tr></thead>
            <tbody>
              {data.deals.map((item) => <tr key={item.id}><td><strong>{item.dealName}</strong></td><td>{companyName(item.companyId)}</td><td>{contactName(item.contactId)}</td><td>{money(item.amount)}</td><td><span className={`pill ${item.pipelineStage.toLowerCase().replaceAll(" ", "-")}`}>{item.pipelineStage}</span></td><td>{item.leadSource}</td><td>{date(item.closeDate)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <div className="app-grid hubspot-bottom-grid">
        <section className="mini-panel">
          <p className="eyebrow">Contacts</p>
          <h3>Recent leads and CRM people</h3>
          <div className="hubspot-list">
            {data.contacts.map((item) => <article key={item.id}><strong>{item.firstName} {item.lastName}</strong><span>{item.email}</span><small>{item.lifecycleStage} · {item.leadSource}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Leads by source</p>
          <h3>Marketing → sales attribution</h3>
          <div className="hubspot-source-list">
            {data.summary.leadsBySource.map((item) => <div key={item.source}><span>{item.source}</span><strong>{item.count}</strong></div>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Follow-up tasks</p>
          <h3>Next sales actions</h3>
          <div className="hubspot-list compact">
            {data.tasks.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.owner} · due {date(item.dueDate)}</span><small>{item.status}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Recent CRM activity</p>
          <h3>What happened after the lead</h3>
          <div className="hubspot-list compact">
            {data.activities.map((item) => <article key={item.id}><strong>{item.type}</strong><span>{item.description}</span><small>{dateTime(item.occurredAt)}</small></article>)}
          </div>
        </section>
        <section className="mini-panel hubspot-api-card">
          <p className="eyebrow">{connection?.connected ? "Connected" : "OAuth connection"}</p>
          <h3>Connect HubSpot CRM API</h3>
          <p>{connection?.connected ? `HubSpot account ${connection.hubId || ""} is connected for this client.` : "Connect a HubSpot account so this client can authorize CRM API access."}</p>
          <button onClick={connectHubSpot} type="button">{connection?.connected ? "Reconnect HubSpot API" : "Connect HubSpot API"}</button>
        </section>
      </div>

      {panel === "contact" ? <form className="hubspot-form" onSubmit={addContact}><FormHeader title="Add HubSpot lead" close={() => setPanel(null)} /><div className="hubspot-form-grid">{Object.entries(contact).map(([key, value]) => <input key={key} onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))} placeholder={label(key)} value={String(value)} />)}</div><button className="button" type="submit">Save lead</button></form> : null}
      {panel === "deal" ? <form className="hubspot-form" onSubmit={addDeal}><FormHeader title="Add HubSpot deal" close={() => setPanel(null)} /><div className="hubspot-form-grid">{Object.entries(deal).map(([key, value]) => <input key={key} onChange={(event) => setDeal((current) => ({ ...current, [key]: key === "amount" ? Number(event.target.value) : event.target.value }))} placeholder={label(key)} type={key === "amount" ? "number" : key === "closeDate" ? "date" : "text"} value={String(value)} />)}</div><button className="button" type="submit">Save deal</button></form> : null}
      {panel === "task" ? <form className="hubspot-form" onSubmit={addTask}><FormHeader title="Add follow-up task" close={() => setPanel(null)} /><div className="hubspot-form-grid">{Object.entries(task).map(([key, value]) => <input key={key} onChange={(event) => setTask((current) => ({ ...current, [key]: event.target.value }))} placeholder={label(key)} type={key === "dueDate" ? "date" : "text"} value={String(value)} />)}</div><button className="button" type="submit">Save task</button></form> : null}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="report-metric-card">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

function FormHeader({ title, close }: { title: string; close: () => void }) {
  return <header><strong>{title}</strong><button onClick={close} type="button">Close</button></header>;
}

function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
function date(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
function label(value: string) { return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()); }
