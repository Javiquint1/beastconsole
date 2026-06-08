"use client";

import { getClientDashboardAccessForAccount } from "@/lib/access/appAccessService";
import type { ClientAccount } from "@/lib/types";
import { WindowManager } from "./WindowManager";

type ClientWorkspaceProps = {
  client: ClientAccount;
};

export function ClientWorkspace({ client }: ClientWorkspaceProps) {
  const access = getClientDashboardAccessForAccount(client);

  if (!access.canAccessDashboard) {
    return (
      <section className="locked-dashboard">
        <p className="eyebrow">Dashboard unavailable</p>
        <h1>Your account is {client.status}.</h1>
        <p>Please contact your administrator to restore dashboard access.</p>
      </section>
    );
  }

  return (
    <section className="client-workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Command center</p>
          <h1>{client.companyName}</h1>
          <p>
            Welcome, {client.name}. Open, move, resize, minimize, and arrange
            your business apps in one workspace.
          </p>
        </div>
        <div className="workspace-status">
          <span className={`pill ${client.paymentStatus}`}>{client.paymentStatus}</span>
          <span className={`pill ${client.status}`}>{client.status}</span>
        </div>
      </header>
      <WindowManager client={client} />
    </section>
  );
}
