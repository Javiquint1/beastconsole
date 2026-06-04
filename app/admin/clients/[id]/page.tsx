"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ClientEditor } from "@/components/ClientEditor";
import { BlockCard } from "@/components/BlockCard";
import { marketingBlocks } from "@/lib/blocks";
import { usePortalData } from "@/hooks/usePortalData";
import type { BlockId, PaymentStatus, UserStatus } from "@/lib/types";

type ClientDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  return (
    <AuthGuard allowedRole="admin">
      {(user) => <ClientDetail clientId={params.id} userName={user.name} />}
    </AuthGuard>
  );
}

function ClientDetail({
  clientId,
  userName
}: {
  clientId: string;
  userName: string;
}) {
  const {
    clients,
    ready,
    setPaymentStatus,
    setUserStatus,
    toggleBlock,
    updateClient
  } = usePortalData();
  const client = clients.find((item) => item.id === clientId);

  return (
    <AppShell user={{ role: "admin", name: userName }}>
      {!ready ? null : !client ? (
        <div className="empty-state">Client not found.</div>
      ) : (
        <>
          <section className="panel">
            <p className="eyebrow">Client profile</p>
            <div className="toolbar">
              <div>
                <h1>{client.companyName}</h1>
                <p className="muted">
                  {client.name} · {client.email}
                  {client.phone ? ` · ${client.phone}` : ""}
                </p>
              </div>
              <span className={`pill ${client.paymentStatus}`}>{client.paymentStatus}</span>
            </div>
          </section>

          <section style={{ marginTop: 16 }}>
            <ClientEditor
              client={client}
              onStatusChange={(status: PaymentStatus) =>
                setPaymentStatus(client.id, status)
              }
              onUserStatusChange={(status: UserStatus) =>
                setUserStatus(client.id, status)
              }
              onClientInfoSave={(updates) => updateClient(client.id, updates)}
              onToggleBlock={(blockId: BlockId) => toggleBlock(client.id, blockId)}
            />
          </section>

          <section className="grid three" style={{ marginTop: 16 }}>
            {marketingBlocks
              .filter((block) => client.enabledBlocks.includes(block.id))
              .map((block) => (
                <BlockCard block={block} client={client} key={block.id} />
              ))}
          </section>
        </>
      )}
    </AppShell>
  );
}
