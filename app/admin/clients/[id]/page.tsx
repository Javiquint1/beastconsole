"use client";

import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { ClientEditor } from "@/components/ClientEditor";
import { BlockCard } from "@/components/BlockCard";
import { marketingBlocks } from "@/lib/blocks";
import { usePortalData } from "@/hooks/usePortalData";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params);

  return (
    <AuthGuard allowedRole="admin">
      {(user) => <ClientDetail clientId={id} userName={user.name} />}
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
    updateAccessSettings,
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
              onClientInfoSave={(updates) => updateClient(client.id, updates)}
              onSaveAccess={(settings) => updateAccessSettings(client.id, settings)}
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
