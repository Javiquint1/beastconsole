import "server-only";

import { randomBytes } from "crypto";
import { canClientAccessApp } from "@/lib/access/appAccessService";
import { getSql } from "@/lib/db/client";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";

export type MetaAdAccount = {
  id: string;
  name: string;
  account_status?: number;
  currency?: string;
  timezone_name?: string;
};

export type MetaConnection = {
  clientId: string;
  accessToken: string;
  selectedAdAccountId: string | null;
  adAccounts: MetaAdAccount[];
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export async function saveMetaConnection(
  connection: {
    clientId: string;
    accessToken: string;
    selectedAdAccountId: string | null;
    adAccounts: MetaAdAccount[];
    tokenExpiresAt: string | null;
  }
) {
  const encryptedAccessToken = encryptSecret(connection.accessToken);
  const sql = getSql();
  const rows = await sql`
    insert into meta_connections (
      client_id,
      encrypted_access_token,
      selected_ad_account_id,
      ad_accounts,
      token_expires_at,
      updated_at
    )
    values (
      ${connection.clientId},
      ${encryptedAccessToken},
      ${connection.selectedAdAccountId},
      ${JSON.stringify(connection.adAccounts)}::jsonb,
      ${connection.tokenExpiresAt},
      now()
    )
    on conflict (client_id)
    do update set
      encrypted_access_token = excluded.encrypted_access_token,
      selected_ad_account_id = excluded.selected_ad_account_id,
      ad_accounts = excluded.ad_accounts,
      token_expires_at = excluded.token_expires_at,
      updated_at = now()
    returning
      client_id,
      encrypted_access_token,
      selected_ad_account_id,
      ad_accounts,
      token_expires_at,
      created_at,
      updated_at
  `;

  return mapMetaConnection(rows[0]);
}

export async function getMetaConnection(clientId: string) {
  const sql = getSql();
  const rows = await sql`
    select
      client_id,
      encrypted_access_token,
      selected_ad_account_id,
      ad_accounts,
      token_expires_at,
      created_at,
      updated_at
    from meta_connections
    where client_id = ${clientId}
    limit 1
  `;
  return rows[0] ? mapMetaConnection(rows[0]) : null;
}

export async function updateSelectedMetaAdAccount(clientId: string, selectedAdAccountId: string) {
  const connection = await getMetaConnection(clientId);
  if (!connection) return null;
  if (!connection.adAccounts.some((account) => account.id === selectedAdAccountId)) return null;
  const sql = getSql();
  const rows = await sql`
    update meta_connections
    set selected_ad_account_id = ${selectedAdAccountId}, updated_at = now()
    where client_id = ${clientId}
    returning
      client_id,
      encrypted_access_token,
      selected_ad_account_id,
      ad_accounts,
      token_expires_at,
      created_at,
      updated_at
  `;
  return rows[0] ? mapMetaConnection(rows[0]) : null;
}

export async function deleteMetaConnection(clientId: string) {
  const sql = getSql();
  const rows = await sql`
    delete from meta_connections
    where client_id = ${clientId}
    returning client_id
  `;
  return rows.length > 0;
}

export function encryptToken(token: string) {
  return encryptSecret(token);
}

export function decryptToken(encryptedToken: string) {
  return decryptSecret(encryptedToken);
}

function mapMetaConnection(row: Record<string, unknown>): MetaConnection {
  const encryptedAccessToken = String(row.encrypted_access_token || "");
  return {
    clientId: String(row.client_id || ""),
    accessToken: decryptSecret(encryptedAccessToken),
    selectedAdAccountId: typeof row.selected_ad_account_id === "string" ? row.selected_ad_account_id : null,
    adAccounts: normalizeAdAccounts(row.ad_accounts),
    tokenExpiresAt: row.token_expires_at ? new Date(String(row.token_expires_at)).toISOString() : null,
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : "",
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : ""
  };
}

function normalizeAdAccounts(value: unknown): MetaAdAccount[] {
  if (typeof value === "string") {
    try {
      return normalizeAdAccounts(JSON.parse(value) as unknown);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter(isMetaAdAccount);
}

function isMetaAdAccount(value: unknown): value is MetaAdAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<MetaAdAccount>;
  return typeof account.id === "string" && typeof account.name === "string";
}
