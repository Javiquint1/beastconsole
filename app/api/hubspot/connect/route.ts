import { NextRequest, NextResponse } from "next/server";
import {
  HUBSPOT_NONCE_COOKIE,
  createHubSpotNonce,
  encodeHubSpotState,
  getHubSpotConfig
} from "@/lib/hubspot/oauth";

export const runtime = "nodejs";

// HubSpot app settings:
// Redirect URL: https://beastconsole.vercel.app/api/hubspot/callback
// Scopes: crm.objects.contacts.read/write, crm.objects.companies.read/write, crm.objects.deals.read/write
export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
    }

    const config = getHubSpotConfig();
    const nonce = createHubSpotNonce();
    const state = encodeHubSpotState(clientId, nonce);
    const oauthUrl = new URL("https://app.hubspot.com/oauth/authorize");
    oauthUrl.searchParams.set("client_id", config.clientId);
    oauthUrl.searchParams.set("redirect_uri", config.redirectUri);
    oauthUrl.searchParams.set("scope", config.scope);
    oauthUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(oauthUrl);
    response.cookies.set(HUBSPOT_NONCE_COOKIE, nonce, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: config.appUrl.startsWith("https://")
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot OAuth could not be started.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
