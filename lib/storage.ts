"use client";

import { initialClients } from "./mock-data";
import type { BlockId, ClientAccount, SessionUser } from "./types";

const CLIENTS_KEY = "beast-console.clients";
const SESSION_KEY = "beast-console.session";

export function loadClients(): ClientAccount[] {
  if (typeof window === "undefined") {
    return initialClients;
  }

  const saved = window.localStorage.getItem(CLIENTS_KEY);
  if (!saved) {
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
    return initialClients;
  }

  try {
    const clients = JSON.parse(saved) as Array<
      Partial<ClientAccount> & { assignedBlocks?: string[] }
    >;
    const migratedClients = clients.map(migrateClientAccount);

    if (!migratedClients.every(isClientAccount)) {
      window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
      return initialClients;
    }

    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(migratedClients));
    return migratedClients as ClientAccount[];
  } catch {
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
    return initialClients;
  }
}

export function saveClients(clients: ClientAccount[]) {
  window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.localStorage.getItem(SESSION_KEY);
  return saved ? (JSON.parse(saved) as SessionUser) : null;
}

export function saveSession(user: SessionUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

function isClientAccount(client: Partial<ClientAccount>) {
  return Boolean(
    client.id &&
      client.name &&
      client.companyName &&
      client.email &&
      client.passwordHash &&
      client.role &&
      client.status &&
      client.paymentStatus &&
      client.createdAt &&
      client.updatedAt &&
      Array.isArray(client.enabledBlocks)
  );
}

function migrateClientAccount(
  client: Partial<ClientAccount> & { assignedBlocks?: string[] }
): Partial<ClientAccount> {
  const legacyBlocks = client.enabledBlocks ?? client.assignedBlocks ?? [];

  return {
    ...client,
    phone: client.phone ?? "",
    businessWebsite: client.businessWebsite ?? "",
    enabledBlocks: legacyBlocks
      .map((blockId) => (blockId === "email-campaign" ? "email" : blockId))
      .filter(isBlockId)
  };
}

function isBlockId(blockId: string): blockId is BlockId {
  return blockId === "google-ads" || blockId === "email" || blockId === "free-ai";
}
