"use client";

import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";

export default function GoogleAdsPage() {
  return (
    <AuthGuard allowedRole="client">
      {(user) => (
        <AppShell user={{ role: "client", name: user.name }}>
          <section className="panel">
            <p className="eyebrow">Google Ads</p>
            <h1>Google Ads</h1>
            <p className="muted">View and manage your Google Ads information.</p>
          </section>
        </AppShell>
      )}
    </AuthGuard>
  );
}
