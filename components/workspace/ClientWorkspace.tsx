"use client";

import { getClientAccessDecision } from "@/lib/access-control";
import type { ClientAccount } from "@/lib/types";
import { WindowManager } from "./WindowManager";

type ClientWorkspaceProps = {
  client: ClientAccount;
};

export function ClientWorkspace({ client }: ClientWorkspaceProps) {
  const access = getClientAccessDecision(client);

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
          <span className={`pill ${access.level}`}>{access.level}</span>
        </div>
      </header>
      <WindowManager client={client} />
    </section>
  );
}
