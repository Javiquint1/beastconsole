"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { getBlockName } from "@/lib/blocks";
import { usePortalData } from "@/hooks/usePortalData";

export default function ClientsPage() {
  return (
    <AuthGuard allowedRole="admin">
      {(user) => <ClientsIndex userName={user.name} />}
    </AuthGuard>
  );
}

function ClientsIndex({ userName }: { userName: string }) {
  const { clients, ready } = usePortalData();

  return (
    <AppShell user={{ role: "admin", name: userName }}>
      <section className="toolbar">
        <div>
          <p className="eyebrow">Admin clients</p>
          <h1>Clients</h1>
        </div>
        <Link className="button" href="/admin/clients/new">
          New client
        </Link>
      </section>

      {!ready ? null : (
        <div className="table-wrap">
          <table className="client-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Email</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Tools</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .filter((client) => client.role === "client")
                .map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.companyName}</td>
                    <td>{client.email}</td>
                    <td>
                      <span className={`pill ${client.paymentStatus}`}>
                        {client.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${client.status}`}>
                        {client.status}
                      </span>
                    </td>
                    <td>{client.enabledBlocks.map(getBlockName).join(", ") || "No tools"}</td>
                    <td>
                      <Link className="ghost-button" href={`/admin/clients/${client.id}`}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
