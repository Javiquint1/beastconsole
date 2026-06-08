import { initialDatabase } from "@/lib/database-seed";
import { buildClientAccounts } from "@/lib/database";
import type { BlockId, ClientAccount, PaymentStatus, UserStatus } from "@/lib/types";

export type AppAccessId =
  | "ai_helper"
  | "email"
  | "google_ads"
  | "meta_ads"
  | "tiktok_ads"
  | "linkedin_ads";

export type AppAccessMode = "full" | "trial" | "disabled" | "locked";

export type AppAccessDecision = {
  enabled: boolean;
  locked: boolean;
  mode: AppAccessMode;
  reason: string | null;
};

export type ClientDashboardAccess = {
  paymentStatus: PaymentStatus;
  accountStatus: UserStatus;
  canAccessDashboard: boolean;
  apps: Record<AppAccessId, AppAccessDecision>;
};

export const appAccessDefinitions: Array<{
  appId: AppAccessId;
  blockId: BlockId;
  name: string;
  description: string;
  trialEnabled: boolean;
}> = [
  { appId: "ai_helper", blockId: "free-ai", name: "AI Helper", description: "Marketing ideas and copy generation.", trialEnabled: true },
  { appId: "email", blockId: "email", name: "Email App", description: "Business mailbox through SMTP and IMAP.", trialEnabled: false },
  { appId: "google_ads", blockId: "google-ads", name: "Google Ads Manager", description: "Google campaign reporting and recommendations.", trialEnabled: false },
  { appId: "meta_ads", blockId: "meta-ads", name: "Meta/Facebook Ads Manager", description: "Facebook and Instagram ad reporting.", trialEnabled: false },
  { appId: "tiktok_ads", blockId: "tiktok-ads", name: "TikTok Ads Manager", description: "TikTok ad performance and reporting.", trialEnabled: false },
  { appId: "linkedin_ads", blockId: "linkedin-ads", name: "LinkedIn Ads Manager", description: "LinkedIn B2B campaign reporting.", trialEnabled: false }
];

const globalAccessStore = globalThis as typeof globalThis & {
  beastAccessClients?: Map<string, ClientAccount>;
};
const serverClients =
  globalAccessStore.beastAccessClients ??
  new Map(buildClientAccounts(initialDatabase).map((client) => [client.id, client]));
globalAccessStore.beastAccessClients = serverClients;

export function registerClientAccessAccount(client: ClientAccount) {
  serverClients.set(client.id, client);
}

export function getClientAppAccess(clientId: string) {
  const client = serverClients.get(clientId);
  if (!client) throw new Error("Client not found.");
  return getClientDashboardAccessForAccount(client);
}

export function updateClientAppAccess(clientId: string, apps: Partial<Record<AppAccessId, boolean>>) {
  const client = requiredClient(clientId);
  const enabledBlocks = appAccessDefinitions
    .filter((definition) => apps[definition.appId] ?? client.enabledBlocks.includes(definition.blockId))
    .map((definition) => definition.blockId);
  const updated = { ...client, enabledBlocks, updatedAt: new Date().toISOString() };
  serverClients.set(clientId, updated);
  return getClientDashboardAccessForAccount(updated);
}

export function updateClientPaymentStatus(clientId: string, paymentStatus: PaymentStatus) {
  const client = requiredClient(clientId);
  serverClients.set(clientId, { ...client, paymentStatus, updatedAt: new Date().toISOString() });
  return getClientAppAccess(clientId);
}

export function updateClientAccountStatus(clientId: string, status: UserStatus) {
  const client = requiredClient(clientId);
  serverClients.set(clientId, { ...client, status, updatedAt: new Date().toISOString() });
  return getClientAppAccess(clientId);
}

export function canClientAccessApp(clientId: string, appId: AppAccessId) {
  return !getClientAppAccess(clientId).apps[appId].locked;
}

export function getClientDashboardAccess(clientId: string) {
  return getClientAppAccess(clientId);
}

export function getClientDashboardAccessForAccount(client: ClientAccount): ClientDashboardAccess {
  const canAccessDashboard = client.status === "active";
  return {
    paymentStatus: client.paymentStatus,
    accountStatus: client.status,
    canAccessDashboard,
    apps: Object.fromEntries(
      appAccessDefinitions.map((definition) => [
        definition.appId,
        decideAppAccess(client, definition.blockId, definition.trialEnabled)
      ])
    ) as Record<AppAccessId, AppAccessDecision>
  };
}

export function getAppIdForBlock(blockId: BlockId) {
  return appAccessDefinitions.find((definition) => definition.blockId === blockId)?.appId;
}

function decideAppAccess(client: ClientAccount, blockId: BlockId, trialEnabled: boolean): AppAccessDecision {
  const enabled = client.enabledBlocks.includes(blockId);
  if (client.status !== "active") return locked(enabled, "This account is suspended or inactive.");
  if (!enabled) return { enabled: false, locked: true, mode: "disabled", reason: "This app is not enabled for this account." };
  if (client.paymentStatus === "unpaid") return locked(true, "This app is locked because your account is not currently paid.");
  if (client.paymentStatus === "trial") {
    return trialEnabled
      ? { enabled: true, locked: false, mode: "trial", reason: "This app is available in trial/demo mode only." }
      : locked(true, "This app is not available with the current trial access.");
  }
  return { enabled: true, locked: false, mode: "full", reason: null };
}

function locked(enabled: boolean, reason: string): AppAccessDecision {
  return { enabled, locked: true, mode: "locked", reason };
}

function requiredClient(clientId: string) {
  const client = serverClients.get(clientId);
  if (!client) throw new Error("Client not found.");
  return client;
}

// The in-memory server adapter is the MVP persistence boundary. Replace it with
// client_app_access and clients table queries without changing access decisions.
