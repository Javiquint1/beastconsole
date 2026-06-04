"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { usePortalData } from "@/hooks/usePortalData";

export default function AdminPage() {
  return (
    <AuthGuard allowedRole="admin">
      {(user) => <AdminHome userName={user.name} />}
    </AuthGuard>
  );
}

function AdminHome({ userName }: { userName: string }) {
  const { activeClients, clients } = usePortalData();
  const clientAccounts = clients.filter((client) => client.role === "client");
  const paidBlocks = clientAccounts.reduce(
    (total, client) => total + client.enabledBlocks.filter((id) => id !== "free-ai").length,
    0
  );

  return (
    <AppShell user={{ role: "admin", name: userName }}>
      <section className="panel">
        <p className="eyebrow">Admin</p>
        <div className="toolbar">
          <div>
            <h1>Client command center</h1>
            <p className="muted">
              Manage access, payment state, and assigned marketing blocks from one place.
            </p>
          </div>
          <Link className="button" href="/admin/clients/new">
            Create client
          </Link>
        </div>
      </section>

      <section className="grid three" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="eyebrow">Clients</p>
          <h2>{clientAccounts.length}</h2>
          <p className="muted">Total accounts in the portal.</p>
        </div>
        <div className="card">
          <p className="eyebrow">Active access</p>
          <h2>{activeClients.length}</h2>
          <p className="muted">Clients currently allowed into paid blocks.</p>
        </div>
        <div className="card">
          <p className="eyebrow">Paid blocks</p>
          <h2>{paidBlocks}</h2>
          <p className="muted">Assigned revenue-generating tools.</p>
        </div>
      </section>
    </AppShell>
  );
}
