"use client";

import { initialDatabase } from "./database-seed";
import { buildClientAccounts, createDatabaseFromClientAccounts } from "./database";
import type { PortalDatabase } from "./database-schema";
import type { BlockId, ClientAccount, SessionUser } from "./types";

const CLIENTS_KEY = "beast-console.clients";
const DATABASE_KEY = "beast-console.database";
const SESSION_KEY = "beast-console.session";

export function loadClients(): ClientAccount[] {
  return buildClientAccounts(loadDatabase());
}

export function saveClients(clients: ClientAccount[]) {
  saveDatabase(createDatabaseFromClientAccounts(clients, loadDatabase()));
  window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function loadDatabase(): PortalDatabase {
  if (typeof window === "undefined") {
    return initialDatabase;
  }

  const savedDatabase = window.localStorage.getItem(DATABASE_KEY);
  if (savedDatabase) {
    try {
      const database = JSON.parse(savedDatabase) as PortalDatabase;
      if (isPortalDatabase(database)) {
        return database;
      }
    } catch {
      window.localStorage.removeItem(DATABASE_KEY);
    }
  }

  const saved = window.localStorage.getItem(CLIENTS_KEY);
  if (!saved) {
    saveDatabase(initialDatabase);
    return initialDatabase;
  }

  try {
    const clients = JSON.parse(saved) as Array<
      Partial<ClientAccount> & { assignedBlocks?: string[] }
    >;
    const migratedClients = clients.map(migrateClientAccount);

    if (!migratedClients.every(isClientAccount)) {
      saveDatabase(initialDatabase);
      return initialDatabase;
    }

    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(migratedClients));
    const database = createDatabaseFromClientAccounts(
      migratedClients as ClientAccount[]
    );
    saveDatabase(database);
    return database;
  } catch {
    saveDatabase(initialDatabase);
    return initialDatabase;
  }
}

export function saveDatabase(database: PortalDatabase) {
  window.localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
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
  return blockId === "google-ads" || blockId === "meta-ads" || blockId === "tiktok-ads" || blockId === "linkedin-ads" || blockId === "email" || blockId === "free-ai";
}

function isPortalDatabase(database: Partial<PortalDatabase>) {
  return Boolean(
    Array.isArray(database.users) &&
      Array.isArray(database.clients) &&
      Array.isArray(database.client_blocks) &&
      Array.isArray(database.google_ads_reports) &&
      Array.isArray(database.meta_ads_reports) &&
      Array.isArray(database.meta_ads_campaigns) &&
      Array.isArray(database.meta_ads_uploads) &&
      Array.isArray(database.tiktok_ads_reports) &&
      Array.isArray(database.tiktok_ads_campaigns) &&
      Array.isArray(database.tiktok_ads_uploads) &&
      Array.isArray(database.linkedin_ads_reports) &&
      Array.isArray(database.linkedin_ads_campaigns) &&
      Array.isArray(database.linkedin_ads_uploads) &&
      Array.isArray(database.email_reports) &&
      Array.isArray(database.ai_generations) &&
      Array.isArray(database.payments)
  );
}
