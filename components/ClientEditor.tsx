"use client";

import { useEffect, useState } from "react";
import { appAccessDefinitions } from "@/lib/access/appAccessService";
import type { AppAccessId } from "@/lib/access/appAccessService";
import type { BlockId, ClientAccount, PaymentStatus, UserStatus } from "@/lib/types";

type ClientEditorProps = {
  client: ClientAccount;
  onClientInfoSave: (updates: Pick<ClientAccount, "name" | "companyName" | "email" | "phone" | "businessWebsite">) => void;
  onSaveAccess: (settings: Pick<ClientAccount, "paymentStatus" | "status" | "enabledBlocks">) => void;
};

export function ClientEditor({ client, onClientInfoSave, onSaveAccess }: ClientEditorProps) {
  const [clientInfo, setClientInfo] = useState({
    name: client.name,
    companyName: client.companyName,
    email: client.email,
    phone: client.phone,
    businessWebsite: client.businessWebsite
  });
  const [paymentStatus, setPaymentStatus] = useState(client.paymentStatus);
  const [accountStatus, setAccountStatus] = useState(client.status);
  const [enabledBlocks, setEnabledBlocks] = useState<BlockId[]>(client.enabledBlocks);
  const [infoNotice, setInfoNotice] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClientInfo({
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      businessWebsite: client.businessWebsite
    });
    setPaymentStatus(client.paymentStatus);
    setAccountStatus(client.status);
    setEnabledBlocks(client.enabledBlocks);
    setInfoNotice("");
    setNotice("");
  }, [client.id]);

  function submitInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onClientInfoSave(clientInfo);
    setInfoNotice("Client information saved.");
  }

  function updateInfo(field: keyof typeof clientInfo, value: string) {
    setClientInfo((current) => ({ ...current, [field]: value }));
    setInfoNotice("");
  }

  function toggle(blockId: BlockId) {
    setEnabledBlocks((current) => current.includes(blockId) ? current.filter((id) => id !== blockId) : [...current, blockId]);
  }

  async function saveAccess() {
    setSaving(true); setNotice("");
    const apps = Object.fromEntries(
      appAccessDefinitions.map((app) => [app.appId, enabledBlocks.includes(app.blockId)])
    ) as Record<AppAccessId, boolean>;
    const updatedClient = {
      ...client,
      paymentStatus,
      status: accountStatus,
      enabledBlocks
    };
    try {
      const headers = { "Content-Type": "application/json", "x-beast-role": "admin" };
      const [accessResponse, statusResponse] = await Promise.all([
        fetch(`/api/admin/clients/${client.id}/app-access`, { method: "PUT", headers, body: JSON.stringify({ apps, client: updatedClient }) }),
        fetch(`/api/admin/clients/${client.id}/payment-status`, { method: "PUT", headers, body: JSON.stringify({ paymentStatus, accountStatus, client: updatedClient }) })
      ]);
      if (!accessResponse.ok || !statusResponse.ok) throw new Error("Access settings could not be saved.");
      onSaveAccess({ paymentStatus, status: accountStatus, enabledBlocks });
      setNotice("Access settings saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Access settings could not be saved.");
    } finally { setSaving(false); }
  }

  return <div className="admin-access-layout">
    <section className="panel">
      <p className="eyebrow">Client info</p><h2>Edit client</h2>
      <form className="form" onSubmit={submitInfo}>
        <div className="field"><label htmlFor="name">Client name</label><input id="name" name="name" onChange={(event) => updateInfo("name", event.target.value)} required value={clientInfo.name} /></div>
        <div className="field"><label htmlFor="companyName">Company</label><input id="companyName" name="companyName" onChange={(event) => updateInfo("companyName", event.target.value)} required value={clientInfo.companyName} /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" onChange={(event) => updateInfo("email", event.target.value)} required type="email" value={clientInfo.email} /></div>
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" onChange={(event) => updateInfo("phone", event.target.value)} type="tel" value={clientInfo.phone} /></div>
        <div className="field"><label htmlFor="businessWebsite">Business website</label><input id="businessWebsite" name="businessWebsite" onChange={(event) => updateInfo("businessWebsite", event.target.value)} type="url" value={clientInfo.businessWebsite} /></div>
        {infoNotice && <div className="notice">{infoNotice}</div>}
        <button className="button" type="submit">Save client info</button>
      </form>
    </section>
    <div className="admin-access-main">
      <section className="panel">
        <p className="eyebrow">Client Status</p><h2>Account and payment</h2>
        <div className="grid two">
          <div className="field"><label htmlFor="accountStatus">Account status</label><select id="accountStatus" onChange={(e) => setAccountStatus(e.target.value as UserStatus)} value={accountStatus}><option value="active">Active</option><option value="suspended">Suspended</option><option value="inactive">Inactive</option></select></div>
          <div className="field"><label htmlFor="paymentStatus">Payment status</label><select id="paymentStatus" onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} value={paymentStatus}><option value="paid">Paid</option><option value="trial">Trial</option><option value="unpaid">Unpaid</option></select></div>
        </div>
      </section>
      <section className="panel">
        <p className="eyebrow">App Access</p><h2>Enabled client apps</h2>
        <div className="app-access-grid">
          {appAccessDefinitions.map((app) => {
            const enabled = enabledBlocks.includes(app.blockId);
            return <label className={`app-access-card ${enabled ? "enabled" : "disabled"}`} key={app.appId}>
              <span><strong>{app.name}</strong><small>{app.description}</small></span>
              <span className={`pill ${enabled ? "active" : "locked"}`}>{enabled ? "Enabled" : "Disabled"}</span>
              <input checked={enabled} onChange={() => toggle(app.blockId)} type="checkbox" />
              <i aria-hidden="true" />
            </label>;
          })}
        </div>
        {notice && <div className={`notice ${notice.includes("could not") ? "error" : ""}`}>{notice}</div>}
        <button className="button" disabled={saving} onClick={saveAccess} type="button">{saving ? "Saving..." : "Save Access Settings"}</button>
      </section>
    </div>
  </div>;
}
