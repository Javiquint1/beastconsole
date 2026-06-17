import {
  findClientAccessAccount,
  registerClientAccessAccount
} from "@/lib/access/appAccessService";
import type { BlockId, ClientAccount, PaymentStatus, UserStatus } from "@/lib/types";

const defaultEnabledBlocks: BlockId[] = [
  "free-ai",
  "email",
  "google-ads",
  "meta-ads",
  "tiktok-ads",
  "linkedin-ads"
];

export type StripeClientAccountInput = {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  plan?: string;
  paymentStatus?: string;
};

export type StripeSubscriptionStatusInput = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  email?: string;
  plan?: string;
  status: string;
};

export function createClientAccountFromStripe(input: StripeClientAccountInput) {
  const now = new Date().toISOString();
  const existing = findClientAccessAccount({
    email: input.email,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId
  });
  const clientId = existing?.id ?? `stripe-${input.stripeCustomerId}`;
  const paymentStatus = toLocalPaymentStatus(input.paymentStatus ?? "active");
  const accountStatus = isPaidStripeStatus(paymentStatus) ? "active" : "inactive";

  const client: ClientAccount = {
    id: clientId,
    name: input.name?.trim() || existing?.name || input.email,
    companyName: input.company?.trim() || existing?.companyName || "",
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || existing?.phone || "",
    businessWebsite: existing?.businessWebsite ?? "",
    passwordHash: existing?.passwordHash ?? "",
    role: "client",
    status: accountStatus,
    paymentStatus,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    subscriptionPlan: input.plan,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    enabledBlocks: defaultEnabledBlocks,
    monthlyBudget: existing?.monthlyBudget ?? 0,
    leadGoal: existing?.leadGoal ?? 0
  };

  registerClientAccessAccount(client);
  console.info("[stripe] client account created or updated", {
    clientId,
    email: client.email,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    paymentStatus
  });

  // TODO: Replace this in-memory registration with persistent client/user/payment
  // writes, password invite creation, and idempotent lookup by email plus Stripe IDs.
  return client;
}

export function updateClientSubscriptionStatus(input: StripeSubscriptionStatusInput) {
  const existing = findClientAccessAccount(input);
  if (!existing) {
    console.warn("[stripe] subscription status update skipped; client not found", input);
    return null;
  }

  const paymentStatus = toLocalPaymentStatus(input.status);
  const status: UserStatus = isPaidStripeStatus(paymentStatus) ? "active" : "suspended";
  const updated: ClientAccount = {
    ...existing,
    status,
    paymentStatus,
    stripeCustomerId: input.stripeCustomerId ?? existing.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId ?? existing.stripeSubscriptionId,
    subscriptionPlan: input.plan ?? existing.subscriptionPlan,
    enabledBlocks: isPaidStripeStatus(paymentStatus) ? defaultEnabledBlocks : existing.enabledBlocks,
    updatedAt: new Date().toISOString()
  };

  registerClientAccessAccount(updated);
  console.info("[stripe] client subscription status updated", {
    clientId: updated.id,
    paymentStatus,
    accountStatus: status
  });

  // TODO: Persist subscription/payment state to the production database.
  return updated;
}

export function markClientPaymentFailed(input: Omit<StripeSubscriptionStatusInput, "status">) {
  return updateClientSubscriptionStatus({ ...input, status: "payment_failed" });
}

export function suspendClientAccess(input: Omit<StripeSubscriptionStatusInput, "status"> & { status?: string }) {
  return updateClientSubscriptionStatus({ ...input, status: input.status ?? "canceled" });
}

function toLocalPaymentStatus(status: string): PaymentStatus {
  if (status === "paid") return "paid";
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "unpaid") return "unpaid";
  if (status === "canceled") return "canceled";
  if (status === "incomplete_expired") return "incomplete_expired";
  if (status === "payment_failed") return "payment_failed";
  return "unpaid";
}

function isPaidStripeStatus(status: PaymentStatus) {
  return status === "paid" || status === "active" || status === "trialing";
}
