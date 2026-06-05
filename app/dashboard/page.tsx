"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardToolCard } from "@/components/DashboardToolCard";
import { getClientDashboardBlocks } from "@/lib/blocks";
import { getClientAccessDecision } from "@/lib/access-control";
import { usePortalData } from "@/hooks/usePortalData";
import type { ClientAccount } from "@/lib/types";

export default function DashboardPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => <ClientDashboard userClientId={user.clientId} userName={user.name} />}
    </AuthGuard>
  );
}

function ClientDashboard({
  userClientId,
  userName
}: {
  userClientId?: string;
  userName: string;
}) {
  const { clients, ready } = usePortalData();
  const client = clients.find((item) => item.id === userClientId);
  const access = client ? getClientAccessDecision(client) : null;

  if (!ready) return null;

  return (
    <AppShell
      user={{ role: "client", name: userName, companyName: client?.companyName }}
    >
      {!client ? (
        <div className="empty-state">No client dashboard is assigned to this login.</div>
      ) : !access?.canAccessDashboard ? (
        <section className="panel locked-panel">
          <p className="eyebrow">Dashboard locked</p>
          <h1>{client.companyName}</h1>
          <p className="muted">{access?.lockedMessage}</p>
        </section>
      ) : (
        <>
          <section className="dashboard-hero">
            <div>
              <p className="eyebrow">Client dashboard</p>
              <h1>Welcome, {client.name}</h1>
              <p className="muted">
                {client.companyName} has {activeToolCount(client)} enabled tools.
                Dashboard access is {access.level}.
              </p>
            </div>
            <div className="status-summary">
              <div>
                <span className="summary-label">Access</span>
                <strong>{client.status}</strong>
              </div>
              <div>
                <span className="summary-label">Payment</span>
                <strong>{client.paymentStatus}</strong>
              </div>
              <div>
                <span className="summary-label">Dashboard</span>
                <strong>{access.level}</strong>
              </div>
              <div>
                <span className="summary-label">Enabled tools</span>
                <strong>{activeToolCount(client)}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tools</p>
                <h2>Marketing blocks</h2>
              </div>
              <span className={`pill ${client.paymentStatus}`}>
                {client.paymentStatus}
              </span>
            </div>
            <div className="tool-grid">
              {getClientDashboardBlocks(client).map((block) => (
                <DashboardToolCard block={block} key={block.id} />
              ))}
            </div>
          </section>

          <section className="support-section">
            <div>
              <p className="eyebrow">Support</p>
              <h2>Need help? Contact your account manager.</h2>
              <p className="muted">
                Send a note to support@beastconsole.test and include your company
                name for faster routing.
              </p>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function activeToolCount(client: ClientAccount) {
  return client.enabledBlocks.length;
}
