"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";

export default function FreeAiPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => (
        <AppShell user={{ role: "client", name: user.name }}>
          <section className="panel">
            <p className="eyebrow">Free AI</p>
            <h1>Free AI</h1>
            <p className="muted">Generate quick campaign ideas and content angles.</p>
          </section>
        </AppShell>
      )}
    </AuthGuard>
  );
}
