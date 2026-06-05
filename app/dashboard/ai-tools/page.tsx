"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { AiToolsAssistant } from "@/components/AiToolsAssistant";
import { LOCKED_DASHBOARD_MESSAGE, canOpenDashboardBlock } from "@/lib/access-control";
import { usePortalData } from "@/hooks/usePortalData";

export default function AiToolsPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => <AiToolsDashboard userClientId={user.clientId} userName={user.name} />}
    </AuthGuard>
  );
}

function AiToolsDashboard({
  userClientId,
  userName
}: {
  userClientId?: string;
  userName: string;
}) {
  const { clients, ready } = usePortalData();
  const client = clients.find((item) => item.id === userClientId);
  const canOpen = client ? canOpenDashboardBlock(client, "free-ai", false) : false;

  if (!ready) return null;

  return (
    <AppShell
      user={{ role: "client", name: userName, companyName: client?.companyName }}
    >
      {!client ? (
        <div className="empty-state">No client dashboard is assigned to this login.</div>
      ) : !canOpen ? (
        <section className="panel locked-panel">
          <p className="eyebrow">Free AI locked</p>
          <h1>{client.companyName}</h1>
          <p className="muted">{LOCKED_DASHBOARD_MESSAGE}</p>
        </section>
      ) : (
        <AiToolsAssistant clientId={client.id} defaultBusinessName={client.companyName} />
      )}
    </AppShell>
  );
}
