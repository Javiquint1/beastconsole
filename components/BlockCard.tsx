"use client";

import { Bot, Mail, Megaphone, Lock } from "lucide-react";
import { canOpenDashboardBlock } from "@/lib/access-control";
import type { ClientAccount, MarketingBlock } from "@/lib/types";

type BlockCardProps = {
  block: MarketingBlock;
  client: ClientAccount;
};

export function BlockCard({ block, client }: BlockCardProps) {
  const locked = !canOpenDashboardBlock(client, block.id, block.paid);
  const Icon =
    block.category === "Ads" ? Megaphone : block.category === "Email" ? Mail : Bot;

  return (
    <section className="block">
      <div className="toolbar">
        <div>
          <p className="eyebrow">{block.category}</p>
          <h3>{block.name}</h3>
          <p className="muted">{block.description}</p>
        </div>
        {locked ? <Lock size={22} aria-label="Locked" /> : <Icon size={24} aria-hidden="true" />}
      </div>

      {locked ? (
        <div className="empty-state">
          Payment is {client.paymentStatus}. This paid block unlocks when access is active.
        </div>
      ) : block.id === "google-ads" ? (
        <GoogleAdsBlock client={client} />
      ) : block.id === "email" ? (
        <EmailBlock client={client} />
      ) : (
        <FreeAiBlock client={client} />
      )}
    </section>
  );
}

function GoogleAdsBlock({ client }: { client: ClientAccount }) {
  const spend = Math.round(client.monthlyBudget * 0.62);
  const conversions = Math.max(12, Math.round(client.leadGoal * 0.54));
  const cpa = Math.round(spend / conversions);

  return (
    <>
      <div className="metric">
        <span>Monthly budget</span>
        <strong>${client.monthlyBudget.toLocaleString()}</strong>
      </div>
      <div className="metric">
        <span>Spend used</span>
        <strong>${spend.toLocaleString()}</strong>
      </div>
      <div className="metric">
        <span>Conversions</span>
        <strong>{conversions}</strong>
      </div>
      <div className="metric">
        <span>Cost per lead</span>
        <strong>${cpa}</strong>
      </div>
    </>
  );
}

function EmailBlock({ client }: { client: ClientAccount }) {
  return (
    <form className="form">
      <div className="field">
        <label htmlFor="segment">Audience segment</label>
        <select id="segment" defaultValue="warm-leads">
          <option value="warm-leads">Warm leads</option>
          <option value="past-customers">Past customers</option>
          <option value="newsletter">Newsletter list</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="subject">Subject line</label>
        <input id="subject" defaultValue={`${client.companyName}: your June growth plan`} />
      </div>
      <button className="button" type="button">
        Save email draft
      </button>
    </form>
  );
}

function FreeAiBlock({ client }: { client: ClientAccount }) {
  const ideas = [
    `Turn ${client.companyName}'s best customer result into a short proof-led ad.`,
    "Repurpose one client question into a helpful email and a search ad headline.",
    "Create a 3-step offer ladder for leads who are not ready to book yet."
  ];

  return (
    <div className="grid">
      {ideas.map((idea) => (
        <div className="notice" key={idea}>
          {idea}
        </div>
      ))}
    </div>
  );
}
