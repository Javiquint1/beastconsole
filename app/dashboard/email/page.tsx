"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { EmailMarketingReport } from "@/components/EmailMarketingReport";
import { LOCKED_DASHBOARD_MESSAGE, canOpenDashboardBlock } from "@/lib/access-control";
import { getEmailMarketingReport } from "@/lib/email-marketing-reports";
import { usePortalData } from "@/hooks/usePortalData";

export default function EmailPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => (
        <EmailMarketingDashboard userClientId={user.clientId} userName={user.name} />
      )}
    </AuthGuard>
  );
}

function EmailMarketingDashboard({
  userClientId,
  userName
}: {
  userClientId?: string;
  userName: string;
}) {
  const { clients, ready } = usePortalData();
  const client = clients.find((item) => item.id === userClientId);
  const canOpen = client ? canOpenDashboardBlock(client, "email", true) : false;

  if (!ready) return null;

  return (
    <AppShell
      user={{ role: "client", name: userName, companyName: client?.companyName }}
    >
      {!client ? (
        <div className="empty-state">No client dashboard is assigned to this login.</div>
      ) : !canOpen ? (
        <section className="panel locked-panel">
          <p className="eyebrow">Email Marketing locked</p>
          <h1>{client.companyName}</h1>
          <p className="muted">{LOCKED_DASHBOARD_MESSAGE}</p>
        </section>
      ) : (
        <EmailMarketingReport
          companyName={client.companyName}
          report={getEmailMarketingReport(client)}
        />
      )}
    </AppShell>
  );
}
