import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { canClientAccessApp } from "@/lib/access/appAccessService";

export type MetaAdAccount = {
  id: string;
  name: string;
  account_status?: number;
  currency?: string;
  timezone_name?: string;
};

export type MetaConnection = {
  clientId: string;
  encryptedAccessToken: string;
  selectedAdAccountId: string | null;
  adAccounts: MetaAdAccount[];
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const globalMetaStore = globalThis as typeof globalThis & {
  beastMetaConnections?: Map<string, MetaConnection>;
};

const metaConnections = globalMetaStore.beastMetaConnections ?? new Map<string, MetaConnection>();
globalMetaStore.beastMetaConnections = metaConnections;

export const META_NONCE_COOKIE = "beast_meta_oauth_nonce";

export function getMetaConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const graphVersion = process.env.META_GRAPH_VERSION || "v25.0";
  const redirectUri = process.env.META_REDIRECT_URI;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://beastconsole.vercel.app";

  const missing = [
    ["META_APP_ID", appId],
    ["META_APP_SECRET", appSecret],
    ["META_REDIRECT_URI", redirectUri]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing Meta environment variables: ${missing.join(", ")}.`);
  }

  return {
    appId: appId as string,
    appSecret: appSecret as string,
    graphVersion,
    redirectUri: redirectUri as string,
    appUrl
  };
}

export function createNonce() {
  return randomBytes(24).toString("base64url");
}

export function encodeMetaState(clientId: string, nonce: string) {
  return Buffer.from(JSON.stringify({ clientId, nonce }), "utf8").toString("base64url");
}

export function decodeMetaState(value: string): { clientId: string; nonce: string } {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      clientId?: unknown;
      nonce?: unknown;
    };
    if (typeof parsed.clientId !== "string" || typeof parsed.nonce !== "string") {
      throw new Error("Invalid Meta OAuth state.");
    }
    return { clientId: parsed.clientId, nonce: parsed.nonce };
  } catch {
    throw new Error("Invalid Meta OAuth state.");
  }
}

export function canStartMetaOAuth(clientId: string) {
  try {
    return canClientAccessApp(clientId, "meta_ads");
  } catch {
    // TODO: Replace this fallback when client access is backed by a server database.
    // It allows external/signup client IDs to complete OAuth while known Beast Console
    // clients still respect the admin Meta/Facebook access toggle.
    return true;
  }
}

export function saveMetaConnection(connection: Omit<MetaConnection, "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const existing = metaConnections.get(connection.clientId);
  const saved: MetaConnection = {
    ...connection,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  metaConnections.set(connection.clientId, saved);

  // TODO: Persist this record in the production database when server-side storage
  // is available. Store clientId, encryptedAccessToken, selectedAdAccountId,
  // adAccounts JSON, tokenExpiresAt, createdAt, and updatedAt.
  console.info("[meta] connection stored in temporary server memory", {
    clientId: saved.clientId,
    adAccounts: saved.adAccounts.length,
    selectedAdAccountId: saved.selectedAdAccountId
  });

  return saved;
}

export function getMetaConnection(clientId: string) {
  return metaConnections.get(clientId) || null;
}

export function updateSelectedMetaAdAccount(clientId: string, selectedAdAccountId: string) {
  const connection = getMetaConnection(clientId);
  if (!connection) return null;
  if (!connection.adAccounts.some((account) => account.id === selectedAdAccountId)) return null;
  const updated = { ...connection, selectedAdAccountId, updatedAt: new Date().toISOString() };
  metaConnections.set(clientId, updated);
  return updated;
}

export function deleteMetaConnection(clientId: string) {
  return metaConnections.delete(clientId);
}

export function encryptToken(token: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptToken(encryptedToken: string) {
  const [ivValue, tagValue, encryptedValue] = encryptedToken.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Invalid encrypted Meta token.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

function getEncryptionKey() {
  const secret = process.env.META_TOKEN_ENCRYPTION_KEY || process.env.META_APP_SECRET;
  if (!secret) throw new Error("Meta token encryption key is missing.");
  return createHash("sha256").update(secret).digest();
}
