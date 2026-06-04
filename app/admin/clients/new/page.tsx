"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { marketingBlocks } from "@/lib/blocks";
import { usePortalData } from "@/hooks/usePortalData";
import type { BlockId, PaymentStatus, UserStatus } from "@/lib/types";

export default function NewClientPage() {
  return (
    <AuthGuard allowedRole="admin">
      {(user) => <NewClientForm userName={user.name} />}
    </AuthGuard>
  );
}

function NewClientForm({ userName }: { userName: string }) {
  const router = useRouter();
  const { addClient } = usePortalData();
  const [enabledBlocks, setEnabledBlocks] = useState<BlockId[]>(["free-ai"]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const client = await addClient({
      name: String(form.get("name") || ""),
      companyName: String(form.get("companyName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      businessWebsite: String(form.get("businessWebsite") || ""),
      password: String(form.get("password") || ""),
      status: String(form.get("status") || "active") as UserStatus,
      paymentStatus: String(form.get("paymentStatus") || "paid") as PaymentStatus,
      enabledBlocks,
      monthlyBudget: Number(form.get("monthlyBudget") || 0),
      leadGoal: Number(form.get("leadGoal") || 0)
    });

    router.push(`/admin/clients/${client.id}`);
  }

  function toggle(blockId: BlockId) {
    setEnabledBlocks((current) =>
      current.includes(blockId)
        ? current.filter((id) => id !== blockId)
        : [...current, blockId]
    );
  }

  return (
    <AppShell user={{ role: "admin", name: userName }}>
      <section className="panel">
        <p className="eyebrow">New client</p>
        <h1>Create portal access</h1>
        <form className="form" onSubmit={submit}>
          <div className="grid two">
            <div className="field">
              <label htmlFor="name">Contact name</label>
              <input id="name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="companyName">Company name</label>
              <input id="companyName" name="companyName" required />
            </div>
            <div className="field">
              <label htmlFor="email">Login email</label>
              <input id="email" name="email" required type="email" />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" />
            </div>
            <div className="field">
              <label htmlFor="businessWebsite">Business website</label>
              <input id="businessWebsite" name="businessWebsite" type="url" />
            </div>
            <div className="field">
              <label htmlFor="password">Temporary password</label>
              <input id="password" minLength={8} name="password" required type="password" />
            </div>
            <div className="field">
              <label htmlFor="status">User status</label>
              <select id="status" name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="paymentStatus">Payment status</label>
              <select id="paymentStatus" name="paymentStatus" defaultValue="paid">
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="trial">Trial</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="monthlyBudget">Monthly ad budget</label>
              <input id="monthlyBudget" min="0" name="monthlyBudget" type="number" />
            </div>
            <div className="field">
              <label htmlFor="leadGoal">Monthly lead goal</label>
              <input id="leadGoal" min="0" name="leadGoal" type="number" />
            </div>
          </div>

          <section className="panel">
            <p className="eyebrow">Enabled tools</p>
            <div className="grid">
              {marketingBlocks.map((block) => (
                <label className="check-row" key={block.id}>
                  <input
                    checked={enabledBlocks.includes(block.id)}
                    onChange={() => toggle(block.id)}
                    type="checkbox"
                  />
                  {block.name}
                </label>
              ))}
            </div>
          </section>

          <button className="button" type="submit">
            Create client
          </button>
        </form>
      </section>
    </AppShell>
  );
}
