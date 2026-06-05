"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ClientWorkspace } from "@/components/workspace/ClientWorkspace";
import { usePortalData } from "@/hooks/usePortalData";

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

  if (!ready) return null;

  return (
    <AppShell
      user={{ role: "client", name: userName, companyName: client?.companyName }}
    >
      {!client ? (
        <div className="empty-state">No client dashboard is assigned to this login.</div>
      ) : (
        <ClientWorkspace client={client} />
      )}
    </AppShell>
  );
}
