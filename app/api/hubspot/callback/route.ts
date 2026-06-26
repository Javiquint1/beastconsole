import { NextRequest, NextResponse } from "next/server";
import {
  HUBSPOT_NONCE_COOKIE,
  decodeHubSpotState,
  getHubSpotConfig,
  saveHubSpotConnection
} from "@/lib/hubspot/oauth";

export const runtime = "nodejs";

type HubSpotTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  hub_id?: number;
  hub_domain?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
  message?: string;
};

export async function GET(request: NextRequest) {
  const config = safeHubSpotConfig();
  const appUrl = config?.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://beastconsole.vercel.app";

  try {
    if (!config) throw new Error("HubSpot environment variables are not configured.");

    const oauthError = request.nextUrl.searchParams.get("error");
    if (oauthError) {
      const description = request.nextUrl.searchParams.get("error_description") || oauthError;
      return redirectWithStatus(appUrl, "error", description);
    }

    const code = request.nextUrl.searchParams.get("code");
    const stateValue = request.nextUrl.searchParams.get("state");
    if (!code) throw new Error("HubSpot authorization code is missing.");
    if (!stateValue) throw new Error("HubSpot OAuth state is missing.");

    const state = decodeHubSpotState(stateValue);
    const nonceCookie = request.cookies.get(HUBSPOT_NONCE_COOKIE)?.value;
    if (!nonceCookie || nonceCookie !== state.nonce) {
      throw new Error("Invalid HubSpot OAuth nonce.");
    }

    const token = await exchangeCodeForToken(config, code);
    await saveHubSpotConnection({
      clientId: state.clientId,
      hubId: token.hub_id ? String(token.hub_id) : null,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiresAt: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
      scope: token.scope || config.scope
    });

    const response = redirectWithStatus(appUrl, "connected", "HubSpot CRM connected.");
    response.cookies.delete(HUBSPOT_NONCE_COOKIE);
    return response;
  } catch (error) {
    console.error("[hubspot] oauth callback failed", error);
    const response = redirectWithStatus(
      appUrl,
      "error",
      error instanceof Error ? error.message : "HubSpot OAuth callback failed."
    );
    response.cookies.delete(HUBSPOT_NONCE_COOKIE);
    return response;
  }
}

function safeHubSpotConfig() {
  try {
    return getHubSpotConfig();
  } catch {
    return null;
  }
}

async function exchangeCodeForToken(
  config: ReturnType<typeof getHubSpotConfig>,
  code: string
): Promise<Required<Pick<HubSpotTokenResponse, "access_token" | "refresh_token">> & HubSpotTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code
  });

  const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });
  const data = (await response.json()) as HubSpotTokenResponse;
  if (!response.ok || data.error || !data.access_token || !data.refresh_token) {
    throw new Error(data.error_description || data.message || data.error || "HubSpot token exchange failed.");
  }
  return data as Required<Pick<HubSpotTokenResponse, "access_token" | "refresh_token">> & HubSpotTokenResponse;
}

function redirectWithStatus(appUrl: string, status: "connected" | "error", message: string) {
  const url = new URL("/dashboard", appUrl);
  url.searchParams.set("hubspot", status);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}
