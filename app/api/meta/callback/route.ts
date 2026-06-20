import { NextRequest, NextResponse } from "next/server";
import {
  META_NONCE_COOKIE,
  MetaAdAccount,
  decodeMetaState,
  getMetaConfig,
  saveMetaConnection
} from "@/lib/meta/oauth";

export const runtime = "nodejs";

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; type?: string; code?: number };
};

type MetaAdAccountsResponse = {
  data?: MetaAdAccount[];
  error?: { message?: string; type?: string; code?: number };
};

// Meta Developer settings:
// Valid OAuth Redirect URI: https://beastconsole.vercel.app/api/meta/callback
// App domain: beastconsole.vercel.app
// Required scopes: ads_read,business_management
export async function GET(request: NextRequest) {
  const config = safeMetaConfig();
  const appUrl = config?.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://beastconsole.vercel.app";

  try {
    if (!config) throw new Error("Meta environment variables are not configured.");

    const oauthError = request.nextUrl.searchParams.get("error");
    if (oauthError) {
      const description = request.nextUrl.searchParams.get("error_description") || oauthError;
      return redirectWithStatus(appUrl, "error", description);
    }

    const code = request.nextUrl.searchParams.get("code");
    const stateValue = request.nextUrl.searchParams.get("state");
    if (!code) throw new Error("Meta authorization code is missing.");
    if (!stateValue) throw new Error("Meta OAuth state is missing.");

    const state = decodeMetaState(stateValue);
    const nonceCookie = request.cookies.get(META_NONCE_COOKIE)?.value;
    if (!nonceCookie || nonceCookie !== state.nonce) {
      throw new Error("Invalid Meta OAuth nonce.");
    }

    const shortToken = await exchangeCodeForToken(config, code);
    const longToken = await exchangeLongLivedToken(config, shortToken.access_token);
    const accessToken = longToken.access_token || shortToken.access_token;
    if (!accessToken) throw new Error("Meta token exchange did not return an access token.");

    const adAccounts = await fetchMetaAdAccounts(config.graphVersion, accessToken);
    if (!adAccounts.length) throw new Error("No connected Meta ad accounts were found.");

    const expiresIn = longToken.expires_in || shortToken.expires_in;
    await saveMetaConnection({
      clientId: state.clientId,
      accessToken,
      selectedAdAccountId: normalizeAdAccountId(adAccounts[0].id),
      adAccounts: adAccounts.map((account) => ({ ...account, id: normalizeAdAccountId(account.id) })),
      tokenExpiresAt: expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null
    });

    const response = redirectWithStatus(appUrl, "connected", "Meta Ads connected.");
    response.cookies.delete(META_NONCE_COOKIE);
    return response;
  } catch (error) {
    console.error("[meta] oauth callback failed", error);
    const response = redirectWithStatus(
      appUrl,
      "error",
      error instanceof Error ? error.message : "Meta OAuth callback failed."
    );
    response.cookies.delete(META_NONCE_COOKIE);
    return response;
  }
}

function safeMetaConfig() {
  try {
    return getMetaConfig();
  } catch {
    return null;
  }
}

async function exchangeCodeForToken(
  config: ReturnType<typeof getMetaConfig>,
  code: string
): Promise<Required<Pick<MetaTokenResponse, "access_token">> & MetaTokenResponse> {
  const body = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code
  });

  const response = await fetch(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`, {
    body,
    method: "POST"
  });
  const data = (await response.json()) as MetaTokenResponse;
  if (!response.ok || data.error || !data.access_token) {
    throw new Error(data.error?.message || "Meta token exchange failed.");
  }
  return data as Required<Pick<MetaTokenResponse, "access_token">> & MetaTokenResponse;
}

async function exchangeLongLivedToken(
  config: ReturnType<typeof getMetaConfig>,
  shortLivedToken: string
): Promise<MetaTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken
  });

  const response = await fetch(`https://graph.facebook.com/${config.graphVersion}/oauth/access_token`, {
    body,
    method: "POST"
  });
  const data = (await response.json()) as MetaTokenResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta long-lived token exchange failed.");
  }
  return data;
}

async function fetchMetaAdAccounts(graphVersion: string, accessToken: string) {
  const url = new URL(`https://graph.facebook.com/${graphVersion}/me/adaccounts`);
  url.searchParams.set("fields", "id,name,account_status,currency,timezone_name");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = (await response.json()) as MetaAdAccountsResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta ad account fetch failed.");
  }
  return data.data || [];
}

function redirectWithStatus(appUrl: string, status: "connected" | "error", message: string) {
  const url = new URL("/dashboard", appUrl);
  url.searchParams.set("meta", status);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

function normalizeAdAccountId(id: string) {
  return id.startsWith("act_") ? id.slice(4) : id;
}
