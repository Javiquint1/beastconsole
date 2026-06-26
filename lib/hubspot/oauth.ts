import "server-only";

import { randomBytes } from "crypto";
import { getSql } from "@/lib/db/client";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";

export type HubSpotConnection = {
  clientId: string;
  hubId: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string | null;
  scope: string;
  createdAt: string;
  updatedAt: string;
};

export const HUBSPOT_NONCE_COOKIE = "beast_hubspot_oauth_nonce";

let schemaReady: Promise<void> | null = null;

export function getHubSpotConfig() {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://beastconsole.vercel.app";
  const scope =
    process.env.HUBSPOT_SCOPES ||
    "crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write crm.objects.deals.read crm.objects.deals.write";

  const missing = [
    ["HUBSPOT_CLIENT_ID", clientId],
    ["HUBSPOT_CLIENT_SECRET", clientSecret],
    ["HUBSPOT_REDIRECT_URI", redirectUri]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing HubSpot environment variables: ${missing.join(", ")}.`);
  }

  return {
    clientId: clientId as string,
    clientSecret: clientSecret as string,
    redirectUri: redirectUri as string,
    appUrl,
    scope
  };
}

export function createHubSpotNonce() {
  return randomBytes(24).toString("base64url");
}

export function encodeHubSpotState(clientId: string, nonce: string) {
  return Buffer.from(JSON.stringify({ clientId, nonce }), "utf8").toString("base64url");
}

export function decodeHubSpotState(value: string): { clientId: string; nonce: string } {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      clientId?: unknown;
      nonce?: unknown;
    };
    if (typeof parsed.clientId !== "string" || typeof parsed.nonce !== "string") {
      throw new Error("Invalid HubSpot OAuth state.");
    }
    return { clientId: parsed.clientId, nonce: parsed.nonce };
  } catch {
    throw new Error("Invalid HubSpot OAuth state.");
  }
}

export async function saveHubSpotConnection(connection: {
  clientId: string;
  hubId: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string | null;
  scope: string;
}) {
  await ensureHubSpotConnectionSchema();
  const sql = getSql();
  const rows = await sql`
    insert into hubspot_connections (
      client_id,
      hub_id,
      encrypted_access_token,
      encrypted_refresh_token,
      token_expires_at,
      scope,
      updated_at
    )
    values (
      ${connection.clientId},
      ${connection.hubId},
      ${encryptSecret(connection.accessToken)},
      ${encryptSecret(connection.refreshToken)},
      ${connection.tokenExpiresAt},
      ${connection.scope},
      now()
    )
    on conflict (client_id)
    do update set
      hub_id = excluded.hub_id,
      encrypted_access_token = excluded.encrypted_access_token,
      encrypted_refresh_token = excluded.encrypted_refresh_token,
      token_expires_at = excluded.token_expires_at,
      scope = excluded.scope,
      updated_at = now()
    returning
      client_id,
      hub_id,
      encrypted_access_token,
      encrypted_refresh_token,
      token_expires_at,
      scope,
      created_at,
      updated_at
  `;

  return mapConnection(rows[0]);
}

export async function getHubSpotConnection(clientId: string) {
  await ensureHubSpotConnectionSchema();
  const sql = getSql();
  const rows = await sql`
    select
      client_id,
      hub_id,
      encrypted_access_token,
      encrypted_refresh_token,
      token_expires_at,
      scope,
      created_at,
      updated_at
    from hubspot_connections
    where client_id = ${clientId}
    limit 1
  `;
  return rows[0] ? mapConnection(rows[0]) : null;
}

export async function deleteHubSpotConnection(clientId: string) {
  await ensureHubSpotConnectionSchema();
  const sql = getSql();
  const rows = await sql`
    delete from hubspot_connections
    where client_id = ${clientId}
    returning client_id
  `;
  return rows.length > 0;
}

async function ensureHubSpotConnectionSchema() {
  if (!schemaReady) schemaReady = createHubSpotConnectionSchema();
  return schemaReady;
}

async function createHubSpotConnectionSchema() {
  const sql = getSql();
  await sql`
    create table if not exists hubspot_connections (
      client_id text primary key,
      hub_id text,
      encrypted_access_token text not null,
      encrypted_refresh_token text not null,
      token_expires_at timestamptz,
      scope text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
}

function mapConnection(row: Record<string, unknown>): HubSpotConnection {
  return {
    clientId: String(row.client_id || ""),
    hubId: typeof row.hub_id === "string" ? row.hub_id : null,
    accessToken: decryptSecret(String(row.encrypted_access_token || "")),
    refreshToken: decryptSecret(String(row.encrypted_refresh_token || "")),
    tokenExpiresAt: row.token_expires_at ? new Date(String(row.token_expires_at)).toISOString() : null,
    scope: String(row.scope || ""),
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : "",
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : ""
  };
}
