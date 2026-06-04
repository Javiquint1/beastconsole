"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";

export default function EmailMarketingPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => (
        <AppShell user={{ role: "client", name: user.name }}>
          <section className="panel">
            <p className="eyebrow">Email Marketing</p>
            <h1>Email Marketing</h1>
            <p className="muted">Review campaign ideas, audiences, and email drafts.</p>
          </section>
        </AppShell>
      )}
    </AuthGuard>
  );
}
