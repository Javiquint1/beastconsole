import type { BlockId, ClientAccount, DashboardBlockStatus } from "./types";
import { getAppIdForBlock, getClientDashboardAccessForAccount } from "./access/appAccessService";

export type PaymentAccessSource =
  | "manual-admin"
  | "bill-com"
  | "stripe"
  | "paypal"
  | "manual-invoice"
  | "admin-approval";

export type DashboardAccessLevel = "unlocked" | "partial" | "locked";

export type ClientAccessDecision = {
  level: DashboardAccessLevel;
  canAccessDashboard: boolean;
  canAccessPaidBlocks: boolean;
  lockedMessage?: string;
  source: PaymentAccessSource;
};

export const LOCKED_DASHBOARD_MESSAGE =
  "Your account is currently inactive. Please complete payment or contact support to activate your dashboard.";

export function getClientAccessDecision(
  client: ClientAccount
): ClientAccessDecision {
  const dashboard = getClientDashboardAccessForAccount(client);
  if (!dashboard.canAccessDashboard) {
    return lockedDecision("manual-admin");
  }

  if (client.paymentStatus === "paid" || client.paymentStatus === "active" || client.paymentStatus === "trialing") {
    return {
      level: "unlocked",
      canAccessDashboard: true,
      canAccessPaidBlocks: true,
      source: "manual-admin"
    };
  }

  if (client.paymentStatus === "trial") {
    return {
      level: "partial",
      canAccessDashboard: true,
      canAccessPaidBlocks: false,
      source: "manual-admin"
    };
  }

  return lockedDecision("manual-admin");
}

export function getDashboardBlockStatus(
  client: ClientAccount,
  blockId: BlockId,
  isPaidBlock: boolean
): DashboardBlockStatus {
  const appId = getAppIdForBlock(blockId);
  if (!appId) return "locked";
  return getClientDashboardAccessForAccount(client).apps[appId].locked ? "locked" : "active";
}

export function canOpenDashboardBlock(
  client: ClientAccount,
  blockId: BlockId,
  isPaidBlock: boolean
) {
  return getDashboardBlockStatus(client, blockId, isPaidBlock) === "active";
}

function lockedDecision(source: PaymentAccessSource): ClientAccessDecision {
  return {
    level: "locked",
    canAccessDashboard: false,
    canAccessPaidBlocks: false,
    lockedMessage: LOCKED_DASHBOARD_MESSAGE,
    source
  };
}
