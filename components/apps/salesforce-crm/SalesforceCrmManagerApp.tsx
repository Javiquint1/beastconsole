"use client";

import { Activity, BadgeDollarSign, BriefcaseBusiness, ClipboardList, Download, LineChart, Plus, Plug, Save, Target, Users } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { ClientAccount } from "@/lib/types";
import type { SalesforceAccount, SalesforceActivity, SalesforceContact, SalesforceLead, SalesforceOpportunity, SalesforceSummary, SalesforceTask } from "@/lib/salesforce-crm/types";

type SalesforceDashboard = {
  leads: SalesforceLead[];
  accounts: SalesforceAccount[];
  contacts: SalesforceContact[];
  opportunities: SalesforceOpportunity[];
  tasks: SalesforceTask[];
  activities: SalesforceActivity[];
  summary: SalesforceSummary;
  demoMode: boolean;
};

const emptyLead: Pick<SalesforceLead, "firstName" | "lastName" | "company" | "email" | "phone" | "leadSource" | "status"> = { firstName: "", lastName: "", company: "", email: "", phone: "", leadSource: "LinkedIn Ads", status: "New" };
const emptyOpportunity: Pick<SalesforceOpportunity, "accountId" | "contactId" | "opportunityName" | "amount" | "stage" | "probability" | "leadSource" | "closeDate"> = { accountId: "", contactId: "", opportunityName: "", amount: 0, stage: "Prospecting", probability: 10, leadSource: "LinkedIn Ads", closeDate: "" };
const emptyTask: Pick<SalesforceTask, "title" | "owner" | "dueDate" | "status"> = { title: "", owner: "", dueDate: "", status: "Open" };

export function SalesforceCrmManagerApp({ client }: { client: ClientAccount }) {
  const [data, setData] = useState<SalesforceDashboard | null>(null);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"lead" | "opportunity" | "task" | null>(null);
  const [lead, setLead] = useState(emptyLead);
  const [opportunity, setOpportunity] = useState(emptyOpportunity);
  const [task, setTask] = useState(emptyTask);
  const admin = client.role === "admin";
  const headers = useMemo(() => ({ "x-beast-client-id": client.id, "x-beast-role": client.role }), [client.id, client.role]);

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [client.id]);

  async function load() {
    const response = await fetch("/api/salesforce-crm/summary", { headers });
    if (!response.ok) return setNotice("Salesforce CRM dashboard could not be loaded.");
    setData(await response.json() as SalesforceDashboard);
  }

  async function addLead(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/salesforce-crm/leads", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    setNotice(response.ok ? "Salesforce lead added." : "Lead could not be added.");
    if (response.ok) { setLead(emptyLead); setPanel(null); await load(); }
  }

  async function addOpportunity(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/salesforce-crm/opportunities", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(opportunity) });
    setNotice(response.ok ? "Salesforce opportunity added." : "Opportunity could not be added.");
    if (response.ok) { setOpportunity(emptyOpportunity); setPanel(null); await load(); }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/salesforce-crm/tasks", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(task) });
    setNotice(response.ok ? "Salesforce task added." : "Task could not be added.");
    if (response.ok) { setTask(emptyTask); setPanel(null); await load(); }
  }

  if (!data) return <div className="empty-state">Loading Salesforce revenue pipeline...</div>;

  const accountName = (id: string) => data.accounts.find((account) => account.id === id)?.name || "Unassigned";
  const contactName = (id: string) => {
    const record = data.contacts.find((item) => item.id === id);
    return record ? `${record.firstName} ${record.lastName}` : "Unassigned";
  };

  return (
    <div className="workspace-app-content salesforce-crm-app">
      <header className="salesforce-crm-header">
        <div className="salesforce-title">
          <BriefcaseBusiness size={25} />
          <div>
            <p className="eyebrow">Enterprise CRM / revenue tracking</p>
            <h2>Salesforce CRM Manager</h2>
            <span>LinkedIn lead → Salesforce opportunity → pipeline → revenue report</span>
          </div>
        </div>
        <div className="app-actions compact">
          <span className={`pill ${data.demoMode ? "trial" : "active"}`}>{data.demoMode ? "Demo data" : "Manual CRM"}</span>
          <button className="ghost-button light" onClick={() => setNotice("Export download is coming next.")} type="button"><Download size={15} /> Export</button>
          {admin ? <button className="button" onClick={() => setPanel("lead")} type="button"><Plus size={15} /> Add lead</button> : null}
        </div>
      </header>

      {notice ? <div className="notice">{notice}</div> : null}

      <div className="salesforce-metric-grid">
        <Metric icon={<Users size={17} />} label="New leads" value={String(data.summary.newLeads)} />
        <Metric icon={<Target size={17} />} label="Open opportunities" value={String(data.summary.openOpportunities)} />
        <Metric icon={<BadgeDollarSign size={17} />} label="Pipeline value" value={money(data.summary.pipelineValue)} />
        <Metric icon={<LineChart size={17} />} label="Revenue forecast" value={money(data.summary.revenueForecast)} />
        <Metric icon={<Save size={17} />} label="Closed-won deals" value={String(data.summary.closedWonDeals)} />
        <Metric icon={<ClipboardList size={17} />} label="Closed-lost deals" value={String(data.summary.closedLostDeals)} />
        <Metric icon={<BadgeDollarSign size={17} />} label="Closed-won revenue" value={money(data.summary.closedWonRevenue)} />
        <Metric icon={<Activity size={17} />} label="Follow-up tasks" value={String(data.tasks.filter((item) => item.status === "Open").length)} />
      </div>

      <section className="mini-panel salesforce-opportunity-panel">
        <div className="app-section-header">
          <div>
            <p className="eyebrow">Sales pipeline</p>
            <h3>Opportunities and revenue stages</h3>
          </div>
          {admin ? <div className="app-actions compact"><button className="ghost-button light" onClick={() => setPanel("opportunity")} type="button"><Plus size={15} /> Add opportunity</button><button className="ghost-button light" onClick={() => setPanel("task")} type="button"><Plus size={15} /> Add task</button></div> : null}
        </div>
        <div className="table-wrap embedded">
          <table className="client-table salesforce-opportunity-table">
            <thead><tr><th>Opportunity</th><th>Account</th><th>Contact</th><th>Value</th><th>Stage</th><th>Probability</th><th>Forecast</th><th>Lead source</th><th>Close date</th></tr></thead>
            <tbody>
              {data.opportunities.map((item) => <tr key={item.id}><td><strong>{item.opportunityName}</strong></td><td>{accountName(item.accountId)}</td><td>{contactName(item.contactId)}</td><td>{money(item.amount)}</td><td><span className={`pill ${item.stage.toLowerCase().replaceAll(" ", "-")}`}>{item.stage}</span></td><td>{item.probability}%</td><td>{money(item.amount * (item.probability / 100))}</td><td>{item.leadSource}</td><td>{date(item.closeDate)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <div className="app-grid salesforce-bottom-grid">
        <section className="mini-panel">
          <p className="eyebrow">Leads</p>
          <h3>Enterprise lead intake</h3>
          <div className="salesforce-list">
            {data.leads.map((item) => <article key={item.id}><strong>{item.firstName} {item.lastName}</strong><span>{item.company}</span><small>{item.status} · {item.leadSource}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Deals by stage</p>
          <h3>Sales stage mix</h3>
          <div className="salesforce-source-list">
            {data.summary.dealsByStage.map((item) => <div key={item.stage}><span>{item.stage}<small>{item.count} deal(s)</small></span><strong>{money(item.value)}</strong></div>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Lead sources</p>
          <h3>Marketing → revenue path</h3>
          <div className="salesforce-source-list">
            {data.summary.leadSources.map((item) => <div key={item.source}><span>{item.source}</span><strong>{item.count}</strong></div>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Sales follow-up tasks</p>
          <h3>Next revenue actions</h3>
          <div className="salesforce-list compact">
            {data.tasks.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.owner} · due {date(item.dueDate)}</span><small>{item.status}</small></article>)}
          </div>
        </section>
        <section className="mini-panel">
          <p className="eyebrow">Sales activity</p>
          <h3>Recent CRM movement</h3>
          <div className="salesforce-list compact">
            {data.activities.map((item) => <article key={item.id}><strong>{item.type}</strong><span>{item.description}</span><small>{dateTime(item.occurredAt)}</small></article>)}
          </div>
        </section>
        <section className="mini-panel salesforce-api-card">
          <p className="eyebrow">Coming later</p>
          <h3>Connect Salesforce REST API</h3>
          <p>Future version will connect Salesforce REST APIs for leads, accounts, contacts, opportunities, tasks, records, and sales activity sync.</p>
          <button disabled type="button"><Plug size={14} /> Connect Salesforce API</button>
        </section>
      </div>

      {panel === "lead" ? <form className="salesforce-form" onSubmit={addLead}><FormHeader title="Add Salesforce lead" close={() => setPanel(null)} /><div className="salesforce-form-grid">{Object.entries(lead).map(([key, value]) => <input key={key} onChange={(event) => setLead((current) => ({ ...current, [key]: event.target.value }))} placeholder={label(key)} value={String(value)} />)}</div><button className="button" type="submit">Save lead</button></form> : null}
      {panel === "opportunity" ? <form className="salesforce-form" onSubmit={addOpportunity}><FormHeader title="Add Salesforce opportunity" close={() => setPanel(null)} /><div className="salesforce-form-grid">{Object.entries(opportunity).map(([key, value]) => <input key={key} onChange={(event) => setOpportunity((current) => ({ ...current, [key]: key === "amount" || key === "probability" ? Number(event.target.value) : event.target.value }))} placeholder={label(key)} type={key === "amount" || key === "probability" ? "number" : key === "closeDate" ? "date" : "text"} value={String(value)} />)}</div><button className="button" type="submit">Save opportunity</button></form> : null}
      {panel === "task" ? <form className="salesforce-form" onSubmit={addTask}><FormHeader title="Add Salesforce task" close={() => setPanel(null)} /><div className="salesforce-form-grid">{Object.entries(task).map(([key, value]) => <input key={key} onChange={(event) => setTask((current) => ({ ...current, [key]: event.target.value }))} placeholder={label(key)} type={key === "dueDate" ? "date" : "text"} value={String(value)} />)}</div><button className="button" type="submit">Save task</button></form> : null}
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
