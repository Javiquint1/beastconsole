"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { LOCKED_DASHBOARD_MESSAGE, canOpenDashboardBlock } from "@/lib/access-control";
import { marketingBlocks } from "@/lib/blocks";
import { usePortalData } from "@/hooks/usePortalData";
import type { BlockId } from "@/lib/types";

type DashboardToolPageProps = {
  blockId: BlockId;
  eyebrow: string;
  title: string;
  description: string;
};

export function DashboardToolPage({
  blockId,
  eyebrow,
  title,
  description
}: DashboardToolPageProps) {
  return (
    <AuthGuard allowedRole="client">
      {(user) => (
        <ProtectedToolPage
          blockId={blockId}
          description={description}
          eyebrow={eyebrow}
          title={title}
          userClientId={user.clientId}
          userName={user.name}
        />
      )}
    </AuthGuard>
  );
}

function ProtectedToolPage({
  blockId,
  description,
  eyebrow,
  title,
  userClientId,
  userName
}: DashboardToolPageProps & {
  userClientId?: string;
  userName: string;
}) {
  const { clients, ready } = usePortalData();
  const client = clients.find((item) => item.id === userClientId);
  const block = marketingBlocks.find((item) => item.id === blockId);
  const canOpen =
    client && block ? canOpenDashboardBlock(client, blockId, block.paid) : false;

  if (!ready) return null;

  return (
    <AppShell
      user={{ role: "client", name: userName, companyName: client?.companyName }}
    >
      {!client ? (
        <div className="empty-state">No client dashboard is assigned to this login.</div>
      ) : !canOpen ? (
        <section className="panel locked-panel">
          <p className="eyebrow">Tool locked</p>
          <h1>{client.companyName}</h1>
          <p className="muted">{LOCKED_DASHBOARD_MESSAGE}</p>
        </section>
      ) : (
        <section className="panel">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </section>
      )}
    </AppShell>
  );
}
